import { getFamsState, saveFamsState, getCurrentUser } from '../services/dataStore.js';
import { formatCurrency, showToast, openModal, closeModal, getIndianDateTime, getIndianDate } from '../services/uiUtils.js';
import { sendCustodyNotification } from '../services/emailService.js';

export function renderAssetRegister() {
  const state = getFamsState();
  const assets = state.assets || [];

  return `
    <div class="assets-module">
      <div class="fams-card">
        <div class="card-header-flex">
          <div class="card-header-title">
            <i data-lucide="boxes" style="color:#f25c23;"></i>
            <div>
              <h2>Fixed Asset Master Register (FAR)</h2>
              <span class="card-header-subtitle">Statutory Fixed Asset Register under Section 128 of Indian Companies Act 2013</span>
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline btn-sm" id="btnImportAssetsExcel" style="color:#845adf; border-color:#845adf;">
              <i data-lucide="upload-cloud"></i> Import Excel
            </button>
            <button class="btn btn-outline btn-sm" id="btnExportAssetsCsv">
              <i data-lucide="file-spreadsheet"></i> Export Excel
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="filter-bar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; background:#ffffff; padding:12px 14px; border-radius:8px; border:1px solid #eaedf1; margin-bottom:16px;">
          <div class="filter-group" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <div style="position:relative; display:flex; align-items:center;">
              <i data-lucide="search" style="position:absolute; left:10px; width:14px; height:14px; color:#8c9097;"></i>
              <input type="text" id="assetSearchFilter" class="input-control" placeholder="Search Tag, S/N, Plant, Make..." style="padding-left:32px; width: 240px;" />
            </div>
            
            <select id="filterCategory" class="select-control" style="width:190px;">
              <option value="">All Asset Categories</option>
              ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>

            <select id="filterDepartment" class="select-control" style="width:200px;">
              <option value="">All Plants & Departments</option>
              ${state.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>

            <select id="filterStatus" class="select-control" style="width:150px;">
              <option value="">All Statuses</option>
              ${(state.statuses || []).map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
              ${(!state.statuses || state.statuses.length === 0) ? `
                <option value="In Stock">In Stock</option>
                <option value="Assigned">Assigned</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Disposed">Disposed</option>
              ` : ''}
            </select>

            <button type="button" class="btn btn-outline btn-sm" id="btnResetAssetFilters" title="Clear Filters" style="display:none;">
              <i data-lucide="rotate-ccw"></i> Reset
            </button>
          </div>
          <span id="assetFilterCountDisplay" style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">Showing ${assets.length} of ${assets.length} Assets</span>
        </div>

        <!-- Main Data Table -->
        <div class="table-responsive">
          <table class="fams-table" id="assetRegisterTable">
            <thead>
              <tr>
                <th>Asset Tag (FAR)</th>
                <th>Serial Number</th>
                <th>Manufacturer / Brand / Make</th>
                <th>Asset Category</th>
                <th>Custodian</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${assets.map(asset => {
                const cat = state.categories.find(c => String(c.id) === String(asset.category_id) || c.code === asset.category_code || c.name === asset.category_name);
                const emp = state.employees.find(e => String(e.id) === String(asset.current_custodian_id) || e.code === asset.custodian_code || e.name === asset.custodian_name);
                const statusClass = asset.status === 'In Stock' ? 'badge-instock' :
                                    asset.status === 'Assigned' ? 'badge-assigned' :
                                    asset.status === 'In Maintenance' ? 'badge-maintenance' : 'badge-disposed';
                const make = asset.manufacturer || asset.make || '—';
                return `
                  <tr data-id="${asset.id}">
                    <td class="asset-tag-cell">
                      <strong>${asset.asset_code}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${asset.name}</div>
                    </td>
                    <td style="font-family:var(--font-mono); font-size:0.8rem; font-weight:600; color:var(--text-dark);">${asset.serial_number || 'N/A'}</td>
                    <td><strong>${make}</strong></td>
                    <td>${cat ? cat.name : '—'}</td>
                    <td>${emp ? emp.name : '<span style="color:var(--text-dim);">Unassigned</span>'}</td>
                    <td><span class="badge ${statusClass}"><span class="badge-dot"></span> ${asset.status}</span></td>
                    <td style="text-align: right;">
                      <div style="display:inline-flex; gap:6px;">
                        <button class="icon-btn-sm btn-asset-view" data-id="${asset.id}" title="View Asset Details" style="color:#0284c7;"><i data-lucide="eye"></i></button>
                        <button class="icon-btn-sm btn-asset-edit" data-id="${asset.id}" title="Edit Asset" style="color:#f59e0b;"><i data-lucide="edit-3"></i></button>
                        <button class="icon-btn-sm btn-asset-assign" data-id="${asset.id}" title="Assign Custodian" style="color:#10b981;"><i data-lucide="user-plus"></i></button>
                        <button class="icon-btn-sm btn-asset-history" data-id="${asset.id}" title="History Trail" style="color:#8b5cf6;"><i data-lucide="history"></i></button>
                        <button class="icon-btn-sm btn-asset-delete" data-id="${asset.id}" title="Delete Asset" style="color:#ef4444;"><i data-lucide="trash-2"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Attach all dynamic action listeners to FAR table
export function attachAssetRegisterListeners() {
  // View Details Action
  document.querySelectorAll('.btn-asset-view').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      openViewAssetModal(assetId);
    };
  });

  // Edit Asset Action
  document.querySelectorAll('.btn-asset-edit').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      openEditAssetModal(assetId);
    };
  });

  // Assign Custodian Action
  document.querySelectorAll('.btn-asset-assign').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      openAssignCustodianModal(assetId);
    };
  });

  // History Trail Action
  document.querySelectorAll('.btn-asset-history').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      openAssetHistoryModal(assetId);
    };
  });

  // Delete Asset Action
  document.querySelectorAll('.btn-asset-delete').forEach(btn => {
    btn.onclick = () => {
      const assetId = parseInt(btn.getAttribute('data-id'));
      handleDeleteAsset(assetId);
    };
  });

  // Search & Filter listeners
  const searchInput = document.getElementById('assetSearchFilter');
  const catFilter = document.getElementById('filterCategory');
  const deptFilter = document.getElementById('filterDepartment');
  const statusFilter = document.getElementById('filterStatus');
  const resetBtn = document.getElementById('btnResetAssetFilters');
  const countDisplay = document.getElementById('assetFilterCountDisplay');

  const applyFilters = () => {
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cat = catFilter ? catFilter.value : '';
    const dept = deptFilter ? deptFilter.value : '';
    const st = statusFilter ? statusFilter.value : '';

    const hasActiveFilter = !!q || !!cat || !!dept || !!st;
    if (resetBtn) resetBtn.style.display = hasActiveFilter ? 'inline-flex' : 'none';

    const rows = document.querySelectorAll('#assetRegisterTable tbody tr');
    let visibleCount = 0;
    const state = getFamsState();
    const totalCount = (state.assets || []).length;

    rows.forEach(tr => {
      const id = parseInt(tr.getAttribute('data-id'));
      const asset = state.assets.find(a => a.id === id);
      if (!asset) return;

      const matchesSearch = !q || 
        (asset.asset_code && asset.asset_code.toLowerCase().includes(q)) ||
        (asset.name && asset.name.toLowerCase().includes(q)) ||
        (asset.serial_number && asset.serial_number.toLowerCase().includes(q)) ||
        (asset.manufacturer && asset.manufacturer.toLowerCase().includes(q)) ||
        (asset.make && asset.make.toLowerCase().includes(q));

      const matchesCat = !cat || String(asset.category_id) === String(cat);
      const matchesDept = !dept || String(asset.department_id) === String(dept);
      const matchesStatus = !st || String(asset.status).toLowerCase() === String(st).toLowerCase();

      if (matchesSearch && matchesCat && matchesDept && matchesStatus) {
        tr.style.display = '';
        visibleCount++;
      } else {
        tr.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} of ${totalCount} Assets`;
    }
  };

  if (searchInput) searchInput.oninput = applyFilters;
  if (catFilter) catFilter.onchange = applyFilters;
  if (deptFilter) deptFilter.onchange = applyFilters;
  if (statusFilter) statusFilter.onchange = applyFilters;

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (searchInput) searchInput.value = '';
      if (catFilter) catFilter.value = '';
      if (deptFilter) deptFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      applyFilters();
    };
  }

  // Export Excel button (Full export of all asset register records with all columns)
  const exportBtn = document.getElementById('btnExportAssetsCsv');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const state = getFamsState();
      const assets = state.assets || [];
      if (assets.length === 0) {
        showToast('No asset records available to export!', 'error');
        return;
      }

      const headers = [
        'Asset Tag (FAR Code)',
        'Asset Name',
        'Manufacturer / Brand / Make',
        'Serial Number',
        'Model Number',
        'Category',
        'Sub-Category',
        'Description',
        'Purchase Date',
        'PO Number',
        'Invoice Number',
        'Vendor',
        'Purchase Cost (INR)',
        'Tax Amount (INR)',
        'Total Cost (INR)',
        'Current Net Book Value (INR)',
        'Plant Location',
        'Department',
        'Custodian',
        'Status',
        'Warranty Start',
        'Warranty End',
        'AMC Start',
        'AMC Expiry'
      ];

      const rows = assets.map(a => {
        const cat = state.categories.find(c => String(c.id) === String(a.category_id) || c.name === a.category_name);
        const subCat = (state.subCategories || []).find(sc => String(sc.id) === String(a.sub_category_id) || sc.name === a.sub_category_name);
        const loc = state.locations.find(l => String(l.id) === String(a.location_id) || l.name === a.location_name);
        const dept = state.departments.find(d => String(d.id) === String(a.department_id) || d.name === a.department_name);
        const emp = state.employees.find(e => String(e.id) === String(a.current_custodian_id) || e.name === a.custodian_name);
        const vendor = (state.vendors || []).find(v => String(v.id) === String(a.vendor_id) || v.name === a.vendor_name);

        return [
          `"${a.asset_code || ''}"`,
          `"${(a.name || '').replace(/"/g, '""')}"`,
          `"${a.manufacturer || a.make || ''}"`,
          `"${a.serial_number || ''}"`,
          `"${a.model_number || ''}"`,
          `"${cat ? cat.name : ''}"`,
          `"${subCat ? subCat.name : ''}"`,
          `"${(a.description || '').replace(/"/g, '""')}"`,
          `"${a.purchase_date || ''}"`,
          `"${a.po_number || ''}"`,
          `"${a.invoice_number || ''}"`,
          `"${vendor ? vendor.name : ''}"`,
          `"${a.purchase_cost || 0}"`,
          `"${a.tax_amount || 0}"`,
          `"${a.total_cost || a.purchase_cost || 0}"`,
          `"${a.current_book_value || 0}"`,
          `"${loc ? loc.name : ''}"`,
          `"${dept ? dept.name : ''}"`,
          `"${emp ? emp.name : ''}"`,
          `"${a.status || 'In Stock'}"`,
          `"${a.warranty_start_date || ''}"`,
          `"${a.warranty_expiry_date || ''}"`,
          `"${a.amc_start_date || ''}"`,
          `"${a.amc_expiry_date || ''}"`
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Plystory_Fixed_Asset_Register_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported all ${assets.length} fixed asset records into Excel format!`, 'success');
    };
  }

  // Import Excel button
  const importBtn = document.getElementById('btnImportAssetsExcel');
  if (importBtn) {
    importBtn.onclick = openImportAssetsModal;
  }
}

// 1. VIEW ASSET MODAL (Shows ONLY the exact fields from the Asset Registration database)
export function openViewAssetModal(assetId) {
  const state = getFamsState();
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;

  const cat = state.categories.find(c => String(c.id) === String(asset.category_id) || c.code === asset.category_code || c.name === asset.category_name);
  const subCat = (state.subCategories || []).find(sc => String(sc.id) === String(asset.sub_category_id) || sc.name === asset.sub_category_name);
  const loc = state.locations.find(l => String(l.id) === String(asset.location_id) || l.code === asset.location_code || l.name === asset.location_name);
  const dept = state.departments.find(d => String(d.id) === String(asset.department_id) || d.code === asset.department_code || d.name === asset.department_name);
  const emp = state.employees.find(e => String(e.id) === String(asset.current_custodian_id) || e.code === asset.custodian_code || e.name === asset.custodian_name);
  const vendor = (state.vendors || []).find(v => String(v.id) === String(asset.vendor_id) || v.name === asset.vendor_name);

  const statusClass = asset.status === 'In Stock' ? 'badge-instock' :
                      asset.status === 'Assigned' ? 'badge-assigned' :
                      asset.status === 'In Maintenance' ? 'badge-maintenance' : 'badge-disposed';

  const viewHtml = `
    <div style="font-size:0.85rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:14px 18px; border-radius:8px; margin-bottom:16px; border:1px solid #eaedf1;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Asset Tag / Code</span>
          <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:700; color:var(--primary);">${asset.asset_code}</div>
        </div>
        <div>
          <span class="badge ${statusClass}" style="font-size:0.85rem; padding:5px 12px;"><span class="badge-dot"></span> ${asset.status}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; background:#fff; padding:16px; border:1px solid #eaedf1; border-radius:8px; margin-bottom:16px;">
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Asset Name</span>
          <div style="font-weight:700; color:#1e293b; font-size:0.95rem;">${asset.name || '—'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Manufacturer / Brand / Make</span>
          <div style="font-weight:700; color:#1e293b;">${asset.manufacturer || asset.make || '—'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Serial Number</span>
          <div style="font-family:var(--font-mono); font-weight:600; color:#845adf;">${asset.serial_number || 'N/A'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Model Number</span>
          <div>${asset.model_number || '—'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Asset Category</span>
          <div>${cat ? cat.name : '—'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Asset Sub-Category</span>
          <div>${subCat ? subCat.name : '—'}</div>
        </div>

        <div style="grid-column: span 2;">
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Asset Description</span>
          <div>${asset.description || '—'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Purchase Date</span>
          <div>${asset.purchase_date || '—'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Purchase Order (PO)</span>
          <div>${asset.po_number || '—'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Invoice Number</span>
          <div>${asset.invoice_number || '—'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Vendor / Supplier</span>
          <div>${vendor ? vendor.name : '—'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Purchase Cost (₹)</span>
          <div style="font-weight:700; color:#1e293b;">${formatCurrency(asset.purchase_cost)}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Tax Amount (₹)</span>
          <div>${formatCurrency(asset.tax_amount || 0)}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Total Cost (₹)</span>
          <div style="font-weight:700; color:var(--primary);">${formatCurrency(asset.total_cost || asset.purchase_cost)}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Current Net Book Value (₹)</span>
          <div style="font-weight:700; color:#23b7e5;">${formatCurrency(asset.current_book_value)}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Plant / Facility Location</span>
          <div>${loc ? loc.name : '—'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Department</span>
          <div>${dept ? dept.name : '—'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Custodian Lead</span>
          <div style="font-weight:600;">${emp ? `${emp.name} (${emp.code})` : '<span style="color:var(--text-dim);">Unassigned</span>'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Status</span>
          <div><span class="badge ${statusClass}"><span class="badge-dot"></span> ${asset.status}</span></div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Warranty Timeline</span>
          <div>${asset.warranty_start_date ? `${asset.warranty_start_date} to ` : ''}${asset.warranty_expiry_date || 'N/A'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">AMC Contract Period</span>
          <div>${asset.amc_start_date ? `${asset.amc_start_date} to ` : ''}${asset.amc_expiry_date || 'N/A'}</div>
        </div>

        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Invoice Document</span>
          <div>${asset.invoice_file_name ? `<i data-lucide="file-text" style="width:12px; height:12px; color:#845adf;"></i> ${asset.invoice_file_name}` : 'None'}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Handover Document</span>
          <div>${asset.handover_file_name ? `<i data-lucide="file-check" style="width:12px; height:12px; color:#26bf94;"></i> ${asset.handover_file_name}` : 'None'}</div>
        </div>
      </div>

      <div class="modal-footer" style="padding-top:14px;">
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" id="btnViewToEdit" data-id="${asset.id}"><i data-lucide="edit-3"></i> Edit Asset Record</button>
      </div>
    </div>
  `;

  openModal(`Asset Details: ${asset.asset_code}`, `${asset.name}`, viewHtml, 'file-text');

  const toEditBtn = document.getElementById('btnViewToEdit');
  if (toEditBtn) {
    toEditBtn.onclick = () => {
      closeModal();
      openEditAssetModal(asset.id);
    };
  }
}

// Bulk Import Modal with Excel/CSV format template
export function openImportAssetsModal() {
  const state = getFamsState();

  const importHtml = `
    <div style="font-size:0.85rem;">
      <div style="background:#f4f6fa; padding:14px; border-radius:8px; margin-bottom:16px; border:1px solid #eaedf1;">
        <h4 style="color:#1e293b; font-weight:700; margin-bottom:4px;">Bulk Fixed Asset Import</h4>
        <p style="color:#64748b; font-size:0.8rem; margin-bottom:10px;">
          Import fixed assets in bulk using CSV / Excel format. Ensure column headers match the standard template format.
        </p>
        <button type="button" class="btn btn-outline btn-sm" id="btnDownloadAssetTemplate" style="color:#845adf; border-color:#845adf;">
          <i data-lucide="download"></i> Download Sample Excel / CSV Template
        </button>
      </div>

      <form id="formBulkImportAssets">
        <div class="form-group" style="margin-bottom:16px;">
          <label style="font-weight:600; margin-bottom:6px; display:block;">Select Excel / CSV File *</label>
          <input type="file" id="bulkAssetFileInput" class="input-control" accept=".csv, .txt, .xlsx, .xls" required style="padding:8px;" />
          <span style="font-size:0.72rem; color:#8c9097; display:block; margin-top:4px;">Supported: CSV format exported from Excel or ERP systems</span>
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label style="font-weight:600; margin-bottom:6px; display:block;">Or Paste CSV Asset Rows</label>
          <textarea id="bulkAssetPasteText" class="input-control" rows="4" placeholder="Asset Name,Manufacturer,Serial Number,Category,Purchase Cost&#10;Hydraulic Press Machine,Premier,PRM-991,1,4500000&#10;Silent Diesel Generator,Kirloskar,KIR-882,4,2200000"></textarea>
        </div>

        <div class="modal-footer" style="padding-top:14px; margin-top:16px;">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i data-lucide="upload"></i> Process & Import Assets</button>
        </div>
      </form>
    </div>
  `;

  openModal('Bulk Import Assets', 'Import Multiple Assets from Excel / CSV', importHtml, 'upload-cloud');

  // Template download handler
  const templateBtn = document.getElementById('btnDownloadAssetTemplate');
  if (templateBtn) {
    templateBtn.onclick = () => {
      const sampleHeaders = 'Asset Name,Manufacturer,Serial Number,Model Number,Category,Purchase Cost,Tax Amount,Purchase Date,PO Number,Invoice Number,Plant Location,Department,Status\n';
      const sampleRow1 = 'Heavy Duty Veneer Peeler,Premier Works,PRM-VEN-2026,V-600,1,6500000,1170000,2025-01-15,PO-2025-091,INV-2025-441,2,3,In Stock\n';
      const sampleRow2 = 'Core Composer Jointing Line,Kirloskar Make,KIR-JNT-441,CC-10,1,3200000,576000,2025-02-10,PO-2025-098,INV-2025-512,2,3,In Stock\n';
      const sampleContent = 'data:text/csv;charset=utf-8,\uFEFF' + sampleHeaders + sampleRow1 + sampleRow2;
      const encodedUri = encodeURI(sampleContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Plystory_Asset_Import_Template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Asset Import Template downloaded successfully!', 'info');
    };
  }

  // Import form handler
  const form = document.getElementById('formBulkImportAssets');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('bulkAssetFileInput');
      const pasteText = document.getElementById('bulkAssetPasteText').value.trim();

      const parseAndImport = (csvText) => {
        const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1 && !pasteText) {
          showToast('No asset data found in the uploaded file!', 'error');
          return;
        }

        const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
        let importedCount = 0;

        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2 && cols[0]) {
            const nextNum = (state.assets.length + 1).toString().padStart(3, '0');
            const code = `PLY-AST-2026-${nextNum}`;
            const name = cols[0];
            const make = cols[1] || 'Standard OEM';
            const serial = cols[2] || `SN-IMP-${Date.now()}-${i}`;
            const model = cols[3] || '';
            const catId = parseInt(cols[4]) || 1;
            const cost = parseFloat(cols[5]) || 100000;
            const tax = parseFloat(cols[6]) || 0;
            const total = cost + tax;

            const newAsset = {
              id: Date.now() + i,
              asset_code: code,
              name: name,
              manufacturer: make,
              make: make,
              serial_number: serial,
              model_number: model,
              category_id: catId,
              department_id: 3,
              location_id: 2,
              status: 'In Stock',
              purchase_cost: cost,
              tax_amount: tax,
              total_cost: total,
              current_book_value: total,
              purchase_date: new Date().toISOString().slice(0, 10)
            };

            state.assets.push(newAsset);
            importedCount++;
          }
        }

        if (importedCount > 0) {
          state.auditLogs.unshift({
            id: Date.now(),
            user: 'Rajesh Varma',
            action: 'IMPORT',
            module: 'Asset Register',
            details: `Bulk imported ${importedCount} assets via Excel/CSV format`,
            time: getIndianDateTime(),
            ip: '10.20.1.45'
          });

          saveFamsState(state);
          closeModal();
          showToast(`Successfully imported ${importedCount} assets into the registry!`, 'success');
          refreshAssetRegisterView();
        } else {
          showToast('Could not parse valid asset rows. Please check format.', 'error');
        }
      };

      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          parseAndImport(event.target.result);
        };
        reader.readAsText(fileInput.files[0]);
      } else if (pasteText) {
        parseAndImport(pasteText);
      } else {
        showToast('Please select a file or paste CSV content to import.', 'error');
      }
    };
  }
}

// 2. EDIT ASSET MODAL
export function openEditAssetModal(assetId) {
  const state = getFamsState();
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;

  const formHtml = `
    <form id="formEditAsset">
      <div>
        <h4 style="margin-bottom:12px; color:var(--primary); font-weight:600;">1. Core Asset Details</h4>
        <div class="form-grid-3">
          <div class="form-group">
            <label>Asset FAR Code / Asset ID</label>
            <input type="text" id="editAssetCode" class="input-control" value="${asset.asset_code}" readonly style="background-color:#f8fafc;" />
          </div>
          <div class="form-group">
            <label>Asset Name *</label>
            <input type="text" id="editAssetName" class="input-control" value="${asset.name || ''}" required />
          </div>
          <div class="form-group">
            <label>Manufacturer / Brand / Make *</label>
            <input type="text" id="editAssetMake" class="input-control" value="${asset.manufacturer || asset.make || ''}" required />
          </div>
        </div>
        
        <div class="form-grid-2">
          <div class="form-group">
            <label>Asset Category *</label>
            <select id="editAssetCategory" class="select-control" required>
              ${state.categories.map(c => `<option value="${c.id}" ${String(c.id) === String(asset.category_id) ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Asset Sub-Category</label>
            <select id="editAssetSubCategory" class="select-control">
              <option value="">Select Sub-Category...</option>
              ${(state.subCategories || []).map(sc => `<option value="${sc.id}" ${String(sc.id) === String(asset.sub_category_id) ? 'selected' : ''}>${sc.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label>Serial Number *</label>
            <input type="text" id="editAssetSerial" class="input-control" value="${asset.serial_number || ''}" required />
          </div>
          <div class="form-group">
            <label>Model Number</label>
            <input type="text" id="editAssetModel" class="input-control" value="${asset.model_number || ''}" />
          </div>
          <div class="form-group">
            <label>Asset Description</label>
            <input type="text" id="editAssetDesc" class="input-control" value="${asset.description || ''}" />
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0;" />

        <h4 style="margin-bottom:12px; color:var(--primary); font-weight:600;">2. Purchase & Financial Info (Optional)</h4>
        <div class="form-grid-4">
          <div class="form-group">
            <label>Purchase Date</label>
            <input type="date" id="editAssetDate" class="input-control" value="${asset.purchase_date || ''}" />
          </div>
          <div class="form-group">
            <label>Purchase Order (PO)</label>
            <input type="text" id="editAssetPo" class="input-control" value="${asset.po_number || ''}" />
          </div>
          <div class="form-group">
            <label>Invoice Number</label>
            <input type="text" id="editAssetInvoice" class="input-control" value="${asset.invoice_number || ''}" />
          </div>
          <div class="form-group">
            <label>Vendor / Supplier</label>
            <select id="editAssetVendor" class="select-control">
              <option value="">Select Vendor...</option>
              ${state.vendors.map(v => `<option value="${v.id}" ${String(v.id) === String(asset.vendor_id) ? 'selected' : ''}>${v.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-4">
          <div class="form-group">
            <label>Purchase Cost (₹)</label>
            <input type="number" step="0.01" id="editAssetCost" class="input-control" value="${asset.purchase_cost || 0}" />
          </div>
          <div class="form-group">
            <label>Tax Amount (₹)</label>
            <input type="number" step="0.01" id="editAssetTax" class="input-control" value="${asset.tax_amount || 0}" />
          </div>
          <div class="form-group">
            <label>Total Cost (₹)</label>
            <input type="number" step="0.01" id="editAssetTotal" class="input-control" value="${asset.total_cost || asset.purchase_cost || 0}" readonly style="background-color:#f1f5f9;" />
          </div>
          <div class="form-group">
            <label>Net Book Value (₹)</label>
            <input type="number" step="0.01" id="editAssetBookValue" class="input-control" value="${asset.current_book_value || 0}" />
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0;" />

        <h4 style="margin-bottom:12px; color:var(--primary); font-weight:600;">3. Deployment & Warranty (Optional)</h4>
        <div class="form-grid-4">
          <div class="form-group">
            <label>Location (Plant/Hub)</label>
            <select id="editAssetLoc" class="select-control">
              <option value="">Select Location...</option>
              ${state.locations.map(l => `<option value="${l.id}" ${String(l.id) === String(asset.location_id) ? 'selected' : ''}>${l.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select id="editAssetDept" class="select-control">
              <option value="">Select Dept...</option>
              ${state.departments.map(d => `<option value="${d.id}" ${String(d.id) === String(asset.department_id) ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="editAssetStatus" class="select-control">
              <option value="In Stock" ${asset.status === 'In Stock' ? 'selected' : ''}>In Stock</option>
              <option value="Assigned" ${asset.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
              <option value="In Maintenance" ${asset.status === 'In Maintenance' ? 'selected' : ''}>In Maintenance</option>
              <option value="Disposed" ${asset.status === 'Disposed' ? 'selected' : ''}>Disposed</option>
            </select>
          </div>
          <div class="form-group">
            <label>Custodian / Employee</label>
            <select id="editAssetCustodian" class="select-control">
              <option value="">Unassigned</option>
              ${state.employees.map(e => `<option value="${e.id}" ${String(e.id) === String(asset.current_custodian_id) ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div class="form-grid-4">
          <div class="form-group">
            <label>Warranty Start Date</label>
            <input type="date" id="editAssetWarrantyStart" class="input-control" value="${asset.warranty_start_date || ''}" />
          </div>
          <div class="form-group">
            <label>Warranty End Date</label>
            <input type="date" id="editAssetWarrantyEnd" class="input-control" value="${asset.warranty_expiry_date || ''}" />
          </div>
          <div class="form-group">
            <label>AMC Start Date</label>
            <input type="date" id="editAssetAmcStart" class="input-control" value="${asset.amc_start_date || ''}" />
          </div>
          <div class="form-group">
            <label>AMC Expiry Date</label>
            <input type="date" id="editAssetAmcEnd" class="input-control" value="${asset.amc_expiry_date || ''}" />
          </div>
        </div>
      </div>

      <div class="modal-footer" style="padding-top:14px; margin-top:18px;">
        <button type="button" class="btn btn-outline" id="btnCancelEditAsset">Cancel</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="check-circle-2"></i> Update Asset Record</button>
      </div>
    </form>
  `;

  openModal(`Edit Asset: ${asset.asset_code}`, `Modify details for ${asset.name}`, formHtml, 'edit-3');

  const form = document.getElementById('formEditAsset');
  const cancelBtn = document.getElementById('btnCancelEditAsset');
  if (cancelBtn) cancelBtn.onclick = closeModal;

  const costEl = document.getElementById('editAssetCost');
  const taxEl = document.getElementById('editAssetTax');
  const totalEl = document.getElementById('editAssetTotal');
  const calcTotal = () => {
    const cost = parseFloat(costEl.value) || 0;
    const tax = parseFloat(taxEl.value) || 0;
    totalEl.value = (cost + tax).toFixed(2);
  };
  if (costEl) costEl.addEventListener('input', calcTotal);
  if (taxEl) taxEl.addEventListener('input', calcTotal);

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const prevName = asset.name;
      const prevCost = asset.purchase_cost;
      const cost = parseFloat(document.getElementById('editAssetCost').value) || 0;
      const tax = parseFloat(document.getElementById('editAssetTax').value) || 0;
      const totalCost = cost + tax;
      const bookVal = parseFloat(document.getElementById('editAssetBookValue').value) || totalCost;
      const catId = parseInt(document.getElementById('editAssetCategory').value);
      const cat = state.categories.find(c => c.id === catId);

      asset.name = document.getElementById('editAssetName').value;
      asset.manufacturer = document.getElementById('editAssetMake').value;
      asset.make = asset.manufacturer;
      asset.category_id = catId;
      asset.sub_category_id = parseInt(document.getElementById('editAssetSubCategory').value) || null;
      asset.serial_number = document.getElementById('editAssetSerial').value;
      asset.model_number = document.getElementById('editAssetModel').value || '';
      asset.description = document.getElementById('editAssetDesc').value || '';

      asset.purchase_date = document.getElementById('editAssetDate').value || null;
      asset.po_number = document.getElementById('editAssetPo').value || '';
      asset.invoice_number = document.getElementById('editAssetInvoice').value || '';
      asset.vendor_id = parseInt(document.getElementById('editAssetVendor').value) || null;
      asset.purchase_cost = cost;
      asset.tax_amount = tax;
      asset.total_cost = totalCost;
      asset.current_book_value = bookVal;

      asset.location_id = parseInt(document.getElementById('editAssetLoc').value) || null;
      asset.department_id = parseInt(document.getElementById('editAssetDept').value) || null;
      asset.status = document.getElementById('editAssetStatus').value;
      asset.current_custodian_id = parseInt(document.getElementById('editAssetCustodian').value) || null;

      asset.warranty_start_date = document.getElementById('editAssetWarrantyStart').value || null;
      asset.warranty_expiry_date = document.getElementById('editAssetWarrantyEnd').value || null;
      asset.amc_start_date = document.getElementById('editAssetAmcStart').value || null;
      asset.amc_expiry_date = document.getElementById('editAssetAmcEnd').value || null;

      // Append detailed audit trail log
      state.auditLogs.unshift({
        id: Date.now(),
        asset_id: asset.id,
        asset_code: asset.asset_code,
        user: 'Rajesh Varma',
        action: 'UPDATE',
        module: 'Asset Register',
        details: `Updated asset specifications for ${asset.asset_code} (${asset.name}). Cost: ₹${cost}, Status: ${asset.status}`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      showToast(`Asset ${asset.asset_code} successfully updated!`, 'success');
      refreshAssetRegisterView();
    };
  }
}

// 3. ASSIGN CUSTODIAN MODAL
export function openAssignCustodianModal(assetId) {
  const state = getFamsState();
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;

  const currentEmp = state.employees.find(e => String(e.id) === String(asset.current_custodian_id));
  const currentDept = state.departments.find(d => String(d.id) === String(asset.department_id));
  const currentLoc = state.locations.find(l => String(l.id) === String(asset.location_id));

  const assignHtml = `
    <form id="formAssignCustodian">
      <div style="background:#f8fafc; padding:12px; border-radius:6px; margin-bottom:14px; border:1px solid #e2e8f0;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Asset Tag: <strong>${asset.asset_code}</strong></div>
        <div style="font-size:0.95rem; font-weight:700; color:var(--text-dark);">${asset.name}</div>
        <div style="font-size:0.8rem; color:var(--text-dim); margin-top:2px;">
          Current Custodian: <strong>${currentEmp ? currentEmp.name : 'Unassigned'}</strong> &bull; 
          Status: <strong>${asset.status}</strong> &bull; 
          Location: <strong>${currentLoc ? currentLoc.name : 'N/A'}</strong>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Select Custodian / Employee *</label>
          <select id="assignCustodianSelect" class="select-control" required>
            <option value="">Choose Custodian...</option>
            ${state.employees.map(e => `
              <option value="${e.id}" ${String(e.id) === String(asset.current_custodian_id) ? 'selected' : ''}>
                ${e.name} (${e.code} - ${e.designation || 'Lead'})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Assignment Status (from Master) *</label>
          <select id="assignStatusSelect" class="select-control" required>
            ${(state.statuses || []).map(s => `
              <option value="${s.name}" ${s.name === asset.status ? 'selected' : ''}>
                ${s.name} (${s.code})
              </option>
            `).join('')}
            ${(!state.statuses || state.statuses.length === 0) ? `
              <option value="Assigned" ${asset.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
              <option value="In Stock" ${asset.status === 'In Stock' ? 'selected' : ''}>In Stock</option>
              <option value="In Maintenance" ${asset.status === 'In Maintenance' ? 'selected' : ''}>In Maintenance</option>
            ` : ''}
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Department (from Master)</label>
          <select id="assignDeptSelect" class="select-control">
            <option value="">Select Department...</option>
            ${state.departments.map(d => `
              <option value="${d.id}" ${String(d.id) === String(asset.department_id) ? 'selected' : ''}>
                ${d.name} (${d.code})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Plant / Facility Location (from Master)</label>
          <select id="assignLocSelect" class="select-control">
            <option value="">Select Location...</option>
            ${state.locations.map(l => `
              <option value="${l.id}" ${String(l.id) === String(asset.location_id) ? 'selected' : ''}>
                ${l.name} (${l.code})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Assignment Date *</label>
          <input type="date" id="assignDateInput" class="input-control" value="${new Date().toISOString().slice(0, 10)}" required />
        </div>
        <div class="form-group">
          <label>Custody Handover Remarks / Purpose</label>
          <input type="text" id="assignRemarks" class="input-control" placeholder="e.g., Plant operation deployment, laptop allocation" />
        </div>
      </div>

      <div class="modal-footer" style="padding-top:14px; margin-top:16px;">
        <button type="button" class="btn btn-outline" id="btnCancelAssign">Cancel</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="user-check"></i> Confirm Assignment</button>
      </div>
    </form>
  `;

  openModal(`Assign Custodian: ${asset.asset_code}`, `Allocate asset custody & generate handover log`, assignHtml, 'user-plus');

  const form = document.getElementById('formAssignCustodian');
  const cancelBtn = document.getElementById('btnCancelAssign');
  if (cancelBtn) cancelBtn.onclick = closeModal;

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const empId = parseInt(document.getElementById('assignCustodianSelect').value) || null;
      const newStatus = document.getElementById('assignStatusSelect').value;
      const deptId = parseInt(document.getElementById('assignDeptSelect').value) || null;
      const locId = parseInt(document.getElementById('assignLocSelect').value) || null;
      const assignDate = document.getElementById('assignDateInput').value;
      const remarks = document.getElementById('assignRemarks').value || 'Standard allocation';
      
      const emp = empId ? (state.employees || []).find(e => String(e.id) === String(empId)) : null;
      const dept = deptId ? (state.departments || []).find(d => String(d.id) === String(deptId)) : null;
      const loc = locId ? (state.locations || []).find(l => String(l.id) === String(locId)) : null;

      const previousCustodianId = asset.current_custodian_id;
      const previousEmp = previousCustodianId ? (state.employees || []).find(e => String(e.id) === String(previousCustodianId)) : null;

      // Update main asset database record
      asset.current_custodian_id = empId;
      asset.status = newStatus;
      if (deptId) asset.department_id = deptId;
      if (locId) asset.location_id = locId;

      const userSession = getCurrentUser();
      const userName = userSession ? userSession.name : 'Admin';

      // Add detailed audit log event
      state.auditLogs.unshift({
        id: Date.now(),
        asset_id: asset.id,
        asset_code: asset.asset_code,
        user: userName,
        action: empId ? 'ASSIGN' : 'UNTAG',
        module: 'Asset Custody',
        details: empId 
          ? `Assigned custody of ${asset.asset_code} to ${emp ? emp.name : 'Employee'}. Status: ${newStatus}. Location: ${loc ? loc.name : 'Unchanged'}. Dept: ${dept ? dept.name : 'Unchanged'}. Date: ${assignDate}. Remarks: ${remarks}`
          : `Untagged / removed custodian from ${asset.asset_code}. Status: ${newStatus}. Date: ${assignDate}`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      
      // Trigger Automated Email Notifications
      if (empId && emp && emp.email) {
        showToast(`Asset ${asset.asset_code} assigned to ${emp.name}. Dispatching email notification...`, 'success');
        sendCustodyNotification({
          type: 'ASSIGN',
          asset: asset,
          employee: emp,
          assignedDate: assignDate,
          departmentName: dept ? dept.name : '',
          locationName: loc ? loc.name : '',
          remarks: remarks
        }).then(res => {
          if (res.success) {
            showToast(`✓ Custody allocation receipt emailed to ${emp.email}`, 'success');
          }
        });
      } else if (!empId && previousEmp && previousEmp.email) {
        showToast(`Asset ${asset.asset_code} untagged. Dispatching return notice email...`, 'info');
        sendCustodyNotification({
          type: 'UNTAG',
          asset: asset,
          employee: previousEmp,
          assignedDate: assignDate,
          departmentName: dept ? dept.name : '',
          locationName: loc ? loc.name : '',
          remarks: remarks
        }).then(res => {
          if (res.success) {
            showToast(`✓ Asset untagged notice emailed to ${previousEmp.email}`, 'info');
          }
        });
      } else {
        showToast(`Asset ${asset.asset_code} successfully updated!`, 'success');
      }

      refreshAssetRegisterView();
    };
  }
}

// 4. ASSET HISTORY TRAIL MODAL
export function openAssetHistoryModal(assetId) {
  const state = getFamsState();
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;

  // Filter logs for this specific asset (by asset_id or asset_code mention)
  const relatedLogs = (state.auditLogs || []).filter(l => 
    l.asset_id === asset.id || 
    (l.asset_code && l.asset_code === asset.asset_code) ||
    (l.details && l.details.includes(asset.asset_code))
  );

  const historyHtml = `
    <div style="font-size:0.85rem;">
      <div style="background:#f8fafc; padding:12px 16px; border-radius:6px; margin-bottom:16px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">AUDIT TRAIL FOR ASSET</div>
          <div style="font-family:var(--font-mono); font-size:1.05rem; font-weight:700; color:var(--primary);">${asset.asset_code} - ${asset.name}</div>
        </div>
        <span style="font-size:0.78rem; background:#ede9fe; color:#6b21a8; padding:3px 8px; border-radius:4px; font-weight:600;">
          ${relatedLogs.length} Historical Event${relatedLogs.length === 1 ? '' : 's'}
        </span>
      </div>

      ${relatedLogs.length === 0 ? `
        <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
          <i data-lucide="clock" style="width:36px; height:36px; margin-bottom:8px; color:var(--text-dim);"></i>
          <p>No logged modifications or movements recorded for this asset yet.</p>
        </div>
      ` : `
        <div class="audit-timeline" style="max-height:55vh; overflow-y:auto; padding-right:8px;">
          ${relatedLogs.map(log => `
            <div class="timeline-item" style="display:flex; gap:12px; margin-bottom:16px; position:relative;">
              <div style="width:30px; height:30px; border-radius:50%; background:${log.action === 'CREATE' ? '#10b981' : log.action === 'ASSIGN' ? '#3b82f6' : log.action === 'UPDATE' ? '#f59e0b' : '#6b7280'}; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;">
                <i data-lucide="${log.action === 'CREATE' ? 'plus' : log.action === 'ASSIGN' ? 'user-check' : log.action === 'UPDATE' ? 'edit-2' : 'activity'}" style="width:14px; height:14px;"></i>
              </div>
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; flex:1; box-shadow:var(--shadow-sm);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-weight:700; color:var(--text-dark);">${log.action}: ${log.module || 'FAR Registry'}</span>
                  <span style="font-size:0.75rem; color:var(--text-dim); font-family:var(--font-mono);">${log.time}</span>
                </div>
                <p style="font-size:0.82rem; color:var(--text-main); margin-bottom:6px;">${log.details}</p>
                <div style="font-size:0.72rem; color:var(--text-muted); border-top:1px solid #f1f5f9; padding-top:4px;">
                  <span>Logged by: <strong>${log.user}</strong></span> &bull; <span>IP: ${log.ip || '10.20.1.45'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <div class="modal-footer" style="padding-top:14px; margin-top:16px;">
        <button class="btn btn-primary" onclick="closeModal()">Done</button>
      </div>
    </div>
  `;

  openModal(`History Trail: ${asset.asset_code}`, `Complete audit logs, assignments & edit record`, historyHtml, 'history');
}

// 5. DELETE ASSET
export function handleDeleteAsset(assetId) {
  const state = getFamsState();
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;

  const confirmHtml = `
    <div style="text-align:center; padding:12px 0;">
      <div style="width:50px; height:50px; border-radius:50%; background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">
        <i data-lucide="alert-triangle" style="width:28px; height:28px;"></i>
      </div>
      <h3 style="font-size:1.05rem; font-weight:700; color:#1e293b; margin-bottom:6px;">Delete Asset Record?</h3>
      <p style="font-size:0.85rem; color:#64748b; margin-bottom:12px;">
        Are you sure you want to delete <strong>${asset.asset_code}</strong> (${asset.name})?<br>
        This action will remove the asset from the Fixed Asset Register.
      </p>
      <div class="modal-footer" style="justify-content:center; border:none; padding-top:8px;">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" id="btnConfirmDeleteAsset" style="background:#ef4444; border-color:#dc2626;">
          <i data-lucide="trash-2"></i> Yes, Delete Asset
        </button>
      </div>
    </div>
  `;

  openModal(`Confirm Deletion: ${asset.asset_code}`, 'Irreversible registry removal', confirmHtml, 'alert-triangle');

  const confirmBtn = document.getElementById('btnConfirmDeleteAsset');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      state.assets = state.assets.filter(a => a.id !== assetId);
      state.auditLogs.unshift({
        id: Date.now(),
        asset_id: asset.id,
        asset_code: asset.asset_code,
        user: 'Rajesh Varma',
        action: 'DELETE',
        module: 'Asset Register',
        details: `Deleted asset record ${asset.asset_code} (${asset.name})`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      showToast(`Asset ${asset.asset_code} has been deleted!`, 'error');
      refreshAssetRegisterView();
    };
  }
}

// Seamless instant view refresher without full page reload
export function refreshAssetRegisterView() {
  const container = document.getElementById('moduleContainer');
  if (container) {
    container.innerHTML = renderAssetRegister();
    attachAssetRegisterListeners();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ icons: window.lucide.icons });
    }
  }
}

// Modal Form for Registering New Capital Asset in INR
export function openRegisterAssetModal() {
  const state = getFamsState();
  const nextNum = (state.assets.length + 1).toString().padStart(3, '0');
  const generatedCode = `PLY-AST-2026-${nextNum}`;

  const formHtml = `
    <form id="formNewAsset">
      <div>
        <h4 style="margin-bottom:12px; color:var(--primary); font-weight:600;">1. Core Asset Details</h4>
        <div class="form-grid-3">
          <div class="form-group">
            <label>Asset FAR Code / Asset ID (Auto)</label>
            <input type="text" id="newAssetCode" class="input-control" value="${generatedCode}" readonly style="background-color:#f8fafc;" />
          </div>
          <div class="form-group">
            <label>Asset Name *</label>
            <input type="text" id="newAssetName" class="input-control" placeholder="e.g., Heavy Duty Lathe" required />
          </div>
          <div class="form-group">
            <label>Manufacturer / Brand / Make *</label>
            <input type="text" id="newAssetMake" class="input-control" placeholder="e.g., Kirloskar" required />
          </div>
        </div>
        
        <div class="form-grid-2">
          <div class="form-group">
            <label>Asset Category *</label>
            <select id="newAssetCategory" class="select-control" required>
              <option value="">Select Category...</option>
              ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Asset Sub-Category</label>
            <select id="newAssetSubCategory" class="select-control">
              <option value="">Select Sub-Category...</option>
              ${(state.subCategories || []).map(sc => `<option value="${sc.id}">${sc.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label>Serial Number *</label>
            <input type="text" id="newAssetSerial" class="input-control" placeholder="S/N" required />
          </div>
          <div class="form-group">
            <label>Model Number</label>
            <input type="text" id="newAssetModel" class="input-control" placeholder="Model No." />
          </div>
          <div class="form-group">
            <label>Asset Description</label>
            <input type="text" id="newAssetDesc" class="input-control" placeholder="Optional details..." />
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0;" />

        <h4 style="margin-bottom:12px; color:var(--primary); font-weight:600;">2. Purchase & Financial Info (Optional)</h4>
        <div class="form-grid-4">
          <div class="form-group">
            <label>Purchase Date</label>
            <input type="date" id="newAssetDate" class="input-control" />
          </div>
          <div class="form-group">
            <label>Purchase Order (PO)</label>
            <input type="text" id="newAssetPo" class="input-control" placeholder="PO Number" />
          </div>
          <div class="form-group">
            <label>Invoice Number</label>
            <input type="text" id="newAssetInvoice" class="input-control" placeholder="Invoice No." />
          </div>
          <div class="form-group">
            <label>Vendor / Supplier</label>
            <select id="newAssetVendor" class="select-control">
              <option value="">Select Vendor...</option>
              ${state.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-4">
          <div class="form-group">
            <label>Purchase Cost (₹)</label>
            <input type="number" step="0.01" id="newAssetCost" class="input-control" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label>Tax Amount (₹)</label>
            <input type="number" step="0.01" id="newAssetTax" class="input-control" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label>Total Cost (₹)</label>
            <input type="number" step="0.01" id="newAssetTotal" class="input-control" placeholder="0.00" readonly style="background-color:#f1f5f9;" />
          </div>
          <div class="form-group">
            <label>Invoice Upload</label>
            <input type="file" id="newAssetInvoiceFile" class="input-control" accept=".pdf,image/*" />
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0;" />

        <h4 style="margin-bottom:12px; color:var(--primary); font-weight:600;">3. Deployment & Warranty (Optional)</h4>
        <div class="form-grid-4">
          <div class="form-group">
            <label>Location (Plant/Hub)</label>
            <select id="newAssetLoc" class="select-control">
              <option value="">Select Location...</option>
              ${state.locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select id="newAssetDept" class="select-control">
              <option value="">Select Dept...</option>
              ${state.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="newAssetStatus" class="select-control">
              ${(state.statuses || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
              <option value="In Stock" ${(!state.statuses || state.statuses.length === 0) ? 'selected' : ''}>In Stock</option>
            </select>
          </div>
          <div class="form-group">
            <label>Custodian / Employee</label>
            <select id="newAssetCustodian" class="select-control">
              <option value="">Unassigned</option>
              ${state.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div class="form-grid-4">
          <div class="form-group">
            <label>Warranty Start Date</label>
            <input type="date" id="newAssetWarrantyStart" class="input-control" />
          </div>
          <div class="form-group">
            <label>Warranty End Date</label>
            <input type="date" id="newAssetWarrantyEnd" class="input-control" />
          </div>
          <div class="form-group">
            <label>AMC Start Date</label>
            <input type="date" id="newAssetAmcStart" class="input-control" />
          </div>
          <div class="form-group">
            <label>AMC Expiry Date</label>
            <input type="date" id="newAssetAmcEnd" class="input-control" />
          </div>
        </div>

        <div class="form-group" style="margin-top:10px;">
          <label>Upload Handover Document (Optional)</label>
          <input type="file" id="newAssetHandoverFile" class="input-control" accept=".pdf,image/*" />
        </div>
      </div>

      <div class="modal-footer" style="padding-top:14px; margin-top:18px;">
        <button type="button" class="btn btn-outline" id="btnCancelAssetModal">Cancel</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="check-circle-2"></i> Enroll Capital Asset</button>
      </div>
    </form>
  `;

  openModal('Enroll Capital Asset into FAR', 'Plystory Enterprise Fixed Asset Registry', formHtml, 'plus-circle');

  const form = document.getElementById('formNewAsset');
  const cancelBtn = document.getElementById('btnCancelAssetModal');
  if (cancelBtn) cancelBtn.onclick = closeModal;
  
  // Total cost calculator logic
  const costEl = document.getElementById('newAssetCost');
  const taxEl = document.getElementById('newAssetTax');
  const totalEl = document.getElementById('newAssetTotal');
  const calcTotal = () => {
    const cost = parseFloat(costEl.value) || 0;
    const tax = parseFloat(taxEl.value) || 0;
    totalEl.value = (cost + tax).toFixed(2);
  };
  if (costEl) costEl.addEventListener('input', calcTotal);
  if (taxEl) taxEl.addEventListener('input', calcTotal);

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      
      const cost = parseFloat(document.getElementById('newAssetCost').value) || 0;
      const tax = parseFloat(document.getElementById('newAssetTax').value) || 0;
      const totalCost = cost + tax;
      
      const catId = parseInt(document.getElementById('newAssetCategory').value);
      const cat = state.categories.find(c => c.id === catId);
      
      // Determine status string (either directly string if fallback, or lookup from state if id)
      let statusValue = document.getElementById('newAssetStatus').value;
      if (state.statuses && state.statuses.find(s => String(s.id) === String(statusValue))) {
         const statusObj = state.statuses.find(s => String(s.id) === String(statusValue));
         statusValue = statusObj.name;
      }

      const newAsset = {
        id: Date.now(),
        asset_code: document.getElementById('newAssetCode').value,
        name: document.getElementById('newAssetName').value,
        description: document.getElementById('newAssetDesc').value || '',
        manufacturer: document.getElementById('newAssetMake').value,
        make: document.getElementById('newAssetMake').value,
        model_number: document.getElementById('newAssetModel').value || '',
        serial_number: document.getElementById('newAssetSerial').value,
        
        category_id: catId,
        sub_category_id: parseInt(document.getElementById('newAssetSubCategory').value) || null,
        department_id: parseInt(document.getElementById('newAssetDept').value) || null,
        location_id: parseInt(document.getElementById('newAssetLoc').value) || null,
        vendor_id: parseInt(document.getElementById('newAssetVendor').value) || null,
        current_custodian_id: parseInt(document.getElementById('newAssetCustodian').value) || null,
        
        status: statusValue || 'In Stock',
        
        purchase_date: document.getElementById('newAssetDate').value || null,
        po_number: document.getElementById('newAssetPo').value || '',
        invoice_number: document.getElementById('newAssetInvoice').value || '',
        
        purchase_cost: cost,
        tax_amount: tax,
        total_cost: totalCost,
        current_book_value: totalCost, // By default initial book value is total capital cost
        salvage_value: 0,
        
        depreciation_method: cat ? cat.method : 'Straight Line',
        depreciation_rate: cat ? cat.rate : 15.0,
        useful_life_years: cat ? cat.life : 10,
        
        warranty_start_date: document.getElementById('newAssetWarrantyStart').value || null,
        warranty_expiry_date: document.getElementById('newAssetWarrantyEnd').value || null,
        amc_start_date: document.getElementById('newAssetAmcStart').value || null,
        amc_expiry_date: document.getElementById('newAssetAmcEnd').value || null,
        
        invoice_file_name: document.getElementById('newAssetInvoiceFile').files.length > 0 ? document.getElementById('newAssetInvoiceFile').files[0].name : null,
        handover_file_name: document.getElementById('newAssetHandoverFile').files.length > 0 ? document.getElementById('newAssetHandoverFile').files[0].name : null
      };

      state.assets.push(newAsset);
      state.auditLogs.unshift({
        id: Date.now(),
        asset_id: newAsset.id,
        asset_code: newAsset.asset_code,
        user: 'Rajesh Varma',
        action: 'CREATE',
        module: 'Asset Register',
        details: `Enrolled asset ${newAsset.asset_code} (${newAsset.name}) for ₹${newAsset.purchase_cost.toLocaleString('en-IN')}`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      showToast(`Asset ${newAsset.asset_code} successfully registered!`, 'success');
      refreshAssetRegisterView();
    };
  }
}
