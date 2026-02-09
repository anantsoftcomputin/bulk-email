/**
 * Email Tracking Utilities
 * 
 * Injects open-tracking pixels and wraps links for click tracking
 * in outgoing campaign emails.
 */

const TRACKING_BASE = import.meta.env.PROD
  ? '/.netlify/functions'
  : 'http://localhost:8888/.netlify/functions';

/**
 * Generate a unique tracking token from campaign and recipient IDs
 */
function encodeTrackingParams(campaignId, recipientId) {
  return btoa(JSON.stringify({ c: campaignId, r: recipientId, t: Date.now() }));
}

/**
 * Build the tracking pixel URL for open tracking
 */
export function getTrackingPixelUrl(campaignId, recipientId) {
  const token = encodeTrackingParams(campaignId, recipientId);
  return `${TRACKING_BASE}/track-open?tk=${encodeURIComponent(token)}`;
}

/**
 * Build a click-tracking redirect URL
 */
export function getClickTrackingUrl(originalUrl, campaignId, recipientId) {
  const token = encodeTrackingParams(campaignId, recipientId);
  return `${TRACKING_BASE}/track-click?url=${encodeURIComponent(originalUrl)}&tk=${encodeURIComponent(token)}`;
}

/**
 * Inject a tracking pixel <img> tag into the email HTML body
 * placed just before </body> or at the end of the HTML.
 */
export function injectTrackingPixel(html, campaignId, recipientId) {
  const pixelUrl = getTrackingPixelUrl(campaignId, recipientId);
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
export function wrapLinksForTracking(html, campaignId, recipientId) {
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
      const trackedUrl = getClickTrackingUrl(url, campaignId, recipientId);
      return `<a ${before}href="${trackedUrl}"${after}>`;
    }
  );
}

/**
 * Apply both open tracking and click tracking to an email HTML body
 */
export function applyTracking(html, campaignId, recipientId) {
  let tracked = wrapLinksForTracking(html, campaignId, recipientId);
  tracked = injectTrackingPixel(tracked, campaignId, recipientId);
  return tracked;
}
