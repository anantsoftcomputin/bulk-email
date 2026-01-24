// Seed data for development and demo purposes

export const sampleContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Tech Corp',
    notes: 'CEO and founder',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    company: 'Design Studio',
    notes: 'Creative director',
    createdAt: '2024-01-16T10:00:00.000Z',
    updatedAt: '2024-01-16T10:00:00.000Z',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1234567892',
    company: 'Marketing Agency',
    notes: 'Marketing manager',
    createdAt: '2024-01-17T10:00:00.000Z',
    updatedAt: '2024-01-17T10:00:00.000Z',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    phone: '+1234567893',
    company: 'E-commerce Inc',
    notes: 'Product manager',
    createdAt: '2024-01-18T10:00:00.000Z',
    updatedAt: '2024-01-18T10:00:00.000Z',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '+1234567894',
    company: 'Software Solutions',
    notes: 'CTO',
    createdAt: '2024-01-19T10:00:00.000Z',
    updatedAt: '2024-01-19T10:00:00.000Z',
  },
];

export const sampleTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to our community, {{firstName}}!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome {{firstName}}!</h1>
        <p>We're excited to have you join our community.</p>
        <p>Your email is: {{email}}</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    textContent: 'Welcome {{firstName}}! We\'re excited to have you join our community.',
    variables: ['firstName', 'email'],
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Newsletter Template',
    subject: 'Monthly Newsletter - {{month}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{firstName}},</h2>
        <p>Here's what's new this month!</p>
        <p>Visit us at {{company}} for more updates.</p>
      </div>
    `,
    textContent: 'Hi {{firstName}}, Here\'s what\'s new this month!',
    variables: ['firstName', 'month', 'company'],
    createdAt: '2024-01-11T10:00:00.000Z',
    updatedAt: '2024-01-11T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'Product Launch',
    subject: 'Exciting News: New Product Launch!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>🚀 Big News, {{firstName}}!</h1>
        <p>We're launching something amazing and you're the first to know!</p>
        <p>Stay tuned for more details from {{company}}.</p>
      </div>
    `,
    textContent: 'Big News, {{firstName}}! We\'re launching something amazing.',
    variables: ['firstName', 'company'],
    createdAt: '2024-01-12T10:00:00.000Z',
    updatedAt: '2024-01-12T10:00:00.000Z',
  },
];

export const sampleCampaigns = [
  {
    id: '1',
    name: 'January Newsletter',
    subject: 'Start 2024 Strong - Our January Update',
    templateId: '2',
    smtpId: '1',
    status: 'sent',
    totalRecipients: 150,
    stats: {
      sent: 150,
      delivered: 148,
      opened: 89,
      clicked: 34,
      bounced: 2,
      failed: 0,
      unsubscribed: 1,
      openRate: 60.1,
      clickRate: 22.9,
      bounceRate: 1.3,
    },
    createdAt: '2024-01-20T08:00:00.000Z',
    updatedAt: '2024-01-20T10:30:00.000Z',
    sentAt: '2024-01-20T09:00:00.000Z',
  },
  {
    id: '2',
    name: 'Product Launch Announcement',
    subject: '🚀 Introducing Our Latest Innovation',
    templateId: '3',
    smtpId: '1',
    status: 'sent',
    totalRecipients: 250,
    stats: {
      sent: 250,
      delivered: 245,
      opened: 178,
      clicked: 92,
      bounced: 5,
      failed: 0,
      unsubscribed: 2,
      openRate: 72.7,
      clickRate: 37.6,
      bounceRate: 2.0,
    },
    createdAt: '2024-01-18T08:00:00.000Z',
    updatedAt: '2024-01-18T12:00:00.000Z',
    sentAt: '2024-01-18T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'Welcome Campaign',
    subject: 'Welcome to Our Community!',
    templateId: '1',
    smtpId: '1',
    status: 'scheduled',
    totalRecipients: 50,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    },
    scheduledAt: '2024-01-25T09:00:00.000Z',
    createdAt: '2024-01-22T10:00:00.000Z',
    updatedAt: '2024-01-22T10:00:00.000Z',
  },
  {
    id: '4',
    name: 'Winter Sale Promotion',
    subject: '❄️ Winter Sale - Up to 50% Off!',
    templateId: '2',
    smtpId: '1',
    status: 'draft',
    totalRecipients: 0,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    },
    createdAt: '2024-01-23T14:00:00.000Z',
    updatedAt: '2024-01-23T14:00:00.000Z',
  },
];

// Function to initialize stores with sample data
export const initializeSampleData = () => {
  // Check if data already exists in localStorage
  const hasData = localStorage.getItem('contact-storage') || 
                  localStorage.getItem('template-storage') || 
                  localStorage.getItem('campaign-storage');
  
  if (!hasData) {
    // Initialize with sample data only if no data exists
    return {
      contacts: sampleContacts,
      templates: sampleTemplates,
      campaigns: sampleCampaigns,
    };
  }
  
  return null;
};
