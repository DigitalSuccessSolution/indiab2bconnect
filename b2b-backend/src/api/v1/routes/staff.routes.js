const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const auth = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.use(auth);

router.post('/', permission('admins_create'), staffController.createAdmin);
router.get('/', permission('admins_read'), staffController.getAllAdmins);
router.patch('/:id', permission('admins_update'), staffController.updateAdmin);
router.delete('/:id', permission('admins_delete'), staffController.deleteAdmin);

module.exports = router;
