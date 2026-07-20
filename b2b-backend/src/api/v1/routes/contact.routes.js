const express = require("express");
const router = express.Router();
const {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/contact.controller");
const protect = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/role.middleware");

// Public route to submit an inquiry
router.post("/", submitInquiry);

// Protected routes for admins to manage inquiries
router.use(protect);
router.use(restrictTo("SUPERADMIN", "ADMIN", "SUBADMIN"));

router.get("/", getInquiries);
router.put("/:id/status", updateInquiryStatus);
router.delete("/:id", deleteInquiry);

module.exports = router;
