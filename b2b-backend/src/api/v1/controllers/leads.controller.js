const prisma = require("../../../config/prisma");
const catchAsync = require("../../../shared/helpers/catch-async");
const AppError = require("../../../shared/errors/app-error");
const ApiResponse = require("../../../shared/helpers/api-response");
const leadService = require("../../../modules/leads/leads.service");
const { addLeadToQueue } = require("../../../queues");
const { logAction } = require("../../../shared/helpers/auditLogger");
const notificationService = require("../../../modules/notifications/notifications.service");

exports.createLead = catchAsync(async (req, res, next) => {
  const { buyerName, phone, city, categoryId, searchKeyword, message } = req.body;

  const lead = await prisma.lead.create({
    data: {
      buyerName,
      phone,
      city,
      categoryId,
      searchKeyword,
      message,
      type: 'INQUIRY',
      status: 'PENDING'
    }
  });

  addLeadToQueue(lead.id).catch(err => console.error("Lead queueing failed:", err));
  
  const cacheService = require("../../../services/cache.service");
  await cacheService.clearCacheByPrefix("admin:leads:all");

  res.status(201).json(new ApiResponse(201, lead, "Inquiry submitted successfully."));
});

exports.createIdleLead = catchAsync(async (req, res, next) => {
  const { buyerName, phone, city, categoryId, searchKeyword, message } = req.body;

  const lead = await prisma.lead.create({
    data: {
      buyerName,
      phone,
      city,
      categoryId,
      searchKeyword,
      message,
      type: 'IDLE',
      status: 'PENDING'
    }
  });

  addLeadToQueue(lead.id).catch(err => console.error("Idle lead queueing failed:", err));
  
  const cacheService = require("../../../services/cache.service");
  await cacheService.clearCacheByPrefix("admin:leads:all");

  res.status(201).json(new ApiResponse(201, lead, "Idle lead captured."));
});

exports.createDirectLead = catchAsync(async (req, res, next) => {
  const { buyerName, phone, city, categoryId, vendorId, actionType, message: bodyMessage } = req.body;

  if (!vendorId || !actionType) {
    return next(new AppError('vendorId and actionType are required for direct leads', 400));
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { categories: { select: { id: true }, take: 1 } }
  });
  if (!vendor) return next(new AppError('Vendor not found', 404));

  // Resolve categoryId — use provided, fallback to vendor's first category, or omit
  const resolvedCategoryId = categoryId || vendor.categories?.[0]?.id || null;

  const lead = await prisma.lead.create({
    data: {
      buyerName: buyerName ? buyerName.split(' ').map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ') : 'Anonymous Buyer',
      phone: phone || 'N/A',
      city: city || vendor.city,
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
      vendorId: vendorId,
      message: bodyMessage || `DIRECT ${actionType}: Interested in your business. Buyer Phone: ${phone || 'N/A'}`,
      type: 'DIRECT',
      status: 'DISTRIBUTED'
    }
  });

  await prisma.leadLifecycle.create({
    data: {
      leadId: lead.id,
      action: `DIRECT_${actionType}`,
      details: `User initiated a direct ${actionType} with the vendor.`
    }
  });

  try {
    const socketService = require('../../../socket');
    const io = socketService.getIo();
    if (io) {
      io.to(`vendor_${vendorId}`).emit('new_lead', lead);
    }
  } catch (err) {
    console.error('[SOCKET] Failed to emit new_lead:', err);
  }

  const cacheService = require("../../../services/cache.service");
  await cacheService.clearCacheByPrefix("admin:leads:all");
  await cacheService.clearCacheByPrefix(`vendor:leads:${vendorId}`);

  res.status(201).json(new ApiResponse(201, lead, "Direct action logged."));
});


const cacheService = require("../../../services/cache.service");

