const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../../../config/prisma");
const catchAsync = require("../../../shared/helpers/catch-async");
const AppError = require("../../../shared/errors/app-error");
const ApiResponse = require("../../../shared/helpers/api-response");
const notificationService = require("../../../modules/notifications/notifications.service");

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
};

const sendTokenResponse = async (user, statusCode, res, message) => {
  const { accessToken, refreshToken } = await generateTokens(user);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' // Using lax to allow cookies in local dev environments properly
  };

  const roleCookieOptions = {
    ...cookieOptions,
    httpOnly: false // Allow frontend Next.js Middleware to read it
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('userRole', user.role, roleCookieOptions);

  // Remove sensitive fields
  if (user.password) user.password = undefined;
  if (user.otp) user.otp = undefined;

  res.status(statusCode).json(new ApiResponse(statusCode, { 
    token: accessToken, 
    user 
  }, message));
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, role, otp } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please provide name, email and password", 400));
  }

  // OTP Verification for Registration
  if (otp) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.otp !== otp || (user.otpExpiry && new Date() > user.otpExpiry)) {
      return next(new AppError("Invalid or expired email verification code", 401));
    }
  } else {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.password) {
      return next(new AppError("User already exists with this email", 400));
    }
  }

  const hashed = await bcrypt.hash(password, 10);

  let user;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    user = await prisma.user.update({
        where: { email },
        data: {
            name,
            phone,
            password: hashed,
            role: role || "VENDOR",
            otp: null,
            otpExpiry: null
        }
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' '),
        email,
        phone,
        password: hashed,
        role: role || "BUYER"
      }
    });
  }

  // Send Welcome Email
  const templates = require('../../../services/email.templates');
  notificationService.sendEmail({
    email: user.email,
    subject: "✨ Welcome to B2B Community Marketplace!",
    html: templates.welcomeEmailTemplate(user)
  }).catch(err => console.error("Welcome email failed:", err));

  await sendTokenResponse(user, 201, res, "User registered successfully");
});

exports.adminRegister = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, department, hubName } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please provide name, email and password", 400));
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return next(new AppError("User already exists with this email", 400));
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' '),
        email,
        phone,
        password: hashed,
        role: "ADMIN"
      }
    });

    const admin = await tx.admin.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        department: department || "GENERAL",
        hubName: hubName || "Main Hub",
        permissions: ["verify_vendors", "manage_leads", "verify_products"]
      }
    });

    return { user, admin };
  });

  result.user.password = undefined;
  res.status(201).json(new ApiResponse(201, result, "Admin account registered successfully"));
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, phone, password } = req.body;
  const identifier = email || phone;

  if (!identifier || !password) {
    return next(new AppError("Please provide email/phone and password", 400));
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier }
      ]
    },
    include: { vendor: true, admin: true }
  });

  if (!user) {
    return next(new AppError("Incorrect credentials", 401));
  }

  if (!user.password) {
    return next(new AppError("Incorrect credentials. Please set a password.", 401));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return next(new AppError("Incorrect credentials", 401));
  }

  if (user.twoFactorEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    });

    const templates = require('../../../services/email.templates');
    notificationService.sendEmail({
      email: user.email,
      subject: "🔐 Your Two-Factor Authentication Code",
      html: templates.otpEmailTemplate(otp),
      priority: 1 // Highest priority for OTPs
    }).catch(err => console.error("2FA OTP email failed:", err));

    return res.status(200).json(new ApiResponse(200, { 
      mfaRequired: true, 
      userId: user.id,
      email: user.email
    }, "2FA Required. An OTP has been sent to your email."));
  }

  await sendTokenResponse(user, 200, res, "Login successful");
});

const cacheService = require("../../../services/cache.service");

