const prisma = require("../../../config/prisma");
const catchAsync = require("../../../shared/helpers/catch-async");
const AppError = require("../../../shared/errors/app-error");
const ApiResponse = require("../../../shared/helpers/api-response");
const { encrypt, decrypt } = require("../../../shared/helpers/encryption"); // Need to ensure encryption helper is in shared
const notificationService = require("../../../modules/notifications/notifications.service");
const leadService = require("../../../modules/leads/leads.service");
const cacheService = require("../../../services/cache.service");

// Register Vendor
exports.registerVendor = catchAsync(async (req, res, next) => {
  const {
    businessName, email, phone, gstNumber, aadhaarNumber,
    city, categoryIds, description, address, socialLinks,
    googleBusinessLink, workingHours, logoUrl, verificationDocument
  } = req.body;

  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id }
  });

  if (existingVendor) {
    return next(new AppError('Vendor profile already exists for this user', 400));
  }

  const encryptedGst = gstNumber ? encrypt(gstNumber) : null;
  const encryptedAadhaar = aadhaarNumber ? encrypt(aadhaarNumber) : null;

  const vendor = await prisma.vendor.create({
    data: {
      userId: req.user.id,
      businessName,
      email,
      phone,
      gstNumber: encryptedGst,
      aadhaarNumber: encryptedAadhaar,
      city,
      categories: {
        connect: (categoryIds || []).map(id => ({ id }))
      },
      description,
      address,
      socialLinks,
      googleBusinessLink,
      workingHours,
      logoUrl,
      verificationDocument,
      profileCompleteness: 40
    },
    include: { categories: true }
  });

  const responseVendor = {
    ...vendor,
    gstNumber: vendor.gstNumber ? decrypt(vendor.gstNumber) : null,
    aadhaarNumber: vendor.aadhaarNumber ? decrypt(vendor.aadhaarNumber) : null
  };

  await notificationService.notifyVendorRegistration(responseVendor);

  res.status(201).json(new ApiResponse(201, responseVendor, "Vendor registration submitted."));
});

// Search Vendors
exports.searchVendors = catchAsync(async (req, res, next) => {
  const { city, categoryId, search, offeringType, verified, trustSeal, gst, priceRange, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (verified === 'true') where.verified = true;
  if (trustSeal === 'true') where.trustBadge = 'TRUST_SEAL';
  if (gst === 'true') where.gstNumber = { not: null };

  if (city) {
    where.city = { contains: city.trim(), mode: 'insensitive' };
  }
  if (categoryId) {
    where.categories = { some: { id: categoryId } };
  }

  let productsFilter = { status: 'APPROVED', availability: true };
  if (offeringType) {
    productsFilter.type = offeringType;
  }
  if (priceRange) {
    const [minStr, maxStr] = priceRange.split("-");
    const min = parseInt(minStr) || 0;
    const max = maxStr === "max" ? Infinity : parseInt(maxStr);
    productsFilter.price = { gte: min };
    if (max !== Infinity) productsFilter.price.lte = max;
  }

  if (Object.keys(productsFilter).length > 2 || priceRange) {
    where.products = { some: productsFilter };
  } else if (offeringType) {
    where.products = { some: { type: offeringType, status: 'APPROVED', availability: true } };
  }

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { keywords: { some: { name: { contains: search, mode: 'insensitive' } } } },
      { products: { some: { name: { contains: search, mode: 'insensitive' }, status: 'APPROVED', availability: true } } }
    ];
  }

  const cacheKey = `search:vendors:${city || ''}:${categoryId || ''}:${search || ''}:${offeringType || ''}:${verified || ''}:${trustSeal || ''}:${gst || ''}:${priceRange || ''}:${page}:${limit}`;
  const cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) {
    return res.status(200).json(new ApiResponse(200, cachedData, "Fetched from cache"));
  }

  const [vendors, total, totalProducts] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        categories: true,
        products: {
          where: { status: 'APPROVED', availability: true },
          take: 4 // Optimization: Only load up to 4 products for search preview to prevent heavy memory usage
        },
        package: true,
        reviewsReceived: { select: { rating: true } }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { totalScore: 'desc' }
    }),
    prisma.vendor.count({ where }),
    prisma.product.count({
      where: {
        status: 'APPROVED',
        availability: true,
        vendor: where
      }
    })
  ]);

  const responseData = {
    vendors,
    total,
    totalProducts,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };

  await cacheService.setCache(cacheKey, responseData, 60);

  res.status(200).json(new ApiResponse(200, responseData));
});

