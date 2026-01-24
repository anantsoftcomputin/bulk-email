import { VARIABLE_REGEX } from './constants';

// Replace template variables with actual values
export const replaceVariables = (template, data) => {
  if (!template || !data) return template;
  
  return template.replace(VARIABLE_REGEX, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};

// Extract all variables from a template
export const extractVariables = (template) => {
  if (!template) return [];
  
  const matches = template.matchAll(VARIABLE_REGEX);
  const variables = new Set();
  
  for (const match of matches) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
};

// Validate if all required variables have values
export const validateTemplateVariables = (template, data) => {
  const variables = extractVariables(template);
  const missing = [];
  
  variables.forEach(variable => {
    if (!data[variable]) {
      missing.push(variable);
    }
  });
  
  return {
    isValid: missing.length === 0,
    missingVariables: missing,
  };
};

// Generate preview of email with sample data
export const generateEmailPreview = (template, contact) => {
  const sampleData = {
    firstName: contact?.firstName || 'John',
    lastName: contact?.lastName || 'Doe',
    email: contact?.email || 'john@example.com',
    company: contact?.company || 'Acme Corp',
    phone: contact?.phone || '+1234567890',
    ...contact?.customFields,
  };
  
  return {
    subject: replaceVariables(template.subject, sampleData),
    htmlContent: replaceVariables(template.htmlContent, sampleData),
    textContent: replaceVariables(template.textContent, sampleData),
  };
};

// Sanitize HTML to prevent XSS
export const sanitizeHTML = (html) => {
  // Basic sanitization - in production, use a library like DOMPurify
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// Check if email is valid for sending
export const canSendEmail = (email, blacklist = []) => {
  if (!email || !email.trim()) return false;
  
  const emailLower = email.toLowerCase();
  
  // Check if in blacklist
  if (blacklist.some(blocked => emailLower.includes(blocked.toLowerCase()))) {
    return false;
  }
  
  // Check for disposable email domains (basic check)
  const disposableDomains = ['tempmail.', 'throwaway.', 'guerrillamail.'];
  if (disposableDomains.some(domain => emailLower.includes(domain))) {
    return false;
  }
  
  return true;
};

// Parse email headers
export const parseEmailHeaders = (headers) => {
  const parsed = {};
  
  if (!headers) return parsed;
  
  const lines = headers.split('\n');
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      parsed[key] = value;
    }
  });
  
  return parsed;
};

// Calculate email sending rate
export const calculateSendingRate = (totalEmails, hoursToSend) => {
  if (!hoursToSend || hoursToSend <= 0) return totalEmails;
  
  return Math.ceil(totalEmails / hoursToSend);
};

// Estimate campaign duration
export const estimateCampaignDuration = (totalEmails, ratePerHour) => {
  if (!ratePerHour || ratePerHour <= 0) return 0;
  
  const hours = Math.ceil(totalEmails / ratePerHour);
  return {
    hours,
    days: Math.ceil(hours / 24),
    minutes: hours * 60,
  };
};
