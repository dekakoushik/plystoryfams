import { getFamsState, saveFamsState } from '../services/dataStore.js';
import { formatCurrency, showToast } from '../services/uiUtils.js';

// 1. User & Role Management (Super Admin Portal)
export function renderAdminUsers() {
  const state = getFamsState();
  const users = state.users || [];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="users" style="color:#845adf;"></i>
          <div>
            <h2>User Management & Access Control (Admin Portal)</h2>
            <span class="card-header-subtitle">Create, manage, delete system users, assign roles and configure plant jurisdictions</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnAddNewUser">
          <i data-lucide="user-plus"></i> Create New User
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table" id="adminUsersTable">
          <thead>
            <tr>
              <th>User / Name</th>
              <th>Login Email / Username</th>
              <th>Department / Plant</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr data-id="${user.id}">
                <td>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #845adf, #23b7e5); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">
                      ${(user.name || 'User').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <strong>${user.name}</strong>
                      <div style="font-size:0.72rem; color:#8c9097;">Added: ${user.created_at ? user.created_at.slice(0,10) : '2026-02-26'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style="font-family:var(--font-mono); font-size:0.82rem; color:#845adf; font-weight:600;">${user.email}</span>
                </td>
                <td>
                  <div>${user.department || 'All Departments'}</div>
                  <small style="color:#8c9097;">${user.plant || 'All Locations'}</small>
                </td>
                <td>
                  <span class="badge ${user.role === 'Super Admin' ? 'badge-assigned' : 'badge-maintenance'}">
                    ${user.role}
                  </span>
                </td>
                <td>
                  <span class="badge ${user.status === 'Active' ? 'badge-instock' : 'badge-disposed'}">
                    <span class="badge-dot"></span> ${user.status || 'Active'}
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline btn-sm btn-edit-user" data-id="${user.id}" title="Edit User & Roles">
                      <i data-lucide="edit-3"></i> Edit
                    </button>
                    ${user.email !== 'ithelpdesk@plystory.com' ? `
                      <button class="btn btn-outline btn-sm btn-delete-user" data-id="${user.id}" title="Delete User" style="color:#e6533c; border-color:#fecaca;">
                        <i data-lucide="trash-2"></i> Delete
                      </button>
                    ` : `
                      <span style="font-size:0.72rem; color:#8c9097; padding:4px 8px; background:#f4f6fa; border-radius:4px; font-weight:600;">Root Admin</span>
                    `}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Approval Workflow Engine
export function renderAdminWorkflows() {
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="git-merge" style="color:#8b5cf6;"></i>
          <div>
            <h2>Approval Workflow Configurations (India Operations)</h2>
            <span class="card-header-subtitle">Capital expenditure (CAPEX) authorization matrix with multi-level escalation</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm"><i data-lucide="plus"></i> New Authorization Rule</button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr><th>Module Action</th><th>CAPEX Value Range (₹)</th><th>Mandatory Approvers</th><th>SLA</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Plant Machinery CAPEX Purchase</strong></td>
              <td>₹1,00,000 - ₹25,00,000</td>
              <td>Plant Head &rarr; VP Asset Infra</td>
              <td>48 Hours</td>
              <td><span class="badge badge-instock">Active</span></td>
            </tr>
            <tr>
              <td><strong>Heavy Capital Press / Machinery Import</strong></td>
              <td>&gt; ₹25,00,000</td>
              <td>Plant GM &rarr; VP Infra &rarr; CFO & MD</td>
              <td>24 Hours</td>
              <td><span class="badge badge-instock">Active</span></td>
            </tr>
            <tr>
              <td><strong>Machinery Decommission & Scrap Auction</strong></td>
              <td>All Values</td>
              <td>Plant Maintenance Head &rarr; CFO</td>
              <td>72 Hours</td>
              <td><span class="badge badge-instock">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 3. System Audit Logs
export function renderAdminLogs() {
  const state = getFamsState();
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="shield-alert" style="color:#f43f5e;"></i>
          <div>
            <h2>Statutory Audit & System Security Logs</h2>
            <span class="card-header-subtitle">Complete chronological activity log for statutory tax and internal compliance</span>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Target Module</th><th>Description Details</th><th>IP Address</th></tr>
          </thead>
          <tbody>
            ${state.auditLogs.map(log => `
              <tr>
                <td style="font-family:var(--font-mono); font-size:0.75rem;">${log.time}</td>
                <td><strong>${log.user}</strong></td>
                <td><span class="badge ${log.action === 'CREATE' ? 'badge-instock' : 'badge-assigned'}">${log.action}</span></td>
                <td>${log.module}</td>
                <td>${log.details}</td>
                <td><code>${log.ip}</code></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 4. Reports & Analytics
export function renderReportsAnalytics() {
  const state = getFamsState();
  const assets = state.assets || [];

  return `
    <div class="reports-module">
      <div class="kpi-grid">
        <div class="kpi-card cyan">
          <div class="kpi-info">
            <span class="kpi-label">Form FAR Statutory Register</span>
            <span class="kpi-value">${assets.length} Assets</span>
            <span class="kpi-subtext"><i data-lucide="file-text"></i> Companies Act 2013</span>
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="alert('Form FAR PDF Generated')"><i data-lucide="download"></i> Download FAR (PDF)</button>
        </div>

        <div class="kpi-card emerald">
          <div class="kpi-info">
            <span class="kpi-label">Income Tax Act Depr. Schedule</span>
            <span class="kpi-value">FY 2025-26</span>
            <span class="kpi-subtext"><i data-lucide="calculator"></i> Block of Assets Schedule</span>
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="alert('Income Tax Depreciation Schedule Excel Exported')"><i data-lucide="file-spreadsheet"></i> Export Form 3CD Schedule</button>
        </div>

        <div class="kpi-card amber">
          <div class="kpi-info">
            <span class="kpi-label">Plant Maintenance & AMC Spend</span>
            <span class="kpi-value">${formatCurrency(133500)}</span>
            <span class="kpi-subtext"><i data-lucide="wrench"></i> YTD Plant Opex</span>
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="alert('Maintenance Cost CSV Exported')"><i data-lucide="download"></i> Export Maintenance CSV</button>
        </div>
      </div>
    </div>
  `;
}

// 5. Data Tools: Import/Export & Backup
export function renderDataTools() {
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="download-cloud" style="color:#06b6d4;"></i>
          <div>
            <h2>Data Import / Export & Encrypted Database Backup</h2>
            <span class="card-header-subtitle">Bulk asset ingestion from SAP/Tally ERP and automated snapshot archives</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid-2">
        <div class="fams-card" style="background: var(--bg-surface);">
          <h3 style="margin-bottom:10px; color:#fff;"><i data-lucide="upload"></i> Bulk Asset CSV / Tally XML Ingestion</h3>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
            Import thousands of fixed assets from Tally Prime, SAP ERP, or custom CSV templates with automated HSN/SAC, GST, and Category mapping.
          </p>
          <div style="border: 2px dashed var(--border-color); padding: 30px; text-align:center; border-radius:var(--radius-md); cursor:pointer; background:var(--bg-input);">
            <i data-lucide="file-up" style="width:36px; height:36px; color:#38bdf8; margin-bottom:8px;"></i>
            <p style="font-size:0.85rem; font-weight:600;">Drag and drop asset CSV/Excel file here, or click to browse</p>
            <span style="font-size:0.72rem; color:var(--text-dim);">Supported formats: .CSV, .XLSX (Max 50MB)</span>
          </div>
        </div>

        <div class="fams-card" style="background: var(--bg-surface);">
          <h3 style="margin-bottom:10px; color:#fff;"><i data-lucide="database-backup"></i> Instant Database Snapshot & Backup</h3>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
            Generate an AES-256 encrypted SQL and JSON backup archive of all master tables, asset registers, maintenance records, and audit logs.
          </p>
          <button class="btn btn-primary" id="btnTriggerBackup" style="width: 100%;"><i data-lucide="hard-drive"></i> Generate Full System Backup (.SQL.GZ)</button>
        </div>
      </div>
    </div>
  `;
}
