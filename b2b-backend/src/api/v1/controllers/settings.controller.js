const prisma = require('../../../config/prisma');
const catchAsync = require('../../../shared/helpers/catch-async');
const ApiResponse = require('../../../shared/helpers/api-response');

const cacheService = require('../../../services/cache.service');
const { logAction } = require('../../../shared/helpers/auditLogger');

exports.getGlobalSettings = catchAsync(async (req, res) => {
  const cacheKey = 'system:settings:global';
  let settings = await cacheService.getCache(cacheKey);

  if (!settings) {
    settings = await prisma.globalSettings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { id: 'global' },
      });
    }

    await cacheService.setCache(cacheKey, settings, 3600); // 1 hour cache
  }

  res.status(200).json(settings);
});

exports.updateGlobalSettings = catchAsync(async (req, res) => {
  const data = req.body;
  
  const settings = await prisma.globalSettings.upsert({
    where: { id: 'global' },
    update: data,
    create: {
      id: 'global',
      ...data
    }
  });

  await cacheService.deleteCache('system:settings:global');
  res.status(200).json(settings);
});

// --- MOVED FROM ADMIN CONTROLLER ---

exports.getSettings = catchAsync(async (req, res, next) => {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  });

  // Return defaults if not found
  if (!settings) {
    return res.status(200).json(
      new ApiResponse(200, {
        rankingWeightProfile: 0.4,
        rankingWeightPerformance: 0.6,
        marketplaceId: "B2B-INDIA-ROOT-01",
        hubName: "Mumbai Central",
        alertVendorOnboarding: true,
        alertPaymentExceptions: true,
        alertInquirySpikes: false,
      }),
    );
  }

  res.status(200).json(new ApiResponse(200, settings));
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const {
    rankingWeightProfile,
    rankingWeightPerformance,
    marketplaceId,
    hubName,
    alertVendorOnboarding,
    alertPaymentExceptions,
    alertInquirySpikes,
  } = req.body;

  const updateData = {
    rankingWeightProfile:
      rankingWeightProfile !== undefined
        ? parseFloat(rankingWeightProfile)
        : undefined,
    rankingWeightPerformance:
      rankingWeightPerformance !== undefined
        ? parseFloat(rankingWeightPerformance)
        : undefined,
    marketplaceId,
    hubName,
    alertVendorOnboarding:
      alertVendorOnboarding !== undefined
        ? Boolean(alertVendorOnboarding)
        : undefined,
    alertPaymentExceptions:
      alertPaymentExceptions !== undefined
        ? Boolean(alertPaymentExceptions)
        : undefined,
    alertInquirySpikes:
      alertInquirySpikes !== undefined
        ? Boolean(alertInquirySpikes)
        : undefined,
  };

  const createData = {
    id: "global",
    rankingWeightProfile:
      rankingWeightProfile !== undefined
        ? parseFloat(rankingWeightProfile)
        : 0.4,
    rankingWeightPerformance:
      rankingWeightPerformance !== undefined
        ? parseFloat(rankingWeightPerformance)
        : 0.6,
    marketplaceId: marketplaceId || "B2B-INDIA-ROOT-01",
    hubName: hubName || "Mumbai Central",
    alertVendorOnboarding:
      alertVendorOnboarding !== undefined
        ? Boolean(alertVendorOnboarding)
        : true,
    alertPaymentExceptions:
      alertPaymentExceptions !== undefined
        ? Boolean(alertPaymentExceptions)
        : true,
    alertInquirySpikes:
      alertInquirySpikes !== undefined ? Boolean(alertInquirySpikes) : false,
  };

  const settings = await prisma.systemSettings.upsert({
    where: { id: "global" },
    update: updateData,
    create: createData,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, settings, "Platform settings updated successfully"),
    );
});

/**
 * Global Admin Broadcast
 */
exports.broadcastNotification = catchAsync(async (req, res, next) => {
  const { title, message, type, target } = req.body;

  let where = {};
  if (target === "ALL_VENDORS") where.role = "VENDOR";
  else if (target === "ALL_BUYERS") where.role = "BUYER";
  else if (target === "ADMIN") where.role = "ADMIN";

  const users = await prisma.user.findMany({
    where: {
      ...where,
      isActive: true,
    },
  });

  // Create notifications in bulk
  const notifications = users.map((user) => ({
    userId: user.id,
    title: `📢 ${title}`,
    message,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }

  // Create Audit Log
  await logAction(
    req.user.id,
    "BROADCAST_NOTIFICATION",
    "USER",
    `Sent broadcast: ${title} to ${target}`,
    req.ip,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Broadcast signal transmitted successfully"),
    );
});
