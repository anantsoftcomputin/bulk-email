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

// SMTP Providers with full configuration metadata
export const SMTP_PROVIDERS = [
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Free Email',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    usernameLabel: 'Gmail Address',
    passwordLabel: 'App Password',
    helpText: 'Enable 2-Step Verification, then go to Google Account → Security → App Passwords to generate a 16-character password.',
  },
  {
    id: 'outlook',
    name: 'Outlook / Office 365',
    category: 'Free Email',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    usernameLabel: 'Microsoft Email',
    passwordLabel: 'Password',
    helpText: 'Use your full Microsoft account email and password. SMTP AUTH must be enabled in your account or admin settings.',
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    category: 'Free Email',
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    usernameLabel: 'Yahoo Email',
    passwordLabel: 'App Password',
    helpText: 'Generate an App Password in Yahoo Account Security settings (requires 2-Step Verification).',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'Transactional',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    usernameLabel: 'Username',
    passwordLabel: 'API Key',
    usernameFixed: 'apikey',
    helpText: 'Username must be the literal string "apikey". Password is your SendGrid API Key from Settings → API Keys.',
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    category: 'Transactional',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    usernameLabel: 'SMTP Login',
    passwordLabel: 'SMTP Password',
    helpText: 'Find SMTP credentials under Mailgun Dashboard → Sending → Domain Settings → SMTP Credentials.',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp Transactional (Mandrill)',
    category: 'Transactional',
    host: 'smtp.mandrillapp.com',
    port: 587,
    secure: false,
    usernameLabel: 'Username (any string)',
    passwordLabel: 'Mandrill API Key',
    usernamePlaceholder: 'mandrill_user',
    helpText: 'Requires a paid Mailchimp Transactional add-on. Any string works as username; use your Mandrill API key as password.',
  },
  {
    id: 'amazon_ses',
    name: 'Amazon SES',
    category: 'Transactional',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    usernameLabel: 'SMTP Username',
    passwordLabel: 'SMTP Password',
    helpText: 'Generate dedicated SMTP credentials in AWS Console → SES → SMTP Settings. These are NOT your IAM access keys.',
    regions: [
      { label: 'US East (N. Virginia)', host: 'email-smtp.us-east-1.amazonaws.com' },
      { label: 'US West (Oregon)', host: 'email-smtp.us-west-2.amazonaws.com' },
      { label: 'EU (Ireland)', host: 'email-smtp.eu-west-1.amazonaws.com' },
      { label: 'EU (Frankfurt)', host: 'email-smtp.eu-central-1.amazonaws.com' },
      { label: 'AP (Singapore)', host: 'email-smtp.ap-southeast-1.amazonaws.com' },
      { label: 'AP (Sydney)', host: 'email-smtp.ap-southeast-2.amazonaws.com' },
      { label: 'AP (Tokyo)', host: 'email-smtp.ap-northeast-1.amazonaws.com' },
    ],
  },
  {
    id: 'brevo',
    name: 'Brevo (Sendinblue)',
    category: 'Transactional',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    usernameLabel: 'Email Address',
    passwordLabel: 'SMTP Key',
    helpText: 'Use your Brevo account email as username. Find SMTP key in Brevo → Account → SMTP & API.',
  },
  {
    id: 'postmark',
    name: 'Postmark',
    category: 'Transactional',
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    usernameLabel: 'Server API Token',
    passwordLabel: 'Server API Token',
    helpText: 'Use your Server API Token as both the username and password. Found in Postmark → Servers → Your Server → API Tokens.',
  },
  {
    id: 'sparkpost',
    name: 'SparkPost',
    category: 'Transactional',
    host: 'smtp.sparkpostmail.com',
    port: 587,
    secure: false,
    usernameLabel: 'Username',
    passwordLabel: 'API Key',
    usernameFixed: 'SMTP_Injection',
    helpText: 'Username must be "SMTP_Injection". Password is your SparkPost API key with "Send via SMTP" permission.',
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'Transactional',
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    usernameLabel: 'Username',
    passwordLabel: 'API Key',
    usernameFixed: 'resend',
    helpText: 'Username must be "resend". Password is your Resend API Key from app.resend.com/api-keys.',
  },
  {
    id: 'elastic_email',
    name: 'Elastic Email',
    category: 'Transactional',
    host: 'smtp.elasticemail.com',
    port: 2525,
    secure: false,
    usernameLabel: 'Email Address',
    passwordLabel: 'API Key',
    helpText: 'Use your Elastic Email account email as username and your API key as password.',
  },
  {
    id: 'zoho',
    name: 'Zoho Mail',
    category: 'Business Email',
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    usernameLabel: 'Zoho Email',
    passwordLabel: 'Password or App Password',
    helpText: 'Enable SMTP in Zoho Mail settings. For accounts with 2FA, generate an App Password.',
  },
  {
    id: 'smtp2go',
    name: 'SMTP2Go',
    category: 'Transactional',
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    usernameLabel: 'SMTP Username',
    passwordLabel: 'SMTP Password',
    helpText: 'Find SMTP credentials in SMTP2Go Dashboard → Senders.',
  },
  {
    id: 'custom',
    name: 'Custom SMTP',
    category: 'Custom',
    host: '',
    port: 587,
    secure: false,
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    helpText: '',
  },
];

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