// Get Single Vendor
exports.getVendorById = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const cacheKey = `vendor:profile:${vendorId}`;

  let vendor = await cacheService.getCache(cacheKey);

  if (!vendor) {
    vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        categories: true,
        reviewsReceived: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        products: { where: { status: 'APPROVED', availability: true } },
        gallery: { take: 10 },
        certifications: true,
        package: true
      }
    });

    if (vendor) {
      await cacheService.setCache(cacheKey, vendor, 300); // cache for 5 minutes
    }
  }

  if (!vendor) return next(new AppError('Vendor not found', 404));

  // Clone vendor object before modifying it so we don't mutate the cached object by reference
  const responseVendor = JSON.parse(JSON.stringify(vendor));

  if (!req.user) {
    responseVendor.phone = '**********';
    responseVendor.email = responseVendor.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }

  res.status(200).json(new ApiResponse(200, responseVendor));
});

// Get My Profile
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const cacheKey = `vendor:me:${req.user.id}`;
  let vendor = await cacheService.getCache(cacheKey);

  if (!vendor) {
    vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        package: true,
        products: true,
        keywords: true,
        gallery: true,
        certifications: true,
        categories: true
      }
    });

    if (vendor) {
      await cacheService.setCache(cacheKey, vendor, 300);
    }
  }

  if (!vendor) return res.status(200).json(new ApiResponse(200, null, 'No vendor profile yet'));

  const decryptedVendor = {
    ...vendor,
    gstNumber: vendor.gstNumber ? decrypt(vendor.gstNumber) : null,
    aadhaarNumber: vendor.aadhaarNumber ? decrypt(vendor.aadhaarNumber) : null
  };

  res.status(200).json(new ApiResponse(200, decryptedVendor));
});


// Update Profile
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const {
    businessName, description, address,
    socialLinks, googleBusinessLink, workingHours,
    products, keywords, categoryIds, verificationDocument,
    gstNumber, aadhaarNumber, logoUrl
  } = req.body;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
    include: { categories: true }
  });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  if (products && Array.isArray(products)) {
    const snapshot = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { name: true, status: true }
    });
    const statusMap = Object.fromEntries(snapshot.map(s => [s.name, s.status]));

    await prisma.product.deleteMany({ where: { vendorId: vendor.id } });
    if (products.length > 0) {
      const dataToInject = products.map(p => {
        const data = typeof p === 'object' ? p : { name: p };
        return {
          name: data.name || 'Untitled Offering',
          description: data.description || '',
          price: parseFloat(data.price) || 0,
          category: data.category || (vendor.categories && vendor.categories[0]?.name) || '',
          images: Array.isArray(data.images) ? data.images.slice(0, 5) : [],
          moq: parseInt(data.moq) || 1,
          availability: data.availability !== undefined ? !!data.availability : true,
          specifications: data.specifications || '',
          type: data.type === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
          status: statusMap[data.name] || 'PENDING',
          vendorId: vendor.id
        };
      });
      await prisma.product.createMany({ data: dataToInject });
    }
  }

  if (keywords && Array.isArray(keywords)) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        keywords: {
          set: [],
          connectOrCreate: keywords.map(k => {
            const nameStr = typeof k === 'object' && k !== null ? k.name : k;
            return {
              where: { name: nameStr },
              create: { name: nameStr }
            };
          }).filter(k => k.where.name) // ensure no empty names are passed
        }
      }
    });
  }

  // Check if email or phone is already used by another vendor
  if (req.body.email || req.body.phone) {
    const existingContact = await prisma.vendor.findFirst({
      where: {
        id: { not: vendor.id },
        OR: [
          ...(req.body.email ? [{ email: req.body.email }] : []),
          ...(req.body.phone ? [{ phone: req.body.phone }] : [])
        ]
      }
    });

    if (existingContact) {
      if (req.body.email && existingContact.email === req.body.email) {
        return next(new AppError('This business email is already in use by another vendor', 400));
      }
      if (req.body.phone && existingContact.phone === req.body.phone) {
        return next(new AppError('This business phone number is already in use by another vendor', 400));
      }
    }
  }

  const updateData = {};
  if (req.body.email !== undefined) updateData.email = req.body.email;
  if (req.body.phone !== undefined) updateData.phone = req.body.phone;
  if (businessName !== undefined) updateData.businessName = businessName;
  if (description !== undefined) updateData.description = description;
  if (address !== undefined) updateData.address = address;
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
  if (googleBusinessLink !== undefined) updateData.googleBusinessLink = googleBusinessLink;
  if (workingHours !== undefined) updateData.workingHours = workingHours;
  if (verificationDocument !== undefined) updateData.verificationDocument = verificationDocument;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (gstNumber !== undefined) updateData.gstNumber = gstNumber ? encrypt(gstNumber) : null;
  if (aadhaarNumber !== undefined) updateData.aadhaarNumber = aadhaarNumber ? encrypt(aadhaarNumber) : null;

  if (categoryIds && Array.isArray(categoryIds)) {
    updateData.categories = {
      set: [],
      connect: categoryIds.map(id => ({ id }))
    };
  }

  const updatedVendor = await prisma.vendor.update({
    where: { id: vendor.id },
    data: updateData,
    include: { categories: true, products: true, keywords: true }
  });

  const responseVendor = {
    ...updatedVendor,
    gstNumber: updatedVendor.gstNumber ? decrypt(updatedVendor.gstNumber) : null,
    aadhaarNumber: updatedVendor.aadhaarNumber ? decrypt(updatedVendor.aadhaarNumber) : null
  };

  await cacheService.clearCacheByPrefix('search:vendors');
  await cacheService.deleteCache(`vendor:profile:${vendor.id}`);
  await cacheService.deleteCache(`vendor:me:${req.user.id}`);

  res.status(200).json(new ApiResponse(200, responseVendor, "Profile updated successfully"));
});

