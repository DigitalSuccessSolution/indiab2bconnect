const prisma = require('../../../config/prisma');
const catchAsync = require('../../../shared/helpers/catch-async');
const AppError = require('../../../shared/errors/app-error');
const ApiResponse = require('../../../shared/helpers/api-response');
const cacheService = require('../../../services/cache.service');

/**
 * Transaction History
 */
exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search, timeRange } = req.query;
  const skip = (page - 1) * limit;

  const cacheKey = `admin:transactions:all:${page}:${limit}:${status || 'ALL'}:${search || 'none'}:${timeRange || 'ALL'}`;
  let cachedData = await cacheService.getCache(cacheKey);
  // if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { vendor: { businessName: { contains: search, mode: 'insensitive' } } },
      { gatewayTransactionId: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (timeRange && timeRange !== 'ALL') {
    const now = new Date();
    let startDate;
    if (timeRange === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeRange === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(now);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      
      where.createdAt = {
        gte: yesterday,
        lte: endOfYesterday
      };
    } else if (timeRange === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'monthly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    
    if (startDate && timeRange !== 'yesterday') {
      where.createdAt = { gte: startDate };
    }
  }

  // The KPI cards should reflect whatever is filtered in the table (including Search, Date, and Status)
  const statsWhere = { ...where };

  const [transactions, total, revenueAgg, pendingCount, totalCount] = await prisma.$transaction([
    // Table Queries (respects Search, Date, and Status)
    prisma.transaction.findMany({
      where,
      include: { vendor: { include: { categories: true } } },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.count({ where }),
    
    // KPI Queries (fully synced with table filters)
    prisma.transaction.aggregate({
      where: statsWhere,
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      // If status is filtered to something other than PENDING, pending sum is 0. 
      // Otherwise, we enforce PENDING.
      where: (statsWhere.status && statsWhere.status !== 'PENDING') 
        ? { id: 'impossible-no-match' } // Force 0 if filtering by FAILED or COMPLETED
        : { ...statsWhere, status: 'PENDING' },
      _sum: { amount: true }
    }),
    prisma.transaction.count({
      where: statsWhere
    })
  ]);

  const responseData = {
    transactions,
    total,
    totalRevenue: revenueAgg._sum.amount || 0,
    totalPending: pendingCount._sum.amount || 0,
    totalCount: totalCount,
    page,
    totalPages: Math.ceil(total / limit),
  };

  await cacheService.setCache(cacheKey, responseData, 300);

  res.status(200).json(new ApiResponse(200, responseData));
});
