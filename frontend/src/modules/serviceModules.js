import { getFamsState, saveFamsState } from '../services/dataStore.js';
import { formatCurrency, showToast, openModal, closeModal } from '../services/uiUtils.js';

// 1. Warranty Management
export function renderWarrantyManagement() {
  const state = getFamsState();
  const assets = state.assets.filter(a => a.warranty_expiry_date);

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="file-check" style="color:#10b981;"></i>
          <div>
            <h2>Plant & IT Warranty Management</h2>
            <span class="card-header-subtitle">OEM warranties, component coverage, and claim records across Indian suppliers</span>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset / Machine Name</th>
              <th>Authorized Supplier</th>
              <th>Warranty Expiry Date</th>
              <th>Coverage Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${assets.map(a => {
              const vendor = state.vendors.find(v => v.id === a.vendor_id);
              const isExpired = new Date(a.warranty_expiry_date) < new Date();
              return `
                <tr>
                  <td class="asset-tag-cell">${a.asset_code}</td>
                  <td><strong>${a.name}</strong></td>
                  <td>${vendor ? vendor.name : 'Authorized Indian OEM'}</td>
                  <td style="font-family:var(--font-mono);">${a.warranty_expiry_date}</td>
                  <td>
                    <span class="badge ${isExpired ? 'badge-disposed' : 'badge-instock'}">
                      <span class="badge-dot"></span> ${isExpired ? 'Expired' : 'Active Under OEM Warranty'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-claim-warranty" data-id="${a.id}">
                      <i data-lucide="shield-alert"></i> File OEM Claim
                    </button>
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

// 2. AMC Management
export function renderAmcManagement() {
  const state = getFamsState();
  const assets = state.assets.filter(a => a.amc_expiry_date);

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="handshake" style="color:#06b6d4;"></i>
          <div>
            <h2>Annual Maintenance Contracts (AMC)</h2>
            <span class="card-header-subtitle">Annual service partner SLAs, routine overhauls, and renewal tracking</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnCreateAmc">
          <i data-lucide="plus"></i> New AMC Agreement
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset / Machine Name</th>
              <th>AMC Service Partner</th>
              <th>AMC Expiration</th>
              <th>Service Routine</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${assets.map(a => {
              const vendor = state.vendors.find(v => v.id === a.vendor_id);
              return `
                <tr>
                  <td class="asset-tag-cell">${a.asset_code}</td>
                  <td><strong>${a.name}</strong></td>
                  <td>${vendor ? vendor.name : 'Kirloskar / Premier Service Works'}</td>
                  <td style="font-family:var(--font-mono);">${a.amc_expiry_date}</td>
                  <td>Quarterly (4 Routine Overhauls/yr)</td>
                  <td><span class="badge badge-instock"><span class="badge-dot"></span> Active Contract</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm"><i data-lucide="refresh-cw"></i> Renew AMC</button>
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

// 3. Maintenance / Repair Work Orders
export function renderMaintenanceRepair() {
  const state = getFamsState();
  const tickets = state.maintenanceLogs || [];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="wrench" style="color:#f59e0b;"></i>
          <div>
            <h2>Plant Maintenance & Breakdown Work Orders</h2>
            <span class="card-header-subtitle">Factory breakdown tickets, spare parts logging, and repair cost analytics</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnCreateTicket">
          <i data-lucide="plus"></i> Create Work Order Ticket
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Plant Asset Name</th>
              <th>Service Type</th>
              <th>Priority</th>
              <th>Problem / Breakdown Issue</th>
              <th>Assigned Service Engineer</th>
              <th>Repair Cost (₹)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${tickets.map(t => `
              <tr>
                <td style="font-family:var(--font-mono); font-weight:600; color:#fbbf24;">${t.ticket_number}</td>
                <td><strong>${t.asset_name}</strong></td>
                <td>${t.type}</td>
                <td>
                  <span class="badge ${t.priority === 'Critical' ? 'badge-disposed' : 'badge-maintenance'}">${t.priority}</span>
                </td>
                <td style="max-width: 250px;">${t.issue}</td>
                <td>${t.technician}</td>
                <td class="cost-cell">${formatCurrency(t.cost)}</td>
                <td>
                  <span class="badge ${t.status === 'Completed' ? 'badge-instock' : 'badge-maintenance'}">
                    <span class="badge-dot"></span> ${t.status}
                  </span>
                </td>
                <td>
                  ${t.status === 'In Progress' ? `
                    <button class="btn btn-emerald btn-sm btn-complete-ticket" data-id="${t.id}">
                      <i data-lucide="check"></i> Mark Resolved
                    </button>
                  ` : '<span style="font-size:0.75rem; color:var(--text-dim);"><i data-lucide="check-circle"></i> Closed</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 4. Preventive Maintenance Schedules
export function renderPreventiveMaintenance() {
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="calendar-clock" style="color:#06b6d4;"></i>
          <div>
            <h2>Plant Preventive Maintenance (PM) Inspection Schedules</h2>
            <span class="card-header-subtitle">Standard Operating Procedures (SOP), factory safety checks, and shutdown scheduling</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Add PM Schedule</button>
      </div>

      <div class="dashboard-grid-3" style="margin-top: 10px;">
        <div class="fams-card" style="background: var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="badge badge-instock">Monthly Scheduled</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">Due: Mar 01, 2026</span>
          </div>
          <h4 style="font-size:0.95rem; margin-bottom:6px; color:#fff;">Hydraulic Hot Press Pressure Test</h4>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:12px;">Inspect 600-ton hydraulic cylinders, replace O-rings, test thermal oil heating manifolds.</p>
          <div style="font-size:0.75rem; color:var(--text-dim);"><i data-lucide="user"></i> Lead: Gujarat Plant Maintenance Team</div>
        </div>

        <div class="fams-card" style="background: var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="badge badge-maintenance">Quarterly Scheduled</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">Due: Mar 15, 2026</span>
          </div>
          <h4 style="font-size:0.95rem; margin-bottom:6px; color:#fff;">Kirloskar 1000kVA DG Full Load Test</h4>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:12px;">Oil filter changes, alternator insulation megger test, and automatic AMF panel transfer check.</p>
          <div style="font-size:0.75rem; color:var(--text-dim);"><i data-lucide="user"></i> Lead: Kirloskar Field Engineers</div>
        </div>

        <div class="fams-card" style="background: var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="badge badge-instock">Bi-Annual Calibration</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">Due: Apr 10, 2026</span>
          </div>
          <h4 style="font-size:0.95rem; margin-bottom:6px; color:#fff;">SAP Enterprise Server Cluster & UPS</h4>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:12px;">Mumbai Data Center power calibration, disk array health test, and automated tape backup.</p>
          <div style="font-size:0.75rem; color:var(--text-dim);"><i data-lucide="user"></i> Lead: Sify & Dell Certified Tech</div>
        </div>
      </div>
    </div>
  `;
}
