const phonePe = require('../../../services/phonepe');
const prisma = require('../../../config/prisma');
const catchAsync = require('../../../shared/helpers/catch-async');
const AppError = require('../../../shared/errors/app-error');
const ApiResponse = require('../../../shared/helpers/api-response');
const paymentsService = require('../../../modules/payments/payments.service');
const leadService = require('../../../modules/leads/leads.service');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { packageId, callbackUrl } = req.body;
  const result = await paymentsService.createPaymentOrder(req.user.id, packageId, callbackUrl);
  res.status(201).json(new ApiResponse(201, result, 'Order created successfully'));
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { merchantTransactionId } = req.body;

  if (!merchantTransactionId) {
    return next(new AppError('Transaction ID is required', 400));
  }

  try {
    const statusData = await paymentsService.verifyPaymentStatus(merchantTransactionId);

    if (statusData && statusData.state === 'COMPLETED') {
      const phonePeTxnId = statusData.providerReferenceId || statusData.transactionId || merchantTransactionId;
      const result = await paymentsService.processSuccessfulPayment(merchantTransactionId, phonePeTxnId);
      return res.status(200).json(new ApiResponse(200, result, 'Payment verified and subscription activated'));
    } else {
      const status = statusData.state === 'FAILED' ? 'FAILED' : 'PENDING';
      
      if (status === 'FAILED') {
        await paymentsService.processFailedPayment(merchantTransactionId);
      } else {
        await paymentsService.processPendingPayment(merchantTransactionId);
      }
      
      return res.status(200).json(new ApiResponse(200, { status }, `Payment status: ${status}`));
    }
  } catch (error) {
    if (error instanceof AppError) return next(error);
    console.error('PhonePe Status API Error:', error.response?.data || error.message);
    return next(new AppError('Failed to verify payment with PhonePe', 500));
  }
});

/**
 * FREE ACTIVATE — Assign subscription without payment (demo/test mode)
 */
exports.freeActivate = catchAsync(async (req, res, next) => {
  const { packageId } = req.body;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
    include: { user: true }
  });
  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) return next(new AppError('Package not found', 404));

  // 30-day expiry from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  // Update vendor subscription
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { packageId: pkg.id, planExpiry: expiryDate }
  });

  // Log a FREE transaction record
  await prisma.transaction.create({
    data: {
      vendorId: vendor.id,
      packageId: pkg.id,
      amount: 0,
      currency: 'INR',
      status: 'COMPLETED',
      subscriptionDays: 30,
      expiryAt: expiryDate,
      gatewayOrderId: `free_${Date.now()}`
    }
  });

  // In-app notification
  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      title: `${pkg.name} Plan Activated!`,
      message: `Your ${pkg.name} subscription is now active. Expiry: ${expiryDate.toLocaleDateString('en-IN')}.`
    }
  });

  // Recalculate ranking
  await leadService.recalculateRankings(vendor.id);

  res.status(200).json(new ApiResponse(200, {
    package: pkg.name,
    expiry: expiryDate
  }, 'Subscription activated successfully'));
});

/**
 * PhonePe Server-to-Server Webhook Handler
 */
exports.phonepeWebhook = catchAsync(async (req, res, next) => {
  // Always respond with 200 OK to acknowledge receipt as quickly as possible
  res.status(200).send('OK');

  try {
    const authHeader = req.headers['authorization'];
    if (!phonePe.validateWebhookSignature(authHeader)) {
      console.warn('Invalid PhonePe Webhook Signature');
      return;
    }

    const payload = req.body;
    if (!payload || !payload.merchantOrderId) return;

    const merchantTransactionId = payload.merchantOrderId;
    const phonePeTxnId = payload.providerReferenceId || payload.transactionId || merchantTransactionId;

    if (payload.state === 'COMPLETED') {
      await paymentsService.processSuccessfulPayment(merchantTransactionId, phonePeTxnId);
      console.log(`Webhook processed successfully for txn: ${merchantTransactionId}`);
    } else if (payload.state === 'FAILED') {
      await paymentsService.processFailedPayment(merchantTransactionId);
      console.log(`Webhook processed FAILED for txn: ${merchantTransactionId}`);
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
});

/**
 * Download Invoice on the fly
 */
exports.downloadInvoice = catchAsync(async (req, res, next) => {
  const { gatewayOrderId } = req.params;
  
  const transaction = await prisma.transaction.findUnique({
    where: { gatewayOrderId },
    include: { vendor: true, package: true }
  });

  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (!transaction.vendor || !transaction.package) return next(new AppError('Incomplete transaction details', 400));

  await require('../../../modules/payments/invoice.service').pipeInvoiceToResponse(
    transaction,
    transaction.vendor,
    transaction.package,
    res
  );
});