// Sensitive Info Change
exports.updateSensitiveInfo = catchAsync(async (req, res, next) => {
  const { gstNumber, aadhaarNumber } = req.body;
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id }
  });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  const data = {};
  if (gstNumber) data.gstNumber = encrypt(gstNumber);
  if (aadhaarNumber) data.aadhaarNumber = encrypt(aadhaarNumber);

  await prisma.vendor.update({
    where: { id: vendor.id },
    data
  });

  res.status(200).json(new ApiResponse(200, null, "Sensitive info updated."));
});


// Gallery Management
exports.addGalleryImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(new AppError('Upload images', 400));

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });

  const images = req.files.map(file => ({
    vendorId: vendor.id,
    url: file.path,
    publicId: file.filename
  }));

  await prisma.galleryImage.createMany({ data: images });
  res.status(201).json(new ApiResponse(201, images, "Images added"));
});

exports.removeGalleryImage = catchAsync(async (req, res, next) => {
  const { imageId } = req.params;
  await prisma.galleryImage.delete({ where: { id: imageId } });
  res.status(200).json(new ApiResponse(200, null, "Image removed"));
});

exports.addCertification = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Upload certification', 400));

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });

  const certification = await prisma.certification.create({
    data: {
      vendorId: vendor.id,
      name: req.body.name || 'Certification',
      url: req.file.path
    }
  });

  res.status(201).json(new ApiResponse(201, certification, "Certification added"));
});

exports.addReview = catchAsync(async (req, res, next) => {
  const { vendorId, productId, rating, comment } = req.body;

  const review = await prisma.review.create({
    data: {
      userId: req.user.id,
      vendorId,
      productId: productId || null,
      rating,
      comment
    }
  });

  await leadService.recalculateRankings(vendorId);
  res.status(201).json(new ApiResponse(201, review, "Review added"));
});

exports.getPackages = catchAsync(async (req, res, next) => {
  const packages = await prisma.package.findMany();
  res.status(200).json(new ApiResponse(200, packages));
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const cacheKey = 'categories:all';
  let categories = await cacheService.getCache(cacheKey);
  if (!categories) {
    categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    await cacheService.setCache(cacheKey, categories, 3600);
  }
  res.status(200).json(new ApiResponse(200, categories));
});

exports.uploadProductImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Upload image', 400));
  res.status(200).json(new ApiResponse(200, { url: req.file.path }));
});

exports.addFeedback = exports.addReview;

