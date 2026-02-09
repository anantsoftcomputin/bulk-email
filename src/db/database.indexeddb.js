// Database layer using Dexie.js (IndexedDB wrapper)
// This provides a robust, client-side SQL-like database that works in browsers
// and can easily be deployed to Netlify without any backend requirements

import Dexie from 'dexie';

// Initialize the database
export const db = new Dexie('BulkEmailSenderDB');

// Define database schema (version 1)
db.version(1).stores({
  contacts: '++id, email, firstName, lastName, groupId, status, tags, createdAt, updatedAt',
  groups: '++id, name, description, createdAt, updatedAt',
  templates: '++id, name, subject, status, createdAt, updatedAt',
  campaigns: '++id, name, status, scheduledAt, sentAt, createdAt, updatedAt',
  campaignRecipients: '++id, campaignId, contactId, status, sentAt, openedAt, clickedAt',
  smtpConfigs: '++id, name, provider, isDefault, createdAt, updatedAt',
  analytics: '++id, campaignId, type, timestamp, data',
  settings: 'key, value, updatedAt',
  emailQueue: '++id, campaignId, contactId, status, priority, scheduledAt, sentAt, error, retryCount, createdAt',
});

// Database helper functions
export const dbHelpers = {
  // Contacts
  async getAllContacts() {
    return await db.contacts.orderBy('createdAt').reverse().toArray();
  },

  async getContactById(id) {
    return await db.contacts.get(id);
  },

  async createContact(contact) {
    const now = new Date().toISOString();
    return await db.contacts.add({
      ...contact,
      createdAt: now,
      updatedAt: now,
      status: contact.status || 'active',
    });
  },

  async updateContact(id, updates) {
    await db.contacts.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return await db.contacts.get(id);
  },

  async deleteContact(id) {
    return await db.contacts.delete(id);
  },

  async bulkDeleteContacts(ids) {
    return await db.contacts.bulkDelete(ids);
  },

  async searchContacts(query) {
    const lowerQuery = query.toLowerCase();
    return await db.contacts
      .filter(contact => 
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.firstName?.toLowerCase().includes(lowerQuery) ||
        contact.lastName?.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  },

  // Groups
  async getAllGroups() {
    return await db.groups.orderBy('createdAt').reverse().toArray();
  },

  async getGroupById(id) {
    return await db.groups.get(id);
  },

  async createGroup(group) {
    const now = new Date().toISOString();
    return await db.groups.add({
      ...group,
      createdAt: now,
      updatedAt: now,
    });
  },

  async updateGroup(id, updates) {
    await db.groups.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return await db.groups.get(id);
  },

  async deleteGroup(id) {
    return await db.groups.delete(id);
  },

  async getGroupContacts(groupId) {
    return await db.contacts.where('groupId').equals(groupId).toArray();
  },

  // Templates
  async getAllTemplates() {
    return await db.templates.orderBy('createdAt').reverse().toArray();
  },

  async getTemplateById(id) {
    return await db.templates.get(id);
  },

  async createTemplate(template) {
    const now = new Date().toISOString();
    return await db.templates.add({
      ...template,
      createdAt: now,
      updatedAt: now,
      status: template.status || 'draft',
    });
  },

  async updateTemplate(id, updates) {
    await db.templates.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return await db.templates.get(id);
  },

  async deleteTemplate(id) {
    return await db.templates.delete(id);
  },

  // Campaigns
  async getAllCampaigns() {
    return await db.campaigns.orderBy('createdAt').reverse().toArray();
  },

  async getCampaignById(id) {
    return await db.campaigns.get(id);
  },

  async createCampaign(campaign) {
    const now = new Date().toISOString();
    return await db.campaigns.add({
      ...campaign,
      createdAt: now,
      updatedAt: now,
      status: campaign.status || 'draft',
    });
  },

  async updateCampaign(id, updates) {
    await db.campaigns.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return await db.campaigns.get(id);
  },

  async deleteCampaign(id) {
    // Also delete campaign recipients
    await db.campaignRecipients.where('campaignId').equals(id).delete();
    return await db.campaigns.delete(id);
  },

  async getCampaignRecipients(campaignId) {
    return await db.campaignRecipients.where('campaignId').equals(campaignId).toArray();
  },

  async addCampaignRecipient(recipient) {
    return await db.campaignRecipients.add(recipient);
  },

  async updateCampaignRecipient(id, updates) {
    return await db.campaignRecipients.update(id, updates);
  },

  // SMTP Configs
  async getAllSMTPConfigs() {
    return await db.smtpConfigs.orderBy('createdAt').reverse().toArray();
  },

  async getSMTPConfigById(id) {
    return await db.smtpConfigs.get(id);
  },

  async getDefaultSMTPConfig() {
    try {
      const configs = await db.smtpConfigs.toArray();
      const defaultConfig = configs.find(c => c.isDefault === true) || configs[0];
      console.log('Found SMTP config:', defaultConfig?.name || 'None');
      return defaultConfig;
    } catch (error) {
      console.error('Error getting default SMTP config:', error);
      return null;
    }
  },

  async createSMTPConfig(config) {
    const now = new Date().toISOString();
    
    // If this is being set as default, unset other defaults
    if (config.isDefault) {
      await db.smtpConfigs.toCollection().modify({ isDefault: false });
    }
    
    return await db.smtpConfigs.add({
      ...config,
      createdAt: now,
      updatedAt: now,
    });
  },

  async updateSMTPConfig(id, updates) {
    // If this is being set as default, unset other defaults
    if (updates.isDefault) {
      await db.smtpConfigs.toCollection().modify({ isDefault: false });
    }
    
    await db.smtpConfigs.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return await db.smtpConfigs.get(id);
  },

  async deleteSMTPConfig(id) {
    return await db.smtpConfigs.delete(id);
  },

  // Analytics
  async addAnalyticsEvent(event) {
    return await db.analytics.add({
      ...event,
      timestamp: new Date().toISOString(),
    });
  },

  async getCampaignAnalytics(campaignId) {
    return await db.analytics.where('campaignId').equals(campaignId).toArray();
  },

  async getAnalyticsByDateRange(startDate, endDate) {
    return await db.analytics
      .where('timestamp')
      .between(startDate.toISOString(), endDate.toISOString(), true, true)
      .toArray();
  },

  // Settings
  async getSetting(key) {
    const setting = await db.settings.get(key);
    return setting ? setting.value : null;
  },

  async setSetting(key, value) {
    await db.settings.put({
      key,
      value,
      updatedAt: new Date().toISOString(),
    });
  },

  async getAllSettings() {
    const settings = await db.settings.toArray();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  },

  // Email Queue
  async addToEmailQueue(queueItem) {
    return await db.emailQueue.add({
      ...queueItem,
      status: queueItem.status || 'pending',
      priority: queueItem.priority || 1,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
  },

  async getEmailQueuePending(limit = 10) {
    return await db.emailQueue
      .where('status')
      .equals('pending')
      .sortBy('priority')
      .then(items => items.slice(0, limit));
  },

  async updateEmailQueueStatus(id, status, error = null) {
    const updates = { status };
    if (status === 'sent') {
      updates.sentAt = new Date().toISOString();
    }
    if (error) {
      updates.error = error;
      const item = await db.emailQueue.get(id);
      updates.retryCount = (item?.retryCount || 0) + 1;
    }
    await db.emailQueue.update(id, updates);
  },

  async getEmailQueueStats() {
    const all = await db.emailQueue.toArray();
    return {
      pending: all.filter(e => e.status === 'pending').length,
      processing: all.filter(e => e.status === 'processing').length,
      sent: all.filter(e => e.status === 'sent').length,
      failed: all.filter(e => e.status === 'failed').length,
    };
  },

  // Utility functions
  async clearAllData() {
    await db.contacts.clear();
    await db.groups.clear();
    await db.templates.clear();
    await db.campaigns.clear();
    await db.campaignRecipients.clear();
    await db.smtpConfigs.clear();
    await db.analytics.clear();
  },

  async exportDatabase() {
    const data = {
      contacts: await db.contacts.toArray(),
      groups: await db.groups.toArray(),
      templates: await db.templates.toArray(),
      campaigns: await db.campaigns.toArray(),
      campaignRecipients: await db.campaignRecipients.toArray(),
      smtpConfigs: await db.smtpConfigs.toArray(),
      analytics: await db.analytics.toArray(),
    };
    return JSON.stringify(data, null, 2);
  },

  async importDatabase(jsonData) {
    const data = JSON.parse(jsonData);
    
    if (data.contacts) await db.contacts.bulkPut(data.contacts);
    if (data.groups) await db.groups.bulkPut(data.groups);
    if (data.templates) await db.templates.bulkPut(data.templates);
    if (data.campaigns) await db.campaigns.bulkPut(data.campaigns);
    if (data.campaignRecipients) await db.campaignRecipients.bulkPut(data.campaignRecipients);
    if (data.smtpConfigs) await db.smtpConfigs.bulkPut(data.smtpConfigs);
    if (data.analytics) await db.analytics.bulkPut(data.analytics);
  },
};

// Initialize with sample data if database is empty
export async function initializeSampleData() {
  try {
    // Check if we've already initialized
    const initialized = await dbHelpers.getSetting('dataInitialized');
    if (initialized) {
      return;
    }
    
    const contactCount = await db.contacts.count();
    
    if (contactCount === 0) {
      // Add sample groups
      const groupIds = await db.groups.bulkAdd([
        {
          name: 'Newsletter Subscribers',
          description: 'Users subscribed to our newsletter',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Premium Users',
          description: 'Paying customers',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Beta Testers',
          description: 'Users testing new features',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Add sample contacts
      await db.contacts.bulkAdd([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          company: 'Tech Corp',
          groupId: 1,
          status: 'active',
          tags: ['vip', 'newsletter'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          company: 'Design Studio',
          groupId: 1,
          status: 'active',
          tags: ['newsletter'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
          company: 'Startup Inc',
          groupId: 2,
          status: 'active',
          tags: ['premium', 'enterprise'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          firstName: 'Alice',
          lastName: 'Williams',
          email: 'alice.williams@example.com',
          groupId: 3,
          status: 'active',
          tags: ['beta'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          firstName: 'Charlie',
          lastName: 'Brown',
          email: 'charlie.brown@example.com',
          company: 'Marketing Agency',
          groupId: 1,
          status: 'unsubscribed',
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Add sample templates
      await db.templates.bulkAdd([
        {
          name: 'Welcome Email',
          subject: 'Welcome to {{company_name}}!',
          body: '<p>Hi {{first_name}},</p><p>Welcome to our platform! We\'re excited to have you on board.</p>',
          variables: ['first_name', 'company_name'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Newsletter Template',
          subject: '{{newsletter_title}} - {{month}} Edition',
          body: '<h1>{{newsletter_title}}</h1><p>Dear {{first_name}},</p><p>Check out our latest updates...</p>',
          variables: ['first_name', 'newsletter_title', 'month'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Promotional Campaign',
          subject: 'Special Offer: {{discount}}% Off!',
          body: '<p>Hi {{first_name}},</p><p>Get {{discount}}% off on all products. Use code: {{promo_code}}</p>',
          variables: ['first_name', 'discount', 'promo_code'],
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Add sample campaigns
      const now = new Date();
      await db.campaigns.bulkAdd([
        {
          name: 'Q1 Newsletter',
          subject: 'Our Q1 Updates',
          templateId: 2,
          groupIds: [1],
          status: 'sent',
          scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            total: 100,
            sent: 100,
            delivered: 98,
            opened: 75,
            clicked: 45,
            bounced: 2,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Welcome Campaign',
          subject: 'Welcome to Our Platform',
          templateId: 1,
          groupIds: [1, 3],
          status: 'scheduled',
          scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            total: 50,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Product Launch',
          subject: 'Introducing Our New Product',
          templateId: 3,
          groupIds: [2],
          status: 'draft',
          stats: {
            total: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Monthly Digest',
          subject: 'Your Monthly Update',
          templateId: 2,
          groupIds: [1],
          status: 'sending',
          scheduledAt: now.toISOString(),
          stats: {
            total: 80,
            sent: 45,
            delivered: 44,
            opened: 20,
            clicked: 8,
            bounced: 1,
            failed: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Mark as initialized so we don't add sample data again
      await dbHelpers.setSetting('dataInitialized', true);
      console.log('✅ Sample data initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

export default db;
