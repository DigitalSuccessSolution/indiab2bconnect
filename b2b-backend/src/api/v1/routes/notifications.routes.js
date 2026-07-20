const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notifications.controller');

router.get('/', auth, notificationController.getMyNotifications);
router.patch('/mark-all-read', auth, notificationController.markAllAsRead);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