exports.getVendorLeads = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = 'ALL', sort = 'newest' } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor && req.user.role !== 'SUPERADMIN') {
    return next(new AppError('Vendor profile not found', 404));
  }
  const targetVendorId = req.user.role === 'SUPERADMIN' ? req.params.vendorId : vendor.id;

  const cacheKey = `vendor:leads:${targetVendorId}:${pageNum}:${limitNum}:${search}:${status}:${sort}`;
  let responseData = await cacheService.getCache(cacheKey);

  if (!responseData) {
    const whereClause = { vendorId: targetVendorId };
    
    if (status !== 'ALL') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { buyerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const orderBy = { createdAt: sort === 'oldest' ? 'asc' : 'desc' };

    const [leads, total, totalInquiries, activeDeals, wonDeals, expiredDeals] = await Promise.all([
      prisma.lead.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limitNum,
        include: { lifecycle: true, category: true }
      }),
      prisma.lead.count({ where: whereClause }),
      prisma.lead.count({ where: { vendorId: targetVendorId } }),
      prisma.lead.count({ where: { vendorId: targetVendorId, status: { in: ['DISTRIBUTED', 'PENDING'] } } }),
      prisma.lead.count({ where: { vendorId: targetVendorId, status: 'CLOSED' } }),
      prisma.lead.count({ where: { vendorId: targetVendorId, status: 'EXPIRED' } })
    ]);

    responseData = {
      leads,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      stats: {
        totalInquiries,
        activeDeals,
        wonDeals,
        expiredDeals
      }
    };

    await cacheService.setCache(cacheKey, responseData, 60); // 1 minute cache
  }

  res.status(200).json(new ApiResponse(200, responseData));
});

exports.updateLeadStatus = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const { status } = req.body;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return next(new AppError('Lead not found', 404));

  if (status === 'CLOSED') {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { status: 'CLOSED' }
      }),
      prisma.leadLifecycle.create({
        data: {
          leadId,
          action: 'CLOSED_BY_VENDOR',
          details: 'Vendor successfully closed the lead.'
        }
      })
    ]);

    if (lead.vendorId) {
      await cacheService.clearCacheByPrefix(`vendor:leads:${lead.vendorId}`);
    }
    await cacheService.clearCacheByPrefix("admin:leads:all");

    return res.status(200).json(new ApiResponse(200, null, 'Lead closed successfully'));
  }

  if (status === 'REDISTRIBUTE') {
    try {
      await leadService.redistributeLead(leadId);
    } catch (err) {
      console.error("Redistribution failed:", err);
      return next(new AppError('Failed to redistribute lead', 500));
    }
    
    if (lead.vendorId) {
      await cacheService.clearCacheByPrefix(`vendor:leads:${lead.vendorId}`);
    }
    await cacheService.clearCacheByPrefix("admin:leads:all");

    return res.status(200).json(new ApiResponse(200, null, 'Lead has been sent for redistribution'));
  }

  if (status === 'EXPIRED') {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { status: 'EXPIRED' }
      }),
      prisma.leadLifecycle.create({
        data: {
          leadId,
          action: 'EXPIRED_BY_ADMIN',
          details: 'Admin manually marked the lead as expired.'
        }
      })
    ]);

    if (lead.vendorId) {
      await cacheService.clearCacheByPrefix(`vendor:leads:${lead.vendorId}`);
    }
    await cacheService.clearCacheByPrefix("admin:leads:all");

    return res.status(200).json(new ApiResponse(200, null, 'Lead expired successfully'));
  }

  return next(new AppError('Invalid status update', 400));
});

exports.addLeadNote = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const { note } = req.body;

  if (!note) return next(new AppError('Note content is required', 400));

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return next(new AppError('Lead not found', 404));

  await prisma.leadLifecycle.create({
    data: {
      leadId,
      action: 'VENDOR_NOTE',
      details: note,
      vendorId: req.user.role === 'VENDOR' ? req.user.id : null // Assuming req.user is set
    }
  });

  if (lead.vendorId) {
    await cacheService.clearCacheByPrefix(`vendor:leads:${lead.vendorId}`);
  }

  res.status(201).json(new ApiResponse(201, null, 'Note added successfully'));
});

