const { Worker } = require('bullmq');
const { connection } = require('../config/redis');
const leadService = require('../modules/leads/leads.service');

const leadWorker = new Worker('lead-distribution', async (job) => {
  console.log(`[WORKER] Processing job: ${job.name} (${job.id})`);
  
  try {
    if (job.name === 'distribute') {
      const { leadId } = job.data;
      await leadService.distributeInquiryLead(leadId);
    }
    
    if (job.name === 'process-aged') {
      await leadService.processAgedLeads();
    }
    
    if (job.name === 'check-unattended-leads') {
      await leadService.sendUnattendedLeadReminders();
    }
  } catch (error) {
    console.error(`[WORKER-ERROR] Job ${job.id} failed:`, error);
    throw error;
  }
}, { connection, concurrency: 10 });

leadWorker.on('completed', (job) => {
  console.log(`[WORKER-SUCCESS] Job ${job.id} completed.`);
});

leadWorker.on('failed', (job, err) => {
  console.error(`[WORKER-FAILED] Job ${job.id} failed: ${err.message}`);
});

module.exports = leadWorker;
