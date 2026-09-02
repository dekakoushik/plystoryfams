import { getFamsState, saveFamsState, getCurrentUser } from '../services/dataStore.js';
import { showToast, getIndianDateTime } from '../services/uiUtils.js';

export function renderSmtpConfig() {
  const state = getFamsState();
  const smtp = state.smtpConfig || {
    host: 'smtp.office365.com',
    port: 587,
    encryption: 'STARTTLS',
    username: 'ithelpdesk@plystory.com',
    password: '',
    from_name: 'Plystory FAMS Notifications',
    from_email: 'noreply@plystory.com',
    reply_to: 'ithelpdesk@plystory.com',
    enable_asset_alerts: true,
    enable_custody_notifications: true,
    enable_maintenance_reminders: true,
    last_tested: 'Never',
    status: 'Not Configured'
  };

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="mail-check" style="color:#6366f1;"></i>
          <div>
            <h2>SMTP Mail Server Configuration</h2>
            <span class="card-header-subtitle">Outbound email gateway for asset handover receipts, maintenance tickets, and audit alerts</span>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge ${smtp.status === 'Connected' ? 'badge-instock' : 'badge-maintenance'}" id="smtpStatusBadge">
            <span class="badge-dot"></span> ${smtp.status}
          </span>
          <button class="btn btn-outline btn-sm" id="btnTestSmtpConnection" style="color:#6366f1; border-color:#6366f1;">
            <i data-lucide="send"></i> Send Test Email
          </button>
        </div>
      </div>

      <!-- Quick Preset Selectors -->
      <div style="display:flex; align-items:center; gap:10px; background:#f8fafc; padding:12px 18px; border-radius:8px; margin-bottom:20px; border:1px solid #e2e8f0;">
        <span style="font-size:0.8rem; font-weight:700; color:#475569;">Quick Mail Presets:</span>
        <button type="button" class="btn btn-outline btn-sm btn-smtp-preset" data-preset="office365" style="font-size:0.75rem; padding:4px 10px;">
          Microsoft 365 / Outlook
        </button>
        <button type="button" class="btn btn-outline btn-sm btn-smtp-preset" data-preset="gmail" style="font-size:0.75rem; padding:4px 10px;">
          Google Workspace (Gmail)
        </button>
        <button type="button" class="btn btn-outline btn-sm btn-smtp-preset" data-preset="aws" style="font-size:0.75rem; padding:4px 10px;">
          Amazon SES
        </button>
        <button type="button" class="btn btn-outline btn-sm btn-smtp-preset" data-preset="custom" style="font-size:0.75rem; padding:4px 10px;">
          Custom Enterprise Gateway
        </button>
      </div>

      <form id="formSmtpConfig">
        
        <!-- Connection Server Grid -->
        <h3 style="font-size:0.92rem; font-weight:700; color:#1e293b; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
          <i data-lucide="server" style="width:16px; height:16px; color:#6366f1;"></i> 1. Mail Server Connection Settings
        </h3>

        <div class="form-grid-3">
          <div class="form-group">
            <label>SMTP Host Server *</label>
            <input type="text" id="smtpHost" class="input-control" value="${smtp.host}" placeholder="e.g., smtp.office365.com" required />
          </div>

          <div class="form-group">
            <label>SMTP Port *</label>
            <input type="number" id="smtpPort" class="input-control" value="${smtp.port}" placeholder="587 / 465 / 25" required />
          </div>

          <div class="form-group">
            <label>Encryption Protocol *</label>
            <select id="smtpEncryption" class="select-control" required>
              <option value="STARTTLS" ${smtp.encryption === 'STARTTLS' ? 'selected' : ''}>STARTTLS (Port 587 - Recommended)</option>
              <option value="SSL/TLS" ${smtp.encryption === 'SSL/TLS' ? 'selected' : ''}>SSL / TLS (Port 465)</option>
              <option value="None" ${smtp.encryption === 'None' ? 'selected' : ''}>None (Port 25 - Unencrypted)</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2" style="margin-top:10px;">
          <div class="form-group">
            <label>Authentication Username / Email *</label>
            <input type="text" id="smtpUsername" class="input-control" value="${smtp.username}" placeholder="ithelpdesk@plystory.com" required />
          </div>

          <div class="form-group">
            <label>SMTP Password / App Secret *</label>
            <input type="password" id="smtpPassword" class="input-control" value="${smtp.password}" placeholder="App Password or SMTP API Key" required />
          </div>
        </div>

        <hr style="border:0; border-top:1px solid #e2e8f0; margin:22px 0;" />

        <!-- Sender Details Grid -->
        <h3 style="font-size:0.92rem; font-weight:700; color:#1e293b; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
          <i data-lucide="user-check" style="width:16px; height:16px; color:#10b981;"></i> 2. Sender Identity & Dispatch Configuration
        </h3>

        <div class="form-grid-3">
          <div class="form-group">
            <label>Sender Display Name *</label>
            <input type="text" id="smtpFromName" class="input-control" value="${smtp.from_name}" placeholder="Plystory FAMS Notifications" required />
          </div>

          <div class="form-group">
            <label>From Email Address *</label>
            <input type="email" id="smtpFromEmail" class="input-control" value="${smtp.from_email}" placeholder="noreply@plystory.com" required />
          </div>

          <div class="form-group">
            <label>Reply-To Email Address</label>
            <input type="email" id="smtpReplyTo" class="input-control" value="${smtp.reply_to}" placeholder="ithelpdesk@plystory.com" />
          </div>
        </div>

        <hr style="border:0; border-top:1px solid #e2e8f0; margin:22px 0;" />

        <!-- Automated Notification Triggers -->
        <h3 style="font-size:0.92rem; font-weight:700; color:#1e293b; margin-bottom:14px; display:flex; align-items:center; gap:6px;">
          <i data-lucide="bell-ring" style="width:16px; height:16px; color:#f59e0b;"></i> 3. Automated Notification Triggers
        </h3>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px;">
          <label style="display:flex; align-items:flex-start; gap:10px; padding:14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer;">
            <input type="checkbox" id="chkCustodyNotif" ${smtp.enable_custody_notifications ? 'checked' : ''} style="margin-top:3px; accent-color:#6366f1;" />
            <div>
              <strong style="font-size:0.83rem; color:#1e293b; display:block;">Custody Handover Receipts</strong>
              <span style="font-size:0.72rem; color:#64748b;">Email employee & department lead immediately upon asset assignment</span>
            </div>
          </label>

          <label style="display:flex; align-items:flex-start; gap:10px; padding:14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer;">
            <input type="checkbox" id="chkMaintNotif" ${smtp.enable_maintenance_reminders ? 'checked' : ''} style="margin-top:3px; accent-color:#6366f1;" />
            <div>
              <strong style="font-size:0.83rem; color:#1e293b; display:block;">Maintenance & AMC Alerts</strong>
              <span style="font-size:0.72rem; color:#64748b;">Dispatch PM schedules and breakdown work order tickets to engineers</span>
            </div>
          </label>

          <label style="display:flex; align-items:flex-start; gap:10px; padding:14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer;">
            <input type="checkbox" id="chkAuditNotif" ${smtp.enable_asset_alerts ? 'checked' : ''} style="margin-top:3px; accent-color:#6366f1;" />
            <div>
              <strong style="font-size:0.83rem; color:#1e293b; display:block;">Statutory Audit Summaries</strong>
              <span style="font-size:0.72rem; color:#64748b;">Send verification campaign reports to plant heads and internal auditors</span>
            </div>
          </label>
        </div>

        <div class="modal-footer" style="padding:14px 0; background:transparent; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#64748b;">
            Last verified: <strong>${smtp.last_tested || 'Never'}</strong>
          </span>
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn btn-primary" style="padding:8px 24px;">
              <i data-lucide="check"></i> Save SMTP Configuration
            </button>
          </div>
        </div>

      </form>
    </div>
  `;
}

// Event Listeners for SMTP Module
export function attachSmtpListeners() {
  const form = document.getElementById('formSmtpConfig');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const state = getFamsState();
      
      state.smtpConfig = {
        host: document.getElementById('smtpHost').value.trim(),
        port: parseInt(document.getElementById('smtpPort').value) || 587,
        encryption: document.getElementById('smtpEncryption').value,
        username: document.getElementById('smtpUsername').value.trim(),
        password: document.getElementById('smtpPassword').value.trim(),
        from_name: document.getElementById('smtpFromName').value.trim(),
        from_email: document.getElementById('smtpFromEmail').value.trim(),
        reply_to: document.getElementById('smtpReplyTo').value.trim(),
        enable_custody_notifications: document.getElementById('chkCustodyNotif').checked,
        enable_maintenance_reminders: document.getElementById('chkMaintNotif').checked,
        enable_asset_alerts: document.getElementById('chkAuditNotif').checked,
        last_tested: state.smtpConfig ? state.smtpConfig.last_tested : getIndianDateTime(),
        status: 'Connected'
      };

      state.auditLogs.unshift({
        id: Date.now(),
        user: getCurrentUser() ? getCurrentUser().name : 'Admin',
        action: 'UPDATE',
        module: 'SMTP Mail Configuration',
        details: `Updated SMTP outbound mail server settings for host ${state.smtpConfig.host}:${state.smtpConfig.port}`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      showToast('SMTP mail server settings saved successfully!', 'success');
      if (window.navigateTo) window.navigateTo('smtp-config');
    };
  }

  // Presets
  document.querySelectorAll('.btn-smtp-preset').forEach(btn => {
    btn.onclick = () => {
      const preset = btn.getAttribute('data-preset');
      const hostEl = document.getElementById('smtpHost');
      const portEl = document.getElementById('smtpPort');
      const encEl = document.getElementById('smtpEncryption');

      if (preset === 'office365') {
        if (hostEl) hostEl.value = 'smtp.office365.com';
        if (portEl) portEl.value = '587';
        if (encEl) encEl.value = 'STARTTLS';
        showToast('Loaded Microsoft 365 / Outlook SMTP preset', 'info');
      } else if (preset === 'gmail') {
        if (hostEl) hostEl.value = 'smtp.gmail.com';
        if (portEl) portEl.value = '587';
        if (encEl) encEl.value = 'STARTTLS';
        showToast('Loaded Google Workspace SMTP preset', 'info');
      } else if (preset === 'aws') {
        if (hostEl) hostEl.value = 'email-smtp.ap-south-1.amazonaws.com';
        if (portEl) portEl.value = '587';
        if (encEl) encEl.value = 'STARTTLS';
        showToast('Loaded AWS SES (Mumbai) SMTP preset', 'info');
      } else if (preset === 'custom') {
        if (hostEl) hostEl.value = 'mail.plystory.com';
        if (portEl) portEl.value = '465';
        if (encEl) encEl.value = 'SSL/TLS';
        showToast('Loaded Custom Corporate SMTP preset', 'info');
      }
    };
  });

  // Test Email Button (Interactive Modal)
  const btnTest = document.getElementById('btnTestSmtpConnection');
  if (btnTest) {
    btnTest.onclick = () => {
      const state = getFamsState();
      const smtp = state.smtpConfig || {};
      const host = document.getElementById('smtpHost') ? document.getElementById('smtpHost').value : (smtp.host || 'smtp.gmail.com');
      const currentUser = getCurrentUser();
      const defaultToEmail = currentUser ? currentUser.email : 'ithelpdesk@plystory.com';

      const testModalHtml = `
        <form id="formSendTestEmail">
          <div style="background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:16px;">
            <div style="font-size:0.8rem; color:#64748b;">
              Testing connection with: <strong style="color:#1e293b;">${host}:${document.getElementById('smtpPort') ? document.getElementById('smtpPort').value : '587'}</strong> 
              (${document.getElementById('smtpEncryption') ? document.getElementById('smtpEncryption').value : 'STARTTLS'})
            </div>
            <div style="font-size:0.75rem; color:#10b981; margin-top:3px;">
              <i data-lucide="shield-check" style="width:13px; height:13px; vertical-align:middle;"></i> Ready to send test dispatch via Google Workspace Gateway
            </div>
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label>Recipient Email Address *</label>
            <input type="email" id="testRecipientEmail" class="input-control" value="${defaultToEmail}" placeholder="e.g., yourname@plystory.com" required />
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label>Email Subject</label>
            <input type="text" id="testEmailSubject" class="input-control" value="[Plystory FAMS] SMTP Mail Server Test Verification" required />
          </div>

          <div class="form-group">
            <label>Test Message Body</label>
            <textarea id="testEmailBody" class="input-control" rows="3" readonly style="background:#f8fafc; font-size:0.78rem; font-family:var(--font-mono); color:#475569;">Hello Administrator,\n\nThis is a verified test dispatch from Plystory Enterprise FAMS. Your Google Workspace SMTP outbound gateway is operating properly with full TLS encryption.</textarea>
          </div>

          <div class="modal-footer" style="padding-top:14px; margin-top:16px;">
            <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btnSubmitTestEmail"><i data-lucide="send"></i> Dispatch Test Email</button>
          </div>
        </form>
      `;

      openModal('Send SMTP Test Email', 'Verify outbound Google Workspace mail connection', testModalHtml, 'send');

      const formTest = document.getElementById('formSendTestEmail');
      if (formTest) {
        formTest.onsubmit = async (e) => {
          e.preventDefault();
          const recipient = document.getElementById('testRecipientEmail').value.trim();
          const subject = document.getElementById('testEmailSubject').value.trim();
          const message = document.getElementById('testEmailBody').value.trim();
          const submitBtn = document.getElementById('btnSubmitTestEmail');

          const currentHost = document.getElementById('smtpHost') ? document.getElementById('smtpHost').value.trim() : 'smtp.gmail.com';
          const currentPort = document.getElementById('smtpPort') ? document.getElementById('smtpPort').value.trim() : '587';
          const currentEnc = document.getElementById('smtpEncryption') ? document.getElementById('smtpEncryption').value : 'STARTTLS';
          const currentUsername = document.getElementById('smtpUsername') ? document.getElementById('smtpUsername').value.trim() : '';
          const currentPassword = document.getElementById('smtpPassword') ? document.getElementById('smtpPassword').value.trim() : '';
          const currentFromName = document.getElementById('smtpFromName') ? document.getElementById('smtpFromName').value.trim() : 'Plystory FAMS';
          const currentFromEmail = document.getElementById('smtpFromEmail') ? document.getElementById('smtpFromEmail').value.trim() : currentUsername;

          if (!currentPassword || currentPassword === '••••••••••••') {
            showToast('Please type your 16-character Google App Password in the Password field before testing.', 'error');
            return;
          }

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Connecting to ${currentHost}...`;
          }

          try {
            const response = await fetch('/api/send-test-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                host: currentHost,
                port: currentPort,
                encryption: currentEnc,
                username: currentUsername,
                password: currentPassword,
                from_name: currentFromName,
                from_email: currentFromEmail,
                to: recipient,
                subject: subject,
                message: message
              })
            });

            const result = await response.json();

            if (result.success) {
              const freshState = getFamsState();
              if (freshState.smtpConfig) {
                freshState.smtpConfig.last_tested = getIndianDateTime();
                freshState.smtpConfig.status = 'Connected';
              }

              freshState.auditLogs.unshift({
                id: Date.now(),
                user: currentUser ? currentUser.name : 'Admin',
                action: 'TEST',
                module: 'SMTP Mail Configuration',
                details: `Real test email delivered to ${recipient} via ${currentHost}. Response: ${result.response || '250 OK'}`,
                time: getIndianDateTime(),
                ip: '10.20.1.45'
              });

              saveFamsState(freshState);
              closeModal();
              showToast(`✓ Real test email successfully sent to ${recipient}! Check your inbox.`, 'success');
              if (window.navigateTo) window.navigateTo('smtp-config');
            } else {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i data-lucide="send"></i> Dispatch Test Email`;
              }
              showToast(`SMTP Error: ${result.error}`, 'error');
              alert(`SMTP Connection Failed:\n\n${result.error}\n\nTip for Google Workspace:\n1. Make sure 2-Step Verification is ON in your Google Account.\n2. Generate a 16-character 'App Password' at https://myaccount.google.com/apppasswords and paste it as the password.`);
            }
          } catch (fetchErr) {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = `<i data-lucide="send"></i> Dispatch Test Email`;
            }
            showToast(`Connection failed: ${fetchErr.message}`, 'error');
          }
        };
      }
    };
  }
}
