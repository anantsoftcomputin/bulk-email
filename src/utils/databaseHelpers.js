// Utility to clear all demo/sample data from the database
import { db, dbHelpers } from '../db/database';
import toast from 'react-hot-toast';

export async function clearDemoData() {
  try {
    // Clear all collections except settings
    await db.contacts.clear();
    await db.groups.clear();
    await db.templates.clear();
    await db.campaigns.clear();
    await db.campaignRecipients.clear();
    await db.analytics.clear();
    await db.emailQueue.clear();
    
    // Reset the initialization flag
    await dbHelpers.setSetting('dataInitialized', false);
    
    console.log('✅ Demo data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing demo data:', error);
    throw error;
  }
}

export async function exportAllData() {
  try {
    const data = {
      contacts: await db.contacts.toArray(),
      groups: await db.groups.toArray(),
      templates: await db.templates.toArray(),
      campaigns: await db.campaigns.toArray(),
      campaignRecipients: await db.campaignRecipients.toArray(),
      smtpConfigs: await db.smtpConfigs.toArray(),
      analytics: await db.analytics.toArray(),
      settings: await db.settings.toArray(),
      emailQueue: await db.emailQueue.toArray(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-email-sender-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Failed to export data');
    throw error;
  }
}

export async function importData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    // Import data into respective tables
    if (data.contacts) await db.contacts.bulkPut(data.contacts);
    if (data.groups) await db.groups.bulkPut(data.groups);
    if (data.templates) await db.templates.bulkPut(data.templates);
    if (data.campaigns) await db.campaigns.bulkPut(data.campaigns);
    if (data.campaignRecipients) await db.campaignRecipients.bulkPut(data.campaignRecipients);
    if (data.smtpConfigs) await db.smtpConfigs.bulkPut(data.smtpConfigs);
    if (data.analytics) await db.analytics.bulkPut(data.analytics);
    if (data.settings) await db.settings.bulkPut(data.settings);
    if (data.emailQueue) await db.emailQueue.bulkPut(data.emailQueue);
    
    toast.success('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    toast.error('Failed to import data');
    throw error;
  }
}

export async function getDatabaseStats() {
  try {
    const stats = {
      contacts: await db.contacts.count(),
      groups: await db.groups.count(),
      templates: await db.templates.count(),
      campaigns: await db.campaigns.count(),
      campaignRecipients: await db.campaignRecipients.count(),
      smtpConfigs: await db.smtpConfigs.count(),
      analytics: await db.analytics.count(),
      emailQueue: await db.emailQueue.count(),
    };
    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}
