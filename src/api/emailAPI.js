// API client that works in both dev and production
// Development: Uses Node.js Express server (localhost:3001)
// Production: Uses Netlify Functions (/.netlify/functions)
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
  : '/.netlify/functions';

class EmailAPI {
  /**
   * Test SMTP configuration by sending a test email
   * @param {Object} config - SMTP configuration
   * @param {string} toEmail - Recipient email
   * @returns {Promise<Object>}
   */
  async testSMTP(config, toEmail) {
    const endpoint = isDev ? `${API_BASE_URL}/email/test` : `${API_BASE_URL}/email-test`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config, toEmail }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send test email');
    }
    
    return data;
  }

  /**
   * Verify SMTP configuration without sending email
   * @param {Object} config - SMTP configuration
   * @returns {Promise<Object>}
   */
  async verifySMTP(config) {
    const endpoint = isDev ? `${API_BASE_URL}/email/verify` : `${API_BASE_URL}/email-verify`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify SMTP configuration');
    }
    
    return data;
  }

  /**
   * Send a single email
   * @param {Object} config - SMTP configuration
   * @param {Object} emailData - Email data (to, subject, body)
   * @returns {Promise<Object>}
   */
  async sendEmail(config, emailData) {
    const endpoint = isDev ? `${API_BASE_URL}/email/send` : `${API_BASE_URL}/email-send`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config, emailData }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return data;
  }

  /**
   * Send bulk emails
   * @param {Object} config - SMTP configuration
   * @param {Array} emails - Array of email objects
   * @param {number} rateLimit - Emails per hour
   * @returns {Promise<Object>}
   */
  async sendBulkEmails(config, emails, rateLimit = 100) {
    const endpoint = isDev ? `${API_BASE_URL}/email/send-bulk` : `${API_BASE_URL}/email-send-bulk`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config, emails, rateLimit }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send bulk emails');
    }
    
    return data;
  }

  /**
   * Check API health
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    if (!isDev) {
      // In production, Netlify Functions are always available
      return { success: true, message: 'Netlify Functions are available' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/email/health`);
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Backend server is not running' };
    }
  }
}

export default new EmailAPI();
