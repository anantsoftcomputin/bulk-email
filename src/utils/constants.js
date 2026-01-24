// API Base URL (change to your backend URL)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Campaign Status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  PAUSED: 'paused',
  FAILED: 'failed',
};

// Email Status
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
  FAILED: 'failed',
  UNSUBSCRIBED: 'unsubscribed',
};

// Contact Import Types
export const IMPORT_TYPES = {
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json',
};

// SMTP Provider Types
export const SMTP_PROVIDERS = {
  CUSTOM: 'custom',
  GMAIL: 'gmail',
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  AWS_SES: 'aws_ses',
  SMTP2GO: 'smtp2go',
};

// SMTP Provider Configurations
export const SMTP_CONFIGS = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  },
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
  },
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
  },
  aws_ses: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
  },
  smtp2go: {
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false,
  },
};

// Template Variable Regex
export const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

// Email Template Variables
export const EMAIL_VARIABLES = [
  { key: '{{firstName}}', label: 'First Name' },
  { key: '{{lastName}}', label: 'Last Name' },
  { key: '{{email}}', label: 'Email' },
  { key: '{{company}}', label: 'Company' },
  { key: '{{phone}}', label: 'Phone' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  gray: '#6b7280',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['.csv', '.xlsx', '.xls', '.json'],
};

// Rate Limiting
export const RATE_LIMITS = {
  DEFAULT: 100, // emails per hour
  BURST: 10, // emails per minute
};

// Validation Patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  URL: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
};
