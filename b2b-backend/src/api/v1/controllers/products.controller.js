const prisma = require('../../../config/prisma');
const catchAsync = require("../../../shared/helpers/catch-async");
const AppError = require("../../../shared/errors/app-error");
const ApiResponse = require("../../../shared/helpers/api-response");
const cacheService = require('../../../services/cache.service');
const { logAction } = require('../../../shared/helpers/auditLogger');
const notificationService = require('../../../modules/notifications/notifications.service');

// Get My Products with Pagination
exports.getMyProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type = 'PRODUCT' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
    select: { id: true }
  });

  if (!vendor) {
    return res.status(404).json(new ApiResponse(404, null, "Vendor profile not found."));
  }

  const where = {
    vendorId: vendor.id,
    type: type
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  res.status(200).json(new ApiResponse(200, {
    data: products,
    meta: {
      total,
      page: parseInt(page),
      limit: take,
      totalPages
    }
  }, "Products retrieved successfully."));
});

// Search Products (IndiaMart Style - Product First)
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { city, categoryId, search, offeringType, verified, trustSeal, gst, priceRange, sort, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    status: 'APPROVED',
    availability: true
  };

  if (offeringType) {
    where.type = offeringType;
  }

  if (priceRange) {
    const [minStr, maxStr] = priceRange.split("-");
    const min = parseInt(minStr) || 0;
    const max = maxStr === "max" ? Infinity : parseInt(maxStr);
    where.price = { gte: min };
    if (max !== Infinity) where.price.lte = max;
  }

  // Vendor relation filters
  const vendorFilter = {};
  let hasVendorFilter = false;

  if (verified === 'true') { vendorFilter.verified = true; hasVendorFilter = true; }
  if (trustSeal === 'true') { vendorFilter.trustBadge = 'TRUST_SEAL'; hasVendorFilter = true; }
  if (gst === 'true') { vendorFilter.gstNumber = { not: null }; hasVendorFilter = true; }
  if (city) { vendorFilter.city = { equals: city.trim(), mode: 'insensitive' }; hasVendorFilter = true; }

  if (categoryId) {
    vendorFilter.categories = { some: { id: categoryId } };
    hasVendorFilter = true;
  }

  if (hasVendorFilter) {
    where.vendor = vendorFilter;
  }

  if (search) {
    const searchFilter = { contains: search, mode: 'insensitive' };
    where.OR = [
      { name: searchFilter },
      { description: searchFilter },
      { keywords: { has: search } },
      { vendor: { businessName: searchFilter } },
      { category: searchFilter } // Product.category is a String
    ];
  }

  const cacheKey = `search:products:${city || ''}:${categoryId || ''}:${search || ''}:${offeringType || ''}:${verified || ''}:${trustSeal || ''}:${gst || ''}:${priceRange || ''}:${sort || ''}:${page}:${limit}`;
  const cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) {
    return res.status(200).json(new ApiResponse(200, cachedData, "Fetched from cache"));
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'Price: Low to High') {
    orderBy = { price: 'asc' };
  } else if (sort === 'Price: High to Low') {
    orderBy = { price: 'desc' };
  } else if (sort === 'Popularity') {
    orderBy = { vendor: { totalScore: 'desc' } };
  } else if (sort === 'Newest') {
    orderBy = { createdAt: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        vendor: {
          include: {
            categories: true,
            package: true,
            reviewsReceived: { select: { rating: true } }
          }
        }
      },
      skip,
      take,
      orderBy
    }),
    prisma.product.count({ where })
  ]);

  const responseData = {
    products,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take)
  };

  await cacheService.setCache(cacheKey, responseData, 60);

  res.status(200).json(new ApiResponse(200, responseData));
});

