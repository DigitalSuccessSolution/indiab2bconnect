const express = require('express');
const router = express.Router();
const prisma = require('../../../config/prisma');
const auth = require('../middlewares/auth.middleware');
const catchAsync = require('../../../shared/helpers/catch-async');
const ApiResponse = require('../../../shared/helpers/api-response');
const paymentsController = require('../controllers/payments.controller');

router.post('/free-activate', auth, paymentsController.freeActivate);

// Create order (PhonePe V2 OAuth)
router.post('/create-order', auth, paymentsController.createOrder);

// Verify order status
router.post('/verify', auth, paymentsController.verifyPayment);

// Download dynamic invoice PDF
router.get('/invoice/:gatewayOrderId', paymentsController.downloadInvoice);

// Server-to-Server Webhook callback (No authentication needed, verified via signature)
router.post('/phonepe-webhook', paymentsController.phonepeWebhook);

router.get('/history', auth, catchAsync(async (req, res, next) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) return next(new AppError('Vendor not found', 404));

  const transactions = await prisma.transaction.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    include: { package: true }
  });
  res.status(200).json(new ApiResponse(200, transactions));
}));

module.exports = router;