exports.matchWithYou = catchAsync(async (req, res, next) => {
  const { buyerName, phone, city, categoryId, message, searchKeyword } = req.body;

  if (!city || !categoryId) {
    return next(new AppError('City and Category are required for Smart Match', 400));
  }

  const matchedVendors = await prisma.vendor.findMany({
    where: {
      city: { equals: city, mode: 'insensitive' },
      categories: { some: { id: categoryId } },
      verified: true,
      user: { isActive: true }
    },
    select: {
      id: true,
      businessName: true,
      city: true,
      totalScore: true,
      products: { select: { name: true }, take: 3 },
      package: { select: { name: true, priority: true } }
    },
    orderBy: [
      { package: { priority: 'desc' } },
      { totalScore: 'desc' }
    ],
    take: 5
  });

  const lead = await prisma.lead.create({
    data: {
      buyerName,
      phone,
      city,
      categoryId,
      message,
      type: 'INQUIRY',
      status: 'PENDING',
      searchKeyword: searchKeyword || 'SMART_MATCH'
    }
  });

  addLeadToQueue(lead.id).catch(err => console.error("Match lead queueing failed:", err));

  const cacheService = require("../../../services/cache.service");
  await cacheService.clearCacheByPrefix("admin:leads:all");

  res.status(200).json(new ApiResponse(200, {
    message: "We've matched you with the best vendors!",
    matchedVendors,
    leadId: lead.id
  }));
});

// --- MOVED FROM ADMIN CONTROLLER ---

exports.reassignLead = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const { vendorId } = req.body;
  console.log(
    "[DEBUG-REASSIGN] Reassigning Lead:",
    leadId,
    "to Vendor:",
    vendorId,
  );

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { vendorId, status: "DISTRIBUTED" },
    include: { vendor: { include: { categories: true, user: true } } },
  });

  await prisma.leadLifecycle.create({
    data: {
      leadId,
      action: "DISTRIBUTED", // Using DISTRIBUTED so the rotation logic picks it up
      details: `Admin manually reassigned lead to vendor ${lead.vendor.businessName} (${lead.vendor.id})`,
    },
  });

  // Create In-App Notification
  await prisma.notification.create({
    data: {
      userId: lead.vendor.userId,
      title: "New Priority Lead! 🚀",
      message: `Admin has assigned a new lead from ${lead.buyerName} to you.`,
    },
  });

  // Create Audit Log
  await logAction(
    req.user.id,
    "REASSIGN_LEAD",
    "LEAD",
    `Reassigned lead from ${lead.buyerName || lead.phone || leadId} to vendor ${lead.vendor.businessName}`,
    req.ip,
  );

  // Notify vendor
  await notificationService.notifyLeadAssignment(
    lead.vendor,
    lead,
    req.user.role,
  );
  
  await cacheService.clearCacheByPrefix("admin:leads:all");
  await cacheService.clearCacheByPrefix(`vendor:leads:${vendorId}`);

  res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead reassigned successfully"));
});

exports.getAllLeads = catchAsync(async (req, res, next) => {
  const { status, city, categoryId, search, type, timeRange, startDate, endDate, page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;
  const { id, role: userRole } = req.user;

  const cacheContext = userRole === "SUPERADMIN" ? "global" : id;
  const cacheKey = `admin:leads:all:${JSON.stringify(req.query)}:${cacheContext}`;
  let cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  const where = {};
  if (status && status !== "ALL") where.status = status;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;

  if (search) {
    where.OR = [
      { requesterName: { contains: search, mode: "insensitive" } },
      { requesterPhone: { contains: search, mode: "insensitive" } }
    ];
  }

  if (timeRange && timeRange !== "ALL") {
    const now = new Date();
    if (timeRange === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      where.createdAt = { gte: startOfDay };
    } else if (timeRange === "yesterday") {
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(now.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startOfYesterday, lte: endOfYesterday };
    } else if (timeRange === "weekly") {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      where.createdAt = { gte: lastWeek };
    } else if (timeRange === "monthly") {
      const lastMonth = new Date(now);
      lastMonth.setDate(now.getDate() - 30);
      where.createdAt = { gte: lastMonth };
    }
  } else if (startDate && endDate) {
    where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { vendor: { include: { categories: true } }, category: true },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.count({ where }),
  ]);

  const responseData = {
    leads,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };

  await cacheService.setCache(cacheKey, responseData, 300); // 5 mins cache

  res.status(200).json(new ApiResponse(200, responseData));
});
