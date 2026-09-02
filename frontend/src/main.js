import { createIcons, icons } from 'lucide';
import { renderDashboard, attachDashboardListeners } from './modules/dashboardModule.js';
import { renderAssetRegister, openRegisterAssetModal, attachAssetRegisterListeners } from './modules/assetRegisterModule.js';
import { renderAssetAssignment, renderAssetTransfer, renderAssetHistory } from './modules/lifecycleModules.js';
import { renderWarrantyManagement, renderAmcManagement, renderMaintenanceRepair, renderPreventiveMaintenance } from './modules/serviceModules.js';
import { renderDepreciation, renderAssetValuation, renderDisposalScrap } from './modules/financialModules.js';
import { renderPhysicalAudit, renderBarcodeQr, renderAssetDocuments } from './modules/auditModules.js';
import { renderMasterModules, setActiveMasterTab, getActiveMasterTab, openMasterFormModal, deleteMasterEntity } from './modules/masterModules.js';
import { renderAdminUsers, renderAdminWorkflows, renderAdminLogs, renderReportsAnalytics, renderDataTools } from './modules/adminReportsModules.js';
import { renderLoginOverlay, updateTopNavbarProfile, openUserProfileModal, attachAdminUserListeners } from './modules/authModule.js';
import { renderSmtpConfig, attachSmtpListeners } from './modules/smtpConfigModule.js';
import { sendCustodyNotification } from './services/emailService.js';
import { showToast, openModal, closeModal, formatCurrency, getIndianDateTime } from './services/uiUtils.js';
import { getFamsState, saveFamsState, logoutUser, getCurrentUser } from './services/dataStore.js';

// Make Lucide globally accessible
window.lucide = { createIcons, icons };
window.navigateTo = navigateTo;

// Route Dictionary Mapping
const routes = {
  'dashboard': { title: 'Executive Dashboard', render: renderDashboard },
  'assets': { title: 'Asset Register & Purchase', render: renderAssetRegister },
  'asset-assignment': { title: 'Asset Assignment & Custody', render: renderAssetAssignment },
  'asset-transfer': { title: 'Asset Transfers & Workflows', render: renderAssetTransfer },
  'asset-history': { title: 'Asset History & Audit Trail', render: renderAssetHistory },
  'warranty-management': { title: 'Warranty Management', render: renderWarrantyManagement },
  'amc-management': { title: 'AMC Contracts', render: renderAmcManagement },
  'maintenance-repair': { title: 'Maintenance & Work Orders', render: renderMaintenanceRepair },
  'preventive-maintenance': { title: 'Preventive Maintenance', render: renderPreventiveMaintenance },
  'depreciation': { title: 'Depreciation Engine', render: renderDepreciation },
  'asset-valuation': { title: 'Asset Valuation & Impairment', render: renderAssetValuation },
  'disposal-scrap': { title: 'Disposal & Scrapping', render: renderDisposalScrap },
  'physical-audit': { title: 'Physical Asset Audit', render: renderPhysicalAudit },
  'barcode-qr': { title: 'Barcode & QR Tracking', render: renderBarcodeQr },
  'asset-documents': { title: 'Asset Documents Vault', render: renderAssetDocuments },
  'master-modules': { title: 'Master Data Modules (11 Tables)', render: renderMasterModules },
  'admin-users': { title: 'User & Role Matrix', render: renderAdminUsers },
  'smtp-config': { title: 'SMTP Outbound Mail Server Configuration', render: renderSmtpConfig },
  'admin-workflows': { title: 'Approval Workflow Rules', render: renderAdminWorkflows },
  'admin-logs': { title: 'System Audit Logs', render: renderAdminLogs },
  'reports-analytics': { title: 'Reports & BI Analytics', render: renderReportsAnalytics },
  'data-tools': { title: 'Data Import/Export & Backup', render: renderDataTools },
};

