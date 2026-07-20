const asyncHandler = require("express-async-handler");
const prisma = require("../../../config/prisma");
const AppError = require("../../../shared/errors/app-error");

/**
 * @desc    Submit a new contact inquiry
 * @route   POST /api/v1/contact
 * @access  Public
 */
const submitInquiry = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return next(new AppError("Name, email, and message are required fields.", 400));
  }

  const inquiry = await prisma.contactInquiry.create({
    data: {
      name,
      email,
      phone,
      subject,
      message,
    },
  });

  res.status(201).json({
    success: true,
    message: "Your inquiry has been submitted successfully.",
    data: inquiry,
  });
});

/**
 * @desc    Get all contact inquiries
 * @route   GET /api/v1/contact
 * @access  Private (Admin/SubAdmin/SuperAdmin)
 */
const getInquiries = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering by status if provided
  const { status } = req.query;
  let where = {};
  if (status) {
    where.status = status;
  }

  const inquiries = await prisma.contactInquiry.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.contactInquiry.count({ where });

  res.status(200).json({
    success: true,
    count: inquiries.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: inquiries,
  });
});

/**
 * @desc    Update inquiry status
 * @route   PUT /api/v1/contact/:id/status
 * @access  Private (Admin/SubAdmin/SuperAdmin)
 */
const updateInquiryStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["PENDING", "INPROGRESS", "RESOLVED"].includes(status)) {
    return next(new AppError("Invalid status.", 400));
  }

  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });

  if (!inquiry) {
    return next(new AppError("Inquiry not found.", 404));
  }

  const updatedInquiry = await prisma.contactInquiry.update({
    where: { id },
    data: { status },
  });

  res.status(200).json({
    success: true,
    message: "Inquiry status updated successfully.",
    data: updatedInquiry,
  });
});

/**
 * @desc    Delete an inquiry
 * @route   DELETE /api/v1/contact/:id
 * @access  Private (Admin/SubAdmin/SuperAdmin)
 */
const deleteInquiry = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });

  if (!inquiry) {
    return next(new AppError("Inquiry not found.", 404));
  }

  await prisma.contactInquiry.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: "Inquiry deleted successfully.",
  });
});

module.exports = {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
