const prisma = require("../../config/prisma");
const notificationService = require("../notifications/notifications.service");
const whatsappService = require("../../services/whatsapp"); // Pointing to the modular whatsapp service

/**
 * Normalize city names for better matching
 */
const normalizeCity = (city) => {
  if (!city) return '';
  const c = city.trim().toLowerCase();
  if (c === 'bangalore' || c === 'bengaluru') return 'bangalore';
  if (c === 'bombay' || c === 'mumbai') return 'mumbai';
  if (c === 'calcutta' || c === 'kolkata') return 'kolkata';
  if (c === 'madras' || c === 'chennai') return 'chennai';
  if (c === 'gurgaon' || c === 'gurugram') return 'gurugram';
  return c;
};

const distributeInquiryLead = async (leadId) => {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { category: true }
  });

  const leadCity = normalizeCity(lead.city);

  const allVendors = await prisma.vendor.findMany({
    where: {
      categories: { some: { id: lead.categoryId } },
      verified: true,
      user: { isActive: true }
    },
    include: {
      package: true,
      user: true
    }
  });

  const eligibleVendors = allVendors.filter(v => normalizeCity(v.city) === leadCity);

  if (eligibleVendors.length === 0) return;

  const previousAssignments = await prisma.leadLifecycle.findMany({
    where: { leadId, action: { in: ['DISTRIBUTED', 'REDISTRIBUTED'] } }
  });

  const previousVendorIds = previousAssignments.map(a => a.vendorId).filter(Boolean);
  const availableVendors = eligibleVendors.filter(v => !previousVendorIds.includes(v.id));

  let targetVendor;

  if (lead.type === 'IDLE') {
    const diamondVendors = availableVendors
      .filter(v => v.package?.name?.toUpperCase() === 'DIAMOND')
      .sort((a, b) => b.totalScore - a.totalScore);

    if (diamondVendors.length === 0) return;
    targetVendor = diamondVendors[0];
  } else {
    const rankedVendors = availableVendors.sort((a, b) => b.totalScore - a.totalScore);
    if (rankedVendors.length === 0) return;
    
    const maxScore = rankedVendors[0].totalScore;
    const topVendors = rankedVendors.filter(v => v.totalScore === maxScore);
    
    if (topVendors.length === 1) {
      targetVendor = topVendors[0];
    } else {
      // Rotation: Break ties by picking vendor assigned a lead least recently
      const vendorIds = topVendors.map(v => v.id);
      const recentAssignments = await prisma.leadLifecycle.groupBy({
        by: ['vendorId'],
        where: {
          vendorId: { in: vendorIds },
          action: 'DISTRIBUTED'
        },
        _max: {
          createdAt: true
        }
      });
      
      const assignmentMap = {};
      recentAssignments.forEach(r => {
        if (r.vendorId) {
          assignmentMap[r.vendorId] = r._max.createdAt.getTime();
        }
      });
      
      topVendors.sort((a, b) => {
        const timeA = assignmentMap[a.id] || 0;
        const timeB = assignmentMap[b.id] || 0;
        return timeA - timeB;
      });
      
      targetVendor = topVendors[0];
    }
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      vendorId: targetVendor.id,
      status: 'DISTRIBUTED',
      updatedAt: new Date()
    }
  });

  await prisma.leadLifecycle.create({
    data: {
      leadId,
      vendorId: targetVendor.id,
      action: 'DISTRIBUTED',
      details: `Lead assigned to vendor ${targetVendor.businessName}`
    }
  });

  // MUST DELETE CACHE BEFORE EMITTING SOCKET EVENT (Avoids race condition)
  try {
    const cacheService = require('../../services/cache.service');
    await cacheService.deleteCache(`vendor:leads:${targetVendor.userId}:self`);
    console.log(`[CACHE] Cleared lead cache for vendor user ${targetVendor.userId}`);
  } catch (err) {
    console.error('[CACHE] Failed to clear lead cache:', err);
  }

  notificationService.notifyVendorOfLead(targetVendor, lead).catch(() => { });
  whatsappService.notifyVendorWhatsApp(targetVendor, lead).catch(() => { });

  try {
    const socketService = require('../../socket');
    const io = socketService.getIo();
    if (io) {
      io.to(`vendor_${targetVendor.id}`).emit('new_lead', lead);
      console.log(`[SOCKET] Emitted new_lead to vendor_${targetVendor.id}`);
    }
  } catch (err) {
    console.error('[SOCKET] Failed to emit new_lead:', err);
  }

  await prisma.notification.create({
    data: {
      userId: targetVendor.userId,
      title: 'New Lead Opportunity',
      message: `New ${lead.type} lead from ${lead.buyerName}.`
    }
  });
};