exports.getMe = catchAsync(async (req, res, next) => {
  const cacheKey = `user:profile:${req.user.id}`;
  let user = await cacheService.getCache(cacheKey);

  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { vendor: true, admin: true }
    });

    if (user) {
      user.password = undefined;
      await cacheService.setCache(cacheKey, user, 300); // 5 mins cache
    }
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json(new ApiResponse(200, user));
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, email, department, hubName, password, avatar } = req.body;

  if (email) {
    const existingEmail = await prisma.user.findFirst({ where: { email, id: { not: req.user.id } } });
    if (existingEmail) {
      return next(new AppError("Email already in use by another account", 400));
    }
  }

  if (phone) {
    const existingPhone = await prisma.user.findFirst({ where: { phone, id: { not: req.user.id } } });
    if (existingPhone) {
      return next(new AppError("Phone already in use by another account", 400));
    }
  }
  
  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (email) updateData.email = email;
  if (avatar) updateData.avatar = avatar;
  
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    include: { vendor: true, admin: true }
  });

  if (user.role === 'ADMIN') {
    await prisma.admin.update({
      where: { userId: user.id },
      data: {
        department: department || undefined,
        hubName: hubName || undefined,
        name: name || undefined,
        email: email || undefined
      }
    });
  }

  const result = user;

  result.password = undefined;
  await cacheService.deleteCache(`user:profile:${req.user.id}`);
  
  res.status(200).json(new ApiResponse(200, result, "Profile updated successfully"));
});

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  const file = req.file;
  if (!file || !file.path) {
    return next(new AppError("Please provide an image for the avatar", 400));
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar: req.file.path },
    include: { vendor: true, admin: true }
  });

  user.password = undefined;
  await cacheService.deleteCache(`user:profile:${req.user.id}`);

  res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

exports.requestOTP = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) return next(new AppError("Mobile number is required", 400));

  let user = await prisma.user.findUnique({ where: { phone } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name: "Guest User",
        email: null,
        role: 'BUYER'
      }
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpiry }
  });

  console.log(`📱 [OTP REQUEST] FOR: ${phone} | CODE: ${otp}`);

  res.status(200).json(new ApiResponse(200, { 
    otp: process.env.NODE_ENV !== 'production' ? otp : undefined 
  }, "OTP transmitted successfully."));
});

exports.requestEmailOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email address is required", 400));

  let user = await prisma.user.findUnique({ where: { email } });
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  if (!user) {
    await prisma.user.create({
        data: {
            email,
            name: email.split('@')[0],
            otp,
            otpExpiry,
            role: 'VENDOR'
        }
    });
  } else {
    await prisma.user.update({
        where: { email },
        data: { otp, otpExpiry }
    });
  }

  const templates = require('../../../services/email.templates');
  notificationService.sendEmail({
    email,
    subject: "🔐 Your Verification Code",
    html: templates.otpEmailTemplate(otp),
    priority: 1
  }).catch(err => console.error("OTP email delivery failed:", err));

  res.status(200).json(new ApiResponse(200, {
    otp: process.env.NODE_ENV !== 'production' ? otp : undefined
  }, "Verification code sent to your inbox."));
});

exports.verifyOTPLogin = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;
  
  const user = await prisma.user.findFirst({ 
    where: { phone, otp },
    include: { vendor: true, admin: true }
  });

  if (!user || (user.otpExpiry && new Date() > user.otpExpiry)) {
    return next(new AppError("Invalid or expired OTP", 401));
  }

  if (user.role === 'VENDOR') {
    return next(new AppError("Vendors must login using email and password.", 403));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpiry: null }
  });

  await sendTokenResponse(user, 200, res, "Mobile login successful");
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(200).json(new ApiResponse(200, null, "If an account with that email exists, a reset link has been sent."));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)
    }
  });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  const templates = require('../../../services/email.templates');
  
  notificationService.sendEmail({
    email: user.email,
    subject: "🔐 Password Reset Request",
    html: templates.passwordResetTemplate(resetUrl),
    priority: 1
  }).catch(err => console.error("Reset email delivery failed:", err));

  res.status(200).json(new ApiResponse(200, null, "If an account with that email exists, a reset link has been sent."));
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      type: 'PASSWORD_RESET',
      expiresAt: { gt: new Date() }
    }
  });

  if (!verificationToken) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { password: hashedPassword }
  });

  await prisma.verificationToken.deleteMany({
    where: { userId: verificationToken.userId, type: 'PASSWORD_RESET' }
  });

  res.status(200).json(new ApiResponse(200, null, "Password reset successful."));
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh token not found in cookies", 401));
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    // Clear cookie on failure
    res.clearCookie('refreshToken');
    return next(new AppError("Invalid or expired refresh token. Please login again.", 401));
  }

  // Generate new tokens and rotate
  const user = storedToken.user;
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );

  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 30); // 30 days

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: storedToken.id } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: newExpiresAt
      }
    })
  ]);

  // Set new cookie
  res.cookie('refreshToken', newRefreshToken, {
    expires: newExpiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.cookie('userRole', user.role, {
    expires: newExpiresAt,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.status(200).json(new ApiResponse(200, {
    token: accessToken
  }, "Token refreshed successfully"));
});

exports.logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.cookie('userRole', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: false
  });

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

exports.verify2FA = catchAsync(async (req, res, next) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return next(new AppError("Please provide userId and OTP", 400));
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, otp },
    include: { vendor: true, admin: true }
  });

  if (!user || (user.otpExpiry && new Date() > user.otpExpiry)) {
    return next(new AppError("Invalid or expired OTP", 401));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpiry: null }
  });

  await sendTokenResponse(user, 200, res, "2FA verification successful");
});

