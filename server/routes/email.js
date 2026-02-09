const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

/**
 * POST /api/email/test
 * Send a test email to verify SMTP configuration
 */
router.post('/test', async (req, res) => {
  try {
    const { config, toEmail } = req.body;

    if (!config || !config.host || !config.port || !config.fromEmail) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SMTP configuration. Required fields: host, port, username, password, fromEmail',
      });
    }

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email address is required',
      });
    }

    const result = await emailService.sendTestEmail(config, toEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message,
      code: error.code,
    });
  }
});

/**
 * POST /api/email/verify
 * Verify SMTP configuration without sending email
 */
router.post('/verify', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || !config.host || !config.port) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SMTP configuration',
      });
    }

    const result = await emailService.verifyConfiguration(config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/email/send
 * Send a single campaign email
 */
router.post('/send', async (req, res) => {
  try {
    const { config, emailData } = req.body;

    if (!config || !emailData) {
      return res.status(400).json({
        success: false,
        error: 'SMTP config and email data are required',
      });
    }

    const result = await emailService.sendCampaignEmail(config, emailData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * POST /api/email/send-bulk
 * Send bulk emails with rate limiting
 */
router.post('/send-bulk', async (req, res) => {
  try {
    const { config, emails, rateLimit } = req.body;

    if (!config || !emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        error: 'SMTP config and emails array are required',
      });
    }

    // Set timeout to handle long-running requests
    req.setTimeout(600000); // 10 minutes

    const result = await emailService.sendBulkEmails(config, emails, rateLimit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * GET /api/email/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Email API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/track-open
 * Email open tracking pixel
 * Returns a 1x1 transparent GIF and records the open event
 */
router.get('/track-open', async (req, res) => {
  // 1x1 transparent GIF in base64
  const TRANSPARENT_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  const headers = {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const tk = req.query.tk;
    if (tk) {
      const decoded = JSON.parse(Buffer.from(tk, 'base64').toString());
      const { c: campaignId, r: recipientId, u: userId } = decoded;

      console.log(`[OPEN] Campaign: ${campaignId}, Recipient: ${recipientId}, User: ${userId || 'unknown'}`);

      // TODO: Record tracking event in Firestore
      // For now, just log it
    }
  } catch (err) {
    console.error('Tracking error:', err.message);
  }

  // Always return the pixel, even on errors
  res.set(headers).send(TRANSPARENT_GIF);
});

/**
 * GET /api/track-click  
 * Email click tracking redirect
 * Records the click event and redirects to the original URL
 */
router.get('/track-click', async (req, res) => {
  const url = req.query.url;
  const tk = req.query.tk;

  if (!url) {
    return res.status(400).json({ error: 'Missing redirect URL' });
  }

  try {
    if (tk) {
      const decoded = JSON.parse(Buffer.from(tk, 'base64').toString());
      const { c: campaignId, r: recipientId, u: userId } = decoded;

      console.log(`[CLICK] Campaign: ${campaignId}, Recipient: ${recipientId}, User: ${userId || 'unknown'}, URL: ${url}`);

      // TODO: Record tracking event in Firestore
      // For now, just log it
    }
  } catch (err) {
    console.error('Click tracking error:', err.message);
  }

  // Always redirect to the original URL
  res.redirect(decodeURIComponent(url));
});

module.exports = router;
