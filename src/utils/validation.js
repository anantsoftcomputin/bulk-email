import { VALIDATION } from './constants';

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION.EMAIL.test(email)) return 'Invalid email format';
  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null; // Phone is optional
  if (!VALIDATION.PHONE.test(phone)) return 'Invalid phone format';
  return null;
};

export const validateURL = (url) => {
  if (!url) return null; // URL is optional
  if (!VALIDATION.URL.test(url)) return 'Invalid URL format';
  return null;
};

export const validateSMTPConfig = (config) => {
  const errors = {};
  
  if (!config.name?.trim()) {
    errors.name = 'Configuration name is required';
  }
  
  if (!config.host?.trim()) {
    errors.host = 'SMTP host is required';
  }
  
  if (!config.port) {
    errors.port = 'SMTP port is required';
  } else if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.port = 'Invalid port number';
  }
  
  if (!config.username?.trim()) {
    errors.username = 'Username is required';
  }
  
  if (!config.password?.trim()) {
    errors.password = 'Password is required';
  }
  
  const emailError = validateEmail(config.fromEmail);
  if (emailError) {
    errors.fromEmail = emailError;
  }
  
  if (!config.fromName?.trim()) {
    errors.fromName = 'From name is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateCampaign = (campaign) => {
  const errors = {};
  
  if (!campaign.name?.trim()) {
    errors.name = 'Campaign name is required';
  }
  
  if (!campaign.subject?.trim()) {
    errors.subject = 'Subject is required';
  }
  
  if (!campaign.templateId) {
    errors.templateId = 'Template is required';
  }
  
  if (!campaign.smtpId) {
    errors.smtpId = 'SMTP configuration is required';
  }
  
  if (!campaign.recipientType) {
    errors.recipientType = 'Recipient type is required';
  }
  
  if (campaign.recipientType === 'contacts' && (!campaign.contactIds || campaign.contactIds.length === 0)) {
    errors.contactIds = 'At least one contact must be selected';
  }
  
  if (campaign.recipientType === 'groups' && (!campaign.groupIds || campaign.groupIds.length === 0)) {
    errors.groupIds = 'At least one group must be selected';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateTemplate = (template) => {
  const errors = {};
  
  if (!template.name?.trim()) {
    errors.name = 'Template name is required';
  }
  
  if (!template.subject?.trim()) {
    errors.subject = 'Subject is required';
  }
  
  if (!template.htmlContent?.trim()) {
    errors.htmlContent = 'HTML content is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateContact = (contact) => {
  const errors = {};
  
  const emailError = validateEmail(contact.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  if (!contact.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  const phoneError = validatePhone(contact.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateGroup = (group) => {
  const errors = {};
  
  if (!group.name?.trim()) {
    errors.name = 'Group name is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};
