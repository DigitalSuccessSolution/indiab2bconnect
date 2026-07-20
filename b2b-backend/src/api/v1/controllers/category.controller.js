const prisma = require("../../../config/prisma");
const catchAsync = require("../../../shared/helpers/catch-async");
const ApiResponse = require("../../../shared/helpers/api-response");
const AppError = require("../../../shared/errors/app-error");
const cacheService = require("../../../services/cache.service");
const { logAction } = require("../../../shared/helpers/auditLogger");

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const cacheKey = 'categories:all';
  let categories = await cacheService.getCache(cacheKey);

  if (!categories) {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { vendors: true }
        }
      }
    });

    await cacheService.setCache(cacheKey, categories, 3600); // 1 hour cache
  }

  res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon, isActive } = req.body;

  const category = await prisma.category.create({
    data: { name, description, icon, isActive: isActive !== undefined ? isActive : true },
  });

  // Create Audit Log
  await logAction(
    req.user.id,
    "CREATE_CATEGORY",
    "CATEGORY",
    `Created new category: ${name}`,
    req.ip,
  );

  await cacheService.deleteCache('categories:all');

  res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, icon, isActive } = req.body;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return next(new AppError("Category not found", 404));

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name, description, icon, isActive },
  });

  // Create Audit Log
  await logAction(
    req.user.id,
    "UPDATE_CATEGORY",
    "CATEGORY",
    `Updated category: ${name}`,
    req.ip,
  );

  await cacheService.deleteCache('categories:all');

  res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, "Category updated successfully"));
});

exports.toggleCategoryStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return next(new AppError("Category not found", 404));

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { isActive: !category.isActive },
  });

  await logAction(
    req.user.id,
    "UPDATE_CATEGORY",
    "CATEGORY",
    `Marked category ${category.name} as ${updatedCategory.isActive ? 'Active' : 'Inactive'}`,
    req.ip,
  );

  await cacheService.deleteCache('categories:all');

  res.status(200).json(new ApiResponse(200, updatedCategory, `Category marked as ${updatedCategory.isActive ? 'Active' : 'Inactive'}`));
});

exports.adminGetAllCategories = catchAsync(async (req, res, next) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.status(200).json(new ApiResponse(200, categories));
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({ 
    where: { id },
    include: { _count: { select: { leads: true, vendors: true } } }
  });
  if (!category) return next(new AppError("Category not found", 404));

  if (category._count.leads > 0 || category._count.vendors > 0) {
    return next(new AppError(`Cannot delete category "${category.name}". It is currently linked to ${category._count.leads} leads and ${category._count.vendors} vendors. Please reassign or delete them first.`, 400));
  }

  await prisma.category.delete({ where: { id } });

  // Create Audit Log
  await logAction(
    req.user.id,
    "DELETE_CATEGORY",
    "CATEGORY",
    `Permanently deleted category: ${category.name}`,
    req.ip,
  );

  await cacheService.deleteCache('categories:all');

  res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});
