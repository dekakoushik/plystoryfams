import { getFamsState, saveFamsState } from '../services/dataStore.js';
import { formatCurrency, showToast, openModal, closeModal } from '../services/uiUtils.js';

// 1. Asset Assignment & Custody Module
export function renderAssetAssignment() {
  const state = getFamsState();
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="user-check" style="color:#60a5fa;"></i>
          <div>
            <h2>Asset Assignment & Custody</h2>
            <span class="card-header-subtitle">Track custodian allocations and generate handover acknowledgement forms</span>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Current Custodian</th>
              <th>Department</th>
              <th>Assignment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.assets.map(asset => {
              const emp = state.employees.find(e => e.id === asset.current_custodian_id);
              const dept = state.departments.find(d => d.id === asset.department_id);
              return `
                <tr>
                  <td class="asset-tag-cell">${asset.asset_code}</td>
                  <td><strong>${asset.name}</strong></td>
                  <td>${emp ? `<span style="color:#38bdf8; font-weight:600;"><i data-lucide="user"></i> ${emp.name}</span>` : '<span style="color:var(--text-dim);">Available for Checkout</span>'}</td>
                  <td>${dept ? dept.name : '—'}</td>
                  <td>
                    <span class="badge ${asset.current_custodian_id ? 'badge-assigned' : 'badge-instock'}">
                      ${asset.current_custodian_id ? 'Assigned' : 'Unallocated'}
                    </span>
                  </td>
                  <td>
                    ${asset.current_custodian_id ? 
                      `<button class="btn btn-outline btn-sm btn-return-asset" data-id="${asset.id}"><i data-lucide="corner-down-left"></i> Check In / Return</button>` :
                      `<button class="btn btn-primary btn-sm btn-assign-asset" data-id="${asset.id}"><i data-lucide="user-plus"></i> Assign Custodian</button>`
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Asset Transfers & Approval Workflows
export function renderAssetTransfer() {
  const state = getFamsState();
  const transfers = state.transfers || [];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="arrow-left-right" style="color:#8b5cf6;"></i>
          <div>
            <h2>Inter-Departmental Asset Transfers</h2>
            <span class="card-header-subtitle">Movement authorizations & multi-tier approval workflow</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnInitiateTransfer">
          <i data-lucide="plus"></i> New Transfer Request
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Transfer ID</th>
              <th>Asset Target</th>
              <th>From Location / Dept</th>
              <th>Destination Location / Dept</th>
              <th>Date</th>
              <th>Workflow Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${transfers.map(trf => {
              const asset = state.assets.find(a => a.id === trf.asset_id);
              const badgeClass = trf.status === 'Approved' ? 'badge-instock' : trf.status === 'Pending' ? 'badge-maintenance' : 'badge-disposed';
              return `
                <tr>
                  <td style="font-family:var(--font-mono); font-weight:600; color:#c084fc;">${trf.transfer_number}</td>
                  <td><strong>${asset ? asset.name : 'Unknown Asset'}</strong></td>
                  <td>${trf.from_dept}<br><small style="color:var(--text-dim);">${trf.from_loc}</small></td>
                  <td>${trf.to_dept}<br><small style="color:var(--text-dim);">${trf.to_loc}</small></td>
                  <td>${trf.date}</td>
                  <td><span class="badge ${badgeClass}"><span class="badge-dot"></span> ${trf.status}</span></td>
                  <td>
                    ${trf.status === 'Pending' ? `
                      <div style="display:flex; gap:6px;">
                        <button class="btn btn-emerald btn-sm btn-approve-transfer" data-id="${trf.id}"><i data-lucide="check"></i> Approve</button>
                        <button class="btn btn-rose btn-sm btn-reject-transfer" data-id="${trf.id}"><i data-lucide="x"></i> Reject</button>
                      </div>
                    ` : `<span style="font-size:0.75rem; color:var(--text-dim);"><i data-lucide="check-circle"></i> Completed</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 3. Asset Audit Trail & Movement History
export function renderAssetHistory() {
  const state = getFamsState();
  const logs = state.auditLogs || [];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="history" style="color:#845adf;"></i>
          <div>
            <h2>Enterprise Asset History & Audit Trail</h2>
            <span class="card-header-subtitle">Real-time chronological logging of asset creation, modifications, custody handovers, imports & deletions</span>
          </div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted); background:#f4f6fa; padding:4px 12px; border-radius:20px; border:1px solid #eaedf1;">
            ${logs.length} Live Audit Entries
          </span>
          <button class="btn btn-outline btn-sm" id="btnClearAuditLogs" style="color:#e6533c; border-color:#fecaca;">
            <i data-lucide="trash-2"></i> Clear History
          </button>
        </div>
      </div>

      ${logs.length === 0 ? `
        <div style="text-align:center; padding:40px 20px; color:#8c9097;">
          <i data-lucide="shield-check" style="width:48px; height:48px; color:#cbd5e1; margin-bottom:12px;"></i>
          <div style="font-weight:600; font-size:0.95rem; color:#1e293b;">No History Logs Recorded</div>
          <p style="font-size:0.8rem; margin-top:4px;">Action logs for asset creation, edits, custodian assignment, and deletions will appear here in real time.</p>
        </div>
      ` : `
        <div class="audit-timeline" style="margin-top: 15px;">
          ${logs.map(log => {
            const isCreate = log.action === 'CREATE' || log.action === 'IMPORT';
            const isDelete = log.action === 'DELETE';
            const isAssign = log.action === 'ASSIGN';
            const bulletClass = isCreate ? 'emerald' : isDelete ? 'rose' : isAssign ? 'cyan' : 'amber';
            const iconName = isCreate ? 'plus' : isDelete ? 'trash-2' : isAssign ? 'user-check' : 'edit-3';

            return `
              <div class="timeline-item">
                <div class="timeline-bullet ${bulletClass}">
                  <i data-lucide="${iconName}" style="width:10px; height:10px; color:#fff;"></i>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-title">
                      <span class="badge ${isCreate ? 'badge-instock' : isDelete ? 'badge-disposed' : isAssign ? 'badge-assigned' : 'badge-maintenance'}" style="margin-right:6px; font-size:0.72rem;">
                        ${log.action}
                      </span>
                      ${log.module}
                    </span>
                    <span class="timeline-time">${log.time}</span>
                  </div>
                  <p style="font-size:0.82rem; color:var(--text-main); margin-bottom: 4px; font-weight:500;">${log.details}</p>
                  <div style="font-size:0.72rem; color:var(--text-dim);">
                    <span>Initiated by: <strong>${log.user || 'Rajesh Varma'}</strong></span> &bull; <span>Client IP: <code>${log.ip || '10.20.1.45'}</code></span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
