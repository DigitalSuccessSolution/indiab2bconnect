const nodemailer = require('nodemailer');

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const { notificationQueue } = require('../queues');

/**
 * Executes the actual sending of the email via Nodemailer
 * (This should be called by the BullMQ worker)
 */
const executeEmailSend = async (options) => {
  try {
    const mailOptions = {
      from: `B2B Community <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('[EMAIL SERVICE] Sending failed:', err);
  }
};

/**
 * Pushes the email task to the BullMQ Queue for background processing
 * @param {Object} options - Email options
 */
const sendEmail = async (options) => {
  try {
    if (notificationQueue) {
      await notificationQueue.add('send-email-job', options, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        priority: options.priority || 10 // Default priority is 10 (low), 1 is highest
      });
      console.log(`[EMAIL SERVICE] Email task for ${options.email} queued successfully.`);
    } else {
      console.warn('[EMAIL SERVICE] notificationQueue is undefined. Falling back to sync email send.');
      await executeEmailSend(options);
    }
  } catch (err) {
    console.error('[EMAIL SERVICE] Failed to queue email task:', err);
    // Fallback to sync
    await executeEmailSend(options);
  }
};

module.exports = {
  sendEmail,
  executeEmailSend
};