// Add Single Product
exports.addProduct = catchAsync(async (req, res, next) => {
  const {
    name, description, price, category, images, keywords,
    moq, availability, specifications, type, sku
  } = req.body;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
    include: { categories: true }
  });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  const product = await prisma.product.create({
    data: {
      name: name || 'Untitled Offering',
      description: description || '',
      price: parseFloat(price) || 0,
      category: category || (vendor.categories && vendor.categories[0]?.name) || '',
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      keywords: Array.isArray(keywords) ? keywords : [],
      moq: parseInt(moq) || 1,
      availability: availability !== undefined ? !!availability : true,
      specifications: specifications || '',
      sku: sku || '',
      type: type === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
      vendorId: vendor.id
    }
  });

  // Invalidate product & vendor caches
  await cacheService.clearCacheByPrefix('search:products');
  await cacheService.clearCacheByPrefix(`vendor:${vendor.id}`);
  await cacheService.clearCacheByPrefix('admin:offerings:pending');

  res.status(201).json(new ApiResponse(201, product, "Asset added successfully"));
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id }
  });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  // Find existing product to compare changes
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId, vendorId: vendor.id }
  });

  if (!existingProduct) return next(new AppError('Product not found', 404));

  const allowedFields = ['name', 'description', 'price', 'category', 'images', 'keywords', 'moq', 'availability', 'specifications', 'type', 'sku'];
  const criticalFields = ['name', 'description', 'category', 'images', 'specifications', 'type', 'sku'];
  const updateData = {};
  let requiresReapproval = false;

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      let value = req.body[key];

      // Apply specific formatting/transformations
      if (key === 'price') value = parseFloat(value) || 0;
      else if (key === 'moq') value = parseInt(value) || 1;
      else if (key === 'images') value = Array.isArray(value) ? value.slice(0, 5) : [];
      else if (key === 'keywords') value = Array.isArray(value) ? value : [];
      else if (key === 'availability') value = !!value;

      // Check if a critical field actually changed value
      if (criticalFields.includes(key)) {
         if (JSON.stringify(existingProduct[key]) !== JSON.stringify(value)) {
            requiresReapproval = true;
         }
      }

      updateData[key] = value;
    }
  });

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No valid fields provided for update', 400));
  }

  // If a critical field changed, revert status to PENDING for admin review
  if (requiresReapproval && existingProduct.status === 'APPROVED') {
    updateData.status = 'PENDING';
  }

  const product = await prisma.product.update({
    where: { id: productId, vendorId: vendor.id },
    data: updateData
  });

  // Invalidate all related caches
  await cacheService.deleteCache(`product:${productId}`);
  await cacheService.clearCacheByPrefix('search:products');
  await cacheService.clearCacheByPrefix(`vendor:${vendor.id}`);
  await cacheService.clearCacheByPrefix('admin:offerings:pending');

  res.status(200).json(new ApiResponse(200, product, "Asset updated successfully"));
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const cacheKey = `product:${productId}`;

  let product = await cacheService.getCache(cacheKey);

  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: { include: { user: true }, take: 10 },
        vendor: { include: { categories: true, gallery: { take: 3 } } }
      }
    });

    if (product) {
      await cacheService.setCache(cacheKey, product, 300);
    }
  }

  if (!product) return next(new AppError('Product not found', 404));

  const isOwner = req.user && req.user.id === product.vendor.userId;
  const isAdmin = req.user && (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN');

  if (product.status !== 'APPROVED' && !isOwner && !isAdmin) {
    return next(new AppError('Product pending approval.', 403));
  }

  if (!product.availability && !isOwner && !isAdmin) {
    return next(new AppError('Product is currently inactive.', 403));
  }

  if (!req.user || (!isOwner && !isAdmin)) {
    product.vendor.phone = '**********';
    product.vendor.email = product.vendor.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }

  res.status(200).json(new ApiResponse(200, product));
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id }
  });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  await prisma.product.delete({
    where: { id: productId, vendorId: vendor.id }
  });

  // Invalidate all related caches
  await cacheService.deleteCache(`product:${productId}`);
  await cacheService.clearCacheByPrefix('search:products');
  await cacheService.clearCacheByPrefix(`vendor:${vendor.id}`);
  await cacheService.clearCacheByPrefix('admin:offerings:pending');

  res.status(200).json(new ApiResponse(200, null, "Asset removed"));
});

