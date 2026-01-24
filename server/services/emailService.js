const nodemailer = require('nodemailer');

class EmailService {
  /**
   * Create a nodemailer transporter with the given SMTP configuration
   * @param {Object} config - SMTP configuration
   * @returns {Object} Nodemailer transporter
   */
  createTransporter(config) {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true for 465, false for other ports
      auth: {
        user: config.username,
        pass: config.password,
      },
      // Optional: Add connection timeout
      connectionTimeout: 10000,
      // Optional: Add greeting timeout
      greetingTimeout: 10000,
    });
  }

  /**
   * Send a test email
   * @param {Object} config - SMTP configuration
   * @param {string} toEmail - Recipient email address
   * @returns {Promise<Object>} Send result
   */
  async sendTestEmail(config, toEmail) {
    try {
      const transporter = this.createTransporter(config);

      // Verify connection configuration
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `"${config.fromName || 'Bulk Email Sender'}" <${config.fromEmail}>`,
        to: toEmail,
        subject: 'SMTP Configuration Test - Success! ✓',
        text: `Your SMTP configuration is working correctly!\n\nConfiguration Details:\nHost: ${config.host}\nPort: ${config.port}\nSecure: ${config.secure ? 'Yes (TLS/SSL)' : 'No'}\nFrom: ${config.fromEmail}\n\nThis is a test email sent from your Bulk Email Sender application.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">✓ SMTP Test Successful!</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333;">Your SMTP configuration is working correctly!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">Configuration Details:</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px; color: #666;"><strong>Host:</strong></td>
                    <td style="padding: 8px;">${config.host}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; color: #666;"><strong>Port:</strong></td>
                    <td style="padding: 8px;">${config.port}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; color: #666;"><strong>Secure:</strong></td>
                    <td style="padding: 8px;">${config.secure ? 'Yes (TLS/SSL)' : 'No'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; color: #666;"><strong>From:</strong></td>
                    <td style="padding: 8px;">${config.fromEmail}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                This is a test email sent from your Bulk Email Sender application.
              </p>
            </div>
          </div>
        `,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Test email sent successfully',
      };
    } catch (error) {
      console.error('Error sending test email:', error);
      throw {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Send a single campaign email
   * @param {Object} config - SMTP configuration
   * @param {Object} emailData - Email data (to, subject, body)
   * @returns {Promise<Object>} Send result
   */
  async sendCampaignEmail(config, emailData) {
    try {
      const transporter = this.createTransporter(config);

      const info = await transporter.sendMail({
        from: `"${config.fromName || 'Bulk Email Sender'}" <${config.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text || this.stripHtml(emailData.html || emailData.body),
        html: emailData.html || emailData.body,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Error sending campaign email:', error);
      throw {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Send bulk emails (rate-limited)
   * @param {Object} config - SMTP configuration
   * @param {Array} emails - Array of email objects
   * @param {number} rateLimit - Emails per hour
   * @returns {Promise<Object>} Send results
   */
  async sendBulkEmails(config, emails, rateLimit = 100) {
    const results = {
      total: emails.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    const delayMs = Math.ceil((3600 * 1000) / rateLimit); // Calculate delay between emails
    const transporter = this.createTransporter(config);

    // Verify connection before starting
    try {
      await transporter.verify();
    } catch (error) {
      throw {
        success: false,
        error: 'SMTP connection failed: ' + error.message,
      };
    }

    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `"${config.fromName || 'Bulk Email Sender'}" <${config.fromEmail}>`,
          to: email.to,
          subject: email.subject,
          text: email.text || this.stripHtml(email.html || email.body),
          html: email.html || email.body,
        });

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: email.to,
          error: error.message,
        });
      }

      // Rate limiting delay
      if (results.sent + results.failed < emails.length) {
        await this.delay(delayMs);
      }
    }

    return {
      success: true,
      results,
    };
  }

  /**
   * Verify SMTP configuration
   * @param {Object} config - SMTP configuration
   * @returns {Promise<Object>} Verification result
   */
  async verifyConfiguration(config) {
    try {
      const transporter = this.createTransporter(config);
      await transporter.verify();
      
      return {
        success: true,
        message: 'SMTP configuration is valid',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Delay helper function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new EmailService();
