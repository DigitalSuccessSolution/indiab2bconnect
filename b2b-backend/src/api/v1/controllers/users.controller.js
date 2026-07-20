const prisma = require("../../../config/prisma");
const catchAsync = require("../../../shared/helpers/catch-async");
const AppError = require("../../../shared/errors/app-error");
const ApiResponse = require("../../../shared/helpers/api-response");
const cacheService = require("../../../services/cache.service");
const { logAction } = require("../../../shared/helpers/auditLogger");
const { decrypt } = require("../../../shared/helpers/encryption");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { role, isActive, search, page = 1, limit = 1000 } = req.query;
  const { id, role: userRole } = req.user;
  const skip = (page - 1) * limit;

  const cacheContext = userRole === "SUPERADMIN" ? "global" : id;
  const cacheKey = `admin:users:all:${JSON.stringify(req.query)}:${cacheContext}`;
  let cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  const where = {};

  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === "true";
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      vendor: {
        include: {
          products: { take: 5, select: { id: true, name: true, price: true, type: true } },
          keywords: true,
          categories: true
        }
      },
      admin: true,
    },

    skip: parseInt(skip),
    take: parseInt(limit),
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count({ where });

  // Decrypt sensitive information if the user is a vendor
  const decryptedUsers = users.map((user) => {
    if (user.vendor) {
      if (user.vendor.gstNumber) {
        try { user.vendor.gstNumber = decrypt(user.vendor.gstNumber); } catch (e) { /* keep original */ }
      }
      if (user.vendor.aadhaarNumber) {
        try { user.vendor.aadhaarNumber = decrypt(user.vendor.aadhaarNumber); } catch (e) { /* keep original */ }
      }
    }
    return user;
  });

  // Calculate global counts for dashboard cards
  const [vendorsCount, adminsCount, newMembersCount] = await Promise.all([
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const responseData = {
    users: decryptedUsers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    counts: {
      vendors: vendorsCount,
      admins: adminsCount,
      newMembers: newMembersCount,
    },
  };

  await cacheService.setCache(cacheKey, responseData, 300);

  res.status(200).json(new ApiResponse(200, responseData));
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { role, isActive, name, password } = req.body;

  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (name !== undefined) updateData.name = name;

  if (password) {
    const bcrypt = require('bcryptjs');
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Create Audit Log
  await logAction(
    req.user.id,
    "UPDATE_USER",
    "USER",
    `Updated user ${user.name || user.phone || user.email || userId} details`,
    req.ip,
  );

  await cacheService.clearCacheByPrefix("admin:users:all");
  await cacheService.clearCacheByPrefix(`vendor:me:${userId}`);
  if (user.role === "VENDOR") {
     const vendorObj = await prisma.vendor.findUnique({ where: { userId }});
     if (vendorObj) {
        await cacheService.clearCacheByPrefix(`vendor:${vendorObj.id}`);
        await cacheService.clearCacheByPrefix("admin:vendors:pending");
     }
  }

  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { vendor: true, admin: true },
  });

  if (!user) return next(new AppError("User not found", 404));

  // 1. Delete user-level relations that block deletion (NOT role-specific)
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.review.deleteMany({ where: { userId } });
  await prisma.auditLog.deleteMany({ where: { userId } });

  // 2. Handle Vendor-specific data deletion
  if (user.role === "VENDOR" && user.vendor) {
    const vendorId = user.vendor.id;
    await prisma.product.deleteMany({ where: { vendorId } });
    await prisma.galleryImage.deleteMany({ where: { vendorId } });
    await prisma.certification.deleteMany({ where: { vendorId } });
    await prisma.ranking.deleteMany({ where: { vendorId } });
    await prisma.review.deleteMany({ where: { vendorId } });
    await prisma.transaction.deleteMany({ where: { vendorId } });
    await prisma.refund.deleteMany({ where: { vendorId } });
    await prisma.lead.updateMany({
      where: { vendorId },
      data: { vendorId: null },
    });
    await prisma.vendor.delete({ where: { id: vendorId } });
  }

  // 3. Handle admin specific data deletion
  if (user.role === "ADMIN" && user.admin) {
    await prisma.admin.delete({ where: { userId: user.id } });
  }

  // 4. Delete the User record itself
  await prisma.user.delete({ where: { id: userId } });

  // Create Audit Log for THIS deletion action (using req.user.id who is the admin performing the delete)
  await logAction(
    req.user.id,
    "DELETE_USER",
    "USER",
    `Permanently deleted user: ${user.name || user.email} (${user.role})`,
    req.ip,
  );

  await cacheService.clearCacheByPrefix("admin:users:all");
  await cacheService.clearCacheByPrefix(`vendor:me:${userId}`);
  if (user.role === "VENDOR" && user.vendor) {
    await cacheService.clearCacheByPrefix(`vendor:${user.vendor.id}`);
    await cacheService.clearCacheByPrefix("admin:vendors:pending");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Member account and associated data removed successfully",
      ),
    );
});