// --- MOVED FROM ADMIN CONTROLLER ---

exports.getPendingOfferings = catchAsync(async (req, res, next) => {
  const {
    status,
    search,
    type,
    timeRange,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = req.query;
  const skip = (page - 1) * limit;

  const { id, role: userRole } = req.user;
  const cacheContext = userRole === "SUPERADMIN" ? "global" : id;
  const cacheKey = `admin:offerings:pending:${JSON.stringify(req.query)}:${cacheContext}`;
  let cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  const where = {};
  if (status && status !== "ALL") where.status = status;
  if (type && type !== "ALL") where.type = type;

  // Date Filtering Logic
  if (timeRange && timeRange !== "ALL") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (timeRange === "today") {
      where.createdAt = { gte: start, lte: end };
    } else if (timeRange === "yesterday") {
      const yesterday = new Date(start);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(end);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      where.createdAt = { gte: yesterday, lte: yesterdayEnd };
    } else if (timeRange === "weekly") {
      const weekAgo = new Date(start);
      weekAgo.setDate(weekAgo.getDate() - 7);
      where.createdAt = { gte: weekAgo, lte: end };
    } else if (timeRange === "monthly") {
      const monthAgo = new Date(start);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      where.createdAt = { gte: monthAgo, lte: end };
    } else if (timeRange === "custom" && startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }
  }

  // Hub-based filtering for admins
  const scopeWhere = {};

  if (userRole === "ADMIN") {
    const admin = await prisma.admin.findUnique({ where: { userId: id } });
    if (admin && admin.categoryIds?.length > 0) {
      scopeWhere.vendor = {
        categories: { some: { name: { in: admin.categoryIds } } },
      };
      where.vendor = scopeWhere.vendor;
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { vendor: { businessName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [offerings, filteredTotal, statsGroupBy] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            city: true,
            userId: true,
            logoUrl: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({
      by: ["status"],
      where: scopeWhere,
      _count: { id: true },
    }),
  ]);

  // Format stats
  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  statsGroupBy.forEach((item) => {
    const count = item._count.id;
    stats.total += count;
    if (item.status === "PENDING") stats.pending = count;
    if (item.status === "APPROVED") stats.approved = count;
    if (item.status === "REJECTED") stats.rejected = count;
  });

  const responseData = {
    offerings,
    total: filteredTotal,
    stats,
    page: parseInt(page),
    totalPages: Math.ceil(filteredTotal / limit),
  };

  await cacheService.setCache(cacheKey, responseData, 300); // 5 mins cache

  res.status(200).json(new ApiResponse(200, responseData));
});

exports.approveOffering = catchAsync(async (req, res, next) => {
  const { offeringId } = req.params;
  const offering = await prisma.product.update({
    where: { id: offeringId },
    data: { status: "APPROVED" },
    include: {
      vendor: {
        select: {
          userId: true,
          businessName: true,
          email: true,
          logoUrl: true,
          user: true,
        },
      },
    },
  });

  // Notify vendor
  await prisma.notification.create({
    data: {
      userId: offering.vendor.userId,
      title: "Offering Approved ✅",
      message: `Your ${offering.type.toLowerCase()} "${offering.name}" has been approved and is now visible to buyers on the marketplace.`,
    },
  });

  // Create Audit Log
  await logAction(
    req.user.id,
    "APPROVE_PRODUCT",
    "OFFERING",
    `Approved offering: ${offering.name} from vendor ${offering.vendor.businessName}`,
    req.ip,
  );

  // Invalidate caches
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.clearCacheByPrefix("search:products");
  await cacheService.clearCacheByPrefix("admin:offerings:pending");
  await cacheService.deleteCache(`product:${offeringId}`);

  // Notify vendor via Email
  await notificationService.notifyProductApproval(
    offering.vendor,
    offering,
    req.user.role,
  );

  res.status(200).json(new ApiResponse(200, offering, "Offering approved"));
});

exports.rejectOffering = catchAsync(async (req, res, next) => {
  const { offeringId } = req.params;
  const { reason } = req.body;
  const offering = await prisma.product.update({
    where: { id: offeringId },
    data: {
      status: "REJECTED",
      rejectionReason: reason || null,
    },
    include: {
      vendor: {
        select: {
          userId: true,
          businessName: true,
          email: true,
          user: true
        }
      }
    },
  });

  // Notify vendor
  await prisma.notification.create({
    data: {
      userId: offering.vendor.userId,
      title: "Offering Rejected ❌",
      message: `Your ${offering.type.toLowerCase()} "${offering.name}" was not approved. ${reason ? "Reason: " + reason : "Please review your listing and resubmit."}`,
    },
  });

  // Notify vendor via Email
  await notificationService.notifyProductRejection(offering.vendor, offering, reason);

  // Create Audit Log
  await logAction(
    req.user.id,
    "REJECT_PRODUCT",
    "OFFERING",
    `Rejected offering: ${offering.name}. Reason: ${reason || "N/A"}`,
    req.ip,
  );

  // Invalidate cache
  await cacheService.clearCacheByPrefix("admin:offerings:pending");
  await cacheService.clearCacheByPrefix("search:products");
  await cacheService.deleteCache(`product:${offeringId}`);

  res.status(200).json(new ApiResponse(200, offering, "Offering rejected"));
});

/**
 * Admin Edit Offering (modify details before approve/reject)
 */
exports.editOffering = catchAsync(async (req, res, next) => {
  const { offeringId } = req.params;
  const {
    name,
    description,
    price,
    category,
    imageUrl,
    moq,
    availability,
    specifications,
    type,
    status,
  } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price) || 0;
  if (category !== undefined) updateData.category = category;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (moq !== undefined) updateData.moq = parseInt(moq) || 1;
  if (availability !== undefined) updateData.availability = !!availability;
  if (specifications !== undefined) updateData.specifications = specifications;
  if (type !== undefined) updateData.type = type;
  if (status !== undefined) updateData.status = status;

  const offering = await prisma.product.update({
    where: { id: offeringId },
    data: updateData,
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
          city: true,
          userId: true,
          logoUrl: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  // Notify vendor if status changed
  if (status === "APPROVED") {
    await prisma.notification.create({
      data: {
        userId: offering.vendor.userId,
        title: "Offering Approved ✅",
        message: `Your ${offering.type.toLowerCase()} "${offering.name}" has been approved and is now visible to buyers on the marketplace.`,
      },
    });
  } else if (status === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: offering.vendor.userId,
        title: "Offering Rejected ❌",
        message: `Your ${offering.type.toLowerCase()} "${offering.name}" was not approved. Please review your listing and resubmit.`,
      },
    });
  }

  // Notify vendor if status changed to approved
  if (status === "APPROVED") {
    await notificationService.notifyProductApproval(
      offering.vendor,
      offering,
      req.user.role,
    );
  }

  // Invalidate cache
  await cacheService.clearCacheByPrefix("admin:offerings:pending");
  await cacheService.clearCacheByPrefix("search:products");
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.deleteCache(`product:${offeringId}`);

  res
    .status(200)
    .json(new ApiResponse(200, offering, "Offering updated successfully"));
});

exports.deleteOffering = catchAsync(async (req, res, next) => {
  const { offeringId } = req.params;
  const offering = await prisma.product.findUnique({ where: { id: offeringId } });
  if (!offering) return next(new AppError('Offering not found', 404));

  await prisma.product.delete({ where: { id: offeringId } });

  // Invalidate cache
  await cacheService.clearCacheByPrefix("admin:offerings:pending");
  await cacheService.clearCacheByPrefix("search:products");
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.deleteCache(`product:${offeringId}`);

  res.status(200).json(new ApiResponse(200, null, 'Offering deleted successfully'));
});
