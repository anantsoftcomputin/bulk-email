/**
 * Email HTML Renderer
 * 
 * Converts a JSON block structure into universally-compatible email HTML.
 * 
 * Design principles:
 * - Table-based layout (no flexbox/grid) for Outlook/Word rendering engine
 * - ALL critical styles inline (Gmail, Yahoo strip <style> tags)
 * - MSO conditionals for Outlook-specific fixes
 * - Progressive enhancement media queries for mobile (clients that support <style>)
 * - Web-safe font stacks
 * - Max-width 600px container
 * - role="presentation" on layout tables for accessibility
 */

// ─── Font stacks safe for email ───────────────────────────────
const FONT_STACKS = {
  'Arial': "Arial, Helvetica, sans-serif",
  'Helvetica': "Helvetica, Arial, sans-serif",
  'Georgia': "Georgia, 'Times New Roman', Times, serif",
  'Times New Roman': "'Times New Roman', Times, Georgia, serif",
  'Verdana': "Verdana, Geneva, sans-serif",
  'Trebuchet MS': "'Trebuchet MS', Helvetica, sans-serif",
  'Courier New': "'Courier New', Courier, monospace",
};

function fontStack(fontFamily) {
  return FONT_STACKS[fontFamily] || FONT_STACKS['Arial'];
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Individual Block Renderers ───────────────────────────────

function renderHeaderBlock(block, settings) {
  const p = block.properties;
  const bgColor = p.backgroundColor || '#1a56db';
  const textColor = p.textColor || '#ffffff';
  const font = fontStack(settings.fontFamily);
  const padding = p.padding || '30px 40px';

  let logoHtml = '';
  if (p.logoUrl) {
    logoHtml = `<img src="${escHtml(p.logoUrl)}" alt="${escHtml(p.companyName || 'Logo')}" width="${p.logoWidth || 150}" style="display:block;border:0;outline:none;max-width:100%;height:auto;" />`;
  }

  return `
    <tr>
      <td align="${p.alignment || 'center'}" style="background-color:${bgColor};padding:${padding};font-family:${font};">
        ${logoHtml}
        ${p.companyName ? `<h1 style="margin:${logoHtml ? '12px' : '0'} 0 0 0;font-size:${p.fontSize || '28px'};font-weight:700;color:${textColor};line-height:1.3;font-family:${font};">${escHtml(p.companyName)}</h1>` : ''}
        ${p.tagline ? `<p style="margin:6px 0 0 0;font-size:14px;color:${textColor};opacity:0.85;font-family:${font};">${escHtml(p.tagline)}</p>` : ''}
      </td>
    </tr>`;
}

function renderHeroBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const bgColor = p.backgroundColor || '#f0f4ff';
  const textColor = p.textColor || '#1a1a2e';

  let bgImage = '';
  if (p.backgroundImage) {
    bgImage = `background-image:url('${p.backgroundImage}');background-size:cover;background-position:center;`;
  }

  let buttonHtml = '';
  if (p.buttonText && p.buttonUrl) {
    const btnBg = p.buttonColor || '#1a56db';
    const btnText = p.buttonTextColor || '#ffffff';
    buttonHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0 auto;">
        <tr>
          <td align="center" bgcolor="${btnBg}" style="border-radius:${p.buttonRadius || '6px'};background-color:${btnBg};">
            <a href="${escHtml(p.buttonUrl)}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${font};font-size:16px;font-weight:600;color:${btnText};text-decoration:none;border-radius:${p.buttonRadius || '6px'};background-color:${btnBg};mso-padding-alt:0;text-align:center;">
              <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%;mso-text-raise:21pt">&nbsp;</i><![endif]-->
              <span style="mso-text-raise:10pt;">${escHtml(p.buttonText)}</span>
              <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%">&nbsp;</i><![endif]-->
            </a>
          </td>
        </tr>
      </table>`;
  }

  return `
    <tr>
      <td style="background-color:${bgColor};${bgImage}padding:${p.padding || '50px 40px'};text-align:${p.alignment || 'center'};font-family:${font};">
        ${p.heading ? `<h1 style="margin:0;font-size:${p.headingSize || '32px'};font-weight:800;color:${textColor};line-height:1.25;font-family:${font};">${p.heading}</h1>` : ''}
        ${p.subheading ? `<p style="margin:16px 0 0 0;font-size:${p.subheadingSize || '18px'};color:${textColor};opacity:0.8;line-height:1.5;font-family:${font};">${p.subheading}</p>` : ''}
        ${buttonHtml}
      </td>
    </tr>`;
}

function renderTextBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  // Content can contain basic HTML (p, b, i, br, a, ul, ol, li)
  return `
    <tr>
      <td style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};font-family:${font};font-size:${p.fontSize || '16px'};line-height:${p.lineHeight || '1.6'};color:${p.color || '#333333'};text-align:${p.alignment || 'left'};">
        ${p.content || ''}
      </td>
    </tr>`;
}

function renderImageBlock(block, settings) {
  const p = block.properties;
  const width = p.width || '100%';
  const imgStyle = `display:block;border:0;outline:none;width:${width};max-width:100%;height:auto;`;
  
  let img = `<img src="${escHtml(p.src || 'https://placehold.co/600x300/e2e8f0/64748b?text=Image')}" alt="${escHtml(p.alt || 'Image')}" width="${p.pixelWidth || 600}" style="${imgStyle}" />`;
  
  if (p.linkUrl) {
    img = `<a href="${escHtml(p.linkUrl)}" target="_blank" style="display:block;">${img}</a>`;
  }

  return `
    <tr>
      <td align="${p.alignment || 'center'}" style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};">
        ${img}
      </td>
    </tr>`;
}

function renderButtonBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const bgColor = p.backgroundColor || '#1a56db';
  const textColor = p.textColor || '#ffffff';
  const radius = p.borderRadius || '6px';
  const width = p.fullWidth ? '100%' : 'auto';

  return `
    <tr>
      <td align="${p.alignment || 'center'}" style="padding:${p.padding || '20px 40px'};background-color:${p.containerBg || '#ffffff'};font-family:${font};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" ${p.fullWidth ? 'width="100%"' : ''} style="${p.fullWidth ? 'width:100%;' : ''}">
          <tr>
            <td align="center" bgcolor="${bgColor}" style="border-radius:${radius};background-color:${bgColor};">
              <a href="${escHtml(p.url || '#')}" target="_blank" style="display:inline-block;${p.fullWidth ? 'width:100%;' : ''}padding:${p.buttonPadding || '14px 32px'};font-family:${font};font-size:${p.fontSize || '16px'};font-weight:${p.fontWeight || '600'};color:${textColor};text-decoration:none;border-radius:${radius};background-color:${bgColor};text-align:center;mso-padding-alt:0;">
                <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%;mso-text-raise:21pt">&nbsp;</i><![endif]-->
                <span style="mso-text-raise:10pt;">${escHtml(p.text || 'Click Here')}</span>
                <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%">&nbsp;</i><![endif]-->
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderDividerBlock(block) {
  const p = block.properties;
  return `
    <tr>
      <td style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="border-top:${p.thickness || '1px'} ${p.style || 'solid'} ${p.color || '#e5e7eb'};font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderSpacerBlock(block) {
  const p = block.properties;
  return `
    <tr>
      <td style="padding:0;height:${p.height || '20px'};font-size:1px;line-height:${p.height || '20px'};background-color:${p.backgroundColor || '#ffffff'};">&nbsp;</td>
    </tr>`;
}

function renderColumnsBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const cols = p.columns || [];
  const colCount = cols.length || 2;
  const colWidth = Math.floor(600 / colCount);
  const gap = parseInt(p.gap) || 20;

  // Build columns for regular clients
  let columnsHtml = cols.map((col, i) => {
    const isLast = i === cols.length - 1;
    return `
      <!--[if mso]><td valign="top" width="${colWidth}" style="width:${colWidth}px;"><![endif]-->
      <div class="email-col" style="display:inline-block;vertical-align:top;width:100%;max-width:${colWidth}px;font-family:${font};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:${col.padding || '10px'};font-size:${col.fontSize || '14px'};color:${col.color || '#333333'};line-height:1.5;text-align:${col.alignment || 'left'};">
              ${col.content || ''}
            </td>
          </tr>
        </table>
      </div>
      <!--[if mso]></td>${!isLast ? '<td style="width:' + gap + 'px;"></td>' : ''}<![endif]-->`;
  }).join('');

  return `
    <tr>
      <td style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};font-family:${font};">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><![endif]-->
        ${columnsHtml}
        <!--[if mso]></tr></table><![endif]-->
      </td>
    </tr>`;
}

function renderSocialBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const iconSize = p.iconSize || '32';
  const networks = p.networks || [];

  // Simple colored circle icons using HTML/CSS (no external images needed)
  const socialIcons = {
    facebook: { color: '#1877F2', label: 'Facebook', letter: 'f' },
    twitter: { color: '#000000', label: 'X (Twitter)', letter: '𝕏' },
    instagram: { color: '#E4405F', label: 'Instagram', letter: 'IG' },
    linkedin: { color: '#0A66C2', label: 'LinkedIn', letter: 'in' },
    youtube: { color: '#FF0000', label: 'YouTube', letter: '▶' },
  };

  const iconsHtml = networks
    .filter(n => n.url)
    .map(n => {
      const icon = socialIcons[n.platform] || { color: '#333', label: n.platform, letter: '?' };
      return `
        <td align="center" style="padding:0 6px;">
          <a href="${escHtml(n.url)}" target="_blank" style="text-decoration:none;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" width="${iconSize}" height="${iconSize}" bgcolor="${icon.color}" style="border-radius:50%;width:${iconSize}px;height:${iconSize}px;background-color:${icon.color};text-align:center;vertical-align:middle;font-family:${font};font-size:13px;font-weight:700;color:#ffffff;line-height:${iconSize}px;">
                  ${icon.letter}
                </td>
              </tr>
            </table>
          </a>
        </td>`;
    }).join('');

  return `
    <tr>
      <td align="${p.alignment || 'center'}" style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};font-family:${font};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            ${iconsHtml}
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderFooterBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const textColor = p.textColor || '#999999';

  return `
    <tr>
      <td style="padding:${p.padding || '30px 40px'};background-color:${p.backgroundColor || '#f8f9fa'};font-family:${font};font-size:${p.fontSize || '12px'};color:${textColor};text-align:${p.alignment || 'center'};line-height:1.6;">
        ${p.companyName ? `<p style="margin:0 0 8px 0;font-weight:600;font-size:14px;color:${p.companyNameColor || '#666666'};">${escHtml(p.companyName)}</p>` : ''}
        ${p.address ? `<p style="margin:0 0 12px 0;">${escHtml(p.address)}</p>` : ''}
        ${p.showUnsubscribe !== false ? `<p style="margin:12px 0 0 0;"><a href="${escHtml(p.unsubscribeUrl || '{{unsubscribe_url}}')}" style="color:${p.linkColor || '#6b7280'};text-decoration:underline;">Unsubscribe</a>${p.preferencesUrl ? ` &middot; <a href="${escHtml(p.preferencesUrl)}" style="color:${p.linkColor || '#6b7280'};text-decoration:underline;">Email Preferences</a>` : ''}</p>` : ''}
        ${p.extraText ? `<p style="margin:8px 0 0 0;font-size:11px;color:${textColor};">${p.extraText}</p>` : ''}
      </td>
    </tr>`;
}

function renderVideoBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const url = p.url || '';
  // Extract YouTube/Vimeo ID for thumbnail
  let thumbnailUrl = p.thumbnailUrl || '';
  let videoLink = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (ytMatch && !thumbnailUrl) {
    thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    videoLink = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  } else if (vimeoMatch && !thumbnailUrl) {
    thumbnailUrl = `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    videoLink = `https://vimeo.com/${vimeoMatch[1]}`;
  }
  const thumb = thumbnailUrl || 'https://placehold.co/560x315/1a1a2e/ffffff?text=▶+Video';
  return `
    <tr>
      <td align="${p.alignment || 'center'}" style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};">
        <a href="${escHtml(videoLink || '#')}" target="_blank" style="display:block;text-decoration:none;position:relative;">
          <img src="${escHtml(thumb)}" alt="${escHtml(p.altText || 'Watch Video')}" width="${p.width || 560}" style="display:block;max-width:100%;height:auto;border:0;border-radius:${p.borderRadius || '8px'};" />
          <!-- Play button overlay (shows in some clients) -->
          <div style="text-align:center;margin-top:12px;">
            <span style="display:inline-block;padding:10px 24px;background-color:${p.buttonColor || '#dc2626'};color:#ffffff;border-radius:6px;font-family:${font};font-size:14px;font-weight:600;text-decoration:none;">▶ ${escHtml(p.buttonLabel || 'Watch Video')}</span>
          </div>
        </a>
        ${p.caption ? `<p style="margin:8px 0 0 0;font-family:${font};font-size:12px;color:#6b7280;text-align:center;">${escHtml(p.caption)}</p>` : ''}
      </td>
    </tr>`;
}

function renderTestimonialBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const stars = '★'.repeat(Math.min(5, Math.max(0, p.rating || 5)));
  const emptyStars = '★'.repeat(5 - Math.min(5, Math.max(0, p.rating || 5)));
  return `
    <tr>
      <td style="padding:${p.padding || '30px 40px'};background-color:${p.backgroundColor || '#f8fafc'};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${p.cardBg || '#ffffff'};border-radius:${p.borderRadius || '12px'};border:1px solid ${p.borderColor || '#e2e8f0'};">
          <tr>
            <td style="padding:${p.innerPadding || '28px'};font-family:${font};">
              ${p.showStars !== false ? `<p style="margin:0 0 12px 0;font-size:20px;line-height:1;"><span style="color:${p.starColor || '#f59e0b'};">${stars}</span><span style="color:#e2e8f0;">${emptyStars}</span></p>` : ''}
              <p style="margin:0 0 20px 0;font-size:${p.quoteSize || '17px'};color:${p.quoteColor || '#1e293b'};line-height:1.6;font-style:italic;">&ldquo;${escHtml(p.quote || 'This product changed my life. Highly recommended!')}&rdquo;</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${p.avatarUrl ? `<td style="padding-right:12px;vertical-align:middle;"><img src="${escHtml(p.avatarUrl)}" alt="${escHtml(p.name || '')}" width="${p.avatarSize || 44}" height="${p.avatarSize || 44}" style="border-radius:50%;display:block;border:0;" /></td>` : ''}
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-weight:700;font-size:14px;color:${p.nameColor || '#0f172a'};">${escHtml(p.name || 'John Doe')}</p>
                    ${p.title || p.company ? `<p style="margin:2px 0 0 0;font-size:12px;color:${p.titleColor || '#64748b'};">${escHtml(p.title || '')}${p.title && p.company ? ', ' : ''}${escHtml(p.company || '')}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderProductsBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const items = p.items || [];
  const cols = p.columns || 2;
  const itemWidth = Math.floor(560 / cols) - 10;
  const itemsHtml = items.map((item, i) => {
    const isLast = i % cols === cols - 1 || i === items.length - 1;
    return `
      <!--[if mso]><td valign="top" width="${itemWidth}" style="width:${itemWidth}px;${!isLast ? 'padding-right:16px;' : ''}"><![endif]-->
      <div class="email-col" style="display:inline-block;vertical-align:top;width:100%;max-width:${itemWidth}px;${!isLast ? 'padding-right:0;' : ''}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${p.cardBg || '#ffffff'};border-radius:${p.borderRadius || '8px'};border:1px solid ${p.borderColor || '#e2e8f0'};overflow:hidden;">
          <tr>
            ${item.imageUrl ? `<td><img src="${escHtml(item.imageUrl)}" alt="${escHtml(item.name || 'Product')}" width="${itemWidth}" style="display:block;max-width:100%;height:auto;border:0;" /></td></tr><tr>` : ''}
            <td style="padding:${p.cardPadding || '16px'};font-family:${font};">
              ${item.badge ? `<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${p.badgeColor || '#3b82f6'};background-color:${p.badgeBg || '#eff6ff'};display:inline-block;padding:3px 8px;border-radius:4px;">${escHtml(item.badge)}</p>` : ''}
              <p style="margin:${item.badge ? '8px' : '0'} 0 4px 0;font-size:${p.nameSize || '15px'};font-weight:700;color:${p.nameColor || '#0f172a'};">${escHtml(item.name || 'Product Name')}</p>
              ${item.description ? `<p style="margin:0 0 10px 0;font-size:${p.descSize || '13px'};color:${p.descColor || '#64748b'};line-height:1.5;">${escHtml(item.description)}</p>` : ''}
              ${item.price ? `<p style="margin:0 0 12px 0;font-size:${p.priceSize || '18px'};font-weight:800;color:${p.priceColor || '#0f172a'};">${escHtml(item.price)}${item.originalPrice ? `<span style="font-size:13px;color:#94a3b8;text-decoration:line-through;margin-left:6px;">${escHtml(item.originalPrice)}</span>` : ''}</p>` : ''}
              ${item.ctaText ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" bgcolor="${p.ctaColor || '#1a56db'}" style="border-radius:6px;background-color:${p.ctaColor || '#1a56db'};"><a href="${escHtml(item.ctaUrl || '#')}" target="_blank" style="display:block;padding:10px 16px;font-family:${font};font-size:13px;font-weight:600;color:${p.ctaTextColor || '#ffffff'};text-decoration:none;text-align:center;">${escHtml(item.ctaText)}</a></td></tr></table>` : ''}
            </td>
          </tr>
        </table>
      </div>
      <!--[if mso]></td>${!isLast ? '<td style="width:16px;"></td>' : ''}<![endif]-->`;
  }).join('');
  return `
    <tr>
      <td style="padding:${p.padding || '20px 40px'};background-color:${p.backgroundColor || '#ffffff'};">
        ${p.title ? `<p style="margin:0 0 16px 0;font-family:${font};font-size:${p.titleSize || '20px'};font-weight:700;color:${p.titleColor || '#0f172a'};text-align:${p.titleAlign || 'left'};">${escHtml(p.title)}</p>` : ''}
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><![endif]-->
        ${itemsHtml}
        <!--[if mso]></tr></table><![endif]-->
      </td>
    </tr>`;
}

function renderMenuBlock(block, settings) {
  const p = block.properties;
  const font = fontStack(settings.fontFamily);
  const links = p.links || [];
  const linksHtml = links.map(l => `
    <td align="center" style="padding:0 ${p.itemSpacing || '12px'};">
      <a href="${escHtml(l.url || '#')}" target="_blank" style="font-family:${font};font-size:${p.fontSize || '14px'};font-weight:${p.fontWeight || '600'};color:${p.linkColor || '#1a56db'};text-decoration:none;">${escHtml(l.label || 'Link')}</a>
    </td>`).join('');
  return `
    <tr>
      <td align="${p.alignment || 'center'}" style="padding:${p.padding || '12px 40px'};background-color:${p.backgroundColor || '#ffffff'};border-bottom:${p.borderBottom || '1px solid #e5e7eb'};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>${linksHtml}</tr>
        </table>
      </td>
    </tr>`;
}

function renderHtmlBlock(block) {
  const p = block.properties;
  return `
    <tr>
      <td style="padding:${p.padding || '0'};background-color:${p.backgroundColor || '#ffffff'};">
        ${p.html || '<!-- Custom HTML block -->'}
      </td>
    </tr>`;
}

// ─── Block router ─────────────────────────────────────────────
function renderBlock(block, settings) {
  switch (block.type) {
    case 'header': return renderHeaderBlock(block, settings);
    case 'hero': return renderHeroBlock(block, settings);
    case 'text': return renderTextBlock(block, settings);
    case 'image': return renderImageBlock(block, settings);
    case 'button': return renderButtonBlock(block, settings);
    case 'divider': return renderDividerBlock(block);
    case 'spacer': return renderSpacerBlock(block);
    case 'columns': return renderColumnsBlock(block, settings);
    case 'social': return renderSocialBlock(block, settings);
    case 'footer': return renderFooterBlock(block, settings);
    case 'video': return renderVideoBlock(block, settings);
    case 'testimonial': return renderTestimonialBlock(block, settings);
    case 'products': return renderProductsBlock(block, settings);
    case 'menu': return renderMenuBlock(block, settings);
    case 'html': return renderHtmlBlock(block);
    default: return '';
  }
}

// ─── Main Renderer ────────────────────────────────────────────

/**
 * Render the full email HTML document from blocks JSON.
 * 
 * @param {Object} data - { settings: {...}, blocks: [...] }
 * @returns {string} Complete HTML email document
 */
export function renderEmailHTML(data) {
  const settings = data.settings || {};
  const blocks = data.blocks || [];
  
  const bgColor = settings.backgroundColor || '#f4f4f4';
  const contentBg = settings.contentBackgroundColor || '#ffffff';
  const contentWidth = settings.contentWidth || 600;
  const font = fontStack(settings.fontFamily);

  const blocksHtml = blocks.map(b => renderBlock(b, settings)).join('\n');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${escHtml(settings.title || 'Email')}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
    * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
    table { border-spacing:0 !important; border-collapse:collapse !important; table-layout:fixed !important; margin:0 auto !important; }
    img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    a { text-decoration:none; }
    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width:100% !important; max-width:100% !important; }
      .email-col { display:block !important; width:100% !important; max-width:100% !important; }
      .stack-column { display:block !important; width:100% !important; max-width:100% !important; }
      .mobile-padding { padding-left:20px !important; padding-right:20px !important; }
      .mobile-center { text-align:center !important; }
      img.fluid { width:100% !important; max-width:100% !important; height:auto !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:${bgColor};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div role="article" aria-roledescription="email" aria-label="${escHtml(settings.title || 'Email')}" lang="en">
    <!-- Visually Hidden Preheader Text -->
    ${settings.preheader ? `<div style="display:none;font-size:1px;color:${bgColor};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escHtml(settings.preheader)}&zwnj;&nbsp;</div>` : ''}

    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${contentWidth}" align="center" style="width:${contentWidth}px;background-color:${contentBg};"><tr><td>
    <![endif]-->

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-container" style="max-width:${contentWidth}px;margin:0 auto;background-color:${contentBg};font-family:${font};">
      ${blocksHtml}
    </table>

    <!--[if mso]>
    </td></tr></table>
    <![endif]-->
  </div>
</body>
</html>`;
}

// ─── Default Block Properties ──────────────────────────────────

export const BLOCK_DEFAULTS = {
  header: {
    companyName: 'Your Company',
    tagline: '',
    logoUrl: '',
    logoWidth: 150,
    backgroundColor: '#1a56db',
    textColor: '#ffffff',
    fontSize: '28px',
    alignment: 'center',
    padding: '30px 40px',
  },
  hero: {
    heading: 'Welcome to Our Newsletter',
    subheading: 'Stay updated with the latest news and offers.',
    headingSize: '32px',
    subheadingSize: '18px',
    buttonText: 'Get Started',
    buttonUrl: '#',
    buttonColor: '#1a56db',
    buttonTextColor: '#ffffff',
    buttonRadius: '6px',
    backgroundColor: '#f0f4ff',
    textColor: '#1a1a2e',
    alignment: 'center',
    padding: '50px 40px',
    backgroundImage: '',
  },
  text: {
    content: '<p>Hello {{firstName}},</p><p>Thank you for subscribing to our newsletter. We have exciting updates to share with you.</p>',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333333',
    backgroundColor: '#ffffff',
    alignment: 'left',
    padding: '20px 40px',
  },
  image: {
    src: '',
    alt: 'Image',
    linkUrl: '',
    width: '100%',
    pixelWidth: 520,
    alignment: 'center',
    backgroundColor: '#ffffff',
    padding: '20px 40px',
  },
  button: {
    text: 'Click Here',
    url: '#',
    backgroundColor: '#1a56db',
    textColor: '#ffffff',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    buttonPadding: '14px 32px',
    fullWidth: false,
    alignment: 'center',
    containerBg: '#ffffff',
    padding: '20px 40px',
  },
  divider: {
    color: '#e5e7eb',
    thickness: '1px',
    style: 'solid',
    backgroundColor: '#ffffff',
    padding: '10px 40px',
  },
  spacer: {
    height: '30px',
    backgroundColor: '#ffffff',
  },
  columns: {
    columns: [
      { content: '<p><strong>Column 1</strong></p><p>Add your content here.</p>', padding: '10px', alignment: 'left', fontSize: '14px', color: '#333333' },
      { content: '<p><strong>Column 2</strong></p><p>Add your content here.</p>', padding: '10px', alignment: 'left', fontSize: '14px', color: '#333333' },
    ],
    gap: '20',
    backgroundColor: '#ffffff',
    padding: '20px 40px',
  },
  social: {
    networks: [
      { platform: 'facebook', url: '' },
      { platform: 'twitter', url: '' },
      { platform: 'instagram', url: '' },
      { platform: 'linkedin', url: '' },
    ],
    iconSize: '36',
    alignment: 'center',
    backgroundColor: '#ffffff',
    padding: '20px 40px',
  },
  video: {
    url: '',
    thumbnailUrl: '',
    altText: 'Watch Video',
    buttonLabel: 'Watch Video',
    buttonColor: '#dc2626',
    caption: '',
    width: 560,
    borderRadius: '8px',
    alignment: 'center',
    backgroundColor: '#ffffff',
    padding: '20px 40px',
  },
  testimonial: {
    quote: 'This product completely transformed how our team works. Highly recommend to anyone!',
    name: 'Jane Smith',
    title: 'CEO',
    company: 'Acme Corp',
    avatarUrl: '',
    avatarSize: 44,
    rating: 5,
    showStars: true,
    starColor: '#f59e0b',
    quoteSize: '17px',
    quoteColor: '#1e293b',
    nameColor: '#0f172a',
    titleColor: '#64748b',
    backgroundColor: '#f8fafc',
    cardBg: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
    innerPadding: '28px',
    padding: '20px 40px',
  },
  products: {
    title: 'Featured Products',
    titleSize: '20px',
    titleColor: '#0f172a',
    titleAlign: 'left',
    columns: 2,
    items: [
      { name: 'Product One', description: 'Short product description goes here.', price: '$29.99', originalPrice: '', imageUrl: 'https://placehold.co/260x180/e2e8f0/64748b?text=Product', badge: 'NEW', ctaText: 'Buy Now', ctaUrl: '#' },
      { name: 'Product Two', description: 'Short product description goes here.', price: '$49.99', originalPrice: '$69.99', imageUrl: 'https://placehold.co/260x180/e2e8f0/64748b?text=Product', badge: 'SALE', ctaText: 'Buy Now', ctaUrl: '#' },
    ],
    cardBg: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
    cardPadding: '16px',
    ctaColor: '#1a56db',
    ctaTextColor: '#ffffff',
    nameColor: '#0f172a',
    descColor: '#64748b',
    priceColor: '#0f172a',
    badgeColor: '#3b82f6',
    badgeBg: '#eff6ff',
    backgroundColor: '#ffffff',
    padding: '20px 40px',
  },
  menu: {
    links: [
      { label: 'Home', url: '#' },
      { label: 'About', url: '#' },
      { label: 'Products', url: '#' },
      { label: 'Contact', url: '#' },
    ],
    linkColor: '#1a56db',
    fontSize: '14px',
    fontWeight: '600',
    itemSpacing: '12px',
    alignment: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '14px 40px',
  },
  html: {
    html: '<p style="color:#333;font-family:Arial,sans-serif;font-size:14px;">Custom HTML content here.</p>',
    backgroundColor: '#ffffff',
    padding: '0',
  },
  footer: {
    companyName: 'Your Company',
    companyNameColor: '#666666',
    address: '123 Street, City, Country',
    showUnsubscribe: true,
    unsubscribeUrl: '{{unsubscribe_url}}',
    preferencesUrl: '',
    extraText: 'You are receiving this because you subscribed to our mailing list.',
    backgroundColor: '#f8f9fa',
    textColor: '#999999',
    linkColor: '#6b7280',
    fontSize: '12px',
    alignment: 'center',
    padding: '30px 40px',
  },
};

/**
 * Create a new block with default properties
 */
export function createBlock(type) {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    properties: JSON.parse(JSON.stringify(BLOCK_DEFAULTS[type] || {})),
  };
}

/**
 * Starter templates
 */
export const STARTER_TEMPLATES = [
  {
    name: 'Blank',
    description: 'Start from scratch',
    icon: '📄',
    settings: { backgroundColor: '#f4f4f4', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: '' },
    blocks: [],
  },
  {
    name: 'Newsletter',
    description: 'Classic newsletter layout',
    icon: '📰',
    settings: { backgroundColor: '#f0f0f0', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: 'This month\'s top stories' },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header, companyName: '{{company_name}}' } },
      { type: 'hero', properties: { ...BLOCK_DEFAULTS.hero, heading: 'Monthly Newsletter', subheading: 'Here\'s what we\'ve been up to this month.' } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, content: '<p>Hi {{firstName}},</p><p>Welcome to our monthly newsletter! Here are the highlights from this month.</p>' } },
      { type: 'divider', properties: { ...BLOCK_DEFAULTS.divider } },
      { type: 'columns', properties: { ...BLOCK_DEFAULTS.columns, columns: [
        { content: '<p><strong>🚀 New Features</strong></p><p>Check out what we launched this month.</p>', padding: '10px', alignment: 'left', fontSize: '14px', color: '#333333' },
        { content: '<p><strong>📊 By the Numbers</strong></p><p>Key metrics and achievements.</p>', padding: '10px', alignment: 'left', fontSize: '14px', color: '#333333' },
      ]}},
      { type: 'button', properties: { ...BLOCK_DEFAULTS.button, text: 'Read More', url: '#' } },
      { type: 'social', properties: { ...BLOCK_DEFAULTS.social } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer } },
    ],
  },
  {
    name: 'Promotional',
    description: 'Product launch or sale',
    icon: '🎯',
    settings: { backgroundColor: '#f4f4f4', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: 'Special offer inside!' },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header, backgroundColor: '#0f172a' } },
      { type: 'hero', properties: { ...BLOCK_DEFAULTS.hero, heading: '{{discount}}% OFF Everything', subheading: 'Use code: {{promo_code}}', backgroundColor: '#0f172a', textColor: '#ffffff', buttonColor: '#eab308', buttonTextColor: '#0f172a', buttonText: 'Shop Now' } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, content: '<p>Hi {{firstName}},</p><p>For a limited time, enjoy an exclusive discount on all our products. Don\'t miss out!</p>' } },
      { type: 'image', properties: { ...BLOCK_DEFAULTS.image, src: 'https://placehold.co/520x260/e2e8f0/475569?text=Product+Image', alt: 'Product showcase' } },
      { type: 'button', properties: { ...BLOCK_DEFAULTS.button, text: 'Claim Your Discount', backgroundColor: '#dc2626' } },
      { type: 'divider', properties: { ...BLOCK_DEFAULTS.divider } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer } },
    ],
  },
  {
    name: 'Welcome',
    description: 'Onboarding new subscribers',
    icon: '👋',
    settings: { backgroundColor: '#f8fafc', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: 'Welcome aboard!' },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header, backgroundColor: '#059669' } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, content: '<h2 style="margin:0 0 16px 0;color:#059669;">Welcome, {{firstName}}! 🎉</h2><p>We\'re thrilled to have you join us. Here\'s what you can expect:</p>' } },
      { type: 'columns', properties: { ...BLOCK_DEFAULTS.columns, columns: [
        { content: '<p style="text-align:center;font-size:28px;margin:0;">📧</p><p><strong>Weekly Updates</strong></p><p>Fresh content delivered to your inbox.</p>', padding: '15px', alignment: 'center', fontSize: '14px', color: '#333333' },
        { content: '<p style="text-align:center;font-size:28px;margin:0;">🎁</p><p><strong>Exclusive Deals</strong></p><p>Members-only discounts and offers.</p>', padding: '15px', alignment: 'center', fontSize: '14px', color: '#333333' },
      ]}},
      { type: 'button', properties: { ...BLOCK_DEFAULTS.button, text: 'Get Started', backgroundColor: '#059669' } },
      { type: 'spacer', properties: { ...BLOCK_DEFAULTS.spacer, height: '10px' } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer } },
    ],
  },
  {
    name: 'Transactional',
    description: 'Order confirmations, receipts',
    icon: '🧾',
    settings: { backgroundColor: '#f9fafb', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: 'Your order confirmation' },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header, backgroundColor: '#1e293b' } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, content: '<h2 style="margin:0 0 16px 0;color:#1e293b;">Order Confirmed ✓</h2><p>Hi {{firstName}},</p><p>Thank you for your purchase. Your order #{{order_id}} has been confirmed and is being processed.</p>' } },
      { type: 'divider', properties: { ...BLOCK_DEFAULTS.divider } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, content: '<table style="width:100%;font-size:14px;"><tr><td style="padding:8px 0;color:#6b7280;">Subtotal</td><td style="padding:8px 0;text-align:right;">$XX.XX</td></tr><tr><td style="padding:8px 0;color:#6b7280;">Shipping</td><td style="padding:8px 0;text-align:right;">FREE</td></tr><tr style="border-top:2px solid #e5e7eb;"><td style="padding:12px 0;font-weight:700;">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;">$XX.XX</td></tr></table>' } },
      { type: 'button', properties: { ...BLOCK_DEFAULTS.button, text: 'Track Your Order', backgroundColor: '#1e293b' } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer } },
    ],
  },
  {
    name: 'Product Showcase',
    description: 'Showcase products with CTAs',
    icon: '🛍️',
    settings: { backgroundColor: '#f4f4f4', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: 'Check out our latest products' },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header, backgroundColor: '#0f172a', companyName: '{{company_name}}' } },
      { type: 'hero', properties: { ...BLOCK_DEFAULTS.hero, heading: 'Our Latest Products', subheading: 'Handpicked just for you, {{firstName}}', backgroundColor: '#0f172a', textColor: '#ffffff', buttonText: 'Shop All', buttonColor: '#3b82f6' } },
      { type: 'products', properties: { ...BLOCK_DEFAULTS.products } },
      { type: 'divider', properties: { ...BLOCK_DEFAULTS.divider } },
      { type: 'social', properties: { ...BLOCK_DEFAULTS.social } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer } },
    ],
  },
  {
    name: 'Event Invite',
    description: 'Invite contacts to an event',
    icon: '🎫',
    settings: { backgroundColor: '#1e1b4b', contentBackgroundColor: '#1e1b4b', fontFamily: 'Arial', contentWidth: 600, preheader: "You're invited!" },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header, backgroundColor: '#312e81', companyName: '{{company_name}}' } },
      { type: 'hero', properties: { ...BLOCK_DEFAULTS.hero, heading: "You're Invited! 🎉", subheading: '{{event_name}} – {{event_date}}', backgroundColor: '#312e81', textColor: '#ffffff', buttonText: 'RSVP Now', buttonColor: '#7c3aed' } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, backgroundColor: '#1e1b4b', color: '#e2e8f0', content: '<p>Hi {{firstName}},</p><p>We are thrilled to invite you to <strong>{{event_name}}</strong>. Join us for an unforgettable experience.</p><p>📅 <strong>Date:</strong> {{event_date}}<br>📍 <strong>Location:</strong> {{event_location}}</p>' } },
      { type: 'button', properties: { ...BLOCK_DEFAULTS.button, text: 'Reserve Your Spot', backgroundColor: '#7c3aed', containerBg: '#1e1b4b' } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer, backgroundColor: '#312e81', textColor: '#a5b4fc' } },
    ],
  },
  {
    name: 'Testimonial Focus',
    description: 'Social proof campaign',
    icon: '⭐',
    settings: { backgroundColor: '#f8fafc', contentBackgroundColor: '#ffffff', fontFamily: 'Arial', contentWidth: 600, preheader: 'See what our customers say' },
    blocks: [
      { type: 'header', properties: { ...BLOCK_DEFAULTS.header } },
      { type: 'text', properties: { ...BLOCK_DEFAULTS.text, content: '<h2 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">What Our Customers Say</h2><p>Join thousands of happy customers who love our product.</p>' } },
      { type: 'testimonial', properties: { ...BLOCK_DEFAULTS.testimonial } },
      { type: 'testimonial', properties: { ...BLOCK_DEFAULTS.testimonial, name: 'Bob Johnson', title: 'Product Manager', company: 'Startup Inc', quote: 'The best tool we have used in years. Our productivity doubled overnight!' } },
      { type: 'button', properties: { ...BLOCK_DEFAULTS.button, text: 'Start Your Free Trial', backgroundColor: '#059669' } },
      { type: 'footer', properties: { ...BLOCK_DEFAULTS.footer } },
    ],
  },
];

/**
 * Extract template variables from blocks (anything in {{ }})
 */
export function extractVariables(blocks) {
  const vars = new Set();
  const regex = /\{\{\s*(\w+)\s*\}\}/g;
  
  function scan(obj) {
    if (typeof obj === 'string') {
      let match;
      while ((match = regex.exec(obj)) !== null) {
        vars.add(match[1]);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(scan);
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(scan);
    }
  }
  
  scan(blocks);
  return Array.from(vars);
}
