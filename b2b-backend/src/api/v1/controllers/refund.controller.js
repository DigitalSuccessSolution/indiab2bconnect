const catchAsync = require('../../../shared/helpers/catch-async');
const prisma = require('../../../config/prisma');
const AppError = require('../../../shared/errors/app-error');
const ApiResponse = require('../../../shared/helpers/api-response');
const notificationService = require('../../../modules/notifications/notifications.service');

// VENDOR: Request a refund
exports.requestRefund = catchAsync(async (req, res, next) => {
  const { transactionId, reason } = req.body;
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId, vendorId: vendor.id }
  });

  if (!transaction) return next(new AppError('Transaction not found or does not belong to you', 404));
  if (transaction.status !== 'COMPLETED') return next(new AppError('Can only refund completed transactions', 400));

  const existingRefund = await prisma.refund.findUnique({
    where: { transactionId }
  });

  if (existingRefund) return next(new AppError('Refund already requested for this transaction', 400));

  const refund = await prisma.refund.create({
    data: {
      vendorId: vendor.id,
      transactionId: transaction.id,
      amount: transaction.amount,
      reason,
      status: 'REQUESTED'
    }
  });

  res.status(201).json(new ApiResponse(201, refund, 'Refund requested successfully. Pending admin approval.'));
});

// VENDOR: Get my refunds
exports.getMyRefunds = catchAsync(async (req, res, next) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  const refunds = await prisma.refund.findMany({
    where: { vendorId: vendor.id },
    include: { transaction: { include: { package: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(new ApiResponse(200, refunds, 'Fetched your refund requests'));
});

// SUPERADMIN: Get all refunds
exports.getAllRefunds = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const refunds = await prisma.refund.findMany({
    where,
    include: { 
      vendor: { select: { businessName: true, email: true, phone: true } },
      transaction: { select: { gatewayOrderId: true, amount: true, createdAt: true } }
    },
    skip: parseInt(skip),
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.refund.count({ where });

  res.status(200).json(new ApiResponse(200, {
    refunds,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  }));
});

// SUPERADMIN: Update refund status
exports.updateRefundStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNote, gatewayRefundId } = req.body;
  if (!['APPROVED', 'REJECTED', 'PROCESSED'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const updateData = { status, adminNote };

  if (status === 'PROCESSED') {
    updateData.processedAt = new Date();
  }
  
  if (gatewayRefundId) updateData.gatewayRefundId = gatewayRefundId;

  const refund = await prisma.refund.update({
    where: { id },
    data: updateData,
    include: { vendor: true, transaction: true }
  });

  if (status === 'PROCESSED') {
    await prisma.transaction.update({
      where: { id: refund.transactionId },
      data: { status: 'REFUNDED' }
    });

    // Notify vendor
    await notificationService.notifyVendorGeneral(
      refund.vendorId,
      'Refund Processed',
      `Your refund for Transaction ${refund.transaction.gatewayOrderId} has been processed.`
    );

    const templates = require('../../../services/email.templates');
    const emailService = require('../../../services/email.service');
    await emailService.sendEmail({
      to: refund.vendor.email,
      subject: '✔️ Refund Processed Successfully',
      html: templates.refundProcessedTemplate(refund.vendor, refund.amount, refund.transaction.gatewayOrderId)
    });
  } else if (status === 'REJECTED') {
    await prisma.notification.create({
      data: {
        userId: refund.vendor.userId,
        title: 'Refund Request Rejected',
        message: `Your refund request was rejected. Reason: ${adminNote || 'No reason provided'}`
      }
    });
  }

  res.status(200).json(new ApiResponse(200, updatedRefund, 'Refund status updated'));
});
