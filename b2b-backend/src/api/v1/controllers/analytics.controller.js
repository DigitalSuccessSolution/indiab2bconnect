const prisma = require('../../../config/prisma');
const catchAsync = require('../../../shared/helpers/catch-async');
const AppError = require('../../../shared/errors/app-error');
const ApiResponse = require('../../../shared/helpers/api-response');
const cacheService = require('../../../services/cache.service');
const { logAction } = require('../../../shared/helpers/auditLogger');
const { decrypt } = require('../../../shared/helpers/encryption');



/**
 * Comprehensive Analytics
 */
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const { timeRange } = req.query;
  const { id, role } = req.user;

  const cacheContext = role === "SUPERADMIN" ? "global" : id;
  const cacheKey = `admin:analytics:${JSON.stringify(req.query)}:${cacheContext}`;
  let cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  let contextWhere = {};
  let adminInfo = null;

  if (role === "ADMIN") {
    adminInfo = await prisma.admin.findUnique({ where: { userId: id } });
    if (adminInfo && adminInfo.categoryIds?.length > 0) {
      contextWhere = {
        categories: { some: { name: { in: adminInfo.categoryIds } } },
      };
    }
  }

  let dateFilter = {};
  let prevDateFilter = {};
  const { startDate, endDate } = req.query;

  if (timeRange === "today") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    dateFilter = { createdAt: { gte: startOfDay, lte: endOfDay } };
    
    const prevStart = new Date(startOfDay); prevStart.setDate(prevStart.getDate() - 1);
    const prevEnd = new Date(endOfDay); prevEnd.setDate(prevEnd.getDate() - 1);
    prevDateFilter = { createdAt: { gte: prevStart, lte: prevEnd } };
  } else if (timeRange === "yesterday") {
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);
    dateFilter = { createdAt: { gte: startOfYesterday, lte: endOfYesterday } };
    
    const prevStart = new Date(startOfYesterday); prevStart.setDate(prevStart.getDate() - 1);
    const prevEnd = new Date(endOfYesterday); prevEnd.setDate(prevEnd.getDate() - 1);
    prevDateFilter = { createdAt: { gte: prevStart, lte: prevEnd } };
  } else if (timeRange === "custom" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    dateFilter = { createdAt: { gte: start, lte: end } };
    
    const diff = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - diff);
    const prevEnd = new Date(end.getTime() - diff);
    prevDateFilter = { createdAt: { gte: prevStart, lte: prevEnd } };
  } else if (timeRange && ["weekly", "monthly", "yearly"].includes(timeRange)) {
    const start = new Date();
    if (timeRange === "weekly") start.setDate(start.getDate() - 7);
    if (timeRange === "monthly") start.setMonth(start.getMonth() - 1);
    if (timeRange === "yearly") start.setFullYear(start.getFullYear() - 1);
    dateFilter = { createdAt: { gte: start } };
    
    const prevStart = new Date(start);
    if (timeRange === "weekly") prevStart.setDate(prevStart.getDate() - 7);
    if (timeRange === "monthly") prevStart.setMonth(prevStart.getMonth() - 1);
    if (timeRange === "yearly") prevStart.setFullYear(prevStart.getFullYear() - 1);
    prevDateFilter = { createdAt: { gte: prevStart, lt: start } };
  }

  const [
    totalLeads,
    totalVendors,
    totalUsers,
    totalRevenue,
    activeSubscribers,
    pendingVendors,
    pendingOfferings,
    totalProducts,
    recentLeads,
    leadsByStatus,
    vendorKeywords,
    leadLocations,
    recentTransactions,
    rejectedVendors,
    packageDistribution,
    topCategoriesObj,
    prevTotalLeads,
    prevTotalVendors,
    prevTotalRevenue,
    prevLeadsByStatus,
  ] = await Promise.all([
    prisma.lead.count({
      where: {
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? { category: { name: { in: adminInfo.categoryIds } } }
          : {}),
      },
    }),
    prisma.vendor.count({
      where: {
        status: "VERIFIED",
        ...dateFilter,
        ...contextWhere,
      },
    }),
    prisma.user.count({
      where: {
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? {
            vendor: {
              categories: { some: { name: { in: adminInfo.categoryIds } } },
            },
          }
          : {}),
      },
    }),
    prisma.transaction.aggregate({
      where: {
        status: "COMPLETED",
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? {
            vendor: {
              categories: { some: { name: { in: adminInfo.categoryIds } } },
            },
          }
          : {}),
      },
      _sum: { amount: true },
    }),
    prisma.vendor.count({
      where: {
        packageId: { not: null },
        ...dateFilter,
        ...contextWhere,
      },
    }),
    prisma.vendor.count({
      where: {
        status: "PENDING",
        ...dateFilter,
        ...contextWhere,
      },
    }),
    prisma.product.count({
      where: {
        status: "PENDING",
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? {
            vendor: {
              categories: { some: { name: { in: adminInfo.categoryIds } } },
            },
          }
          : {}),
      },
    }),
    prisma.product.count({
      where: {
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? {
            vendor: {
              categories: { some: { name: { in: adminInfo.categoryIds } } },
            },
          }
          : {}),
      },
    }),
    prisma.lead.findMany({
      take: 10,
      where: {
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? { category: { name: { in: adminInfo.categoryIds } } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { vendor: { select: { businessName: true } } },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: {
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? { category: { name: { in: adminInfo.categoryIds } } }
          : {}),
      },
      _count: { id: true },
    }),
    // 3. Top Keywords (Demand from buyers)
    prisma.lead.groupBy({
      by: ["searchKeyword"],
      where: {
        searchKeyword: { 
          not: null,
          notIn: ['SMART_MATCH', 'Direct Inquiry'] 
        },
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? { category: { name: { in: adminInfo.categoryIds } } }
          : {}),
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    // 4. City Rankings (Location snippet)
    prisma.lead.groupBy({
      by: ["city"],
      where: {
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? { category: { name: { in: adminInfo.categoryIds } } }
          : {}),
      },
      _count: { id: true },
    }),
    // 5. Revenue Trends
    prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        ...dateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? {
            vendor: {
              categories: { some: { name: { in: adminInfo.categoryIds } } },
            },
          }
          : {}),
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.vendor.count({
      where: {
        status: "REJECTED",
        ...dateFilter,
        ...contextWhere,
      },
    }),
    prisma.package.findMany({
      select: {
        name: true,
        _count: {
          select: { vendors: true }
        }
      }
    }),
    prisma.category.findMany({
      where: {
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0
          ? { name: { in: adminInfo.categoryIds } }
          : {}),
      },
      include: {
        _count: {
          select: { leads: { where: { ...dateFilter } } }
        }
      },
      orderBy: { leads: { _count: 'desc' } },
      take: 5
    }),
    prisma.lead.count({
      where: {
        ...prevDateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0 ? { category: { name: { in: adminInfo.categoryIds } } } : {}),
      },
    }),
    prisma.vendor.count({
      where: { status: "VERIFIED", ...prevDateFilter, ...contextWhere },
    }),
    prisma.transaction.aggregate({
      where: {
        status: "COMPLETED", ...prevDateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0 ? { vendor: { categories: { some: { name: { in: adminInfo.categoryIds } } } } } : {}),
      },
      _sum: { amount: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: {
        ...prevDateFilter,
        ...(role === "ADMIN" && adminInfo?.categoryIds?.length > 0 ? { category: { name: { in: adminInfo.categoryIds } } } : {}),
      },
      _count: { id: true },
    }),
  ]);

  // Process monthly revenue trends
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const revenueTrends = [];

  // Initialize with last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueTrends.push({
      name: monthNames[d.getMonth()],
      revenue: 0,
      timestamp: d.getTime(),
    });
  }

  // Aggregate transaction data into months
  const transactions = recentTransactions;
  transactions.forEach((tx) => {
    const txDate = new Date(tx.createdAt);
    const txMonth = monthNames[txDate.getMonth()];
    const trendPoint = revenueTrends.find((tp) => tp.name === txMonth);
    if (trendPoint) {
      trendPoint.revenue += tx.amount || 0;
    }
  });

  // Calculate dynamic trends
  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100.0%" : "0.0%";
    const diff = ((current - previous) / previous) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  const currRevenue = totalRevenue._sum?.amount || 0;
  const prevRevenue = prevTotalRevenue._sum?.amount || 0;
  const currVendors = totalVendors;
  const prevVendors = prevTotalVendors;
  const currLeads = totalLeads;
  const prevLeads = prevTotalLeads;

  const currClosed = leadsByStatus.find(s => s.status === 'CLOSED')?._count?.id || 0;
  const prevClosed = prevLeadsByStatus.find(s => s.status === 'CLOSED')?._count?.id || 0;
  const currConversion = currLeads ? (currClosed / currLeads) * 100 : 0;
  const prevConversion = prevLeads ? (prevClosed / prevLeads) * 100 : 0;
  const conversionDiff = currConversion - prevConversion;

  const responseData = {
    summary: {
      totalLeads,
      totalVendors: totalVendors + pendingVendors + rejectedVendors,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscribers,
      pendingVendors,
      verifiedVendors: totalVendors,
      rejectedVendors,
      pendingOfferings,
      leadsByStatus,
      packageDistribution: packageDistribution.map(p => ({ name: p.name, vendors: p._count.vendors })),
      trends: {
        revenue: { value: calculateTrend(currRevenue, prevRevenue), isUp: currRevenue >= prevRevenue },
        vendors: { value: calculateTrend(currVendors, prevVendors), isUp: currVendors >= prevVendors },
        leads: { value: calculateTrend(currLeads, prevLeads), isUp: currLeads >= prevLeads },
        conversion: { value: `${conversionDiff > 0 ? '+' : ''}${conversionDiff.toFixed(1)}%`, isUp: conversionDiff >= 0 }
      }
    },
    recentLeads,
    trends: {
      topKeywords: vendorKeywords.filter(k => k.searchKeyword).map((k) => ({
        name: k.searchKeyword,
        count: k._count.id,
      })),
      topLocations: (() => {
        const aggregated = {};
        leadLocations.forEach((l) => {
          const city = (l.city || "Unknown").trim();
          const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
          aggregated[normalizedCity] = (aggregated[normalizedCity] || 0) + (l._count?.id || 0);
        });
        return Object.entries(aggregated)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      })(),
      topCategories: topCategoriesObj.map((cat) => ({
        name: cat.name,
        count: cat._count.leads
      })),
      revenueTrends: revenueTrends.map(({ name, revenue }) => ({
        name,
        revenue,
      })),
    },
    subscriptionPlans: packageDistribution.map(p => ({
      name: p.name,
      vendors: p._count.vendors,
    })),
    hubInfo:
      role === "ADMIN"
        ? {
          name:
            adminInfo?.hubName || adminInfo?.department || "Regional Hub",
          categories: adminInfo?.categoryIds || [],
        }
        : null,
  };

  await cacheService.setCache(cacheKey, responseData, 300); // 5 mins cache

  res.status(200).json(new ApiResponse(200, responseData, "Full platform analytics dataset retrieved"));
});

