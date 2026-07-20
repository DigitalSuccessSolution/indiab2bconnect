const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const leadsController = require('../controllers/leads.controller');
const productsController = require('../controllers/products.controller');
const usersController = require('../controllers/users.controller');
const settingsController = require('../controllers/settings.controller');
const analyticsController = require('../controllers/analytics.controller');
const transactionsController = require('../controllers/transactions.controller');
const packageController = require('../controllers/package.controller');
const vendorsController = require('../controllers/vendors.controller');
const auth = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.use(auth);

// Vendor Approvals
router.patch('/vendors/:vendorId/approve', permission('vendors_approve'), vendorsController.approveVendor);
router.patch('/vendors/:vendorId/unverify', permission('vendors_approve'), vendorsController.unverifyVendor);
router.delete('/vendors/:vendorId/reject', permission('vendors_approve'), vendorsController.rejectVendor);

router.patch('/vendors/:vendorId', permission('vendors_approve'), vendorsController.updateVendor);
router.delete('/vendors/:vendorId', permission('vendors_approve'), vendorsController.deleteVendor);

router.patch('/vendors/:vendorId/badge', permission('vendors_approve'), vendorsController.updateVendorBadge);

router.get('/vendors/pending', permission('vendors_read'), vendorsController.getPendingVendors);
router.get('/vendors/:vendorId/secure', permission('vendors_read'), vendorsController.getVendorSecureDetails);

// User Management
router.get('/users', permission('users_read'), usersController.getAllUsers);
router.patch('/users/:userId', permission('users_update'), usersController.updateUserStatus);
router.delete('/users/:userId', permission('users_delete'), usersController.deleteUser);

// Lead Management
router.get('/leads', permission('leads_read'), leadsController.getAllLeads);
router.patch('/leads/:leadId/reassign', permission('leads_reassign'), leadsController.reassignLead);
router.patch('/vendors/:vendorId/boost', permission('leads_update'), vendorsController.manualBoostVendor);

// Category Management
router.get('/categories', permission('categories_read'), categoryController.adminGetAllCategories);
router.post('/categories', permission('categories_create'), categoryController.createCategory);
router.put('/categories/:id', permission('categories_update'), categoryController.updateCategory);
router.patch('/categories/:id/status', permission('categories_update'), categoryController.toggleCategoryStatus);
router.delete('/categories/:id', permission('categories_delete'), categoryController.deleteCategory);

// Package Management
router.get('/packages', permission('packages_read'), packageController.getAllPackages);
router.post('/packages', permission('packages_create'), packageController.createPackage);
router.patch('/packages/:packageId', permission('packages_update'), packageController.updatePackage);
router.put('/packages/:packageId', permission('packages_update'), packageController.updatePackage); // Added PUT alias
router.delete('/packages/:packageId', permission('packages_delete'), packageController.deletePackage);

// Transactions
router.get('/transactions', permission('transactions_read'), transactionsController.getAllTransactions);

// Analytics & Others
router.get('/analytics', permission('analytics_read'), analyticsController.getAnalytics);
router.get('/analytics/keywords', permission('analytics_read'), analyticsController.getKeywordAnalytics);
router.get('/analytics/performance', permission('analytics_read'), analyticsController.getPerformanceAnalytics);
router.get('/stats', permission('dashboard_read'), analyticsController.getDashboardStats);
router.get('/approvals', permission('vendors_read'), vendorsController.getVendorApprovals);
router.get('/offerings', permission('products_read'), productsController.getPendingOfferings);
router.patch('/offerings/:offeringId/approve', permission('products_approve'), productsController.approveOffering);
router.patch('/offerings/:offeringId/reject', permission('products_approve'), productsController.rejectOffering);
router.patch('/offerings/:offeringId', permission('products_update'), productsController.editOffering);
router.delete('/offerings/:offeringId', permission('products_delete'), productsController.deleteOffering);
router.get('/activity', permission('activity_read'), analyticsController.getActivityLogs);
router.get('/settings', permission('settings_read'), settingsController.getSettings);
router.patch('/settings', permission('settings_update'), settingsController.updateSettings);

// Notifications
router.post('/notifications/broadcast', settingsController.broadcastNotification);

module.exports = router;
