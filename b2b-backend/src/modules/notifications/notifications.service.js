const twilio = require('twilio');
const { sendEmail } = require('../../services/email.service');
const templates = require('../../services/email.templates');

// Initialize Twilio for WhatsApp
const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

/**
 * Send WhatsApp Notification (via Twilio)
 */
const sendWhatsApp = async (phone, message) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio not configured. Would have sent WhatsApp to', phone, ':', message);
    return;
  }
  
  try {
    let formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${formattedPhone}`
    });
  } catch (err) {
    console.error('WhatsApp sending failed:', err);
  }
};

/**
 * Comprehensive Lead Notification
 */
const notifyVendorOfLead = async (vendor, lead) => {
  const shortMessage = `Hello ${vendor.businessName}, you have a new ${lead.type} lead from ${lead.buyerName} in ${lead.city}. Log in to view details.`;
  
  // 1. Email Notification
  await sendEmail({
    email: vendor.email,
    subject: '🚀 New Business Lead Received!',
    message: shortMessage,
    html: templates.leadDistributionTemplate(vendor, lead)
  });

  // 2. WhatsApp Notification
  await sendWhatsApp(vendor.phone, `🚀 *New ${lead.type} Lead Alert* \n\nHello ${vendor.businessName}, you received a new lead from *${lead.buyerName}* in *${lead.city}*. \n\nPlease login to your dashboard to take action.`);
};

/**
 * Subscription Expiry / Upgrade Notifications
 */
const notifySubscriptionEvent = async (vendor, eventType, details) => {
  let subject = '';
  let htmlBody = '';
  let whatsappMsg = '';

  if (eventType === 'PAYMENT_SUCCESS') {
    subject = '🎉 Payment Successful & Plan Upgraded';
    htmlBody = templates.paymentSuccessTemplate(vendor, details);
    whatsappMsg = `🎉 *Payment Successful!*\n\nHello ${vendor.businessName}, we have received your payment of *INR ${details.amount || '...'}* (Txn ID: ${details.transactionId || 'N/A'}).\n\nYour subscription is now upgraded to *${details.packageName}*.\n\nExpiry: ${details.expiry}\n\nThank you for choosing B2B Connect India!`;
  } else if (eventType === 'EXPIRY_WARNING') {
    subject = `⏳ Your Subscription Expires in ${details.daysLeft} Days – Renew Now`;
    htmlBody = templates.subscriptionExpiryWarningTemplate(vendor, details);
    whatsappMsg = `⏳ *Subscription Expiring Soon!*\n\nHello ${vendor.businessName}, your *${details.packageName}* plan expires in *${details.daysLeft} days* on ${details.expiry}.\n\nPlease renew to keep your listing active and maintain your ranking.\n\n👉 Login to renew: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/billing`;
  } else if (eventType === 'EXPIRED') {
    subject = '⚠️ Subscription Expired – Renew to Restore Access';
    htmlBody = templates.subscriptionExpiredTemplate(vendor);
    whatsappMsg = `⚠️ *Subscription Expired!*\n\nHello ${vendor.businessName}, your subscription has expired. Please renew immediately to restore your listing.\n\n👉 ${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/billing`;
  } else if (eventType === 'PAYMENT_FAILED') {
    subject = '⚠️ Payment Failed';
    htmlBody = templates.paymentFailedTemplate(vendor, details);
    whatsappMsg = `⚠️ *Payment Failed*\n\nHello ${vendor.businessName}, your payment of *INR ${details.amount}* (Txn ID: ${details.transactionId}) was unsuccessful.\n\nNo amount was deducted. Please try again from your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/billing`;
  } else if (eventType === 'PAYMENT_PENDING') {
    subject = '⏳ Payment Pending Verification';
    htmlBody = templates.paymentPendingTemplate(vendor, details);
    whatsappMsg = `⏳ *Payment Pending*\n\nHello ${vendor.businessName}, your payment of *INR ${details.amount}* (Txn ID: ${details.transactionId}) is pending verification.\n\nPlease wait a few minutes before trying again.`;
  }

  await sendEmail({ email: vendor.email, subject, html: htmlBody });
  await sendWhatsApp(vendor.phone, whatsappMsg);
};

/**
 * Vendor Registration Success Notification
 */
const notifyVendorRegistration = async (vendor) => {
  console.log(`[AUTH] 🏪 New Vendor Registration: ${vendor.businessName} (${vendor.email})`);
  
  const subject = '🏪 Welcome to B2B Community Marketplace!';
  const message = `Hello ${vendor.businessName}, your vendor registration has been received successfully. Our team will review your documents and verify your profile soon.`;
  
  // 1. Email
  await sendEmail({
    email: vendor.email,
    subject: subject,
    message: message,
    html: templates.vendorRegistrationTemplate(vendor)
  });

  // 2. WhatsApp
  await sendWhatsApp(vendor.phone, `🏪 *Welcome to B2B Community!* \n\nHello ${vendor.businessName}, your registration is successful. Status: *Pending Verification*. Our team will review your profile shortly.`);
};

/**
 * Vendor Approval Notification
 */
const notifyVendorApproval = async (vendor, adminRole) => {
  const roleName = adminRole === 'SUPERADMIN' ? 'Super Admin' : 'Admin';
  const subject = `✅ Business Verified: ${vendor.businessName} is now LIVE!`;
  
  await sendEmail({
    email: vendor.user?.email || vendor.email,
    subject,
    html: templates.vendorApprovalTemplate(vendor, roleName)
  });
};

/**
 * Product/Offering Approval Notification
 */
const notifyProductApproval = async (vendor, product, adminRole) => {
  const roleName = adminRole === 'SUPERADMIN' ? 'Super Admin' : 'Admin';
  const subject = `✅ Product Approved: "${product.name}" is now Live!`;

  await sendEmail({
    email: vendor.user?.email || vendor.email,
    subject,
    html: templates.productApprovalTemplate(vendor, product, roleName)
  });
};

/**
 * Vendor Rejection Notification
 */
const notifyVendorRejection = async (vendor, reason) => {
  const subject = `Action Required: Vendor Application Status`;
  
  await sendEmail({
    email: vendor.user?.email || vendor.email,
    subject,
    html: templates.vendorRejectionTemplate(vendor, reason)
  });
};

/**
 * Product/Offering Rejection Notification
 */
const notifyProductRejection = async (vendor, product, reason) => {
  const subject = `Action Required: Product Listing Status`;

  await sendEmail({
    email: vendor.user?.email || vendor.email,
    subject,
    html: templates.productRejectionTemplate(vendor, product, reason)
  });
};

/**
 * Manual Lead Assignment Notification
 */
const notifyLeadAssignment = async (vendor, lead, adminRole) => {
  const roleName = adminRole === 'SUPERADMIN' ? 'Super Admin' : 'Admin';
  const subject = `🚀 New Priority Lead Assigned to you by ${roleName}`;

  await sendEmail({
    email: vendor.user?.email || vendor.email,
    subject,
    html: templates.manualLeadAssignmentTemplate(vendor, lead, roleName)
  });
};

/**
 * Reminder for Unattended Leads
 */
const notifyUnattendedLead = async (vendor, lead) => {
  const subject = `⚠️ Reminder: Unread Lead from ${lead.buyerName}`;
  const message = `Hello ${vendor.businessName}, you have an unattended lead from ${lead.buyerName} waiting for over 24 hours. Please log in and respond to secure the business.`;

  await sendEmail({
    email: vendor.user?.email || vendor.email,
    subject,
    message,
    html: templates.unattendedLeadTemplate(vendor, lead)
  });

  await sendWhatsApp(vendor.phone, `⚠️ *Reminder: Unread Lead*\n\nHello ${vendor.businessName}, you have an unattended lead from *${lead.buyerName}* waiting for over 24 hours.\n\nPlease login to your dashboard to take action.`);
};

/**
 * Weekly Performance Report for Vendors
 */
const sendWeeklyPerformanceReports = async () => {
  const prisma = require('../../config/prisma');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const vendors = await prisma.vendor.findMany({
    where: { 
      user: { isEmailVerified: true } 
    },
    include: {
      user: true,
      legacyLeads: {
        where: { createdAt: { gte: sevenDaysAgo } }
      }
    }
  });

  for (const vendor of vendors) {
    const leadsThisWeek = vendor.legacyLeads?.length || 0;
    const subject = `📊 Your Weekly Performance Report - B2B Marketplace`;

    await sendEmail({
      email: vendor.user?.email || vendor.email,
      subject,
      html: templates.weeklyPerformanceReportTemplate(vendor, leadsThisWeek)
    });
    
    console.log(`[REPORTS] Sent weekly report to ${vendor.businessName}`);
  }
};

module.exports = { 
  sendEmail,
  sendWhatsApp, 
  notifyVendorOfLead,
  notifySubscriptionEvent,
  notifyVendorRegistration,
  notifyVendorApproval,
  notifyProductApproval,
  notifyLeadAssignment,
  notifyUnattendedLead,
  sendWeeklyPerformanceReports,
  notifyVendorRejection,
  notifyProductRejection
};
