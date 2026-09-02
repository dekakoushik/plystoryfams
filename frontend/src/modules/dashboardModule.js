import { getFamsState } from '../services/dataStore.js';
import { formatCurrency } from '../services/uiUtils.js';

let selectedCategoryFilter = '';

export function renderDashboard() {
  const state = getFamsState();
  const allAssets = state.assets || [];

  // Filter assets if category filter is selected
  const assets = selectedCategoryFilter 
    ? allAssets.filter(a => String(a.category_id) === String(selectedCategoryFilter))
    : allAssets;

  const totalAssetsCount = assets.length;
  const totalGrossCost = assets.reduce((sum, a) => sum + (parseFloat(a.total_cost || a.purchase_cost) || 0), 0);
  const totalBookValue = assets.reduce((sum, a) => sum + (parseFloat(a.current_book_value) || 0), 0);
  const inStockCount = assets.filter(a => a.status === 'In Stock').length;
  const assignedCount = assets.filter(a => a.status === 'Assigned').length;
  const inMaintenanceCount = assets.filter(a => a.status === 'In Maintenance').length;
  const disposedCount = assets.filter(a => a.status === 'Disposed').length;

  // Location wise distribution from existing database
  const locationStats = (state.locations || []).map(loc => {
    const locAssets = assets.filter(a => String(a.location_id) === String(loc.id));
    const count = locAssets.length;
    const value = locAssets.reduce((sum, a) => sum + (parseFloat(a.total_cost || a.purchase_cost) || 0), 0);
    return {
      id: loc.id,
      name: loc.name,
      shortName: loc.name.split(' - ')[0] || loc.name,
      code: loc.code,
      count,
      value
    };
  });

  const maxLocCount = Math.max(...locationStats.map(l => l.count), 1);

  // Category wise distribution
  const categoryStats = (state.categories || []).map(cat => {
    const catAssets = allAssets.filter(a => String(a.category_id) === String(cat.id));
    const count = catAssets.length;
    const value = catAssets.reduce((sum, a) => sum + (parseFloat(a.total_cost || a.purchase_cost) || 0), 0);
    return {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      count,
      value
    };
  });

  return `
    <div class="dashboard-module">
      
      <!-- Top Header Toolbar with Category-Wise Filter -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; background:#ffffff; padding:14px 20px; border-radius:10px; border:1px solid #eaedf1; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div>
          <h2 style="font-size:1.1rem; font-weight:800; color:#1e293b; letter-spacing:-0.02em;">Executive Asset Overview</h2>
          <span style="font-size:0.78rem; color:#8c9097;">Real-time asset telemetry synchronized from Fixed Asset Register</span>
        </div>
        
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size:0.8rem; font-weight:700; color:#495667; display:flex; align-items:center; gap:6px;">
            <i data-lucide="filter" style="width:14px; height:14px; color:#845adf;"></i> Category Filter:
          </label>
          <select id="dashboardCategorySelect" class="select-control" style="width:230px; font-weight:600; padding:6px 12px; border-color:#d0d7de;">
            <option value="">All Categories (${allAssets.length} Assets)</option>
            ${(state.categories || []).map(c => `
              <option value="${c.id}" ${String(c.id) === String(selectedCategoryFilter) ? 'selected' : ''}>
                ${c.name} (${allAssets.filter(a => String(a.category_id) === String(c.id)).length})
              </option>
            `).join('')}
          </select>
          ${selectedCategoryFilter ? `
            <button class="btn btn-outline btn-sm" id="btnResetDashCat" style="color:#845adf;">
              <i data-lucide="rotate-ccw"></i> Reset
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 4 Primary KPI Summary Cards -->
      <div class="kpi-grid-mini" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 22px;">
        
        <!-- 1. Total Assets Card -->
        <div class="kpi-mini-card" style="border-left: 4px solid #845adf; padding:18px 20px;">
          <div class="kpi-mini-info">
            <span class="kpi-mini-title" style="font-size:0.75rem; font-weight:700; color:#8c9097;">TOTAL ASSETS</span>
            <span class="kpi-mini-val" style="color:#845adf; font-size:1.6rem; font-weight:800; margin:4px 0;">${totalAssetsCount}</span>
            <span class="kpi-mini-sub" style="font-size:0.75rem; color:#64748b;">${allAssets.length} Total in Database</span>
          </div>
          <div style="width:46px; height:46px; border-radius:12px; background:#f3f0fb; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="boxes" style="color:#845adf; width:24px; height:24px;"></i>
          </div>
        </div>

        <!-- 2. Asset Value (Total Cost) Card -->
        <div class="kpi-mini-card" style="border-left: 4px solid #23b7e5; padding:18px 20px;">
          <div class="kpi-mini-info">
            <span class="kpi-mini-title" style="font-size:0.75rem; font-weight:700; color:#8c9097;">ASSET VALUE (TOTAL COST)</span>
            <span class="kpi-mini-val" style="color:#23b7e5; font-size:1.5rem; font-weight:800; margin:4px 0;">${formatCurrency(totalGrossCost)}</span>
            <span class="kpi-mini-sub" style="font-size:0.75rem; color:#64748b;">Book Val: <strong>${formatCurrency(totalBookValue)}</strong></span>
          </div>
          <div style="width:46px; height:46px; border-radius:12px; background:#e8f7fc; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="indian-rupee" style="color:#23b7e5; width:24px; height:24px;"></i>
          </div>
        </div>

        <!-- 3. In Stock Card -->
        <div class="kpi-mini-card" style="border-left: 4px solid #26bf94; padding:18px 20px;">
          <div class="kpi-mini-info">
            <span class="kpi-mini-title" style="font-size:0.75rem; font-weight:700; color:#8c9097;">IN STOCK (AVAILABLE)</span>
            <span class="kpi-mini-val" style="color:#26bf94; font-size:1.6rem; font-weight:800; margin:4px 0;">${inStockCount}</span>
            <span class="kpi-mini-sub" style="font-size:0.75rem; color:#64748b;">${totalAssetsCount > 0 ? ((inStockCount / totalAssetsCount) * 100).toFixed(0) : 0}% of Filtered Assets</span>
          </div>
          <div style="width:46px; height:46px; border-radius:12px; background:#eaf8f4; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="archive" style="color:#26bf94; width:24px; height:24px;"></i>
          </div>
        </div>

        <!-- 4. Assigned Card -->
        <div class="kpi-mini-card" style="border-left: 4px solid #f5b849; padding:18px 20px;">
          <div class="kpi-mini-info">
            <span class="kpi-mini-title" style="font-size:0.75rem; font-weight:700; color:#8c9097;">ASSIGNED (CUSTODY)</span>
            <span class="kpi-mini-val" style="color:#f5b849; font-size:1.6rem; font-weight:800; margin:4px 0;">${assignedCount}</span>
            <span class="kpi-mini-sub" style="font-size:0.75rem; color:#64748b;">${inMaintenanceCount} In Maintenance &bull; ${disposedCount} Disposed</span>
          </div>
          <div style="width:46px; height:46px; border-radius:12px; background:#fef8ed; display:flex; align-items:center; justify-content:center;">
            <i data-lucide="user-check" style="color:#f5b849; width:24px; height:24px;"></i>
          </div>
        </div>

      </div>

      <!-- Mid Row: Location-Wise Bar Chart & Category Breakdown Cards -->
      <div class="dashboard-row-2" style="margin-bottom: 22px;">
        
        <!-- Location Wise Bar Chart -->
        <div class="fams-card" style="margin-bottom: 0;">
          <div class="card-header-flex">
            <div class="card-header-title">
              <i data-lucide="map-pin" style="color:#845adf; width:16px; height:16px;"></i>
              <h3 style="font-size:0.92rem;">LOCATION / PLANT WISE ASSET DISTRIBUTION</h3>
            </div>
            <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Live Distribution</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px; padding:10px 0;">
            ${locationStats.map(loc => {
              const pct = maxLocCount > 0 ? ((loc.count / maxLocCount) * 100) : 0;
              return `
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; margin-bottom:6px;">
                    <span style="font-weight:600; color:#1e293b;">${loc.shortName}</span>
                    <div>
                      <strong style="color:#845adf; font-size:0.9rem;">${loc.count} Assets</strong>
                      <span style="color:#8c9097; font-size:0.75rem; margin-left:8px;">(${formatCurrency(loc.value)})</span>
                    </div>
                  </div>
                  <div style="width:100%; height:10px; background:#f1f4f8; border-radius:6px; overflow:hidden;">
                    <div style="width:${Math.max(pct, loc.count > 0 ? 8 : 0)}%; height:100%; background:linear-gradient(90deg, #845adf, #23b7e5); border-radius:6px; transition:width 0.4s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Category Wise Breakdown Panel -->
        <div class="fams-card" style="margin-bottom: 0;">
          <div class="card-header-flex">
            <div class="card-header-title">
              <i data-lucide="tag" style="color:#23b7e5; width:16px; height:16px;"></i>
              <h3 style="font-size:0.92rem;">ASSET CATEGORY BREAKDOWN</h3>
            </div>
            <span style="font-size:0.75rem; color:#8c9097; font-weight:600;">Portfolio Summary</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; padding:6px 0;">
            ${categoryStats.map(cat => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #eaedf1;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="width:8px; height:8px; border-radius:50%; background:#23b7e5;"></span>
                  <div>
                    <div style="font-weight:700; font-size:0.83rem; color:#1e293b;">${cat.name}</div>
                    <span style="font-size:0.72rem; color:#8c9097;">Code: <strong>${cat.code}</strong></span>
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:700; color:#1e293b; font-size:0.88rem;">${cat.count} Units</div>
                  <div style="font-size:0.74rem; font-weight:600; color:#845adf;">${formatCurrency(cat.value)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Bottom: Synced Assets Data Table -->
      <div class="fams-card">
        <div class="card-header-flex">
          <div class="card-header-title">
            <i data-lucide="table" style="color:#26bf94; width:16px; height:16px;"></i>
            <h3 style="font-size:0.92rem;">FIXED ASSET INVENTORY (LIVE DATABASE)</h3>
          </div>
          <a href="#assets" class="btn btn-outline btn-sm" style="color:#845adf; border-color:#845adf;">
            <i data-lucide="external-link"></i> Go To Asset Register (FAR) &rarr;
          </a>
        </div>

        ${assets.length === 0 ? `
          <div style="text-align:center; padding:30px; color:#8c9097;">
            <i data-lucide="inbox" style="width:40px; height:40px; color:#cbd5e1; margin-bottom:8px;"></i>
            <div style="font-weight:600; color:#1e293b;">No Assets In Selected Category</div>
            <p style="font-size:0.8rem; margin-top:2px;">Switch the category filter above or register new assets in the FAR module.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="fams-table">
              <thead>
                <tr>
                  <th>Asset Tag (FAR)</th>
                  <th>Asset Name</th>
                  <th>Make / Brand</th>
                  <th>Serial Number</th>
                  <th>Location</th>
                  <th>Custodian</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${assets.map(asset => {
                  const loc = state.locations.find(l => String(l.id) === String(asset.location_id));
                  const emp = state.employees.find(e => String(e.id) === String(asset.current_custodian_id));
                  const statusClass = asset.status === 'In Stock' ? 'badge-instock' :
                                      asset.status === 'Assigned' ? 'badge-assigned' :
                                      asset.status === 'In Maintenance' ? 'badge-maintenance' : 'badge-disposed';
                  return `
                    <tr>
                      <td class="asset-tag-cell" style="font-family:var(--font-mono); font-weight:700; color:#845adf;">${asset.asset_code}</td>
                      <td><strong>${asset.name}</strong></td>
                      <td>${asset.manufacturer || asset.make || '—'}</td>
                      <td style="font-family:var(--font-mono); font-size:0.8rem;">${asset.serial_number || 'N/A'}</td>
                      <td>${loc ? loc.name.split(' - ')[0] : '—'}</td>
                      <td>${emp ? `<strong>${emp.name}</strong>` : '<span style="color:#8c9097;">Unassigned</span>'}</td>
                      <td class="cost-cell" style="font-weight:700; color:#1e293b;">${formatCurrency(asset.total_cost || asset.purchase_cost)}</td>
                      <td><span class="badge ${statusClass}"><span class="badge-dot"></span> ${asset.status}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;
}

// Attach interactive listeners for the Dashboard
export function attachDashboardListeners() {
  const catSelect = document.getElementById('dashboardCategorySelect');
  if (catSelect) {
    catSelect.onchange = () => {
      selectedCategoryFilter = catSelect.value;
      if (window.navigateTo) window.navigateTo('dashboard');
    };
  }

  const resetBtn = document.getElementById('btnResetDashCat');
  if (resetBtn) {
    resetBtn.onclick = () => {
      selectedCategoryFilter = '';
      if (window.navigateTo) window.navigateTo('dashboard');
    };
  }
}
