import { getFamsState, saveFamsState } from '../services/dataStore.js';
import { showToast, openModal, closeModal, formatCurrency } from '../services/uiUtils.js';

let activeMasterTab = 'categories';

export function renderMasterModules() {
  const state = getFamsState();

  return `
    <div class="master-modules">
      <!-- Master Modules Navigation Pills -->
      <div class="master-subnav">
        <button class="master-subnav-btn ${activeMasterTab === 'categories' ? 'active' : ''}" data-master="categories" onclick="window.switchMasterTab('categories')">Category Master</button>
        <button class="master-subnav-btn ${activeMasterTab === 'subcategories' ? 'active' : ''}" data-master="subcategories" onclick="window.switchMasterTab('subcategories')">Sub-Category Master</button>
        <button class="master-subnav-btn ${activeMasterTab === 'vendors' ? 'active' : ''}" data-master="vendors" onclick="window.switchMasterTab('vendors')">Vendor / Supplier (GST)</button>
        <button class="master-subnav-btn ${activeMasterTab === 'employees' ? 'active' : ''}" data-master="employees" onclick="window.switchMasterTab('employees')">Custodian / Employee</button>
        <button class="master-subnav-btn ${activeMasterTab === 'departments' ? 'active' : ''}" data-master="departments" onclick="window.switchMasterTab('departments')">Department Master</button>
        <button class="master-subnav-btn ${activeMasterTab === 'locations' ? 'active' : ''}" data-master="locations" onclick="window.switchMasterTab('locations')">Plant & Hub Locations</button>
        <button class="master-subnav-btn ${activeMasterTab === 'statuses' ? 'active' : ''}" data-master="statuses" onclick="window.switchMasterTab('statuses')">Status Master</button>
        <button class="master-subnav-btn ${activeMasterTab === 'conditions' ? 'active' : ''}" data-master="conditions" onclick="window.switchMasterTab('conditions')">Condition Master</button>
        <button class="master-subnav-btn ${activeMasterTab === 'deprMethods' ? 'active' : ''}" data-master="deprMethods" onclick="window.switchMasterTab('deprMethods')">Depreciation Method</button>
        <button class="master-subnav-btn ${activeMasterTab === 'docTypes' ? 'active' : ''}" data-master="docTypes" onclick="window.switchMasterTab('docTypes')">Document Type</button>
        <button class="master-subnav-btn ${activeMasterTab === 'maintTypes' ? 'active' : ''}" data-master="maintTypes" onclick="window.switchMasterTab('maintTypes')">Maintenance Type</button>
      </div>

      <!-- Master Content Container -->
      <div class="fams-card" id="masterContentContainer">
        ${renderActiveMasterContent(activeMasterTab, state)}
      </div>
    </div>
  `;
}

export function setActiveMasterTab(tab) {
  activeMasterTab = tab;
}

export function getActiveMasterTab() {
  return activeMasterTab;
}

// Seamless instant tab switcher
window.switchMasterTab = function(masterKey) {
  activeMasterTab = masterKey;
  document.querySelectorAll('.master-subnav-btn').forEach(btn => {
    if (btn.getAttribute('data-master') === masterKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  refreshMasterView();
};

// Function to refresh solely the master content panel in real-time
export function refreshMasterView() {
  const container = document.getElementById('masterContentContainer');
  if (container) {
    const state = getFamsState();
    container.innerHTML = renderActiveMasterContent(activeMasterTab, state);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ icons: window.lucide.icons });
    }
  }
}

