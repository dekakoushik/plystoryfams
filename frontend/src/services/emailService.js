import { getFamsState, getCurrentUser } from './dataStore.js';
import { getIndianDateTime, formatCurrency } from './uiUtils.js';

// Send Custody Assignment or Return Email Notification
export async function sendCustodyNotification({
  type = 'ASSIGN', // 'ASSIGN' or 'UNTAG'
  asset,
  employee,
  previousEmployee = null,
  assignedDate = getIndianDateTime().slice(0, 10),
  departmentName = '',
  locationName = '',
  remarks = ''
}) {
  if (!employee || !employee.email) {
    console.log(`[FAMS Mailer] No email address for ${employee ? employee.name : 'custodian'}. Skipping dispatch.`);
    return { success: false, reason: 'NO_EMAIL' };
  }

  const state = getFamsState();
  const smtp = state.smtpConfig || {};

  // Check if SMTP is configured and custody notification checkbox is enabled
  if (!smtp.username || !smtp.password) {
    console.warn('[FAMS Mailer] SMTP credentials not set. Email not sent.');
    return { success: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const isAssign = type === 'ASSIGN';
  const subject = isAssign
    ? `[Plystory FAMS] Asset Custody Handover Acknowledgment: ${asset.asset_code} (${asset.name})`
    : `[Plystory FAMS] Asset Return / Untagged Notice: ${asset.asset_code} (${asset.name})`;

  const messageText = isAssign
    ? `Dear ${employee.name},\n\nFixed Asset ${asset.name} (${asset.asset_code}) has been allocated to your custody on ${assignedDate}.\nLocation: ${locationName}\nDepartment: ${departmentName}\nRemarks: ${remarks}`
    : `Dear ${employee.name},\n\nFixed Asset ${asset.name} (${asset.asset_code}) has been successfully returned and untagged from your custody records.`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fa; margin: 0; padding: 20px; }
        .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #eaedf1; }
        .email-header { background: ${isAssign ? '#0066ff' : '#475569'}; padding: 28px 32px; color: #ffffff; text-align: left; }
        .brand-badge { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 12px; }
        .email-title { margin: 0; font-size: 20px; font-weight: 700; }
        .email-subtitle { margin-top: 6px; font-size: 13px; opacity: 0.9; }
        .email-body { padding: 32px; color: #1e293b; font-size: 14px; line-height: 1.6; }
        .greeting { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
        .spec-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
        .spec-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .spec-row:last-child { border-bottom: none; }
        .spec-label { color: #64748b; font-weight: 600; }
        .spec-value { color: #0f172a; font-weight: 700; text-align: right; }
        .tag-pill { font-family: monospace; background: #eef2ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
        .status-pill { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; ${isAssign ? 'background:#ecfdf5; color:#059669;' : 'background:#fef2f2; color:#dc2626;'} }
        .notice-card { background: ${isAssign ? '#eff6ff' : '#f8fafc'}; border-left: 4px solid ${isAssign ? '#0066ff' : '#64748b'}; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #334155; margin: 20px 0; }
        .email-footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eaedf1; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="brand-badge">PLYSTORY FAMS</div>
          <h1 class="email-title">${isAssign ? 'Asset Custody Allocation Receipt' : 'Asset Custody Handover / Untagged Notice'}</h1>
          <p class="email-subtitle">Statutory Fixed Asset Management System</p>
        </div>

        <div class="email-body">
          <div class="greeting">Dear ${employee.name},</div>
          
          <p>
            ${isAssign 
              ? `This is an official statutory confirmation that the following capital asset has been assigned to your operational custody under <strong>Plystory Fixed Asset Management System (FAMS)</strong>.`
              : `This notification confirms that the following capital asset has been formally <strong>untagged and checked back</strong> from your custody into the central asset repository.`}
          </p>

          <div class="spec-box">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">FAR Asset Tag Code</td>
                <td style="padding: 8px 0; text-align:right;"><span class="tag-pill">${asset.asset_code}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Asset Name / Model</td>
                <td style="padding: 8px 0; text-align:right; font-weight:700; color:#0f172a;">${asset.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Manufacturer / Make</td>
                <td style="padding: 8px 0; text-align:right; font-weight:600; color:#334155;">${asset.manufacturer || asset.make || 'Premier/Standard'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Serial Number</td>
                <td style="padding: 8px 0; text-align:right; font-family:monospace; font-weight:600;">${asset.serial_number || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Plant / Location</td>
                <td style="padding: 8px 0; text-align:right; font-weight:600;">${locationName || 'Corporate Location'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Department Cost Center</td>
                <td style="padding: 8px 0; text-align:right; font-weight:600;">${departmentName || 'General'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Effective Action Date</td>
                <td style="padding: 8px 0; text-align:right; font-weight:700; color:#0066ff;">${assignedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color:#64748b; font-weight:600;">Status</td>
                <td style="padding: 8px 0; text-align:right;"><span class="status-pill">${isAssign ? 'Assigned in Custody' : 'Checked In (Available)'}</span></td>
              </tr>
            </table>
          </div>

          ${remarks ? `
            <div class="notice-card">
              <strong>Handover Remarks / Notes:</strong><br>
              ${remarks}
            </div>
          ` : ''}

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            ${isAssign
              ? 'Please safeguard the asset and report any breakdown, maintenance need, or location transfer to the Asset Infrastructure team.'
              : 'The asset has been inspected and cleared of custody liabilities in your name.'}
          </p>

          <p style="font-size: 13px; margin-bottom: 0;">
            Best regards,<br>
            <strong>Plystory Asset & Infrastructure Management</strong><br>
            <span style="font-size: 12px; color: #64748b;">Plystory Corporate HO</span>
          </p>
        </div>

        <div class="email-footer">
          This is an automated statutory dispatch from Plystory FAMS.<br>
          For queries, contact <a href="mailto:${smtp.reply_to || 'ithelpdesk@plystory.com'}" style="color:#0066ff; text-decoration:none;">${smtp.reply_to || 'ithelpdesk@plystory.com'}</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('/api/send-test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: smtp.host,
        port: smtp.port,
        encryption: smtp.encryption,
        username: smtp.username,
        password: smtp.password,
        from_name: smtp.from_name || 'Plystory FAMS Notifications',
        from_email: smtp.from_email || smtp.username,
        to: employee.email,
        subject: subject,
        message: messageText,
        html: htmlContent
      })
    });

    const result = await response.json();
    return result;
  } catch (e) {
    console.error('[FAMS Mailer] Custody notification dispatch error:', e);
    return { success: false, error: e.message };
  }
}
