const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendors.controller');
const productsController = require('../controllers/products.controller');
const vendorsValidation = require('../validators/vendors.validation');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');
const { upload, handleCloudinaryUpload } = require('../../../config/cloudinary');

// Vendor Profile & Uploads (Must be before wildcard /:vendorId)
router.get('/me', auth, vendorsController.getMyProfile);
router.put('/me', auth, vendorsController.updateMyProfile);
router.patch('/me', auth, vendorsController.updateMyProfile);
router.get('/profile/me', auth, vendorsController.getMyProfile);
router.patch('/profile/me', auth, vendorsController.updateMyProfile);
router.post('/upload-image', auth, upload.single('image'), handleCloudinaryUpload, vendorsController.uploadProductImage);

router.get('/search', vendorsController.searchVendors);
router.get('/', vendorsController.searchVendors);
router.get('/categories', vendorsController.getAllCategories);
router.get('/cities', vendorsController.getCities);
router.get('/analytics/me', auth, vendorsController.getVendorAnalytics);
router.get('/analytics', auth, vendorsController.getVendorAnalytics);

router.get('/packages', vendorsController.getPackages);
router.get('/products', auth, productsController.getMyProducts);
router.get('/:vendorId', optionalAuth, vendorsController.getVendorById);

router.post('/register', auth, validate(vendorsValidation.registerVendor), vendorsController.registerVendor);
router.post('/register-vendor', auth, validate(vendorsValidation.registerVendor), vendorsController.registerVendor);

router.post('/products', auth, productsController.addProduct);
router.get('/products/search', productsController.searchProducts);
router.get('/products/:productId', optionalAuth, productsController.getProductById);
router.put('/products/:productId', auth, productsController.updateProduct);
router.patch('/products/:productId', auth, productsController.updateProduct);
router.delete('/products/:productId', auth, productsController.deleteProduct);

router.post('/reviews', auth, vendorsController.addReview);
router.post('/feedback', auth, vendorsController.addFeedback);
router.get('/analytics/me', auth, vendorsController.getVendorAnalytics);

module.exports = router;