function renderActiveMasterContent(tab, state) {
  switch (tab) {
    case 'categories':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Asset Category & Block Master (India Schedule II)</h3>
            <span class="card-header-subtitle">Statutory useful lives & depreciation percentages</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('categories')"><i data-lucide="plus"></i> Add Category</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Asset Category Name</th><th>Accounting Method</th><th>Annual Rate</th><th>Useful Life</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.categories || []).map(c => `
              <tr id="row-cat-${c.id}">
                <td><code>${c.code}</code></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.method}</td>
                <td>${c.rate}%</td>
                <td>${c.life} Years</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('categories', '${c.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('categories', '${c.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'subcategories':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Sub-Category Master</h3>
            <span class="card-header-subtitle">Detailed classification mapped to parent asset categories</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('subcategories')"><i data-lucide="plus"></i> Add Sub-Category</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Sub-Category Name</th><th>Parent Category</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.subCategories || []).map(sc => {
              const cat = (state.categories || []).find(c => String(c.id) === String(sc.category_id));
              return `
                <tr id="row-subcat-${sc.id}">
                  <td><code>${sc.code}</code></td>
                  <td><strong>${sc.name}</strong></td>
                  <td>${cat ? cat.name : '—'}</td>
                  <td style="text-align:right;">
                    <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('subcategories', '${sc.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                    <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('subcategories', '${sc.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

    case 'vendors':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Vendor & Supplier Master (GSTIN Verified)</h3>
            <span class="card-header-subtitle">Industrial machinery OEMs, transport providers, and IT vendors</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('vendors')"><i data-lucide="plus"></i> Add Supplier</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Vendor Company</th><th>GSTIN Number</th><th>Contact Person</th><th>Email</th><th>Phone</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.vendors || []).map(v => `
              <tr id="row-vnd-${v.id}">
                <td><code>${v.code}</code></td>
                <td><strong>${v.name}</strong></td>
                <td><code>${v.gst_number || 'N/A'}</code></td>
                <td>${v.contact_person}</td>
                <td>${v.email}</td>
                <td>${v.phone}</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('vendors', '${v.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('vendors', '${v.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'employees':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Employee & Custodian Master</h3>
            <span class="card-header-subtitle">Company personnel with asset accountability</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('employees')"><i data-lucide="plus"></i> Add Custodian</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Emp Code</th><th>Employee Name</th><th>Email</th><th>Mobile Number</th><th>Department</th><th>Designation</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.employees || []).map(e => {
              const dept = (state.departments || []).find(d => String(d.id) === String(e.department_id));
              return `
                <tr id="row-emp-${e.id}">
                  <td><code>${e.code || '—'}</code></td>
                  <td><strong>${e.name}</strong></td>
                  <td>${e.email || '—'}</td>
                  <td>${e.phone || e.mobile || '—'}</td>
                  <td>${dept ? dept.name : '—'}</td>
                  <td>${e.designation || '—'}</td>
                  <td style="text-align:right;">
                    <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('employees', '${e.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                    <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('employees', '${e.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

    case 'departments':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Department & Function Master</h3>
            <span class="card-header-subtitle">Cost center allocation & custodian mapping</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('departments')"><i data-lucide="plus"></i> Add Department</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Department Name</th><th>Department Head</th><th>Description</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.departments || []).map(d => `
              <tr id="row-dept-${d.id}">
                <td><code>${d.code}</code></td>
                <td><strong>${d.name}</strong></td>
                <td>${d.head_name}</td>
                <td>${d.description}</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('departments', '${d.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('departments', '${d.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'locations':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Plant, Warehouse & Facility Location Master</h3>
            <span class="card-header-subtitle">Manufacturing plants, Data Centers & Regional Warehouses across India</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('locations')"><i data-lucide="plus"></i> Add Plant Location</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Location Title</th><th>Plant / Facility</th><th>Floor</th><th>Zone / Unit</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.locations || []).map(l => `
              <tr id="row-loc-${l.id}">
                <td><code>${l.code}</code></td>
                <td><strong>${l.name}</strong></td>
                <td>${l.building || '—'}</td>
                <td>${l.floor || '—'}</td>
                <td>${l.room || '—'}</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('locations', '${l.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('locations', '${l.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'statuses':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Asset Status Master</h3>
            <span class="card-header-subtitle">Lifecycle states and color badges</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('statuses')"><i data-lucide="plus"></i> Add Status</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Status Name</th><th>Color Badge</th><th>Description</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.statuses || []).map(s => `
              <tr id="row-stat-${s.id}">
                <td><code>${s.code}</code></td>
                <td><strong>${s.name}</strong></td>
                <td><span class="badge" style="background:${s.color}22; color:${s.color}; border:1px solid ${s.color}66;"><span class="badge-dot" style="background:${s.color};"></span> ${s.name}</span></td>
                <td>${s.description || '—'}</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('statuses', '${s.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('statuses', '${s.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'conditions':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Asset Condition Master</h3>
            <span class="card-header-subtitle">Physical operational health grades & scoring</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('conditions')"><i data-lucide="plus"></i> Add Condition</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Condition Grade</th><th>Health Score</th><th>Description</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.conditions || []).map(cd => `
              <tr id="row-cond-${cd.id}">
                <td><code>${cd.code}</code></td>
                <td><strong>${cd.name}</strong></td>
                <td><span class="badge badge-assigned">${cd.score || '—'}</span></td>
                <td>${cd.description || '—'}</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('conditions', '${cd.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('conditions', '${cd.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'deprMethods':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Depreciation Method Master</h3>
            <span class="card-header-subtitle">Accounting calculation formulas & legal compliance</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('deprMethods')"><i data-lucide="plus"></i> Add Method</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Method Name</th><th>Calculation Formula</th><th>Statutory Basis</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.deprMethods || []).map(dm => `
              <tr id="row-depr-${dm.id}">
                <td><code>${dm.code}</code></td>
                <td><strong>${dm.name}</strong></td>
                <td><code>${dm.formula}</code></td>
                <td>${dm.legal_basis}</td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('deprMethods', '${dm.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('deprMethods', '${dm.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'docTypes':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Document Type Master</h3>
            <span class="card-header-subtitle">Statutory attachment categories and retention compliance</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('docTypes')"><i data-lucide="plus"></i> Add Doc Type</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Document Type Name</th><th>Retention (Years)</th><th>Mandatory Under Law</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.docTypes || []).map(dt => `
              <tr id="row-doc-${dt.id}">
                <td><code>${dt.code}</code></td>
                <td><strong>${dt.name}</strong></td>
                <td>${dt.retention_years} Years</td>
                <td><span class="badge ${dt.required ? 'badge-disposed' : 'badge-instock'}">${dt.required ? 'Yes (Mandatory)' : 'Optional'}</span></td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('docTypes', '${dt.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('docTypes', '${dt.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'maintTypes':
      return `
        <div class="card-header-flex">
          <div>
            <h3>Maintenance Type Master</h3>
            <span class="card-header-subtitle">Classification for plant work orders & maintenance SLA</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.triggerOpenMasterModal('maintTypes')"><i data-lucide="plus"></i> Add Maintenance Type</button>
        </div>
        <table class="fams-table">
          <thead><tr><th>Code</th><th>Maintenance Type Name</th><th>Standard Frequency</th><th>Default Priority</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${(state.maintTypes || []).map(mt => `
              <tr id="row-maint-${mt.id}">
                <td><code>${mt.code}</code></td>
                <td><strong>${mt.name}</strong></td>
                <td>${mt.frequency}</td>
                <td><span class="badge badge-maintenance">${mt.priority}</span></td>
                <td style="text-align:right;">
                  <button class="icon-btn-sm" onclick="window.triggerOpenMasterModal('maintTypes', '${mt.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                  <button class="icon-btn-sm" onclick="window.triggerDeleteMasterEntity('maintTypes', '${mt.id}')" title="Delete"><i data-lucide="trash-2" style="color:#e74c3c;"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    default:
      return `<div style="padding: 20px; color: #64748b;">Select a master category above.</div>`;
  }
}

// Current open master state for modal
let currentModalContext = {
  masterKey: null,
  editId: null
};

export function openMasterFormModal(masterKey, editId = null) {
  currentModalContext.masterKey = masterKey;
  currentModalContext.editId = editId ? String(editId) : null;

  const state = getFamsState();
  const list = state[getCollectionKey(masterKey)] || [];
  const existingItem = currentModalContext.editId ? list.find(item => String(item.id) === String(currentModalContext.editId)) : null;

  const title = existingItem ? `Edit ${getMasterSingularName(masterKey)}` : `Add New ${getMasterSingularName(masterKey)}`;
  const subtitle = `Configure master data entity in Plystory FAMS`;

  const formFieldsHtml = getMasterFormFields(masterKey, existingItem, state);

  const modalHtml = `
    <div id="masterModalWrapper">
      ${formFieldsHtml}
      <div class="modal-footer" style="padding-top:14px; margin-top:14px;">
        <button type="button" class="btn btn-outline" onclick="window.famsCloseModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="window.triggerSaveMasterEntity()"><i data-lucide="check-circle-2"></i> ${existingItem ? 'Update Changes' : 'Save Entity'}</button>
      </div>
    </div>
  `;

  openModal(title, subtitle, modalHtml, 'database');
}

// Global handler for save button
window.triggerSaveMasterEntity = function() {
  const masterKey = currentModalContext.masterKey;
  const editId = currentModalContext.editId;
  const container = document.getElementById('masterModalWrapper');
  if (!container) return;

  const codeInput = container.querySelector('#mCode');
  const nameInput = container.querySelector('#mName');

  let code = codeInput ? codeInput.value.trim() : '';
  const name = nameInput ? nameInput.value.trim() : '';

  // Employee ID is optional: if left blank, leave empty or auto-assign blank
  if (!code && masterKey !== 'employees') {
    if (codeInput) codeInput.focus();
    showToast('Please enter code', 'error');
    return;
  }

  if (!name) {
    if (nameInput) nameInput.focus();
    showToast('Please enter title / name', 'error');
    return;
  }

  const state = getFamsState();
  const collKey = getCollectionKey(masterKey);
  if (!state[collKey]) state[collKey] = [];

  if (editId) {
    const index = state[collKey].findIndex(i => String(i.id) === String(editId));
    if (index !== -1) {
      const obj = { ...state[collKey][index], code, name };
      applyFieldValues(masterKey, obj, container);
      state[collKey][index] = obj;
      saveFamsState(state);
      showToast(`${name} updated successfully!`, 'success');
    }
  } else {
    const numericIds = state[collKey].map(i => parseInt(i.id)).filter(n => !isNaN(n));
    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : Date.now();
    const newObj = { id: newId, code, name };
    applyFieldValues(masterKey, newObj, container);
    state[collKey].push(newObj);
    saveFamsState(state);
    showToast(`${name} added to Master Registry!`, 'success');
  }

  // Hide modal
  closeModal();

  // Instant DOM redraw
  refreshMasterView();
};

window.famsCloseModal = closeModal;

window.triggerOpenMasterModal = function(masterKey, editId = null) {
  openMasterFormModal(masterKey, editId);
};

window.triggerDeleteMasterEntity = function(masterKey, id) {
  deleteMasterEntity(masterKey, id, () => {
    refreshMasterView();
  });
};

export function deleteMasterEntity(masterKey, id, onDeletedCallback = null) {
  const state = getFamsState();
  const collKey = getCollectionKey(masterKey);
  if (state[collKey]) {
    state[collKey] = state[collKey].filter(item => String(item.id) !== String(id));
    saveFamsState(state);
    showToast(`${getMasterSingularName(masterKey)} successfully removed.`, 'info');
    if (onDeletedCallback) onDeletedCallback();
  }
}

function getCollectionKey(masterKey) {
  switch (masterKey) {
    case 'categories': return 'categories';
    case 'subcategories': return 'subCategories';
    case 'vendors': return 'vendors';
    case 'employees': return 'employees';
    case 'departments': return 'departments';
    case 'locations': return 'locations';
    case 'statuses': return 'statuses';
    case 'conditions': return 'conditions';
    case 'deprMethods': return 'deprMethods';
    case 'docTypes': return 'docTypes';
    case 'maintTypes': return 'maintTypes';
    default: return masterKey;
  }
}

function getMasterSingularName(masterKey) {
  switch (masterKey) {
    case 'categories': return 'Category';
    case 'subcategories': return 'Sub-Category';
    case 'vendors': return 'Vendor / Supplier';
    case 'employees': return 'Employee / Custodian';
    case 'departments': return 'Department';
    case 'locations': return 'Location';
    case 'statuses': return 'Asset Status';
    case 'conditions': return 'Asset Condition';
    case 'deprMethods': return 'Depreciation Method';
    case 'docTypes': return 'Document Type';
    case 'maintTypes': return 'Maintenance Type';
    default: return 'Master Item';
  }
}

function getMasterFormFields(masterKey, item, state) {
  let autoCode = '';
  if (!item) {
    const collKey = getCollectionKey(masterKey);
    const list = state[collKey] || [];
    const numericIds = list.map(i => parseInt(i.id)).filter(n => !isNaN(n));
    const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const numStr = String(nextId).padStart(3, '0');
    
    switch (masterKey) {
      case 'categories': autoCode = 'CAT-' + numStr; break;
      case 'subcategories': autoCode = 'SUB-' + numStr; break;
      case 'vendors': autoCode = 'VND-' + numStr; break;
      case 'employees': autoCode = 'PLY-EMP-' + (100 + nextId); break;
      case 'departments': autoCode = 'DEP-' + numStr; break;
      case 'locations': autoCode = 'LOC-' + numStr; break;
      case 'statuses': autoCode = 'STAT-' + numStr; break;
      case 'conditions': autoCode = 'COND-' + numStr; break;
      case 'deprMethods': autoCode = 'MTHD-' + numStr; break;
      case 'docTypes': autoCode = 'DOC-' + numStr; break;
      case 'maintTypes': autoCode = 'MNT-' + numStr; break;
      default: autoCode = 'CODE-' + numStr; break;
    }
  }

  switch (masterKey) {
    case 'categories':
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Category Code *</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code : autoCode}" required />
          </div>
          <div class="form-group">
            <label>Category Name *</label>
            <input type="text" id="mName" class="input-control" placeholder="e.g., Solar Power Array System" value="${item ? item.name : ''}" required />
          </div>
        </div>
        <div class="form-grid-3">
          <div class="form-group">
            <label>Depreciation Method</label>
            <select id="mMethod" class="select-control">
              <option value="Straight Line" ${item && item.method === 'Straight Line' ? 'selected' : ''}>Straight Line Method (SLM)</option>
              <option value="Reducing Balance" ${item && item.method === 'Reducing Balance' ? 'selected' : ''}>Written Down Value (WDV)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Depreciation Rate (%)</label>
            <input type="number" step="0.01" id="mRate" class="input-control" value="${item ? item.rate : 15.0}" required />
          </div>
          <div class="form-group">
            <label>Useful Life (Years)</label>
            <input type="number" id="mLife" class="input-control" value="${item ? item.life : 10}" required />
          </div>
        </div>
      `;

    case 'subcategories':
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Sub-Category Code *</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code : autoCode}" required />
          </div>
          <div class="form-group">
            <label>Sub-Category Name *</label>
            <input type="text" id="mName" class="input-control" value="${item ? item.name : ''}" required />
          </div>
        </div>
        <div class="form-group">
          <label>Parent Category *</label>
          <select id="mParentCat" class="select-control">
            ${(state.categories || []).map(c => `<option value="${c.id}" ${item && String(item.category_id) === String(c.id) ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      `;

    case 'vendors':
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Vendor Code *</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code : autoCode}" required />
          </div>
          <div class="form-group">
            <label>Vendor / Company Name *</label>
            <input type="text" id="mName" class="input-control" value="${item ? item.name : ''}" required />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>GSTIN Number</label>
            <input type="text" id="mGstin" class="input-control" placeholder="27AAAAA0000A1Z5" value="${item ? item.gst_number || '' : ''}" />
          </div>
          <div class="form-group">
            <label>Contact Person</label>
            <input type="text" id="mContact" class="input-control" value="${item ? item.contact_person || '' : ''}" />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="mEmail" class="input-control" value="${item ? item.email || '' : ''}" />
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" id="mPhone" class="input-control" value="${item ? item.phone || '' : ''}" />
          </div>
        </div>
      `;

    case 'employees':
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Employee Code / ID (Optional)</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code || '' : ''}" placeholder="e.g., PLY-EMP-106 or leave blank" />
          </div>
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="mName" class="input-control" value="${item ? item.name : ''}" placeholder="Employee Full Name" required />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Email (Optional)</label>
            <input type="email" id="mEmail" class="input-control" value="${item ? item.email || '' : ''}" placeholder="name@plystory.com or leave blank" />
          </div>
          <div class="form-group">
            <label>Mobile Number (Optional)</label>
            <input type="tel" id="mPhone" class="input-control" value="${item ? item.phone || item.mobile || '' : ''}" placeholder="e.g., +91 98765 43210" />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Designation</label>
            <input type="text" id="mDesignation" class="input-control" value="${item ? item.designation || '' : ''}" placeholder="e.g., Senior Plant Engineer" />
          </div>
          <div class="form-group">
            <label>Department</label>
            <select id="mDept" class="select-control">
              ${(state.departments || []).map(d => `<option value="${d.id}" ${item && String(item.department_id) === String(d.id) ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `;

    case 'departments':
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Department Code *</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code : autoCode}" required />
          </div>
          <div class="form-group">
            <label>Department Name *</label>
            <input type="text" id="mName" class="input-control" value="${item ? item.name : ''}" required />
          </div>
        </div>
        <div class="form-group">
          <label>Department Head</label>
          <input type="text" id="mHead" class="input-control" value="${item ? item.head_name || '' : ''}" />
        </div>
        <div class="form-group">
          <label>Description / Scope</label>
          <input type="text" id="mDesc" class="input-control" value="${item ? item.description || '' : ''}" />
        </div>
      `;

    case 'locations':
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Location Code *</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code : autoCode}" required />
          </div>
          <div class="form-group">
            <label>Location Title *</label>
            <input type="text" id="mName" class="input-control" value="${item ? item.name : ''}" required />
          </div>
        </div>
        <div class="form-grid-3">
          <div class="form-group">
            <label>Plant / Building</label>
            <input type="text" id="mBuilding" class="input-control" value="${item ? item.building || '' : ''}" />
          </div>
          <div class="form-group">
            <label>Floor</label>
            <input type="text" id="mFloor" class="input-control" value="${item ? item.floor || '' : ''}" />
          </div>
          <div class="form-group">
            <label>Room / Zone</label>
            <input type="text" id="mRoom" class="input-control" value="${item ? item.room || '' : ''}" />
          </div>
        </div>
      `;

    default:
      return `
        <div class="form-grid-2">
          <div class="form-group">
            <label>Code *</label>
            <input type="text" id="mCode" class="input-control" value="${item ? item.code : autoCode}" required />
          </div>
          <div class="form-group">
            <label>Name *</label>
            <input type="text" id="mName" class="input-control" value="${item ? item.name : ''}" required />
          </div>
        </div>
        <div class="form-group">
          <label>Description / Notes</label>
          <input type="text" id="mDesc" class="input-control" value="${item ? item.description || item.formula || '' : ''}" />
        </div>
      `;
  }
}

function applyFieldValues(masterKey, obj, container) {
  if (masterKey === 'categories') {
    const elMethod = container.querySelector('#mMethod');
    const elRate = container.querySelector('#mRate');
    const elLife = container.querySelector('#mLife');
    obj.method = elMethod ? elMethod.value : 'Straight Line';
    obj.rate = elRate ? parseFloat(elRate.value) || 15.0 : 15.0;
    obj.life = elLife ? parseInt(elLife.value) || 10 : 10;
  } else if (masterKey === 'subcategories') {
    const elParent = container.querySelector('#mParentCat');
    obj.category_id = elParent ? parseInt(elParent.value) || 1 : 1;
  } else if (masterKey === 'vendors') {
    const elGstin = container.querySelector('#mGstin');
    const elContact = container.querySelector('#mContact');
    const elEmail = container.querySelector('#mEmail');
    const elPhone = container.querySelector('#mPhone');
    obj.gst_number = elGstin ? elGstin.value.trim() : '';
    obj.contact_person = elContact ? elContact.value.trim() : '';
    obj.email = elEmail ? elEmail.value.trim() : '';
    obj.phone = elPhone ? elPhone.value.trim() : '';
  } else if (masterKey === 'employees') {
    const elEmail = container.querySelector('#mEmail');
    const elPhone = container.querySelector('#mPhone');
    const elDesig = container.querySelector('#mDesignation');
    const elDept = container.querySelector('#mDept');
    obj.email = elEmail ? elEmail.value.trim() : '';
    obj.phone = elPhone ? elPhone.value.trim() : '';
    obj.mobile = obj.phone;
    obj.designation = elDesig ? elDesig.value.trim() : '';
    obj.department_id = elDept ? parseInt(elDept.value) || 1 : 1;
  } else if (masterKey === 'departments') {
    const elHead = container.querySelector('#mHead');
    const elDesc = container.querySelector('#mDesc');
    obj.head_name = elHead ? elHead.value.trim() : '';
    obj.description = elDesc ? elDesc.value.trim() : '';
  } else if (masterKey === 'locations') {
    const elBuilding = container.querySelector('#mBuilding');
    const elFloor = container.querySelector('#mFloor');
    const elRoom = container.querySelector('#mRoom');
    obj.building = elBuilding ? elBuilding.value.trim() : '';
    obj.floor = elFloor ? elFloor.value.trim() : '';
    obj.room = elRoom ? elRoom.value.trim() : '';
  } else {
    const elDesc = container.querySelector('#mDesc');
    if (elDesc) obj.description = elDesc.value.trim();
  }
}
