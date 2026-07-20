const { Queue } = require('bullmq');
const { connection } = require('../config/redis');

// Standard Enterprise Configuration for Queues
const defaultJobOptions = {
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours max
    count: 100 // Or keep maximum 100 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    count: 1000 // Or keep maximum 1000 failed jobs
  }
};

// Define Queues with Memory Management
const leadQueue = new Queue('lead-distribution', { connection, defaultJobOptions });
const rankingQueue = new Queue('ranking-engine', { connection, defaultJobOptions });
const notificationQueue = new Queue('notifications', { connection, defaultJobOptions });
const subscriptionQueue = new Queue('subscription-jobs', { connection, defaultJobOptions });

/**
 * Add a lead to the distribution queue
 */
const addLeadToQueue = async (leadId) => {
  await leadQueue.add('distribute', { leadId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    }
  });
};

/**
 * Schedule repeatable jobs
 */
const scheduleRepeatableJobs = async () => {
  // Ranking recalculation every day at midnight
  await rankingQueue.add('recalculate', {}, {
    repeat: {
      pattern: '0 0 * * *'
    }
  });

  // Aged lead processing every hour
  await leadQueue.add('process-aged', {}, {
    repeat: {
      pattern: '0 * * * *'
    }
  });

  // Check for unattended leads every hour (at minute 30 to offset from process-aged)
  await leadQueue.add('check-unattended-leads', {}, {
    repeat: {
      pattern: '30 * * * *'
    }
  });

  // Subscription expiry check every day at 2 AM
  await subscriptionQueue.add('check-expiries', {}, {
    repeat: {
      pattern: '0 2 * * *'
    }
  });

  // Notification cleanup every day at 3 AM
  await notificationQueue.add('cleanup-old-notifications', {}, {
    repeat: {
      pattern: '0 3 * * *'
    }
  });

  // Weekly Performance Reports every Sunday at 8:00 PM (20:00)
  await notificationQueue.add('weekly-performance-reports', {}, {
    repeat: {
      pattern: '0 20 * * 0'
    }
  });
};

module.exports = {
  leadQueue,
  rankingQueue,
  notificationQueue,
  subscriptionQueue,
  addLeadToQueue,
  scheduleRepeatableJobs
};