/**
 * Keyword & Category Analytics
 */
exports.getKeywordAnalytics = catchAsync(async (req, res, next) => {
  // 1. Top Keywords from Vendors (Profiles)
  const vendorKeywords = await prisma.keyword.findMany({
    include: { _count: { select: { vendors: true } } },
    orderBy: { vendors: { _count: "desc" } },
    take: 10,
  });

  // 2. Keyword-wise Leads (Demand Analysis)
  const leadKeywords = await prisma.lead.groupBy({
    by: ["searchKeyword"],
    where: { searchKeyword: { not: null } },
    _count: { id: true },
    orderBy: { _count: { searchKeyword: "desc" } },
    take: 10,
  });

  res.status(200).json(new ApiResponse(200, { vendorKeywords, leadKeywords }));
});

/**
 * Performance & Conversion Analytics
 */
exports.getPerformanceAnalytics = catchAsync(async (req, res, next) => {
  const [totalLeads, closedLeads, categoryPerformance, planComparison] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "CLOSED" } }),
      prisma.category.findMany({
        include: {
          _count: { select: { leads: true, vendors: true } },
        },
        take: 10,
      }),
      prisma.package.findMany({
        include: {
          _count: { select: { vendors: true } },
          vendors: {
            select: { _count: { select: { leads: true } } },
          },
        },
      }),
    ]);

  // Calculate closure rate
  const closureRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  // Process plan Leads distribution
  const planData = planComparison.map((p) => {
    const totalLeadsForPlan = p.vendors.reduce(
      (acc, v) => acc + v._count.leads,
      0,
    );
    return {
      name: p.name,
      vendorCount: p._count.vendors,
      totalLeads: totalLeadsForPlan,
      avgLeadsPerVendor:
        p._count.vendors > 0 ? totalLeadsForPlan / p._count.vendors : 0,
    };
  });

  res.status(200).json(
    new ApiResponse(200, {
      conversion: {
        totalLeads,
        closedLeads,
        closureRate: closureRate.toFixed(2) + "%",
      },
      categoryPerformance,
      planComparison: planData,
    }),
  );
});

