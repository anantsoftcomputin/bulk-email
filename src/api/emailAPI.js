// API client for Netlify Functions
const API_BASE_URL = import.meta.env.PROD ? '/.netlify/functions' : 'http://localhost:8888/.netlify/functions';

class EmailAPI {
  /**
   * Test SMTP configuration by sending a test email
   * @param {Object} config - SMTP configuration
   * @param {string} toEmail - Recipient email
   * @returns {Promise<Object>}
   */
  async testSMTP(config, toEmail) {
    const response = await fetch(`${API_BASE_URL}/email-test`, {
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
    const response = await fetch(`${API_BASE_URL}/email-verify`, {
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
    const response = await fetch(`${API_BASE_URL}/email-send`, {
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
    const response = await fetch(`${API_BASE_URL}/email-send-bulk`, {
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
   * Check API health (not needed for Netlify Functions)
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    // Netlify Functions are always available when deployed
    // For local development with Netlify CLI, functions are available at localhost:8888
    return { success: true, message: 'Netlify Functions are available' };
  }
}

export default new EmailAPI();
