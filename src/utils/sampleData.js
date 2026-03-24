// Seed data for development and demo purposes

export const sampleContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Tech Corp',
    notes: 'CEO and founder',
    status: 'active',
    groupId: 1, // VIP Customers
    tags: ['premium', 'tech'],
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    company: 'Design Studio',
    notes: 'Creative director',
    status: 'active',
    groupId: 2, // Newsletter Subscribers
    tags: ['design', 'creative'],
    createdAt: '2024-01-16T10:00:00.000Z',
    updatedAt: '2024-01-16T10:00:00.000Z',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1234567892',
    company: 'Marketing Agency',
    notes: 'Marketing manager',
    status: 'active',
    groupId: 3, // Potential Leads
    tags: ['marketing', 'lead'],
    createdAt: '2024-01-17T10:00:00.000Z',
    updatedAt: '2024-01-17T10:00:00.000Z',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    phone: '+1234567893',
    company: 'E-commerce Inc',
    notes: 'Product manager',
    status: 'active',
    groupId: 1, // VIP Customers
    tags: ['ecommerce', 'premium'],
    createdAt: '2024-01-18T10:00:00.000Z',
    updatedAt: '2024-01-18T10:00:00.000Z',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '+1234567894',
    company: 'Software Solutions',
    notes: 'CTO',
    status: 'active',
    groupId: 2, // Newsletter Subscribers
    tags: ['software', 'tech'],
    createdAt: '2024-01-19T10:00:00.000Z',
    updatedAt: '2024-01-19T10:00:00.000Z',
  },
  {
    id: '6',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    phone: '+1234567895',
    company: 'Startup Inc',
    notes: 'Founder',
    status: 'unsubscribed',
    groupId: null,
    tags: ['startup'],
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
  },
  {
    id: '7',
    firstName: 'Robert',
    lastName: 'Miller',
    email: 'robert.miller@example.com',
    phone: '+1234567896',
    company: 'Consulting Group',
    notes: 'Senior consultant',
    status: 'bounced',
    groupId: 3, // Potential Leads
    tags: ['consulting'],
    createdAt: '2024-01-21T10:00:00.000Z',
    updatedAt: '2024-01-21T10:00:00.000Z',
  },
  {
    id: '8',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1234567897',
    company: 'Media Corp',
    notes: 'Content strategist',
    status: 'active',
    groupId: 2, // Newsletter Subscribers
    tags: ['media', 'content'],
    createdAt: '2024-01-22T10:00:00.000Z',
    updatedAt: '2024-01-22T10:00:00.000Z',
  },
];

