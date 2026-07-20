const AppError = require('../../../shared/errors/app-error');
const catchAsync = require('../../../shared/helpers/catch-async');
const prisma = require('../../../config/prisma');

module.exports = (permissionName) => {
  return catchAsync(async (req, res, next) => {
    const { id, role } = req.user;

    // 1. Core Admins (SUPERADMIN) have all permissions
    if (role === 'SUPERADMIN') return next();

    // 2. Admins have MANAGE_STAFF permission by default to manage their team
    if (role === 'ADMIN' && permissionName === 'admins_update') return next();

    // 3. Fetch Admin record from database
    const admin = await prisma.admin.findUnique({
      where: { userId: id }
    });

    if (!admin || !admin.isActive) {
      return next(new AppError('Your account is either not an admin or is suspended', 403));
    }

    // 4. Check for granular CRUD permissions
    const requiredPermissionLower = permissionName.toLowerCase();
    const userPermissionsLower = (admin.permissions || []).map(p => p.toLowerCase());

    // Allow bypass if user has "all" for that module (e.g., vendors_all)
    const moduleName = requiredPermissionLower.split('_')[0];
    const moduleAllPermission = `${moduleName}_all`;

    const hasPermission = userPermissionsLower.includes(requiredPermissionLower) || 
                          userPermissionsLower.includes(moduleAllPermission) ||
                          userPermissionsLower.includes('all');

    if (!hasPermission) {
      return next(new AppError(`Access Denied: Missing '${permissionName}' permission`, 403));
    }

    next();
  });
};