/**
 * Location Analytics
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const [users, verifiedVendors, pendingVendors, rejectedVendors, leads, revenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.vendor.count({ where: { status: "VERIFIED" } }),
      prisma.vendor.count({ where: { status: "PENDING" } }),
      prisma.vendor.count({ where: { status: "REJECTED" } }),
      prisma.lead.count(),
      prisma.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      vendors: verifiedVendors,
      totalVendors: verifiedVendors + pendingVendors + rejectedVendors,
      pendingVendors,
      rejectedVendors,
      leads,
      revenue: revenue._sum.amount || 0,
    }),
  );
});

exports.getLocationAnalytics = catchAsync(async (req, res, next) => {
  const vendorLocations = await prisma.vendor.groupBy({
    by: ["city"],
    _count: { id: true },
    orderBy: { _count: { city: "desc" } },
  });

  const leadLocations = await prisma.lead.groupBy({
    by: ["city"],
    _count: { id: true },
    orderBy: { _count: { city: "desc" } },
  });

  res
    .status(200)
    .json(new ApiResponse(200, { vendorLocations, leadLocations }));
});

// getActivityLogs
exports.getActivityLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, module, action, timeRange, startDate, endDate, search, sortBy, sortOrder } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (module) where.module = module;
  if (action) where.action = action;

  if (search) {
    where.OR = [
      { module: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
      { details: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (timeRange && timeRange !== 'ALL') {
    if (timeRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.createdAt = { gte: today };
    } else if (timeRange === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      where.createdAt = { gte: yesterday, lte: endOfYesterday };
    } else if (timeRange === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      where.createdAt = { gte: lastWeek };
    } else if (timeRange === 'monthly') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      where.createdAt = { gte: lastMonth };
    } else if (timeRange === 'yearly') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      where.createdAt = { gte: lastYear };
    } else if (timeRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }
  }

  let orderBy = { createdAt: "desc" };
  if (sortBy) {
     const order = sortOrder === 'asc' ? 'asc' : 'desc';
     if (sortBy === 'createdAt') orderBy = { createdAt: order };
     else if (sortBy === 'user') orderBy = { user: { name: order } };
     else if (sortBy === 'module') orderBy = { module: order };
     else if (sortBy === 'action') orderBy = { action: order };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true, avatar: true } },
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy,
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }),
  );
});