exports.getVendorAnalytics = catchAsync(async (req, res, next) => {
  const cacheKey = `vendor:analytics:${req.user.id}`;
  let analyticsData = await cacheService.getCache(cacheKey);

  if (!analyticsData) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: { categories: true, products: true }
    });

    if (!vendor) return next(new AppError('Vendor not found', 404));

    const leadStats = await prisma.lead.groupBy({
      by: ['status'],
      where: { vendorId: vendor.id },
      _count: { id: true }
    });

    let categoryRank = 0;
    if (vendor.categories.length > 0) {
      categoryRank = await prisma.vendor.count({
        where: {
          categories: { some: { id: vendor.categories[0].id } },
          totalScore: { gt: vendor.totalScore }
        }
      }) + 1;
    }

    const rankings = await prisma.ranking.findMany({
      where: { vendorId: vendor.id },
      take: 7,
      orderBy: { date: 'desc' }
    });

    const totalLeads = await prisma.lead.count({ where: { vendorId: vendor.id } });
    const respondedLeads = await prisma.lead.count({
      where: { vendorId: vendor.id, status: { not: 'PENDING' } }
    });
    const responseRate = totalLeads > 0 ? `${Math.round((respondedLeads / totalLeads) * 100)}%` : 'N/A';

    analyticsData = {
      leads: leadStats,
      totalLeads,
      categoryRank: `#${categoryRank}`,
      responseRate: responseRate,
      rankings: rankings.length > 0 ? rankings.reverse() : [],
      profileCompleteness: vendor.profileCompleteness || 40
    };

    // No caching for analytics — must always be real-time
  }

  res.status(200).json(new ApiResponse(200, analyticsData));
});

exports.getCities = catchAsync(async (req, res, next) => {
  const vendors = await prisma.vendor.findMany({
    select: { city: true },
    distinct: ['city']
  });

  const cities = vendors
    .map(v => v.city)
    .filter(Boolean)
    .sort();

  res.status(200).json(new ApiResponse(200, cities));
});

/**
 * =====================================
 * ADMIN VENDOR MANAGEMENT FUNCTIONS
 * =====================================
 */

/**
 * Vendor Approval
 */
exports.approveVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      verified: true,
      status: "VERIFIED"
    },
    include: { user: true },
  });

  // Upgrade user's role to VENDOR
  await prisma.user.update({
    where: { id: vendor.userId },
    data: { role: "VENDOR" },
  });

  // Create In-App Notification
  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      title: "Business Verified!",
      message:
        "Your business profile has been verified by the Admin. You are now eligible to receive leads.",
    },
  });

  // Create Audit Log
  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(
    req.user.id,
    "APPROVE_VENDOR",
    "VENDOR",
    `Approved vendor: ${vendor.businessName}`,
    req.ip,
  );

  // Clear Search Cache & Recalculate Initial Ranking
  const leadService = require("../../../modules/leads/leads.service");
  await leadService.recalculateRankings(vendorId);
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.clearCacheByPrefix("admin:vendors:pending");
  await cacheService.clearCacheByPrefix(`vendor:me:${vendor.userId}`);
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);

  // Notify vendor
  await notificationService.notifyVendorApproval(vendor, req.user.role);

  res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor approved successfully"));
});

exports.unverifyVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      verified: false,
      status: "PENDING"
    },
    include: { user: true },
  });

  // Create In-App Notification
  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      title: "Verification Revoked",
      message:
        "Your verification status has been revoked by the Admin. Please contact support for more details.",
    },
  });

  // Create Audit Log
  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(
    req.user.id,
    "UNVERIFY_VENDOR",
    "VENDOR",
    `Unverified vendor: ${vendor.businessName}`,
    req.ip,
  );

  await cacheService.clearCacheByPrefix("admin:vendors:pending");
  await cacheService.clearCacheByPrefix(`vendor:me:${vendor.userId}`);
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);

  res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor verification revoked"));
});

