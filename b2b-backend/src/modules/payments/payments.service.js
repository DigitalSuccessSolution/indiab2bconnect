const axios = require('axios');
const phonePe = require('../../services/phonepe');
const prisma = require('../../config/prisma');
const AppError = require('../../shared/errors/app-error');
const cacheService = require('../../services/cache.service');
const leadService = require('../leads/leads.service');
const notificationService = require('../notifications/notifications.service');
const invoiceService = require('./invoice.service');

/**
 * Creates a PhonePe payment order and logs it as PENDING in the DB.
 */
exports.createPaymentOrder = async (userId, packageId, callbackUrl) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) throw new AppError('Vendor profile not found', 404);

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) throw new AppError('Subscription package not found', 404);

  const merchantTransactionId = `T${Date.now()}`;
  
  const payload = {
    merchantId: phonePe.PHONEPE_MERCHANT_ID,
    merchantOrderId: merchantTransactionId,
    amount: Math.round(pkg.price * 100), // in paise
    expireAfter: 1800, // 30 minutes
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: `B2B Connect India - ${pkg.name} Subscription`,
      merchantUrls: {
        redirectUrl: callbackUrl || `${process.env.FRONTEND_URL}/vendor/billing/success`
      }
    },
    metaInfo: {
      udf1: vendor.id,
      udf2: packageId
    }
  };

  const token = await phonePe.generateOAuthToken();
  const response = await axios.post(phonePe.PHONEPE_CHECKOUT_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${token}`
    }
  });

  if (response.data && (response.data.state === 'CREATED' || response.data.state === 'PENDING') && response.data.redirectUrl) {
    await prisma.transaction.create({
      data: {
        vendorId: vendor.id,
        packageId: packageId,
        amount: pkg.price,
        currency: 'INR',
        status: 'PENDING',
        paymentGateway: 'PHONEPE',
        gatewayOrderId: merchantTransactionId
      }
    });

    return {
      redirectUrl: response.data.redirectUrl,
      merchantTransactionId
    };
  } else {
    throw new AppError('Payment initiation failed with PhonePe', 400);
  }
};

/**
 * Checks PhonePe API for the actual status of a transaction.
 */
exports.verifyPaymentStatus = async (merchantTransactionId) => {
  const endpoint = `${phonePe.PHONEPE_STATUS_URL}/${merchantTransactionId}/status`;
  const token = await phonePe.generateOAuthToken();

  const response = await axios.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Robustly processes a successful payment using a database transaction.
 * Completely idempotent.
 */
exports.processSuccessfulPayment = async (merchantTransactionId, phonePeTxnId) => {
  const transactionForPackage = await prisma.transaction.findUnique({
    where: { gatewayOrderId: merchantTransactionId },
    include: { vendor: { include: { user: true } }, package: true }
  });

  if (!transactionForPackage) throw new AppError('Transaction not found', 404);
  
  // Idempotency check: if already completed, do nothing.
  if (transactionForPackage.status === 'COMPLETED') {
    return { status: 'COMPLETED', invoiceUrl: transactionForPackage.invoiceUrl };
  }

  const baseUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000';
  const invoiceUrl = `${baseUrl}/api/v1/payments/invoice/${merchantTransactionId}`;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  // Use Prisma Transaction to ensure atomic updates
  const [updatedTransaction, updatedVendor] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transactionForPackage.id },
      data: {
        status: 'COMPLETED',
        gatewayTransactionId: phonePeTxnId,
        expiryAt: expiryDate,
        subscriptionDays: 30,
        invoiceUrl
      }
    }),
    prisma.vendor.update({
      where: { id: transactionForPackage.vendorId },
      data: { 
        packageId: transactionForPackage.packageId,
        planExpiry: expiryDate
      }
    }),
    prisma.notification.create({
      data: {
        userId: transactionForPackage.vendor.userId,
        title: 'Subscription Activated!',
        message: 'Your payment was successful and your subscription has been activated.'
      }
    })
  ]);

  // Execute Decoupled Side-Effects safely after atomic commit
  try {
    // Generate invoice explicitly for webhook access immediately if necessary
    try {
      await invoiceService.generateInvoice(updatedTransaction, transactionForPackage.vendor, transactionForPackage.package);
    } catch (e) {
      console.error('Invoice generation failed during processing:', e);
    }

    await cacheService.deleteCache(`vendor:profile:${updatedVendor.id}`);
    await cacheService.clearCacheByPrefix(`vendor:me:${transactionForPackage.vendor.userId}`);
    await cacheService.clearCacheByPrefix('search:vendors');

    await notificationService.notifySubscriptionEvent(transactionForPackage.vendor, 'PAYMENT_SUCCESS', {
      packageName: transactionForPackage.package?.name || 'Premium',
      expiry: expiryDate.toLocaleDateString(),
      amount: transactionForPackage.amount,
      transactionId: merchantTransactionId,
      date: new Date().toLocaleDateString()
    });

    await leadService.recalculateRankings(updatedVendor.id);
  } catch (err) {
    console.error('Non-fatal error during side-effects of successful payment:', err);
  }

  return { status: 'COMPLETED', invoiceUrl };
};

/**
 * Robustly processes a failed payment.
 */
exports.processFailedPayment = async (merchantTransactionId) => {
  const transactionForPackage = await prisma.transaction.findUnique({
    where: { gatewayOrderId: merchantTransactionId },
    include: { vendor: true, package: true }
  });

  if (!transactionForPackage) throw new AppError('Transaction not found', 404);
  if (transactionForPackage.status === 'FAILED' || transactionForPackage.status === 'COMPLETED') return { status: transactionForPackage.status };

  await prisma.transaction.update({
    where: { id: transactionForPackage.id },
    data: { status: 'FAILED' }
  });

  try {
    await notificationService.notifySubscriptionEvent(transactionForPackage.vendor, 'PAYMENT_FAILED', {
      packageName: transactionForPackage.package?.name || 'Premium',
      amount: transactionForPackage.amount,
      transactionId: merchantTransactionId,
      date: new Date().toLocaleDateString()
    });
  } catch (err) {
    console.error('Non-fatal error sending failed payment notification:', err);
  }

  return { status: 'FAILED' };
};

/**
 * Robustly processes a pending payment.
 */
exports.processPendingPayment = async (merchantTransactionId) => {
  const transactionForPackage = await prisma.transaction.findUnique({
    where: { gatewayOrderId: merchantTransactionId },
    include: { vendor: true, package: true }
  });

  if (!transactionForPackage) throw new AppError('Transaction not found', 404);
  if (transactionForPackage.status !== 'PENDING') return { status: transactionForPackage.status };

  try {
    await notificationService.notifySubscriptionEvent(transactionForPackage.vendor, 'PAYMENT_PENDING', {
      packageName: transactionForPackage.package?.name || 'Premium',
      amount: transactionForPackage.amount,
      transactionId: merchantTransactionId,
      date: new Date().toLocaleDateString()
    });
  } catch (err) {
    console.error('Non-fatal error sending pending payment notification:', err);
  }

  return { status: 'PENDING' };
};
