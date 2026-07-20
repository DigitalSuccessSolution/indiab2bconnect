const catchAsync = require('../../../shared/helpers/catch-async');
const prisma = require('../../../config/prisma');
const AppError = require('../../../shared/errors/app-error');
const ApiResponse = require('../../../shared/helpers/api-response');
const bcrypt = require('bcryptjs');
const { logAction } = require('../../../shared/helpers/auditLogger');
const cacheService = require('../../../services/cache.service');

const VALID_DEPARTMENTS = ['GENERAL', 'DATA_ENTRY', 'SALES', 'SUPPORT'];

// Create admin (SUPERADMIN or ADMIN can do this)
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, permissions, department, hubName, categoryIds, role } = req.body;
  const creatorRole = req.user.role;

  if (department && !VALID_DEPARTMENTS.includes(department)) {
    return next(new AppError('Invalid department selected', 400));
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (user) return next(new AppError('Email already in use', 400));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Determine target role based on creator's role and requested role
  let targetRole = 'SUBADMIN';
  if (creatorRole === 'SUPERADMIN') {
    targetRole = role === 'SUBADMIN' ? 'SUBADMIN' : 'ADMIN';
  }

  user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: targetRole
    }
  });

  let createdById = null;
  if (creatorRole === 'ADMIN') {
    const creatorAdmin = await prisma.admin.findUnique({ where: { userId: req.user.id } });
    if (creatorAdmin) createdById = creatorAdmin.id;
  }

  const admin = await prisma.admin.create({
    data: {
      userId: user.id,
      name,
      email,
      department: department || 'GENERAL',
      hubName: hubName || null,
      categoryIds: categoryIds || [],
      permissions: permissions || [],
      createdById: createdById
    }
  });

  // Create Audit Log
  await logAction(req.user.id, 'CREATE_STAFF', targetRole, `Created new ${targetRole}: ${name} (${email})`, req.ip);

  // Clear Cache
  await cacheService.deleteCache(`admin:staff:all:global`);
  if (createdById) {
    const creatorUser = await prisma.admin.findUnique({ where: { id: createdById } });
    if (creatorUser) await cacheService.deleteCache(`admin:staff:all:${creatorUser.userId}`);
  }

  res.status(201).json(new ApiResponse(201, admin, `${targetRole} created successfully`));
});

// Get all admins (Filtered based on role)
exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const { role, id } = req.user;

  const cacheContext = role === "SUPERADMIN" ? "global" : id;
  const cacheKey = `admin:staff:all:${cacheContext}`;
  let cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) return res.status(200).json(new ApiResponse(200, cachedData));

  let where = {};

  if (role === 'ADMIN') {
    const creatorAdmin = await prisma.admin.findUnique({ where: { userId: id } });
    where = { createdById: creatorAdmin ? creatorAdmin.id : 'none' };
  } else if (role === 'SUPERADMIN') {
    where = { user: { role: { in: ['ADMIN', 'SUBADMIN'] } } };
  }

  const admins = await prisma.admin.findMany({
    where,
    include: { user: { select: { isActive: true, role: true, avatar: true } } }
  });

  await cacheService.setCache(cacheKey, admins, 300); // 5 mins cache

  res.status(200).json(new ApiResponse(200, admins));
});

// Update admin Permissions / Status
exports.updateAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { permissions, isActive, department, hubName, categoryIds, name, email, password, role } = req.body;

  if (department && !VALID_DEPARTMENTS.includes(department)) {
    return next(new AppError('Invalid department selected', 400));
  }

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return next(new AppError('admin not found', 404));

  const updateData = {};
  if (permissions !== undefined) updateData.permissions = permissions;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (department !== undefined) updateData.department = department;
  if (hubName !== undefined) updateData.hubName = hubName;
  if (categoryIds !== undefined) updateData.categoryIds = categoryIds;
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: updateData
  });

  const userUpdateData = {};
  if (isActive !== undefined) userUpdateData.isActive = isActive;
  if (name !== undefined) userUpdateData.name = name;
  if (email !== undefined) userUpdateData.email = email;
  if (role !== undefined && req.user.role === 'SUPERADMIN') {
    // Only SUPERADMIN can change roles
    userUpdateData.role = role === 'SUBADMIN' ? 'SUBADMIN' : 'ADMIN';
  }

  if (password) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    userUpdateData.password = await bcrypt.hash(password, salt);
  }

  if (Object.keys(userUpdateData).length > 0) {
    await prisma.user.update({
      where: { id: admin.userId },
      data: userUpdateData
    });
  }

  // Create Audit Log
  await logAction(req.user.id, 'UPDATE_ADMIN', 'ADMIN', `Updated admin ${updatedAdmin.name || updatedAdmin.email || id}`, req.ip);

  // Clear Cache
  await cacheService.deleteCache(`admin:staff:all:global`);
  if (admin.createdById) {
    const creatorUser = await prisma.admin.findUnique({ where: { id: admin.createdById } });
    if (creatorUser) await cacheService.deleteCache(`admin:staff:all:${creatorUser.userId}`);
  }

  res.status(200).json(new ApiResponse(200, updatedAdmin, 'admin updated'));
});

// Delete admin
exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return next(new AppError('admin not found', 404));

  await prisma.admin.delete({ where: { id } });
  await prisma.user.delete({ where: { id: admin.userId } });

  // Create Audit Log
  await logAction(req.user.id, 'DELETE_ADMIN', 'ADMIN', `Permanently removed admin account of ${admin.name}`, req.ip);

  // Clear Cache
  await cacheService.deleteCache(`admin:staff:all:global`);
  if (admin.createdById) {
    const creatorUser = await prisma.admin.findUnique({ where: { id: admin.createdById } });
    if (creatorUser) await cacheService.deleteCache(`admin:staff:all:${creatorUser.userId}`);
  }

  res.status(200).json(new ApiResponse(200, null, 'admin removed completely'));
});