exports.rejectVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { reason } = req.body || {};

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      status: "REJECTED",
      verified: false,
      rejectionReason: reason || null,
    },
    include: { user: true },
  });

  // Create In-App Notification
  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      title: "Application Rejected",
      message: `Your vendor application was rejected. Reason: ${reason || "Incomplete documentation"}`,
    },
  });

  // Notify vendor via Email
  await notificationService.notifyVendorRejection(vendor, reason);

  // Create Audit Log
  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(
    req.user.id,
    "REJECT_VENDOR",
    "VENDOR",
    `Rejected vendor: ${vendor.businessName}. Reason: ${reason || "N/A"}`,
    req.ip,
  );

  await cacheService.clearCacheByPrefix("admin:vendors:pending");
  await cacheService.clearCacheByPrefix(`vendor:me:${vendor.userId}`);
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);

  res.status(200).json(new ApiResponse(200, null, "Vendor application rejected"));
});

/**
 * Update Vendor Details
 */
exports.updateVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  const allowedFields = [
    "businessName", "phone", "email", "address", "city",
    "gstNumber", "aadhaarNumber", "description",
    "googleBusinessLink", "workingHours", "logoUrl",
    "verificationDocument", "status", "verified",
    "trustBadge", "profileCompleteness", "responseTime",
    "loginFrequency", "leadClosureRate", "totalScore",
    "manualBoost", "packageId", "planExpiry"
  ];

  let updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (["profileCompleteness", "loginFrequency"].includes(field)) {
        updateData[field] = parseInt(req.body[field], 10);
      } else if (["responseTime", "leadClosureRate", "totalScore", "manualBoost"].includes(field)) {
        updateData[field] = parseFloat(req.body[field]);
      } else if (field === "planExpiry" && req.body[field]) {
        updateData[field] = new Date(req.body[field]);
      } else {
        updateData[field] = req.body[field];
      }
    }
  });

  if (Array.isArray(req.body.categoryIds)) {
    updateData.categories = {
      set: req.body.categoryIds.map(id => ({ id }))
    };
  }

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: updateData,
  });

  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(req.user.id, "UPDATE_VENDOR", "VENDOR", `Updated vendor: ${vendor.businessName}`, req.ip);
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);
  await cacheService.clearCacheByPrefix("admin:vendors:pending");

  res.status(200).json(new ApiResponse(200, vendor, "Vendor updated successfully"));
});

/**
 * Delete Vendor
 */
exports.deleteVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  await prisma.vendor.delete({
    where: { id: vendorId }
  });

  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(req.user.id, "DELETE_VENDOR", "VENDOR", `Deleted vendor: ${vendorId}`, req.ip);
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);
  await cacheService.clearCacheByPrefix("admin:vendors:pending");

  res.status(200).json(new ApiResponse(200, null, "Vendor deleted successfully"));
});

/**
 * Update Vendor Trust Badge
 */
exports.updateVendorBadge = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { trustBadge } = req.body;

  if (!trustBadge || !['NONE', 'VERIFIED', 'GOLD_SUPPLIER', 'TRUST_SEAL'].includes(trustBadge)) {
    return next(new AppError('Invalid or missing trust badge', 400));
  }

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { trustBadge },
  });

  // Create Audit Log
  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(
    req.user.id,
    "UPDATE_VENDOR_BADGE",
    "VENDOR",
    `Updated vendor badge to ${trustBadge} for ${vendor.businessName}`,
    req.ip,
  );

  // Clear cache
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);
  await cacheService.clearCacheByPrefix("admin:vendors:pending");

  res.status(200).json(new ApiResponse(200, vendor, "Vendor badge updated successfully"));
});

/**
 * Get all vendors awaiting verification
 */
