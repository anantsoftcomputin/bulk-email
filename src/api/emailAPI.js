// API client that works in both dev and production
// Development: Vite proxies /api → Express server on localhost:3001
//   Start both together with: npm run dev:all
// Production: Uses Netlify Functions (/.netlify/functions)
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev
  ? '/api'
  : '/.netlify/functions';

class EmailAPI {
  /**
   * Test SMTP configuration by sending a test email
   * @param {Object} config - SMTP configuration
   * @param {string} toEmail - Recipient email
   * @returns {Promise<Object>}
   */
  async _post(endpoint, body) {
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(
        isDev
          ? 'Email server is not running. Start it with: npm run dev:all'
          : 'Failed to reach the email service. Please try again.'
      );
    }

    // Safely parse response — a 5xx from the proxy may have an empty or HTML body
    const text = await response.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); } catch { /* non-JSON body — leave data as {} */ }
    }

    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status}). Check your SMTP credentials and settings.`);
    }
    return data;
  }

  async testSMTP(config, toEmail) {
    const endpoint = isDev ? `${API_BASE_URL}/email/test` : `${API_BASE_URL}/email-test`;
    return this._post(endpoint, { config, toEmail });
  }

  async verifySMTP(config) {
    const endpoint = isDev ? `${API_BASE_URL}/email/verify` : `${API_BASE_URL}/email-verify`;
    return this._post(endpoint, { config });
  }

  async sendEmail(config, emailData) {
    const endpoint = isDev ? `${API_BASE_URL}/email/send` : `${API_BASE_URL}/email-send`;
    return this._post(endpoint, { config, emailData });
  }

  async sendBulkEmails(config, emails, rateLimit = 100) {
    const endpoint = isDev ? `${API_BASE_URL}/email/send-bulk` : `${API_BASE_URL}/email-send-bulk`;
    return this._post(endpoint, { config, emails, rateLimit });
  }

  async checkHealth() {
    if (!isDev) return { success: true, message: 'Netlify Functions are available' };
    try {
      const response = await fetch(`${API_BASE_URL}/email/health`);
      return await response.json();
    } catch {
      return { success: false, message: 'Backend server is not running. Use: npm run dev:all' };
    }
  }
}

export default new EmailAPI();
