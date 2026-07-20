const { Worker } = require('bullmq');
const { connection } = require('../config/redis');
const prisma = require('../config/prisma');

const notificationWorker = new Worker('notifications', async (job) => {
  if (job.name === 'cleanup-old-notifications') {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log(`[NOTIFICATIONS] Cleanup complete: Removed ${result.count} old notifications.`);
    } catch (err) {
      console.error('[NOTIFICATIONS] Cleanup failed:', err);
    }
  }

  if (job.name === 'weekly-performance-reports') {
    try {
      const { sendWeeklyPerformanceReports } = require('../modules/notifications/notifications.service');
      await sendWeeklyPerformanceReports();
      console.log(`[NOTIFICATIONS] Weekly performance reports sent successfully.`);
    } catch (err) {
      console.error('[NOTIFICATIONS] Weekly reports failed:', err);
    }
  }

  if (job.name === 'send-email-job') {
    try {
      const { executeEmailSend } = require('../services/email.service');
      await executeEmailSend(job.data);
      console.log(`[NOTIFICATIONS WORKER] Background email sent successfully to ${job.data.email}`);
    } catch (err) {
      console.error(`[NOTIFICATIONS WORKER] Background email sending failed for ${job.data.email}:`, err);
      throw err; // Throw to trigger BullMQ retry logic
    }
  }
}, { connection, concurrency: 10 });

notificationWorker.on('completed', (job) => {
  console.log(`[NOTIFICATIONS WORKER] Job ${job.id} completed.`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`[NOTIFICATIONS WORKER] Job ${job.id} failed:`, err);
});

module.exports = notificationWorker;