exports.getPendingVendors = catchAsync(async (req, res, next) => {
  const {
    search,
    city,
    status,
    timeRange,
    categoryId,
    packageId,
    page = 1,
    limit = 50,
  } = req.query;
  const { id, role } = req.user;
  const skip = (page - 1) * limit;

  const cacheContext = role === "SUPERADMIN" ? "global" : id;
  const cacheKey = `admin:vendors:pending:v2:${JSON.stringify(req.query)}:${cacheContext}`;
  let cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  const where = {};

  if (timeRange && ["today", "yesterday", "weekly", "monthly", "yearly"].includes(timeRange)) {
    const now = new Date();
    if (timeRange === "today") {
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      where.createdAt = { gte: startOfToday };
    } else if (timeRange === "yesterday") {
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(now);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startOfYesterday, lte: endOfYesterday };
    } else {
      const startDate = new Date();
      if (timeRange === "weekly") startDate.setDate(startDate.getDate() - 7);
      if (timeRange === "monthly") startDate.setMonth(startDate.getMonth() - 1);
      if (timeRange === "yearly") startDate.setFullYear(startDate.getFullYear() - 1);
      where.createdAt = { gte: startDate };
    }
  }

  if (status === "VERIFIED") {
    where.status = "VERIFIED";
  } else if (status === "PENDING") {
    where.status = "PENDING";
  } else if (status === "REJECTED") {
    where.status = "REJECTED";
  } else {
    if (status !== "ALL") {
      where.status = "PENDING";
    }
  }

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (categoryId) {
    where.categories = { some: { id: categoryId } };
  }

  if (packageId) {
    where.packageId = packageId;
  }

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [vendors, total] = await prisma.$transaction([
    prisma.vendor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true, role: true } },
        categories: { select: { id: true, name: true } },
        products: { take: 5, select: { id: true, name: true, price: true, type: true, images: true } },
        certifications: true,
        gallery: true,
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(skip),
      take: parseInt(limit),
    }),
    prisma.vendor.count({ where }),
  ]);

  const decryptedVendors = vendors.map((vendor) => {
    let gst = null;
    let aadhaar = null;
    if (vendor.gstNumber) { try { gst = decrypt(vendor.gstNumber); } catch (e) { gst = vendor.gstNumber; } }
    if (vendor.aadhaarNumber) { try { aadhaar = decrypt(vendor.aadhaarNumber); } catch (e) { aadhaar = vendor.aadhaarNumber; } }
    return { ...vendor, gstNumber: gst, aadhaarNumber: aadhaar };
  });

  const responseData = {
    vendors: decryptedVendors,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };

  await cacheService.setCache(cacheKey, responseData, 300);
  res.status(200).json(new ApiResponse(200, responseData));
});

exports.getVendorSecureDetails = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { businessName: true, gstNumber: true, aadhaarNumber: true, verificationDocument: true },
  });
  if (!vendor) return next(new AppError("Vendor not found", 404));

  const secureData = {
    ...vendor,
    gstNumber: vendor.gstNumber ? decrypt(vendor.gstNumber) : null,
    aadhaarNumber: vendor.aadhaarNumber ? decrypt(vendor.aadhaarNumber) : null,
  };

  res.status(200).json(new ApiResponse(200, secureData, "Secure details retrieved"));
});

exports.manualBoostVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { boostScore } = req.body;
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { manualBoost: parseFloat(boostScore) },
  });
  await leadService.recalculateRankings(vendorId);
  await cacheService.clearCacheByPrefix("search:vendors");
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);
  await cacheService.clearCacheByPrefix("admin:vendors:pending");

  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(req.user.id, "BOOST_VENDOR", "VENDOR", `Applied +${boostScore} manual boost to vendor ${vendor.businessName}`, req.ip);

  res.status(200).json(new ApiResponse(200, vendor, "Vendor boost applied"));
});

exports.suspendVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { suspend } = req.body;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });

  await prisma.user.update({
    where: { id: vendor.userId },
    data: { isActive: !suspend },
  });

  const { logAction } = require("../../../shared/helpers/auditLogger");
  await logAction(req.user.id, suspend ? "SUSPEND_VENDOR" : "UNSUSPEND_VENDOR", "VENDOR", `${suspend ? "Suspended" : "Unsuspended"} vendor linked to user ${vendor.userId}`, req.ip);

  await cacheService.clearCacheByPrefix("admin:users:all");
  await cacheService.clearCacheByPrefix(`vendor:me:${vendor.userId}`);
  await cacheService.clearCacheByPrefix(`vendor:${vendorId}`);
  await cacheService.clearCacheByPrefix("admin:vendors:pending");

  res.status(200).json(new ApiResponse(200, null, suspend ? "Vendor suspended" : "Vendor unsuspended"));
});

exports.getVendorApprovals = catchAsync(async (req, res, next) => {
  const vendors = await prisma.vendor.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(new ApiResponse(200, vendors));
});

const seoService = require("../../../modules/marketplace/seo.service");
exports.getGoogleMerchantFeed = catchAsync(async (req, res, next) => {
  const feed = await seoService.generateMerchantFeed();
  res.status(200).json(new ApiResponse(200, feed, "Google Merchant feed generated successfully"));
});