exports.toggle2FA = catchAsync(async (req, res, next) => {
  const { enable } = req.body;
  
  if (typeof enable !== 'boolean') {
    return next(new AppError("Please provide a boolean value for 'enable'", 400));
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { twoFactorEnabled: enable }
  });

  await cacheService.deleteCache(`user:profile:${req.user.id}`);

  res.status(200).json(new ApiResponse(200, { twoFactorEnabled: user.twoFactorEnabled }, `Two-Factor Authentication has been ${enable ? 'enabled' : 'disabled'}.`));
});

exports.requestEmailChangeOTP = catchAsync(async (req, res, next) => {
  const { newEmail } = req.body;
  
  if (!newEmail) {
    return next(new AppError("Please provide a new email address", 400));
  }

  // Duplicate Check
  const existingUser = await prisma.user.findFirst({
    where: { email: newEmail }
  });

  if (existingUser) {
    return next(new AppError("Email is already in use by another account", 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the new email and OTP in cache for 10 minutes (600 seconds)
  const cacheKey = `email-change:${req.user.id}`;
  await cacheService.setCache(cacheKey, { newEmail, otp }, 600);

  try {
    const templates = require('../../../services/email.templates');
    await notificationService.sendEmail({
      email: newEmail,
      subject: "📧 Verify your new Email Address",
      html: templates.otpEmailTemplate ? templates.otpEmailTemplate(otp) : `<p>Your OTP for email change is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      priority: 1
    });
  } catch (err) {
    console.error("OTP email failed:", err);
    return next(new AppError("Failed to send OTP to the new email address. Please check if the email is valid or try again later.", 500));
  }

  res.status(200).json(new ApiResponse(200, null, "An OTP has been sent to your new email address."));
});

exports.verifyEmailChange = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("Please provide the OTP", 400));
  }

  const cacheKey = `email-change:${req.user.id}`;
  const cachedData = await cacheService.getCache(cacheKey);

  if (!cachedData || cachedData.otp !== otp) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  const { newEmail } = cachedData;

  // Final duplicate check just in case
  const existingUser = await prisma.user.findFirst({
    where: { email: newEmail, id: { not: req.user.id } }
  });

  if (existingUser) {
    return next(new AppError("Email is already in use by another account", 400));
  }

  // Update User
  await prisma.user.update({
    where: { id: req.user.id },
    data: { email: newEmail }
  });

  // Update Admin if exists
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN' || req.user.role === 'SUBADMIN') {
    const admin = await prisma.admin.findUnique({ where: { userId: req.user.id } });
    if (admin) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { email: newEmail }
      });
    }
  }

  // Invalidate caches
  await cacheService.deleteCache(cacheKey);
  await cacheService.deleteCache(`user:profile:${req.user.id}`);

  res.status(200).json(new ApiResponse(200, { email: newEmail }, "Email updated successfully"));
});