function navigateTo(tabKey) {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin');

  // If standard 'User' tries to access admin-users or smtp-config module, redirect to dashboard with alert
  if ((tabKey === 'admin-users' || tabKey === 'smtp-config') && !isAdmin) {
    showToast('Access Restricted: This configuration module is only available to Administrators.', 'error');
    window.location.hash = '#dashboard';
    tabKey = 'dashboard';
  }

  const route = routes[tabKey] || routes['dashboard'];
  const container = document.getElementById('moduleContainer');
  const breadcrumb = document.getElementById('currentViewTitle');

  if (breadcrumb) breadcrumb.textContent = route.title;
  if (container) {
    container.innerHTML = route.render();
  }

  // Update Sidebar active class & Role visibility
  document.querySelectorAll('.nav-item').forEach(el => {
    const tab = el.getAttribute('data-tab');
    if (tab === 'admin-users' || tab === 'smtp-config') {
      el.style.display = isAdmin ? 'flex' : 'none';
    }
    if (tab === tabKey) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Re-initialize Lucide icons
  createIcons({ icons });

  // Attach dynamic event handlers
  attachEventListeners();
}

function attachEventListeners() {
  // Master Tabs Sub-Nav toggle
  document.querySelectorAll('.master-subnav-btn').forEach(btn => {
    btn.onclick = () => {
      const masterKey = btn.getAttribute('data-master');
      setActiveMasterTab(masterKey);
      navigateTo('master-modules');
    };
  });

  // Register Asset buttons
  const btnRegister = document.getElementById('btnRegisterAssetModal');
  if (btnRegister) btnRegister.onclick = openRegisterAssetModal;

  const btnAddNew = document.getElementById('btnAddNewAsset');
  if (btnAddNew) btnAddNew.onclick = openRegisterAssetModal;

  // FAR Table Action buttons (View, Edit, Assign, History, Delete)
  attachAssetRegisterListeners();

  // Dashboard filter listeners
  attachDashboardListeners();

  // Admin User & Role Matrix listeners (Create, Edit, Delete)
  attachAdminUserListeners();

  // SMTP Mail Server Configuration listeners
  attachSmtpListeners();

  // Top User Profile and Sidebar Profile Buttons
  const btnTopProf = document.getElementById('btnTopUserProfile');
  if (btnTopProf) btnTopProf.onclick = openUserProfileModal;

  const btnSideProf = document.getElementById('sidebarViewProfileBtn');
  if (btnSideProf) btnSideProf.onclick = openUserProfileModal;

  // Logout button in sidebar
  const btnLogout = document.getElementById('sidebarLogoutBtn');
  if (btnLogout) {
    btnLogout.onclick = () => {
      logoutUser();
      showToast('You have been logged out successfully.', 'info');
      renderLoginOverlay();
    };
  }

  // Update profile card in navbar
  updateTopNavbarProfile();

  // Clear Audit Trail History Logs button
  const btnClearLogs = document.getElementById('btnClearAuditLogs');
  if (btnClearLogs) {
    btnClearLogs.onclick = () => {
      const state = getFamsState();
      state.auditLogs = [];
      saveFamsState(state);
      showToast('Asset history logs cleared successfully!', 'info');
      navigateTo('asset-history');
    };
  }

  // Depreciation Schedule Modal Viewer
  document.querySelectorAll('.btn-view-depr-schedule').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      const state = getFamsState();
      const asset = state.assets.find(a => a.id === assetId);
      if (!asset) return;

      const cost = asset.purchase_cost;
      const rate = asset.depreciation_rate / 100;
      const schedule = [
        { year: 'FY 2025-26', open: cost, depr: cost * rate, close: cost * (1 - rate) },
        { year: 'FY 2026-27', open: cost * (1 - rate), depr: cost * rate, close: cost * (1 - 2 * rate) },
        { year: 'FY 2027-28', open: cost * (1 - 2 * rate), depr: cost * rate, close: cost * (1 - 3 * rate) },
        { year: 'FY 2028-29', open: cost * (1 - 3 * rate), depr: cost * rate, close: cost * (1 - 4 * rate) },
        { year: 'FY 2029-30', open: cost * (1 - 4 * rate), depr: cost * rate, close: asset.salvage_value }
      ];

      const html = `
        <div style="margin-bottom:12px;">
          <strong style="color:#1e293b; font-size:1rem;">${asset.name} (${asset.asset_code})</strong>
          <div style="font-size:0.8rem; color:#64748b;">Method: ${asset.depreciation_method} &bull; Rate: ${asset.depreciation_rate}% &bull; Initial Cost: ${formatCurrency(asset.purchase_cost)}</div>
        </div>
        <table class="fams-table">
          <thead><tr><th>Fiscal Period</th><th>Opening Value</th><th>Depreciation</th><th>Closing Net Book Value</th></tr></thead>
          <tbody>
            ${schedule.map(s => `<tr><td><strong>${s.year}</strong></td><td>${formatCurrency(s.open)}</td><td style="color:#e74c3c;">-${formatCurrency(s.depr)}</td><td style="color:#0284c7; font-weight:700;">${formatCurrency(s.close)}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
      openModal(`Depreciation Schedule - ${asset.asset_code}`, '5-Year Statutory Fiscal Projection', html, 'trending-down');
    };
  });

  // Assign Asset Modal
  document.querySelectorAll('.btn-assign-asset').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      const state = getFamsState();
      const asset = state.assets.find(a => a.id === assetId);

      const html = `
        <div class="form-group">
          <label>Select Custodian / Employee</label>
          <select id="selectCustodianEmp" class="select-control">
            ${state.employees.map(e => `<option value="${e.id}">${e.name} (${e.designation})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Assignment Date</label>
          <input type="date" id="assignDate" class="input-control" value="2026-02-26" />
        </div>
        <div class="modal-footer" style="padding-top:12px;">
          <button class="btn btn-outline" onclick="document.getElementById('modalBackdrop').style.display='none'">Cancel</button>
          <button class="btn btn-primary" id="btnConfirmAssign">Assign Asset</button>
        </div>
      `;
      openModal('Assign Asset Custodian', `Allocate ${asset ? asset.name : ''}`, html, 'user-check');

      const confirmBtn = document.getElementById('btnConfirmAssign');
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          const empId = parseInt(document.getElementById('selectCustodianEmp').value);
          const emp = state.employees.find(e => e.id === empId);
          const assignDateVal = document.getElementById('assignDate') ? document.getElementById('assignDate').value : getIndianDateTime().slice(0, 10);
          if (asset) {
            asset.current_custodian_id = empId;
            asset.status = 'Assigned';
            state.auditLogs.unshift({
              id: Date.now(),
              user: getCurrentUser() ? getCurrentUser().name : 'Admin',
              action: 'ASSIGN',
              module: 'Asset Custody',
              details: `Assigned asset ${asset.asset_code} to ${emp ? emp.name : 'Employee'}`,
              time: getIndianDateTime(),
              ip: '10.20.1.45'
            });
            saveFamsState(state);
            closeModal();
            
            // Trigger automated email
            if (emp && emp.email) {
              showToast(`Asset allocated to ${emp.name}. Sending email receipt...`, 'success');
              sendCustodyNotification({
                type: 'ASSIGN',
                asset: asset,
                employee: emp,
                assignedDate: assignDateVal,
                departmentName: '',
                locationName: ''
              }).then(res => {
                if (res.success) {
                  showToast(`✓ Custody allocation receipt emailed to ${emp.email}`, 'success');
                }
              });
            } else {
              showToast(`Asset allocated to ${emp ? emp.name : 'Employee'}`, 'success');
            }

            navigateTo('asset-assignment');
          }
        };
      }
    };
  });

  // Return / Check In Asset
  document.querySelectorAll('.btn-return-asset').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      const state = getFamsState();
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        const prevEmp = asset.current_custodian_id ? state.employees.find(e => e.id === asset.current_custodian_id) : null;
        asset.current_custodian_id = null;
        asset.status = 'In Stock';
        
        state.auditLogs.unshift({
          id: Date.now(),
          user: getCurrentUser() ? getCurrentUser().name : 'Admin',
          action: 'UNTAG',
          module: 'Asset Custody',
          details: `Untagged and returned asset ${asset.asset_code} from custody`,
          time: getIndianDateTime(),
          ip: '10.20.1.45'
        });

        saveFamsState(state);

        if (prevEmp && prevEmp.email) {
          showToast(`Asset ${asset.asset_code} checked back into storage. Sending return notice...`, 'info');
          sendCustodyNotification({
            type: 'UNTAG',
            asset: asset,
            employee: prevEmp
          }).then(res => {
            if (res.success) {
              showToast(`✓ Return / untagged notice emailed to ${prevEmp.email}`, 'info');
            }
          });
        } else {
          showToast(`Asset ${asset.asset_code} checked back into storage`, 'info');
        }

        navigateTo('asset-assignment');
      }
    };
  });

  // Quick Live Scanner button
  const btnScan = document.getElementById('btnQuickScan');
  if (btnScan) {
    btnScan.onclick = () => {
      openModal('Live QR / Barcode Scanner', 'Optical Camera Recognition', `
        <div style="text-align:center; padding: 20px 0;">
          <div style="width: 180px; height: 180px; margin: 0 auto 16px auto; border: 2px dashed #1abc9c; border-radius: 6px; display:flex; align-items:center; justify-content:center; background:rgba(26, 188, 156, 0.05);">
            <i data-lucide="scan" style="width: 56px; height: 56px; color: #1abc9c;"></i>
          </div>
          <p style="font-size:0.85rem; color:#1e293b; font-weight:600;">Point optical camera at Asset Barcode / QR Label</p>
          <span style="font-size:0.75rem; color:#64748b;">Industrial optical recognition sensor active</span>
        </div>
      `, 'camera');
    };
  }

  // Backup button
  const btnBackup = document.getElementById('btnTriggerBackup');
  if (btnBackup) {
    btnBackup.onclick = () => {
      showToast('Encrypted SQL Backup snapshot generated and downloaded!', 'success');
    };
  }
}

// Initial router setup
window.addEventListener('DOMContentLoaded', () => {
  renderLoginOverlay();
  updateTopNavbarProfile();

  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash);
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

  const modalClose = document.getElementById('modalCloseBtn');
  if (modalClose) modalClose.onclick = closeModal;

  createIcons({ icons });
});
