/**
 * Email Tracking Utilities
 * 
 * Injects open-tracking pixels and wraps links for click tracking
 * in outgoing campaign emails.
 */

// Get the base URL for tracking endpoints
// In production: Use full Netlify URL so email clients can load tracking pixels
// In development: Use localhost Express backend
const getTrackingBase = () => {
  if (import.meta.env.PROD) {
    // Production: Use full URL from environment or detect from window
    const appUrl = import.meta.env.VITE_APP_URL;
    if (appUrl) {
      return `${appUrl}/.netlify/functions`;
    }
    // Fallback: Try to detect from window.location (when running in browser)
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/.netlify/functions`;
    }
    // Last resort: relative URL (won't work in emails but better than nothing)
    return '/.netlify/functions';
  } else if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';  // Express backend for dev
  } else {
    return 'http://localhost:8888/.netlify/functions';  // Netlify dev
  }
};

const TRACKING_BASE = getTrackingBase();

/**
 * Generate a unique tracking token from campaign, recipient and user IDs
 */
function encodeTrackingParams(campaignId, recipientId, userId) {
  return btoa(JSON.stringify({ c: campaignId, r: recipientId, u: userId, t: Date.now() }));
}

/**
 * Build the tracking pixel URL for open tracking
 */
export function getTrackingPixelUrl(campaignId, recipientId, userId) {
  const token = encodeTrackingParams(campaignId, recipientId, userId);
  return `${TRACKING_BASE}/track-open?tk=${encodeURIComponent(token)}`;
}

/**
 * Build a click-tracking redirect URL
 */
export function getClickTrackingUrl(originalUrl, campaignId, recipientId, userId) {
  const token = encodeTrackingParams(campaignId, recipientId, userId);
  return `${TRACKING_BASE}/track-click?url=${encodeURIComponent(originalUrl)}&tk=${encodeURIComponent(token)}`;
}

/**
 * Inject a tracking pixel <img> tag into the email HTML body
 * placed just before </body> or at the end of the HTML.
 */
export function injectTrackingPixel(html, campaignId, recipientId, userId) {
  const pixelUrl = getTrackingPixelUrl(campaignId, recipientId, userId);
  const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;

  // Try to insert before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  // Otherwise append
  return html + pixel;
}

/**
 * Wrap all <a href="..."> links in the HTML with click-tracking URLs.
 * Skips mailto: links, # anchors, and unsubscribe links.
 */
export function wrapLinksForTracking(html, campaignId, recipientId, userId) {
  // Match <a ... href="URL" ...>
  return html.replace(
    /<a\s([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (match, before, url, after) => {
      // Skip mailto, tel, anchor, and unsubscribe links
      if (
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('#') ||
        url.includes('unsubscribe')
      ) {
        return match;
      }
      const trackedUrl = getClickTrackingUrl(url, campaignId, recipientId, userId);
      return `<a ${before}href="${trackedUrl}"${after}>`;
    }
  );
}

/**
 * Apply both open tracking and click tracking to an email HTML body
 */
export function applyTracking(html, campaignId, recipientId, userId) {
  let tracked = wrapLinksForTracking(html, campaignId, recipientId, userId);
  tracked = injectTrackingPixel(tracked, campaignId, recipientId, userId);
  return tracked;
}
