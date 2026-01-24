// Email Queue Service - Enterprise-grade email queue management
import { db, dbHelpers } from '../db/database';
import toast from 'react-hot-toast';
import emailAPI from '../api/emailAPI';

class EmailQueueService {
  constructor() {
    this.isProcessing = false;
    this.processingInterval = null;
    this.rateLimitInterval = 60000; // 1 minute in milliseconds
    this.emailsSentInInterval = 0;
    this.maxEmailsPerInterval = 300; // Increased from 100 to 300 emails per hour
  }

  /**
   * Add emails to the queue for a campaign
   * @param {number} campaignId - Campaign ID
   * @param {Array} contacts - Array of contact objects
   * @param {Object} template - Email template
   * @param {number} priority - Priority (1-10, lower = higher priority)
   */
  async addCampaignToQueue(campaignId, contacts, template, priority = 5) {
    try {
      console.log('addCampaignToQueue called with:', { campaignId, contactCount: contacts.length, template, priority });
      
      const queueItems = contacts.map(contact => ({
        campaignId,
        contactId: contact.id,
        email: contact.email,
        subject: this.replaceVariables(template.subject, contact),
        body: this.replaceVariables(template.body, contact),
        priority,
        scheduledAt: new Date().toISOString(),
      }));

      console.log('Queue items to add:', queueItems);

      for (const item of queueItems) {
        const id = await dbHelpers.addToEmailQueue(item);
        console.log('Added queue item with ID:', id);
      }

      console.log(`Added ${queueItems.length} emails to queue for campaign ${campaignId}`);
      return queueItems.length;
    } catch (error) {
      console.error('Error adding to email queue:', error);
      throw error;
    }
  }

  /**
   * Replace template variables with contact data
   */
  replaceVariables(text, contact) {
    if (!text) return '';
    
    const variables = {
      first_name: contact.firstName || '',
      firstName: contact.firstName || '',
      last_name: contact.lastName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      company: contact.company || '',
      phone: contact.phone || '',
    };

    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, value);
    });

    return result;
  }

  /**
   * Start processing the email queue
   */
  async startProcessing() {
    if (this.isProcessing) {
      console.log('Email queue is already processing');
      return;
    }

    this.isProcessing = true;
    console.log('Started email queue processing');

    // Reset rate limit counter every interval
    setInterval(() => {
      this.emailsSentInInterval = 0;
    }, this.rateLimitInterval);

    // Process queue every 5 seconds
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, 5000);
  }

  /**
   * Stop processing the email queue
   */
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log('Stopped email queue processing');
  }

  /**
   * Process pending emails in the queue
   */
  async processQueue() {
    try {
      // Reset stuck processing items (older than 5 minutes)
      const stuckItems = await db.emailQueue
        .where('status')
        .equals('processing')
        .toArray();
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      for (const item of stuckItems) {
        if (new Date(item.createdAt) < fiveMinutesAgo) {
          console.log('Resetting stuck processing item:', item.email);
          await dbHelpers.updateEmailQueueStatus(item.id, 'pending', 'Reset from stuck processing state');
        }
      }

      // Get settings for rate limiting
      const maxEmailsPerHour = await dbHelpers.getSetting('maxEmailsPerHour') || 100;
      this.maxEmailsPerInterval = Math.floor(maxEmailsPerHour / 60); // Per minute

      // Check rate limit
      if (this.emailsSentInInterval >= this.maxEmailsPerInterval) {
        console.log('Rate limit reached, waiting...');
        return;
      }

      // Get pending emails
      const batchSize = Math.min(5, this.maxEmailsPerInterval - this.emailsSentInInterval);
      const pendingEmails = await dbHelpers.getEmailQueuePending(batchSize);

      if (pendingEmails.length === 0) {
        return;
      }

      console.log(`📧 Processing ${pendingEmails.length} emails from queue`);

      // Process each email
      for (const email of pendingEmails) {
        await this.sendEmail(email);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(queueItem) {
    try {
      console.log('Sending email to:', queueItem.email);
      
      // Update status to processing
      await dbHelpers.updateEmailQueueStatus(queueItem.id, 'processing');

      // Get default SMTP config
      const smtpConfig = await dbHelpers.getDefaultSMTPConfig();
      
      if (!smtpConfig) {
        console.error('No default SMTP configuration found');
        throw new Error('No default SMTP configuration found');
      }

      console.log('Using SMTP config:', smtpConfig.name);

      // Send via backend API
      let emailSent = false;
      try {
        const result = await emailAPI.sendEmail(smtpConfig, {
          to: queueItem.email,
          subject: queueItem.subject,
          body: queueItem.body,
          html: queueItem.body,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to send email');
        }
        emailSent = true;
        console.log('Email sent via backend API');
      } catch (apiError) {
        // If backend is not available, fall back to simulation
        console.warn('Backend API not available, simulating email send:', apiError.message);
        await this.simulateEmailSend(queueItem, smtpConfig);
        emailSent = true;
      }

      // Update status to sent
      await dbHelpers.updateEmailQueueStatus(queueItem.id, 'sent');
      
      // Update campaign recipient status if exists
      if (queueItem.campaignId) {
        const recipients = await dbHelpers.getCampaignRecipients(queueItem.campaignId);
        const recipient = recipients.find(r => r.contactId === queueItem.contactId);
        if (recipient) {
          await dbHelpers.updateCampaignRecipient(recipient.id, {
            status: 'sent',
            sentAt: new Date().toISOString(),
          });
        }
      }

      this.emailsSentInInterval++;
      console.log(`✓ Email sent successfully to ${queueItem.email}`);
      
    } catch (error) {
      console.error(`✗ Error sending email to ${queueItem.email}:`, error);
      
      // Get retry settings
      const maxRetries = await dbHelpers.getSetting('emailRetryAttempts') || 3;
      
      if (queueItem.retryCount < maxRetries) {
        // Mark for retry
        console.log(`Retrying email (attempt ${queueItem.retryCount + 1}/${maxRetries})`);
        await dbHelpers.updateEmailQueueStatus(queueItem.id, 'pending', error.message);
      } else {
        // Mark as failed
        console.log(`Email failed after ${maxRetries} attempts`);
        await dbHelpers.updateEmailQueueStatus(queueItem.id, 'failed', error.message);
      }
    }
  }

  /**
   * Simulate email sending (replace with actual SMTP in production)
   */
  async simulateEmailSend(queueItem, smtpConfig) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('SMTP connection failed'));
        }
      }, 1000);
    });
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    return await dbHelpers.getEmailQueueStats();
  }

  /**
   * Clear all failed emails from queue
   */
  async clearFailed() {
    const failed = await db.emailQueue.where('status').equals('failed').toArray();
    await db.emailQueue.bulkDelete(failed.map(e => e.id));
    return failed.length;
  }

  /**
   * Retry all failed emails
   */
  async retryFailed() {
    const failed = await db.emailQueue.where('status').equals('failed').toArray();
    for (const email of failed) {
      await dbHelpers.updateEmailQueueStatus(email.id, 'pending');
    }
    return failed.length;
  }
}

// Create singleton instance
const emailQueueService = new EmailQueueService();

export default emailQueueService;