export const sampleTemplates = [
  // ─── 1. Welcome Email ────────────────────────────────────────────────────────
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}, {{firstName}}! 🎉',
    category: 'welcome',
    status: 'active',
    variables: ['firstName', 'company', 'email', 'ctaUrl'],
    textContent: 'Welcome {{firstName}}! We\'re thrilled to have you join {{company}}. Get started today.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome</title></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4ff;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,0.10);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:48px 40px 40px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:32px;line-height:64px;">✨</div>
        <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:-0.5px;">Welcome aboard!</h1>
        <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:16px;">We're so excited to have you with us</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px 40px 32px;">
        <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">Hi <strong>{{firstName}}</strong>,</p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7;">Thanks for joining <strong style="color:#6366f1;">{{company}}</strong>. Your account has been created successfully and you're all set to get started. We can't wait to show you everything we've built for you.</p>
        <!-- Feature boxes -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
          <tr>
            <td width="32%" style="background:#f5f3ff;border-radius:12px;padding:20px 16px;text-align:center;vertical-align:top;">
              <div style="font-size:28px;margin-bottom:8px;">🚀</div>
              <div style="font-size:13px;font-weight:600;color:#4f46e5;">Quick Setup</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Ready in minutes</div>
            </td>
            <td width="4%"></td>
            <td width="32%" style="background:#ecfdf5;border-radius:12px;padding:20px 16px;text-align:center;vertical-align:top;">
              <div style="font-size:28px;margin-bottom:8px;">💡</div>
              <div style="font-size:13px;font-weight:600;color:#059669;">Smart Tools</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Built for you</div>
            </td>
            <td width="4%"></td>
            <td width="32%" style="background:#fff7ed;border-radius:12px;padding:20px 16px;text-align:center;vertical-align:top;">
              <div style="font-size:28px;margin-bottom:8px;">🔒</div>
              <div style="font-size:13px;font-weight:600;color:#d97706;">Secure</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Your data is safe</div>
            </td>
          </tr>
        </table>
        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
          <tr><td align="center">
            <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:15px 40px;border-radius:50px;letter-spacing:0.3px;">Get Started Now →</a>
          </td></tr>
        </table>
        <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">Your email: <strong>{{email}}</strong></p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #f3f4f6;">
        <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">© 2026 {{company}}. All rights reserved.</p>
        <p style="margin:0;font-size:12px;"><a href="#" style="color:#6366f1;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#6366f1;text-decoration:none;">Privacy Policy</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },

  // ─── 2. Monthly Newsletter ────────────────────────────────────────────────────
  {
    id: '2',
    name: 'Monthly Newsletter',
    subject: '{{month}} Newsletter — What\'s new at {{company}}',
    category: 'newsletter',
    status: 'active',
    variables: ['firstName', 'month', 'company', 'articleTitle1', 'articleTitle2', 'articleTitle3'],
    textContent: 'Hi {{firstName}}, here\'s your {{month}} newsletter from {{company}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Newsletter</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <!-- Logo Bar -->
      <tr><td style="background:#111827;padding:20px 40px;border-radius:12px 12px 0 0;text-align:center;">
        <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-1px;">{{company}}</span>
        <span style="color:#6b7280;font-size:13px;margin-left:10px;">| Monthly Digest</span>
      </td></tr>
      <!-- Hero -->
      <tr><td style="background:linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%);padding:48px 40px;text-align:center;">
        <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:2px;">{{month}} Edition</p>
        <h1 style="margin:0 0 16px;color:#f8fafc;font-size:32px;font-weight:800;line-height:1.2;">Your Monthly<br><span style="color:#38bdf8;">Roundup</span></h1>
        <p style="margin:0;color:#94a3b8;font-size:15px;">The best stories, updates, and insights — curated for you</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:#ffffff;padding:40px;">
        <p style="margin:0 0 28px;color:#374151;font-size:16px;">Hi <strong>{{firstName}}</strong> 👋</p>
        <!-- Article 1 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#eff6ff;padding:4px 16px;"><span style="color:#3b82f6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Feature</span></td></tr>
          <tr><td style="padding:20px 20px 16px;">
            <h3 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">{{articleTitle1}}</h3>
            <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.6;">Discover the latest developments and insights tailored especially for our community members this month.</p>
            <a href="#" style="color:#3b82f6;font-size:13px;font-weight:600;text-decoration:none;">Read more →</a>
          </td></tr>
        </table>
        <!-- Article 2 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#f0fdf4;padding:4px 16px;"><span style="color:#16a34a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tips</span></td></tr>
          <tr><td style="padding:20px 20px 16px;">
            <h3 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">{{articleTitle2}}</h3>
            <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.6;">Practical advice and pro tips from our team to help you make the most of your experience.</p>
            <a href="#" style="color:#16a34a;font-size:13px;font-weight:600;text-decoration:none;">Read more →</a>
          </td></tr>
        </table>
        <!-- Article 3 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#fdf4ff;padding:4px 16px;"><span style="color:#a855f7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Community</span></td></tr>
          <tr><td style="padding:20px 20px 16px;">
            <h3 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">{{articleTitle3}}</h3>
            <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.6;">See what our community has been up to and get inspired by stories from fellow members.</p>
            <a href="#" style="color:#a855f7;font-size:13px;font-weight:600;text-decoration:none;">Read more →</a>
          </td></tr>
        </table>
        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center">
            <a href="#" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">View All Stories</a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f1f5f9;padding:24px 40px;border-radius:0 0 12px 12px;text-align:center;">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">You're receiving this because you subscribed to {{company}} updates.</p>
        <p style="margin:0;font-size:12px;"><a href="#" style="color:#64748b;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#64748b;text-decoration:none;">Manage Preferences</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-11T10:00:00.000Z',
    updatedAt: '2024-01-11T10:00:00.000Z',
  },

  // ─── 3. Flash Sale / Promotion ───────────────────────────────────────────────
  {
    id: '3',
    name: 'Flash Sale Promotion',
    subject: '⚡ {{discount}}% OFF — Sale ends in 24 hours!',
    category: 'promotional',
    status: 'active',
    variables: ['firstName', 'discount', 'company', 'promoCode', 'saleEndDate', 'ctaUrl'],
    textContent: 'Hi {{firstName}}, our flash sale starts now — {{discount}}% off everything with code {{promoCode}}. Hurry, offer ends {{saleEndDate}}!',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flash Sale</title></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(234,88,12,0.15);">
      <!-- Urgency Banner -->
      <tr><td style="background:#dc2626;padding:10px 40px;text-align:center;">
        <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;">⏰ LIMITED TIME OFFER — ENDS {{saleEndDate}}</span>
      </td></tr>
      <!-- Hero -->
      <tr><td style="background:linear-gradient(135deg,#ea580c 0%,#dc2626 50%,#9333ea 100%);padding:56px 40px;text-align:center;">
        <p style="margin:0 0 12px;color:rgba(255,255,255,0.8);font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:3px;">Flash Sale</p>
        <div style="margin:0 0 8px;">
          <span style="color:#fbbf24;font-size:96px;font-weight:900;line-height:1;display:block;">{{discount}}%</span>
          <span style="color:#ffffff;font-size:32px;font-weight:800;letter-spacing:-1px;display:block;">OFF EVERYTHING</span>
        </div>
        <p style="margin:24px 0 0;color:rgba(255,255,255,0.85);font-size:16px;">Hey {{firstName}}, this one's just for you</p>
      </td></tr>
      <!-- Code Box -->
      <tr><td style="padding:32px 40px;text-align:center;">
        <p style="margin:0 0 16px;color:#374151;font-size:16px;">Use this exclusive code at checkout:</p>
        <div style="background:#fff7ed;border:2px dashed #f97316;border-radius:12px;padding:20px 32px;display:inline-block;margin:0 auto;">
          <span style="font-size:28px;font-weight:800;color:#ea580c;letter-spacing:6px;">{{promoCode}}</span>
        </div>
        <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">Copy &amp; paste at checkout</p>
      </td></tr>
      <!-- Products Grid -->
      <tr><td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="30%" style="background:#f9fafb;border-radius:12px;padding:24px 16px;text-align:center;vertical-align:top;">
              <div style="font-size:36px;margin-bottom:8px;">👕</div>
              <div style="font-size:13px;font-weight:600;color:#111827;">Apparel</div>
              <div style="font-size:12px;color:#ef4444;font-weight:700;margin-top:4px;">{{discount}}% OFF</div>
            </td>
            <td width="5%"></td>
            <td width="30%" style="background:#f9fafb;border-radius:12px;padding:24px 16px;text-align:center;vertical-align:top;">
              <div style="font-size:36px;margin-bottom:8px;">💻</div>
              <div style="font-size:13px;font-weight:600;color:#111827;">Electronics</div>
              <div style="font-size:12px;color:#ef4444;font-weight:700;margin-top:4px;">{{discount}}% OFF</div>
            </td>
            <td width="5%"></td>
            <td width="30%" style="background:#f9fafb;border-radius:12px;padding:24px 16px;text-align:center;vertical-align:top;">
              <div style="font-size:36px;margin-bottom:8px;">🏠</div>
              <div style="font-size:13px;font-weight:600;color:#111827;">Home</div>
              <div style="font-size:12px;color:#ef4444;font-weight:700;margin-top:4px;">{{discount}}% OFF</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:0 40px 40px;text-align:center;">
        <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#dc2626);color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;padding:18px 48px;border-radius:50px;box-shadow:0 4px 16px rgba(220,38,38,0.35);">Shop the Sale Now</a>
        <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">Free shipping on orders over $50 · No minimum required</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#ea580c;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-12T10:00:00.000Z',
    updatedAt: '2024-01-12T10:00:00.000Z',
  },

  // ─── 4. Product Launch ───────────────────────────────────────────────────────
  {
    id: '4',
    name: 'Product Launch',
    subject: '🚀 Introducing {{productName}} — Built for you',
    category: 'product',
    status: 'active',
    variables: ['firstName', 'productName', 'company', 'productTagline', 'ctaUrl'],
    textContent: 'Hi {{firstName}}, we\'re thrilled to introduce {{productName}} from {{company}}. {{productTagline}}',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Product Launch</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid #334155;">
      <!-- Nav bar -->
      <tr><td style="padding:20px 36px;border-bottom:1px solid #334155;">
        <span style="color:#94a3b8;font-size:15px;font-weight:700;">{{company}}</span>
      </td></tr>
      <!-- Hero -->
      <tr><td style="padding:56px 40px 40px;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#06b6d4);padding:2px;border-radius:50%;margin-bottom:24px;">
          <div style="background:#1e293b;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-size:40px;line-height:80px;">🚀</div>
        </div>
        <p style="margin:0 0 8px;color:#38bdf8;font-size:12px;text-transform:uppercase;letter-spacing:3px;font-weight:700;">New Release</p>
        <h1 style="margin:0 0 16px;color:#f8fafc;font-size:38px;font-weight:900;line-height:1.1;letter-spacing:-1.5px;">{{productName}}</h1>
        <p style="margin:0;color:#94a3b8;font-size:18px;line-height:1.6;max-width:440px;margin:0 auto;">{{productTagline}}</p>
      </td></tr>
      <!-- Features -->
      <tr><td style="padding:8px 40px 40px;">
        <!-- Feature 1 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;border-radius:12px;margin-bottom:12px;border:1px solid #334155;">
          <tr>
            <td style="padding:20px;width:56px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">⚡</div>
            </td>
            <td style="padding:20px 20px 20px 0;">
              <div style="color:#f1f5f9;font-size:15px;font-weight:700;margin-bottom:4px;">Blazing Fast Performance</div>
              <div style="color:#64748b;font-size:13px;line-height:1.5;">Engineered from the ground up for speed. Every millisecond counts.</div>
            </td>
          </tr>
        </table>
        <!-- Feature 2 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;border-radius:12px;margin-bottom:12px;border:1px solid #334155;">
          <tr>
            <td style="padding:20px;width:56px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#06b6d4,#0ea5e9);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🔐</div>
            </td>
            <td style="padding:20px 20px 20px 0;">
              <div style="color:#f1f5f9;font-size:15px;font-weight:700;margin-bottom:4px;">Enterprise-Grade Security</div>
              <div style="color:#64748b;font-size:13px;line-height:1.5;">Your data is protected with end-to-end encryption and zero-trust architecture.</div>
            </td>
          </tr>
        </table>
        <!-- Feature 3 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;border-radius:12px;border:1px solid #334155;">
          <tr>
            <td style="padding:20px;width:56px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#10b981,#059669);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📊</div>
            </td>
            <td style="padding:20px 20px 20px 0;">
              <div style="color:#f1f5f9;font-size:15px;font-weight:700;margin-bottom:4px;">Powerful Analytics</div>
              <div style="color:#64748b;font-size:13px;line-height:1.5;">Real-time dashboards and insights that help you make smarter decisions.</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:8px 40px 48px;text-align:center;">
        <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 44px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 20px rgba(99,102,241,0.4);">Try {{productName}} Free →</a>
        <p style="margin:12px 0 0;color:#475569;font-size:12px;">No credit card required · Free for 14 days</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
        <p style="margin:0;color:#475569;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#6366f1;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-13T10:00:00.000Z',
    updatedAt: '2024-01-13T10:00:00.000Z',
  },

  // ─── 5. Event Invitation ─────────────────────────────────────────────────────
  {
    id: '5',
    name: 'Event Invitation',
    subject: 'You\'re invited 🎟️ — {{eventName}}',
    category: 'event',
    status: 'active',
    variables: ['firstName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'company', 'ctaUrl'],
    textContent: 'Dear {{firstName}}, you are cordially invited to {{eventName}} on {{eventDate}} at {{eventTime}}, {{eventLocation}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Event Invitation</title></head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdf2f8;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(219,39,119,0.12);">
      <!-- Decorative Top -->
      <tr><td style="background:linear-gradient(135deg,#ec4899 0%,#8b5cf6 50%,#06b6d4 100%);height:8px;"></td></tr>
      <!-- Header -->
      <tr><td style="padding:48px 40px 32px;text-align:center;">
        <p style="margin:0 0 8px;color:#ec4899;font-size:12px;text-transform:uppercase;letter-spacing:3px;font-weight:700;">You're Invited</p>
        <h1 style="margin:0 0 12px;color:#111827;font-size:30px;font-weight:800;line-height:1.2;">{{eventName}}</h1>
        <p style="margin:0;color:#6b7280;font-size:16px;">Hi <strong>{{firstName}}</strong>, we'd love to see you there</p>
      </td></tr>
      <!-- Event Details Card -->
      <tr><td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-radius:16px;overflow:hidden;border:1px solid #fbcfe8;">
          <tr>
            <td width="50%" style="padding:24px;vertical-align:top;border-right:1px solid #fbcfe8;">
              <div style="color:#ec4899;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:8px;">📅 Date</div>
              <div style="color:#111827;font-size:18px;font-weight:700;">{{eventDate}}</div>
            </td>
            <td width="50%" style="padding:24px;vertical-align:top;">
              <div style="color:#ec4899;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:8px;">⏰ Time</div>
              <div style="color:#111827;font-size:18px;font-weight:700;">{{eventTime}}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 24px 24px;border-top:1px solid #fbcfe8;">
              <div style="color:#ec4899;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:8px;">📍 Location</div>
              <div style="color:#111827;font-size:16px;font-weight:600;">{{eventLocation}}</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Description -->
      <tr><td style="padding:0 40px 32px;">
        <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.7;text-align:center;">Join us for an unforgettable evening of inspiration, connection, and celebration. This is an event you won't want to miss!</p>
      </td></tr>
      <!-- RSVP Buttons -->
      <tr><td style="padding:0 40px 40px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 auto;">
          <tr>
            <td style="padding-right:12px;">
              <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:50px;">✓ Yes, I'll be there!</a>
            </td>
            <td>
              <a href="#" style="display:inline-block;background:#f9fafb;color:#6b7280;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:50px;border:2px solid #e5e7eb;">Decline</a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">RSVP by {{eventDate}}</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">Hosted by {{company}} · <a href="#" style="color:#ec4899;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-14T10:00:00.000Z',
    updatedAt: '2024-01-14T10:00:00.000Z',
  },

  // ─── 6. Order Confirmation ───────────────────────────────────────────────────
  {
    id: '6',
    name: 'Order Confirmation',
    subject: 'Order Confirmed ✅ — #{{orderNumber}}',
    category: 'transactional',
    status: 'active',
    variables: ['firstName', 'orderNumber', 'orderDate', 'orderTotal', 'company', 'shippingAddress', 'deliveryDate'],
    textContent: 'Hi {{firstName}}, your order #{{orderNumber}} has been confirmed. Total: {{orderTotal}}. Expected delivery: {{deliveryDate}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(5,150,105,0.10);">
      <!-- Success Header -->
      <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:40px;text-align:center;">
        <div style="width:72px;height:72px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;text-align:center;line-height:72px;font-size:36px;">✅</div>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:700;">Order Confirmed!</h1>
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">Thanks for your purchase, {{firstName}}!</p>
      </td></tr>
      <!-- Order Number Banner -->
      <tr><td style="background:#f0fdf4;padding:16px 40px;text-align:center;border-bottom:1px solid #d1fae5;">
        <span style="color:#6b7280;font-size:13px;">Order Number: </span>
        <span style="color:#059669;font-size:16px;font-weight:800;letter-spacing:1px;">#{{orderNumber}}</span>
        <span style="color:#6b7280;font-size:13px;margin-left:16px;">Date: {{orderDate}}</span>
      </td></tr>
      <!-- Details -->
      <tr><td style="padding:32px 40px;">
        <!-- Order Summary -->
        <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;">Order Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
          <tr style="background:#f9fafb;">
            <td style="padding:12px 16px;color:#374151;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Product</td>
            <td style="padding:12px 16px;color:#374151;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;text-align:right;">Amount</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Your items</td>
            <td style="padding:14px 16px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">{{orderTotal}}</td>
          </tr>
          <tr style="background:#f0fdf4;">
            <td style="padding:14px 16px;color:#059669;font-size:14px;font-weight:700;">Total</td>
            <td style="padding:14px 16px;color:#059669;font-size:16px;font-weight:800;text-align:right;">{{orderTotal}}</td>
          </tr>
        </table>
        <!-- Delivery Info -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48%" style="background:#f9fafb;border-radius:12px;padding:20px;vertical-align:top;">
              <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;">📦 Shipping To</div>
              <div style="color:#111827;font-size:14px;font-weight:600;line-height:1.5;">{{shippingAddress}}</div>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f9fafb;border-radius:12px;padding:20px;vertical-align:top;">
              <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;">🚚 Expected Delivery</div>
              <div style="color:#059669;font-size:16px;font-weight:700;">{{deliveryDate}}</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:0 40px 40px;text-align:center;">
        <a href="#" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 36px;border-radius:8px;">Track Your Order</a>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">Questions? Reply to this email · © 2026 {{company}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },

  // ─── 7. Password Reset ───────────────────────────────────────────────────────
  {
    id: '7',
    name: 'Password Reset',
    subject: 'Reset your {{company}} password',
    category: 'transactional',
    status: 'active',
    variables: ['firstName', 'company', 'resetUrl', 'expiryTime'],
    textContent: 'Hi {{firstName}}, use this link to reset your password: {{resetUrl}}. This link expires in {{expiryTime}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Password Reset</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <!-- Header -->
      <tr><td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #f3f4f6;">
        <span style="color:#111827;font-size:22px;font-weight:800;">{{company}}</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:48px 40px 40px;text-align:center;">
        <div style="width:80px;height:80px;background:#fef3c7;border-radius:50%;margin:0 auto 24px;text-align:center;line-height:80px;font-size:40px;">🔐</div>
        <h1 style="margin:0 0 12px;color:#111827;font-size:26px;font-weight:700;">Reset your password</h1>
        <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.7;max-width:400px;margin:0 auto 32px;">Hi <strong>{{firstName}}</strong>, we received a request to reset your password. Click the button below to choose a new one.</p>
        <a href="{{resetUrl}}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Reset Password</a>
        <!-- Expiry notice -->
        <div style="margin:28px auto 0;background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 20px;max-width:380px;">
          <p style="margin:0;color:#713f12;font-size:13px;">⏰ This link expires in <strong>{{expiryTime}}</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </td></tr>
      <!-- Security note -->
      <tr><td style="padding:0 40px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f9ff;border-radius:12px;padding:20px;border:1px solid #bae6fd;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 8px;color:#0369a1;font-size:13px;font-weight:700;">🛡️ Security Tip</p>
            <p style="margin:0;color:#0c4a6e;font-size:13px;line-height:1.5;">Never share this link with anyone. {{company}} will never ask for your password via email or phone.</p>
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · This is an automated message, please do not reply</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-16T10:00:00.000Z',
    updatedAt: '2024-01-16T10:00:00.000Z',
  },

  // ─── 8. Re-engagement / Win-back ────────────────────────────────────────────
  {
    id: '8',
    name: 'Re-engagement / Win-back',
    subject: 'We miss you, {{firstName}} 💙 — Come back!',
    category: 'promotional',
    status: 'active',
    variables: ['firstName', 'company', 'offerDiscount', 'promoCode', 'ctaUrl'],
    textContent: 'Hi {{firstName}}, we haven\'t seen you in a while! Come back with {{offerDiscount}}% off using code {{promoCode}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>We miss you</title></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eff6ff;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 28px rgba(59,130,246,0.12);">
      <!-- Hero -->
      <tr><td style="background:linear-gradient(160deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%);padding:56px 40px;text-align:center;">
        <div style="font-size:64px;margin-bottom:16px;">💙</div>
        <h1 style="margin:0 0 12px;color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;">We miss you,<br>{{firstName}}!</h1>
        <p style="margin:0;color:rgba(255,255,255,0.8);font-size:16px;">It's been a while since we last saw you at {{company}}</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px;">
        <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;text-align:center;">We noticed you haven't been around lately, and we want to make it worth your while to come back. Here's a special gift just for you:</p>
        <!-- Offer box -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:16px;margin-bottom:32px;border:2px solid #93c5fd;">
          <tr><td style="padding:32px;text-align:center;">
            <div style="color:#1d4ed8;font-size:14px;font-weight:600;margin-bottom:8px;">LIMITED TIME OFFER</div>
            <div style="color:#1e40af;font-size:60px;font-weight:900;line-height:1;margin-bottom:4px;">{{offerDiscount}}%</div>
            <div style="color:#1e40af;font-size:20px;font-weight:700;margin-bottom:20px;">OFF YOUR NEXT ORDER</div>
            <div style="background:#1d4ed8;border-radius:10px;padding:12px 24px;display:inline-block;">
              <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:4px;">{{promoCode}}</span>
            </div>
          </td></tr>
        </table>
        <p style="margin:0 0 8px;color:#6b7280;font-size:14px;text-align:center;">Here's what's new since you left:</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
          <tr>
            <td style="padding:8px 0;color:#374151;font-size:14px;">✨ New features &amp; improvements</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151;font-size:14px;">📦 Exciting new products added</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151;font-size:14px;">🎁 Exclusive member rewards program</td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center">
            <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;box-shadow:0 4px 16px rgba(29,78,216,0.3);">Come Back &amp; Save {{offerDiscount}}%</a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#3b82f6;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-17T10:00:00.000Z',
    updatedAt: '2024-01-17T10:00:00.000Z',
  },

  // ─── 9. Abandoned Cart ───────────────────────────────────────────────────────
  {
    id: '9',
    name: 'Abandoned Cart Recovery',
    subject: '🛒 You forgot something, {{firstName}}…',
    category: 'transactional',
    status: 'active',
    variables: ['firstName', 'company', 'cartTotal', 'itemCount', 'ctaUrl'],
    textContent: 'Hi {{firstName}}, you left {{itemCount}} item(s) worth {{cartTotal}} in your cart. Complete your order before they\'re gone!',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Abandoned Cart</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <!-- Header -->
      <tr><td style="padding:20px 40px;text-align:center;border-bottom:3px solid #f97316;">
        <span style="color:#111827;font-size:20px;font-weight:800;">{{company}}</span>
      </td></tr>
      <!-- Hero -->
      <tr><td style="padding:48px 40px 32px;text-align:center;">
        <div style="font-size:72px;margin-bottom:16px;">🛒</div>
        <h1 style="margin:0 0 12px;color:#111827;font-size:28px;font-weight:800;">Your cart is waiting!</h1>
        <p style="margin:0;color:#6b7280;font-size:16px;line-height:1.6;">Hey <strong>{{firstName}}</strong>, you left <strong>{{itemCount}} item(s)</strong> behind worth <strong style="color:#f97316;">{{cartTotal}}</strong></p>
      </td></tr>
      <!-- Cart Visual -->
      <tr><td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
          <tr>
            <td style="padding:20px;width:72px;vertical-align:top;">
              <div style="width:56px;height:56px;background:#f97316;border-radius:10px;text-align:center;line-height:56px;font-size:28px;">📦</div>
            </td>
            <td style="padding:20px 20px 20px 0;vertical-align:middle;">
              <div style="color:#111827;font-size:15px;font-weight:700;">{{itemCount}} item(s) in cart</div>
              <div style="color:#6b7280;font-size:13px;margin-top:4px;">These items might sell out soon</div>
            </td>
            <td style="padding:20px;text-align:right;vertical-align:middle;">
              <div style="color:#f97316;font-size:20px;font-weight:800;">{{cartTotal}}</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Urgency -->
      <tr><td style="padding:0 40px 24px;text-align:center;">
        <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">⚠️ Items in your cart are not reserved — <br>complete your order before they run out!</p>
      </td></tr>
      <!-- Trust badges -->
      <tr><td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align:center;padding:0 8px;">
              <div style="font-size:24px;margin-bottom:4px;">🚚</div>
              <div style="color:#374151;font-size:12px;font-weight:600;">Free Shipping</div>
            </td>
            <td style="text-align:center;padding:0 8px;">
              <div style="font-size:24px;margin-bottom:4px;">🔒</div>
              <div style="color:#374151;font-size:12px;font-weight:600;">Secure Checkout</div>
            </td>
            <td style="text-align:center;padding:0 8px;">
              <div style="font-size:24px;margin-bottom:4px;">↩️</div>
              <div style="color:#374151;font-size:12px;font-weight:600;">Easy Returns</div>
            </td>
            <td style="text-align:center;padding:0 8px;">
              <div style="font-size:24px;margin-bottom:4px;">💬</div>
              <div style="color:#374151;font-size:12px;font-weight:600;">24/7 Support</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:0 40px 48px;text-align:center;">
        <a href="{{ctaUrl}}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;padding:17px 48px;border-radius:50px;box-shadow:0 4px 16px rgba(249,115,22,0.35);">Complete My Order →</a>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#f97316;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-18T10:00:00.000Z',
    updatedAt: '2024-01-18T10:00:00.000Z',
  },

  // ─── 10. Customer Thank You ──────────────────────────────────────────────────
  {
    id: '10',
    name: 'Customer Thank You',
    subject: 'Thank you, {{firstName}} 🙏 — You mean the world to us',
    category: 'transactional',
    status: 'active',
    variables: ['firstName', 'company', 'reviewUrl'],
    textContent: 'Thank you so much, {{firstName}}! We truly appreciate your support of {{company}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thank You</title></head>
<body style="margin:0;padding:0;background:#fefce8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fefce8;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(234,179,8,0.15);">
      <!-- Hero -->
      <tr><td style="background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#d97706 100%);padding:56px 40px;text-align:center;">
        <div style="font-size:72px;margin-bottom:16px;">🙏</div>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:34px;font-weight:900;letter-spacing:-1px;">Thank You!</h1>
        <p style="margin:0;color:rgba(255,255,255,0.9);font-size:17px;">{{firstName}}, you are absolutely amazing</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:48px 40px;">
        <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;text-align:center;">We are incredibly grateful for your continued trust and support. Customers like you are the reason we do what we do at <strong>{{company}}</strong>.</p>
        <!-- Stars -->
        <div style="text-align:center;margin:0 0 32px;">
          <span style="font-size:32px;color:#fbbf24;">★★★★★</span>
        </div>
        <!-- Quote box -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fefce8;border-left:4px solid #fbbf24;border-radius:0 12px 12px 0;margin-bottom:32px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0;color:#92400e;font-size:15px;line-height:1.7;font-style:italic;">"Your satisfaction is our greatest achievement. Thank you for choosing us and being part of our journey."</p>
            <p style="margin:12px 0 0;color:#b45309;font-size:13px;font-weight:700;">— The {{company}} Team</p>
          </td></tr>
        </table>
        <!-- Leave a review -->
        <p style="margin:0 0 16px;color:#374151;font-size:15px;text-align:center;font-weight:600;">Would you mind sharing your experience?</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center">
            <a href="{{reviewUrl}}" style="display:inline-block;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;box-shadow:0 4px 16px rgba(245,158,11,0.35);">⭐ Leave a Review</a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #fde68a;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#f59e0b;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-19T10:00:00.000Z',
    updatedAt: '2024-01-19T10:00:00.000Z',
  },

  // ─── 11. Referral Program ────────────────────────────────────────────────────
  {
    id: '11',
    name: 'Referral Program',
    subject: '🎁 Earn {{rewardAmount}} — Invite your friends to {{company}}',
    category: 'promotional',
    status: 'active',
    variables: ['firstName', 'company', 'rewardAmount', 'referralCode', 'referralUrl'],
    textContent: 'Hi {{firstName}}, share {{company}} with friends and earn {{rewardAmount}} for each referral using code {{referralCode}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Referral Program</title></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ff;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(139,92,246,0.15);">
      <!-- Hero -->
      <tr><td style="background:linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#4f46e5 100%);padding:52px 40px;text-align:center;">
        <div style="font-size:64px;margin-bottom:16px;">🎁</div>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:32px;font-weight:900;line-height:1.2;">Share the love,<br>earn rewards!</h1>
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:16px;">Invite friends to {{company}} and both of you win</p>
      </td></tr>
      <!-- How it works -->
      <tr><td style="padding:40px 40px 32px;">
        <h2 style="margin:0 0 24px;color:#111827;font-size:20px;font-weight:700;text-align:center;">How it works</h2>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="30%" style="text-align:center;padding:0 8px;vertical-align:top;">
              <div style="width:48px;height:48px;background:#ede9fe;border-radius:50%;margin:0 auto 12px;text-align:center;line-height:48px;font-size:22px;">📤</div>
              <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:4px;">Share Your Link</div>
              <div style="font-size:12px;color:#9ca3af;">Share with friends &amp; family</div>
            </td>
            <td width="5%" style="text-align:center;color:#d1d5db;font-size:24px;vertical-align:middle;">→</td>
            <td width="30%" style="text-align:center;padding:0 8px;vertical-align:top;">
              <div style="width:48px;height:48px;background:#ede9fe;border-radius:50%;margin:0 auto 12px;text-align:center;line-height:48px;font-size:22px;">👥</div>
              <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:4px;">Friends Sign Up</div>
              <div style="font-size:12px;color:#9ca3af;">They create an account</div>
            </td>
            <td width="5%" style="text-align:center;color:#d1d5db;font-size:24px;vertical-align:middle;">→</td>
            <td width="30%" style="text-align:center;padding:0 8px;vertical-align:top;">
              <div style="width:48px;height:48px;background:#ede9fe;border-radius:50%;margin:0 auto 12px;text-align:center;line-height:48px;font-size:22px;">💰</div>
              <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:4px;">Both Earn</div>
              <div style="font-size:12px;color:#9ca3af;">You both get {{rewardAmount}}</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Reward Card -->
      <tr><td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:16px;border:2px solid #ddd6fe;">
          <tr><td style="padding:28px;text-align:center;">
            <div style="color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:8px;">Your Referral Code</div>
            <div style="background:#7c3aed;display:inline-block;border-radius:10px;padding:12px 28px;margin-bottom:16px;">
              <span style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:5px;">{{referralCode}}</span>
            </div>
            <div style="color:#6b7280;font-size:13px;">Share this code or your unique link below</div>
          </td></tr>
        </table>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:0 40px 48px;text-align:center;">
        <a href="{{referralUrl}}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 44px;border-radius:50px;box-shadow:0 4px 20px rgba(124,58,237,0.35);">Share &amp; Earn {{rewardAmount}}</a>
        <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">No limit on referrals · Rewards paid instantly</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#7c3aed;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
  },

  // ─── 12. Feedback / Survey ───────────────────────────────────────────────────
  {
    id: '12',
    name: 'Feedback & Survey',
    subject: 'How was your experience, {{firstName}}? (2 mins)',
    category: 'other',
    status: 'active',
    variables: ['firstName', 'company', 'surveyUrl', 'incentive'],
    textContent: 'Hi {{firstName}}, we\'d love your feedback on {{company}}. Complete our quick survey and get {{incentive}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Feedback Survey</title></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdfa;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(20,184,166,0.12);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%);padding:48px 40px;text-align:center;">
        <div style="font-size:64px;margin-bottom:16px;">💬</div>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:28px;font-weight:800;">Your opinion matters!</h1>
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">Help us improve your experience at {{company}}</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px;">
        <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>{{firstName}}</strong>,</p>
        <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.7;">We're always looking to improve, and your feedback is incredibly valuable to us. This quick survey takes less than 2 minutes to complete.</p>
        <!-- Rating prompt -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdfa;border-radius:16px;margin-bottom:28px;">
          <tr><td style="padding:24px;text-align:center;">
            <p style="margin:0 0 16px;color:#0f766e;font-size:15px;font-weight:600;">How would you rate your overall experience?</p>
            <div style="font-size:36px;letter-spacing:8px;">
              <a href="{{surveyUrl}}" style="text-decoration:none;color:#cbd5e1;">★</a>
              <a href="{{surveyUrl}}" style="text-decoration:none;color:#cbd5e1;">★</a>
              <a href="{{surveyUrl}}" style="text-decoration:none;color:#fbbf24;">★</a>
              <a href="{{surveyUrl}}" style="text-decoration:none;color:#fbbf24;">★</a>
              <a href="{{surveyUrl}}" style="text-decoration:none;color:#fbbf24;">★</a>
            </div>
            <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">Click a star to rate</p>
          </td></tr>
        </table>
        <!-- Incentive -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef3c7;border-radius:12px;margin-bottom:32px;border:1px solid #fde68a;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0;color:#92400e;font-size:14px;"><strong>🎁 Bonus:</strong> Complete the full survey and receive <strong>{{incentive}}</strong> as a thank-you!</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center">
            <a href="{{surveyUrl}}" style="display:inline-block;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:15px 40px;border-radius:50px;box-shadow:0 4px 16px rgba(20,184,166,0.3);">Take the Survey (2 mins)</a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#14b8a6;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-21T10:00:00.000Z',
    updatedAt: '2024-01-21T10:00:00.000Z',
  },

  // ─── 13. SaaS Feature Announcement ──────────────────────────────────────────
  {
    id: '13',
    name: 'SaaS Feature Announcement',
    subject: '✨ New in {{company}}: {{featureName}} is here!',
    category: 'announcement',
    status: 'active',
    variables: ['firstName', 'company', 'featureName', 'featureDescription', 'ctaUrl'],
    textContent: 'Hi {{firstName}}, we just launched {{featureName}} at {{company}}. {{featureDescription}}',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Feature Announcement</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <!-- Top bar -->
      <tr><td style="background:#111827;padding:16px 40px;text-align:center;">
        <span style="color:#ffffff;font-size:16px;font-weight:700;">{{company}}</span>
        <span style="background:#10b981;color:#ffffff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;margin-left:10px;letter-spacing:0.5px;text-transform:uppercase;">New Feature</span>
      </td></tr>
      <!-- Hero -->
      <tr><td style="padding:56px 40px 40px;text-align:center;">
        <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:20px;width:100px;height:100px;margin:0 auto 24px;text-align:center;line-height:100px;font-size:52px;">✨</div>
        <p style="margin:0 0 8px;color:#10b981;font-size:12px;text-transform:uppercase;letter-spacing:3px;font-weight:700;">Just Shipped</p>
        <h1 style="margin:0 0 16px;color:#111827;font-size:32px;font-weight:900;line-height:1.2;letter-spacing:-1px;">{{featureName}}</h1>
        <p style="margin:0;color:#6b7280;font-size:16px;line-height:1.7;max-width:440px;margin:0 auto;">{{featureDescription}}</p>
      </td></tr>
      <!-- What's new -->
      <tr><td style="padding:8px 40px 40px;">
        <h3 style="margin:0 0 20px;color:#111827;font-size:17px;font-weight:700;">What's included:</h3>
        <!-- Bullet items -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;"><div style="width:20px;height:20px;background:#d1fae5;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">✓</div></td>
              <td style="padding-left:8px;color:#374151;font-size:14px;">Fully integrated with your existing workflow</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;"><div style="width:20px;height:20px;background:#d1fae5;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">✓</div></td>
              <td style="padding-left:8px;color:#374151;font-size:14px;">Available immediately — no setup required</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;"><div style="width:20px;height:20px;background:#d1fae5;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">✓</div></td>
              <td style="padding-left:8px;color:#374151;font-size:14px;">Built based on your feedback — thank you!</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;"><div style="width:20px;height:20px;background:#d1fae5;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">✓</div></td>
              <td style="padding-left:8px;color:#374151;font-size:14px;">Works on all devices and platforms</td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:0 40px 48px;text-align:center;">
        <a href="{{ctaUrl}}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:15px 40px;border-radius:10px;">Try {{featureName}} Now →</a>
        <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">Already included in your plan · No extra cost</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 {{company}} · <a href="#" style="color:#10b981;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-22T10:00:00.000Z',
    updatedAt: '2024-01-22T10:00:00.000Z',
  },

  // ─── 14. Webinar / Workshop Invitation ───────────────────────────────────────
  {
    id: '14',
    name: 'Webinar / Workshop Invitation',
    subject: '📚 Join us live: {{webinarTitle}} — Free registration',
    category: 'event',
    status: 'active',
    variables: ['firstName', 'webinarTitle', 'webinarDate', 'webinarTime', 'company', 'speakerName', 'ctaUrl'],
    textContent: 'Hi {{firstName}}, join us for a free live webinar: {{webinarTitle}} on {{webinarDate}} at {{webinarTime}} with {{speakerName}}.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Webinar Invitation</title></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f9ff;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(14,165,233,0.12);">
      <!-- Live badge bar -->
      <tr><td style="background:#0ea5e9;padding:10px 40px;text-align:center;">
        <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;">🔴 FREE LIVE WEBINAR — REGISTER NOW</span>
      </td></tr>
      <!-- Hero -->
      <tr><td style="background:linear-gradient(160deg,#0369a1 0%,#0284c7 50%,#0ea5e9 100%);padding:52px 40px;text-align:center;">
        <p style="margin:0 0 16px;color:rgba(255,255,255,0.8);font-size:13px;text-transform:uppercase;letter-spacing:2px;">Upcoming Webinar</p>
        <h1 style="margin:0 0 20px;color:#ffffff;font-size:28px;font-weight:800;line-height:1.3;">{{webinarTitle}}</h1>
        <!-- Date/Time badges -->
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 auto;">
          <tr>
            <td style="background:rgba(255,255,255,0.2);border-radius:8px;padding:10px 18px;margin-right:10px;">
              <span style="color:#ffffff;font-size:14px;font-weight:700;">📅 {{webinarDate}}</span>
            </td>
            <td style="width:12px;"></td>
            <td style="background:rgba(255,255,255,0.2);border-radius:8px;padding:10px 18px;">
              <span style="color:#ffffff;font-size:14px;font-weight:700;">⏰ {{webinarTime}}</span>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px;">
        <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>{{firstName}}</strong>,</p>
        <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.7;">You're invited to an exclusive live session where we'll dive deep into practical strategies you can apply immediately. Spots are limited, so reserve yours now!</p>
        <!-- Speaker card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f9ff;border-radius:14px;margin-bottom:28px;border:1px solid #bae6fd;">
          <tr>
            <td style="padding:20px;width:64px;vertical-align:middle;">
              <div style="width:52px;height:52px;background:linear-gradient(135deg,#0ea5e9,#0284c7);border-radius:50%;text-align:center;line-height:52px;font-size:26px;color:#fff;">👤</div>
            </td>
            <td style="padding:20px 20px 20px 0;vertical-align:middle;">
              <div style="color:#0c4a6e;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px;">Featured Speaker</div>
              <div style="color:#111827;font-size:16px;font-weight:700;">{{speakerName}}</div>
              <div style="color:#6b7280;font-size:13px;">{{company}}</div>
            </td>
          </tr>
        </table>
        <!-- What you'll learn -->
        <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;">What you'll learn:</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
          <tr><td style="padding:8px 0;color:#374151;font-size:14px;display:flex;align-items:flex-start;gap:8px;"><span style="color:#0ea5e9;font-weight:700;margin-right:8px;">→</span>Proven strategies to accelerate your results</td></tr>
          <tr><td style="padding:8px 0;color:#374151;font-size:14px;"><span style="color:#0ea5e9;font-weight:700;margin-right:8px;">→</span>Live Q&amp;A — get your questions answered</td></tr>
          <tr><td style="padding:8px 0;color:#374151;font-size:14px;"><span style="color:#0ea5e9;font-weight:700;margin-right:8px;">→</span>Exclusive resources sent to all attendees</td></tr>
        </table>
        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center">
            <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;box-shadow:0 4px 16px rgba(14,165,233,0.35);">Reserve My Spot — Free!</a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">Hosted by {{company}} · <a href="#" style="color:#0ea5e9;text-decoration:none;">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-23T10:00:00.000Z',
    updatedAt: '2024-01-23T10:00:00.000Z',
  },

  // ─── 15. Holiday / Seasonal Greeting ────────────────────────────────────────
  {
    id: '15',
    name: 'Holiday Greeting',
    subject: '🎄 Season\'s Greetings from {{company}}!',
    category: 'announcement',
    status: 'active',
    variables: ['firstName', 'company', 'holidayName', 'giftUrl', 'teamSignature'],
    textContent: 'Happy {{holidayName}}, {{firstName}}! Warmest wishes from everyone at {{company}}. We\'re grateful for your support this year.',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Holiday Greeting</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;">
      <!-- Starry night header -->
      <tr><td style="background:linear-gradient(180deg,#0f172a 0%,#1e3a5f 50%,#1e293b 100%);padding:56px 40px 40px;text-align:center;position:relative;">
        <div style="font-size:48px;letter-spacing:8px;margin-bottom:16px;">🌟 ❄️ 🎄</div>
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:3px;font-weight:700;">Happy {{holidayName}}</p>
        <h1 style="margin:0;color:#f8fafc;font-size:40px;font-weight:900;line-height:1.1;letter-spacing:-1.5px;">Season's<br><span style="background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Greetings</span></h1>
      </td></tr>
      <!-- Main card -->
      <tr><td style="background:#1e293b;padding:40px;border:1px solid #334155;border-top:none;border-bottom:none;">
        <!-- Stars decoration -->
        <p style="margin:0 0 24px;color:#fbbf24;font-size:20px;text-align:center;letter-spacing:16px;">· · ✦ · ·</p>
        <p style="margin:0 0 16px;color:#e2e8f0;font-size:17px;line-height:1.8;text-align:center;">Dear <strong style="color:#fbbf24;">{{firstName}}</strong>,</p>
        <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.8;text-align:center;">As another wonderful year draws to a close, we want to take a moment to express our deepest gratitude. Having you as part of the <strong style="color:#e2e8f0;">{{company}}</strong> community means the world to us.</p>
        <!-- Snowflake divider -->
        <p style="margin:0 0 24px;color:#475569;font-size:18px;text-align:center;letter-spacing:24px;">❄ ❄ ❄</p>
        <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;line-height:1.8;text-align:center;">May this season bring you joy, warmth, and moments that fill your heart with happiness. Here's to an amazing year ahead — together.</p>
        <!-- Gift box -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#1e3a5f,#1e293b);border-radius:16px;margin-bottom:32px;border:1px solid #334155;">
          <tr><td style="padding:28px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎁</div>
            <p style="margin:0 0 8px;color:#f8fafc;font-size:17px;font-weight:700;">A Holiday Gift From Us</p>
            <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;">As a thank-you for your continued support, we have a special surprise waiting for you.</p>
            <a href="{{giftUrl}}" style="display:inline-block;background:linear-gradient(135deg,#fbbf24,#f97316);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 36px;border-radius:50px;">Unwrap Your Gift 🎁</a>
          </td></tr>
        </table>
        <!-- Signature -->
        <p style="margin:0;color:#e2e8f0;font-size:16px;text-align:center;font-style:italic;">With warmth &amp; gratitude,</p>
        <p style="margin:8px 0 0;color:#fbbf24;font-size:16px;font-weight:700;text-align:center;">{{teamSignature}}</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#0f172a;padding:24px 40px;text-align:center;border-radius:0 0 20px 20px;border:1px solid #1e293b;border-top:none;">
        <p style="margin:0 0 4px;color:#475569;font-size:12px;">🌟 {{company}} wishes you a wonderful {{holidayName}}! 🌟</p>
        <p style="margin:0;font-size:12px;"><a href="#" style="color:#fbbf24;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#fbbf24;text-decoration:none;">Privacy Policy</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    createdAt: '2024-01-24T10:00:00.000Z',
    updatedAt: '2024-01-24T10:00:00.000Z',
  },
];

export const sampleCampaigns = [
  {
    id: '1',
    name: 'January Newsletter',
    subject: 'Start 2024 Strong - Our January Update',
    templateId: '2',
    smtpId: '1',
    status: 'sent',
    totalRecipients: 150,
    stats: {
      sent: 150,
      delivered: 148,
      opened: 89,
      clicked: 34,
      bounced: 2,
      failed: 0,
      unsubscribed: 1,
      openRate: 60.1,
      clickRate: 22.9,
      bounceRate: 1.3,
    },
    createdAt: '2024-01-20T08:00:00.000Z',
    updatedAt: '2024-01-20T10:30:00.000Z',
    sentAt: '2024-01-20T09:00:00.000Z',
  },
  {
    id: '2',
    name: 'Product Launch Announcement',
    subject: '🚀 Introducing Our Latest Innovation',
    templateId: '3',
    smtpId: '1',
    status: 'sent',
    totalRecipients: 250,
    stats: {
      sent: 250,
      delivered: 245,
      opened: 178,
      clicked: 92,
      bounced: 5,
      failed: 0,
      unsubscribed: 2,
      openRate: 72.7,
      clickRate: 37.6,
      bounceRate: 2.0,
    },
    createdAt: '2024-01-18T08:00:00.000Z',
    updatedAt: '2024-01-18T12:00:00.000Z',
    sentAt: '2024-01-18T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'Welcome Campaign',
    subject: 'Welcome to Our Community!',
    templateId: '1',
    smtpId: '1',
    status: 'scheduled',
    totalRecipients: 50,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    },
    scheduledAt: '2024-01-25T09:00:00.000Z',
    createdAt: '2024-01-22T10:00:00.000Z',
    updatedAt: '2024-01-22T10:00:00.000Z',
  },
  {
    id: '4',
    name: 'Winter Sale Promotion',
    subject: '❄️ Winter Sale - Up to 50% Off!',
    templateId: '2',
    smtpId: '1',
    status: 'draft',
    totalRecipients: 0,
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    },
    createdAt: '2024-01-23T14:00:00.000Z',
    updatedAt: '2024-01-23T14:00:00.000Z',
  },
];

// Function to initialize stores with sample data
export const initializeSampleData = () => {
  // Check if data already exists in localStorage
  const hasData = localStorage.getItem('contact-storage') || 
                  localStorage.getItem('template-storage') || 
                  localStorage.getItem('campaign-storage');
  
  if (!hasData) {
    // Initialize with sample data only if no data exists
    return {
      contacts: sampleContacts,
      templates: sampleTemplates,
      campaigns: sampleCampaigns,
    };
  }
  
  return null;
};
