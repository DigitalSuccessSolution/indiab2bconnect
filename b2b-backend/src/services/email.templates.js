/**
 * Email Templates for B2B Marketplace
 * Separating UI/HTML logic from business logic.
 * Designed with modern, responsive, professional aesthetics.
 */

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Universal Email Wrapper
 * Provides a consistent header, body container, and footer.
 */
const emailWrapper = (title, content, preheader = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <span style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin: 0 20px;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">B2B Connect India</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; color: #334155; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafb; padding: 32px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                © ${new Date().getFullYear()} B2B Connect India. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                You are receiving this email because you are a registered vendor on our platform.<br>
                <a href="${getFrontendUrl()}/vendor/settings" style="color: #3b82f6; text-decoration: none;">Manage Email Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const leadDistributionTemplate = (vendor, lead) => emailWrapper(
  "New Lead Assigned",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    <p>Great news! You have been assigned a new <strong>${lead.type}</strong> lead. Responding quickly increases your chances of closing the deal.</p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Lead Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
        <tr><td style="padding-bottom: 12px; color: #64748b;" width="35%"><strong>Buyer:</strong></td><td style="padding-bottom: 12px; color: #0f172a; font-weight: 500;">${lead.buyerName}</td></tr>
        <tr><td style="padding-bottom: 12px; color: #64748b;"><strong>Location:</strong></td><td style="padding-bottom: 12px; color: #0f172a; font-weight: 500;">${lead.city}</td></tr>
        <tr><td style="padding-bottom: 0; color: #64748b;"><strong>Requirement:</strong></td><td style="padding-bottom: 0; color: #0f172a; font-weight: 500;">${lead.searchKeyword || lead.message || 'General Inquiry'}</td></tr>
      </table>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/leads" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-top: 8px; font-size: 16px;">View Full Details</a>
        </td>
      </tr>
    </table>
  `,
  "You have a new business lead waiting for your response."
);

const paymentSuccessTemplate = (vendor, details) => emailWrapper(
  "Payment Receipt: Subscription Upgraded",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">🎉 Payment Successful, ${vendor.businessName}!</h2>
    <p>Your payment of <strong>INR ${details.amount || '...'}</strong> was successfully received. Your subscription has been upgraded to the <strong>${details.packageName}</strong>.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; color: #334155; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; line-height: 1.6;">
        <tr><td style="color: #64748b; padding-bottom: 8px;" width="40%">Transaction ID:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${details.transactionId || 'N/A'}</td></tr>
        <tr><td style="color: #64748b; padding-bottom: 8px;">Amount Paid:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">INR ${details.amount || 'N/A'}</td></tr>
        <tr><td style="color: #64748b; padding-bottom: 8px;">Date:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${details.date || 'N/A'}</td></tr>
        <tr><td style="color: #64748b; padding-bottom: 0;">Valid Until:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 0;">${details.expiry || 'N/A'}</td></tr>
      </table>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 0 0 32px 0;">
      <p style="margin: 0; color: #166534; font-size: 15px;"><strong>New Plan Benefits Activated:</strong> Boosted ranking priority, premium verified leads, and enhanced visibility!</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/dashboard" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-top: 8px; font-size: 16px;">Go to Dashboard</a>
        </td>
      </tr>
    </table>
  `,
  `Your payment of INR ${details.amount || ''} was successful.`
);

const subscriptionExpiryWarningTemplate = (vendor, details) => emailWrapper(
  "Action Required: Subscription Expiring",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">⚠️ Your <strong>${details.packageName}</strong> expires in ${details.daysLeft} Days (on ${details.expiry}).</p>
    </div>

    <p style="margin-bottom: 32px;">Don't lose your premium ranking and access to exclusive leads. If your plan expires, your listing will be temporarily downgraded and your products may be hidden from buyers.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/billing" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Renew Now</a>
        </td>
      </tr>
    </table>
  `,
  `Your plan expires in ${details.daysLeft} days. Renew to maintain your ranking.`
);

const subscriptionExpiredTemplate = (vendor) => emailWrapper(
  "Subscription Expired",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 24px; border-radius: 8px; margin: 32px 0; text-align: center;">
      <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 18px;">⚠️ Premium Access Revoked</h3>
      <p style="margin: 0; color: #7f1d1d; font-size: 15px;">Your subscription has expired. Your listing ranking has been downgraded and premium features have been disabled.</p>
    </div>

    <p style="margin-bottom: 32px; text-align: center;">It's not too late! You can restore your premium access immediately by renewing your subscription.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/billing" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Renew Subscription</a>
        </td>
      </tr>
    </table>
  `,
  "Your premium subscription has expired. Renew to restore access."
);

const vendorRegistrationTemplate = (vendor) => emailWrapper(
  "Registration Received",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Welcome to the Network!</h2>
    <p>Dear <strong>${vendor.businessName}</strong>,</p>
    <p>Thank you for registering your business with B2B Connect India. We have successfully received your application.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
        <tr><td style="padding-bottom: 12px; color: #64748b;" width="40%"><strong>Current Status:</strong></td><td style="padding-bottom: 12px; color: #d97706; font-weight: 700;">Pending Verification</td></tr>
        <tr><td style="padding-bottom: 0px; color: #64748b;"><strong>Registration ID:</strong></td><td style="padding-bottom: 0px; color: #0f172a; font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${vendor.id}</td></tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Our verification team is currently reviewing your profile and documents. You will receive an update from us within 24-48 hours once your account is approved and goes live.</p>
  `,
  "Your registration is pending verification."
);

const vendorApprovalTemplate = (vendor, roleName) => emailWrapper(
  "Account Verified",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Congratulations, ${vendor.businessName}!</h2>
    <p>We are thrilled to inform you that your business profile has been officially verified and approved by our team.</p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 4px; margin: 32px 0;">
      <p style="margin: 0; color: #166534; font-weight: 700; font-size: 16px;">Status: ACTIVE & VERIFIED</p>
      <p style="margin: 8px 0 0 0; color: #15803d; font-size: 15px;">Your listing is now visible to thousands of potential buyers across the network.</p>
    </div>

    <p style="font-weight: 600; color: #0f172a; margin-bottom: 12px;">Next Steps for Success:</p>
    <ul style="color: #475569; padding-left: 24px; margin-bottom: 32px; line-height: 1.8;">
      <li>Add your top products/services to your catalog.</li>
      <li>Complete your profile (upload logo, add description) to improve ranking.</li>
      <li>Keep an eye on your inbox for new buyer leads.</li>
    </ul>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Access Dashboard</a>
        </td>
      </tr>
    </table>
  `,
  "Your business profile has been verified and is now live."
);

const productApprovalTemplate = (vendor, product, roleName) => emailWrapper(
  "Product Listing Approved",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    <p>Great news! Your product listing has been reviewed and approved. It is now publicly visible to buyers on the marketplace.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 18px;">${product.name}</p>
      <p style="margin: 8px 0 0 0; color: #64748b; font-size: 15px;">Category: ${product.category || 'General'}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/products" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; margin-top: 8px; font-size: 16px;">Manage Products</a>
        </td>
      </tr>
    </table>
  `,
  `Your product "${product.name}" is now live on the marketplace.`
);

const manualLeadAssignmentTemplate = (vendor, lead, roleName) => emailWrapper(
  "High Priority Lead Assigned",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    <p>A high-priority lead has been manually assigned to your business profile by our management team.</p>
    
    <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; border-radius: 4px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; color: #9a3412; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Priority Lead Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
        <tr><td style="padding-bottom: 12px; color: #9a3412;" width="35%"><strong>Buyer:</strong></td><td style="padding-bottom: 12px; color: #431407; font-weight: 500;">${lead.buyerName}</td></tr>
        <tr><td style="padding-bottom: 12px; color: #9a3412;"><strong>Location:</strong></td><td style="padding-bottom: 12px; color: #431407; font-weight: 500;">${lead.city}</td></tr>
        <tr><td style="padding-bottom: 0; color: #9a3412;"><strong>Requirement:</strong></td><td style="padding-bottom: 0; color: #431407; font-weight: 500;">${lead.message || lead.searchKeyword || 'N/A'}</td></tr>
      </table>
    </div>

    <p style="margin-bottom: 32px;">We highly recommend contacting this buyer immediately to maximize your chance of conversion.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/leads" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Respond Now</a>
        </td>
      </tr>
    </table>
  `,
  "A high-priority lead has been assigned to you. Respond quickly."
);

const unattendedLeadTemplate = (vendor, lead) => emailWrapper(
  "Action Required: Unread Lead",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 16px;">⚠️ You have an unattended lead waiting for over 24 hours.</p>
    </div>

    <p>Statistics show that responding within the first few hours significantly increases your chances of converting a lead into business. Don't let this opportunity slip away!</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 32px 0;">
      <p style="margin: 0 0 12px 0; color: #475569; font-size: 15px;"><strong>Buyer:</strong> <span style="color: #0f172a; font-weight: 500;">${lead.buyerName}</span></p>
      <p style="margin: 0 0 12px 0; color: #475569; font-size: 15px;"><strong>Location:</strong> <span style="color: #0f172a; font-weight: 500;">${lead.city}</span></p>
      <p style="margin: 0; color: #475569; font-size: 15px;"><strong>Requirement:</strong> <span style="color: #0f172a; font-weight: 500;">${lead.message || 'N/A'}</span></p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/leads" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Take Action Now</a>
        </td>
      </tr>
    </table>
  `,
  "You received a lead over 24 hours ago that is still pending your response."
);

const weeklyPerformanceReportTemplate = (vendor, leadsThisWeek) => emailWrapper(
  "Weekly Performance Summary",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    <p>Here is a summary of how your business performed on the B2B Connect India Marketplace over the past 7 days:</p>
    
    <div style="margin: 40px 0;">
      <!-- Stat 1 -->
      <div style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: middle;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Leads Received</p>
        </div>
        <div style="display: table-cell; vertical-align: middle; text-align: right;">
          <span style="font-size: 28px; font-weight: 800; color: #059669;">${leadsThisWeek}</span>
        </div>
      </div>
      
      <!-- Stat 2 -->
      <div style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: middle;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Profile Completeness</p>
        </div>
        <div style="display: table-cell; vertical-align: middle; text-align: right;">
          <span style="font-size: 28px; font-weight: 800; color: #2563eb;">${vendor.profileCompleteness}%</span>
        </div>
      </div>
      
      <!-- Stat 3 -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-cell; vertical-align: middle;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Overall Ranking Score</p>
        </div>
        <div style="display: table-cell; vertical-align: middle; text-align: right;">
          <span style="font-size: 28px; font-weight: 800; color: #7c3aed;">${(vendor.totalScore || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
      <p style="margin: 0; color: #1e40af; font-size: 15px; line-height: 1.6;">
        💡 <strong>Pro Tip:</strong> To improve your visibility and get more leads, ensure your profile is 100% complete and always respond to buyer inquiries quickly.
      </p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/dashboard" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">View Full Dashboard</a>
        </td>
      </tr>
    </table>
  `,
  `You received ${leadsThisWeek} leads this week. Check your performance summary.`
);

const welcomeEmailTemplate = (user) => emailWrapper(
  "Welcome to B2B Connect India",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Welcome, ${user.name}!</h2>
    <p>We are absolutely thrilled to welcome you to the <strong>B2B Connect India</strong> community.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">Your account has been created successfully. You can now explore the marketplace, connect with buyers or sellers, and grow your business.</p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/login" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Log In to Your Account</a>
        </td>
      </tr>
    </table>
  `,
  "Your account has been created successfully. Welcome to our community!"
);

const refundProcessedTemplate = (vendor, amount, orderId) => emailWrapper(
  "Refund Processed Successfully",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hello ${vendor.businessName},</h2>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 4px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px;">Refund Successful</h3>
      <p style="margin: 0; color: #15803d; font-size: 15px; line-height: 1.6;">We have successfully processed your refund of <strong>INR ${amount}</strong> for Transaction ID: <code>${orderId}</code>.</p>
    </div>

    <p style="color: #475569;">It may take <strong>5-7 business days</strong> for the amount to reflect in your original payment method depending on your bank.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/billing" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View Billing History</a>
        </td>
      </tr>
    </table>
  `,
  `Your refund of INR ${amount} has been processed.`
);

const otpEmailTemplate = (otp) => emailWrapper(
  "Your Verification Code",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Verification Required</h2>
    <p>Please use the following One-Time Password (OTP) to verify your account or login securely. This code is valid for 10 minutes.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin: 32px 0; text-align: center;">
      <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 4px;">${otp}</span>
    </div>
    
    <p style="color: #475569; font-size: 14px; margin-top: 24px;">If you did not request this code, please ignore this email or contact support immediately.</p>
  `,
  `Your secure verification code is ${otp}.`
);

const passwordResetTemplate = (resetUrl) => emailWrapper(
  "Password Reset Request",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Password Reset Request</h2>
    <p>We received a request to reset the password for your B2B Connect India account.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">Click the button below to set a new password. This link will expire in exactly <strong>1 hour</strong>.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
        <tr>
          <td align="center">
            <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px;">Reset Password</a>
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
  `,
  "Reset your B2B Connect India password."
);

const vendorRejectionTemplate = (vendor, reason) => emailWrapper(
  "Action Required: Vendor Application Status",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Vendor Application Update</h2>
    <p>Dear ${vendor.businessName},</p>
    <p>We have reviewed your vendor application for the B2B Connect India platform. Unfortunately, we cannot approve your application at this time.</p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin: 32px 0;">
      <h3 style="color: #991b1b; font-size: 16px; margin-top: 0;">Reason for Rejection</h3>
      <p style="margin: 0; color: #7f1d1d;">${reason || "Your application did not meet our current requirements or had incomplete documentation."}</p>
    </div>

    <p style="color: #475569; font-size: 15px;">You may review your submitted details and contact our support team if you believe this was a mistake or if you would like to submit additional documentation.</p>
  `,
  "Update regarding your B2B Connect India vendor application."
);

const productRejectionTemplate = (vendor, product, reason) => emailWrapper(
  "Action Required: Product Listing Status",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Product Listing Update</h2>
    <p>Dear ${vendor.businessName},</p>
    <p>We have reviewed your recent ${product.type.toLowerCase()} submission <strong>"${product.name}"</strong>. Unfortunately, we cannot approve this listing for our marketplace at this time.</p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin: 32px 0;">
      <h3 style="color: #991b1b; font-size: 16px; margin-top: 0;">Reason for Rejection</h3>
      <p style="margin: 0; color: #7f1d1d;">${reason || "The listing did not meet our marketplace guidelines or contained insufficient information."}</p>
    </div>

    <p style="color: #475569; font-size: 15px;">Please log in to your dashboard to edit the listing based on this feedback and resubmit it for approval.</p>
  `,
  `Update regarding your product listing "${product.name}".`
);

const paymentFailedTemplate = (vendor, details) => emailWrapper(
  "Payment Failed",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">⚠️ Payment Failed</h2>
    <p>Dear ${vendor.businessName},</p>
    <p>We attempted to process your payment of <strong>INR ${details.amount}</strong> for the <strong>${details.packageName}</strong> subscription, but the transaction was unsuccessful.</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; color: #991b1b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; line-height: 1.6;">
        <tr><td style="color: #7f1d1d; padding-bottom: 8px;" width="40%">Transaction ID:</td><td style="color: #450a0a; font-weight: 500; padding-bottom: 8px;">${details.transactionId || 'N/A'}</td></tr>
        <tr><td style="color: #7f1d1d; padding-bottom: 8px;">Amount:</td><td style="color: #450a0a; font-weight: 500; padding-bottom: 8px;">INR ${details.amount}</td></tr>
        <tr><td style="color: #7f1d1d; padding-bottom: 0;">Date:</td><td style="color: #450a0a; font-weight: 500; padding-bottom: 0;">${details.date}</td></tr>
      </table>
    </div>

    <p style="margin-bottom: 24px;">No amount has been deducted. If money was debited from your account, it will be automatically refunded by your bank within 3-5 business days.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/billing" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">Try Payment Again</a>
        </td>
      </tr>
    </table>
  `,
  `Your recent payment of INR ${details.amount} has failed.`
);

const paymentPendingTemplate = (vendor, details) => emailWrapper(
  "Payment Pending Verification",
  `
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">⏳ Payment is Pending</h2>
    <p>Dear ${vendor.businessName},</p>
    <p>Your payment of <strong>INR ${details.amount}</strong> for the <strong>${details.packageName}</strong> subscription is currently pending verification from the bank or payment gateway.</p>
    
    <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 24px; border-radius: 8px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; line-height: 1.6;">
        <tr><td style="color: #92400e; padding-bottom: 8px;" width="40%">Transaction ID:</td><td style="color: #78350f; font-weight: 500; padding-bottom: 8px;">${details.transactionId || 'N/A'}</td></tr>
        <tr><td style="color: #92400e; padding-bottom: 8px;">Amount:</td><td style="color: #78350f; font-weight: 500; padding-bottom: 8px;">INR ${details.amount}</td></tr>
        <tr><td style="color: #92400e; padding-bottom: 0;">Date:</td><td style="color: #78350f; font-weight: 500; padding-bottom: 0;">${details.date}</td></tr>
      </table>
    </div>

    <p style="margin-bottom: 24px;">Please do not make another payment while we verify this transaction. We will notify you once the status is updated (usually within 15-30 minutes).</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${getFrontendUrl()}/vendor/billing" style="display: inline-block; background-color: #d97706; color: #ffffff; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">View Status</a>
        </td>
      </tr>
    </table>
  `,
  `Your recent payment of INR ${details.amount} is currently pending.`
);

module.exports = {
  leadDistributionTemplate,
  paymentSuccessTemplate,
  subscriptionExpiryWarningTemplate,
  subscriptionExpiredTemplate,
  vendorRegistrationTemplate,
  vendorApprovalTemplate,
  productApprovalTemplate,
  manualLeadAssignmentTemplate,
  unattendedLeadTemplate,
  weeklyPerformanceReportTemplate,
  welcomeEmailTemplate,
  refundProcessedTemplate,
  otpEmailTemplate,
  passwordResetTemplate,
  vendorRejectionTemplate,
  productRejectionTemplate,
  paymentFailedTemplate,
  paymentPendingTemplate
};