const processAgedLeads = async () => {
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Expire old pending leads (that never got distributed or are stuck)
  await prisma.lead.updateMany({
    where: {
      status: 'PENDING',
      createdAt: { lte: thirtyDaysAgo }
    },
    data: {
      status: 'EXPIRED',
      updatedAt: new Date()
    }
  });

  // 2. Process leads that haven't been closed in 6 days
  const agedLeads = await prisma.lead.findMany({
    where: {
      status: 'DISTRIBUTED',
      followUpSent: false,
      createdAt: { lte: sixDaysAgo }
    }
  });

  for (const lead of agedLeads) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { followUpSent: true }
    });
    await redistributeLead(lead.id);
  }
};

const redistributeLead = async (leadId) => {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead || lead.status === 'CLOSED' || lead.status === 'EXPIRED') return;

  const previousVendorId = lead.vendorId;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Stop endless looping: If lead is older than 30 days, expire it permanently
  if (lead.createdAt <= thirtyDaysAgo) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        vendorId: previousVendorId, // keep track of the last vendor who had it
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    });

    await prisma.leadLifecycle.create({
      data: {
        leadId,
        vendorId: previousVendorId,
        action: 'EXPIRED',
        details: `Lead permanently expired after 30 days to prevent endless redistribution.`
      }
    });
    return;
  }

  // Otherwise, redistribute normally
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      vendorId: null,
      status: 'PENDING',
      updatedAt: new Date()
    }
  });

  await prisma.leadLifecycle.create({
    data: {
      leadId,
      vendorId: previousVendorId,
      action: 'REDISTRIBUTED',
      details: `Lead redistributed due to non-closure.`
    }
  });

  const { addLeadToQueue } = require('../../queues');
  await addLeadToQueue(leadId);
};

const recalculateRankings = async (targetVendorId = null) => {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } }) ||
    { rankingWeightProfile: 0.4, rankingWeightPerformance: 0.6 };

  const where = targetVendorId ? { id: targetVendorId } : {};
  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      package: true,
      reviewsReceived: true,
      keywords: true,
    }
  });

  const maxPackagePriceRow = await prisma.package.findFirst({ orderBy: { price: 'desc' } });
  const maxPrice = maxPackagePriceRow?.price || 1;

  for (const vendor of vendors) {
    const packageWeight = (vendor.package?.price || 0) / maxPrice;
    const profileScore = vendor.profileCompleteness / 100;
    const responseScore = Math.max(0, 1 - (vendor.responseTime / 1000));

    const avgRating = vendor.reviewsReceived.length > 0
      ? vendor.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / vendor.reviewsReceived.length
      : 0;
    const reviewScore = avgRating / 5;

    const keywordScore = Math.min(1, vendor.keywords.length / 10);
    const engagementScore = (vendor.leadClosureRate * 0.7) + (Math.min(1, vendor.loginFrequency / 30) * 0.3);

    const performanceScore = (profileScore * 0.2) + (responseScore * 0.2) +
      (reviewScore * 0.3) + (keywordScore * 0.1) +
      (engagementScore * 0.2);

    const totalScore = (packageWeight * settings.rankingWeightProfile) +
      (performanceScore * settings.rankingWeightPerformance) +
      vendor.manualBoost;

    await prisma.$transaction([
      prisma.vendor.update({
        where: { id: vendor.id },
        data: { totalScore: parseFloat(totalScore.toFixed(4)) }
      }),
      prisma.ranking.create({
        data: { vendorId: vendor.id, score: totalScore }
      })
    ]);
  }
};

/**
 * Check for leads that were distributed > 24h ago but not responded to
 */
const sendUnattendedLeadReminders = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const unattendedLeads = await prisma.lead.findMany({
    where: {
      status: 'DISTRIBUTED',
      followUpSent: false,
      createdAt: { lt: twentyFourHoursAgo },
      vendorId: { not: null }
    },
    include: {
      vendor: { include: { user: true } }
    }
  });

  const { notifyUnattendedLead } = require('../notifications/notifications.service');

  for (const lead of unattendedLeads) {
    if (lead.vendor) {
      await notifyUnattendedLead(lead.vendor, lead);
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: { followUpSent: true }
      });
      
      console.log(`[LEADS-SERVICE] Sent unattended lead reminder to vendor ${lead.vendor.id} for lead ${lead.id}`);
    }
  }
};

module.exports = { distributeInquiryLead, recalculateRankings, redistributeLead, processAgedLeads, sendUnattendedLeadReminders };
