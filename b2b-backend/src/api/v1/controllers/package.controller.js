const prisma = require('../../../config/prisma');
const catchAsync = require('../../../shared/helpers/catch-async');
const ApiResponse = require('../../../shared/helpers/api-response');
const AppError = require('../../../shared/errors/app-error');

const cacheService = require("../../../services/cache.service");

/**
 * Public: Get all available packages for vendors to subscribe
 */
exports.getAllPackages = catchAsync(async (req, res, next) => {
  const cacheKey = 'packages:all';
  let packages = await cacheService.getCache(cacheKey);

  if (!packages) {
    packages = await prisma.package.findMany({
      orderBy: { price: 'asc' }
    });
    await cacheService.setCache(cacheKey, packages, 3600); // 1 hour cache
  }

  res.status(200).json(new ApiResponse(200, packages));
});

exports.createPackage = catchAsync(async (req, res, next) => {
  const { name, price, priority, description, features, isPopular, isActive } = req.body;

  if (!name || price === undefined)
    return next(new AppError("Name and price are required", 400));

  const pkg = await prisma.package.create({
    data: {
      name,
      price: parseFloat(price),
      priority: parseInt(priority) || 0,
      description,
      features: Array.isArray(features) ? features : [],
      isPopular: !!isPopular,
      isActive: isActive !== undefined ? !!isActive : true,
    },
  });

  await cacheService.deleteCache('packages:all');

  res
    .status(201)
    .json(new ApiResponse(201, pkg, "Subscription package initialized"));
});

exports.updatePackage = catchAsync(async (req, res, next) => {
  const { packageId } = req.params;
  const { name, price, priority, description, features, isPopular, isActive } = req.body;

  const pkg = await prisma.package.update({
    where: { id: packageId },
    data: {
      name,
      price: price !== undefined ? parseFloat(price) : undefined,
      priority: priority !== undefined ? parseInt(priority) : undefined,
      description,
      features: Array.isArray(features) ? features : undefined,
      isPopular: isPopular !== undefined ? !!isPopular : undefined,
      isActive: isActive !== undefined ? !!isActive : undefined,
    },
  });

  await cacheService.deleteCache('packages:all');

  res.status(200).json(new ApiResponse(200, pkg, "Package tier updated"));
});

exports.deletePackage = catchAsync(async (req, res, next) => {
  const { packageId } = req.params;

  await prisma.package.delete({
    where: { id: packageId },
  });

  await cacheService.deleteCache('packages:all');

  res
    .status(200)
    .json(new ApiResponse(200, null, "Package tier decommissioned"));
});
