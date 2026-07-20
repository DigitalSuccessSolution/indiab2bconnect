const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refund.controller');
const auth = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.use(auth);

// Vendor endpoints
router.post('/request', refundController.requestRefund);
router.get('/me', refundController.getMyRefunds);
router.get('/my-refunds', refundController.getMyRefunds);

// Superadmin endpoints
router.get('/admin/all', permission('refunds_read'), refundController.getAllRefunds);
router.get('/', permission('refunds_read'), refundController.getAllRefunds);
router.patch('/admin/:id', permission('refunds_update'), refundController.updateRefundStatus);
router.patch('/:id/status', permission('refunds_update'), refundController.updateRefundStatus);

module.exports = router;
