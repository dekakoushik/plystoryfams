import { getFamsState, saveFamsState } from '../services/dataStore.js';
import { formatCurrency, showToast, openModal, closeModal } from '../services/uiUtils.js';

// 1. Depreciation Calculation Engine Module (India Schedule II & IT Act)
export function renderDepreciation() {
  const state = getFamsState();
  const assets = state.assets || [];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="trending-down" style="color:#f59e0b;"></i>
          <div>
            <h2>Depreciation Calculation Engine (India Accounting Standards)</h2>
            <span class="card-header-subtitle">Companies Act 2013 (SLM Schedule II) & Income Tax Act 1961 (WDV Block of Assets)</span>
          </div>
        </div>
        <button class="btn btn-emerald btn-sm" id="btnRunBatchDepreciation">
          <i data-lucide="calculator"></i> Run FY 2025-26 Depreciation
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name & Plant</th>
              <th>Statutory Method</th>
              <th>Depr. Rate / Life</th>
              <th>Gross Capital Cost</th>
              <th>Accumulated Depr.</th>
              <th>Net Book Value (Closing)</th>
              <th>Tax Schedule</th>
            </tr>
          </thead>
          <tbody>
            ${assets.map(a => {
              const accumulated = a.purchase_cost - a.current_book_value;
              return `
                <tr>
                  <td class="asset-tag-cell">${a.asset_code}</td>
                  <td><strong>${a.name}</strong></td>
                  <td><span class="badge ${a.depreciation_method === 'Straight Line' ? 'badge-assigned' : 'badge-transferred'}">${a.depreciation_method}</span></td>
                  <td>${a.depreciation_rate}% (${a.useful_life_years} Yrs)</td>
                  <td class="cost-cell">${formatCurrency(a.purchase_cost)}</td>
                  <td class="cost-cell" style="color:#f87171;">-${formatCurrency(accumulated)}</td>
                  <td class="cost-cell" style="color:#34d399; font-weight:700;">${formatCurrency(a.current_book_value)}</td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-view-depr-schedule" data-id="${a.id}">
                      <i data-lucide="table"></i> View Tax Schedule
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

// 2. Asset Valuation & Impairment (Ind AS 36)
export function renderAssetValuation() {
  const state = getFamsState();
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="coins" style="color:#10b981;"></i>
          <div>
            <h2>Asset Valuation & Impairment Testing (Ind AS 36)</h2>
            <span class="card-header-subtitle">Registered valuer assessments, plant upgrades, and fair value adjustments</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnNewValuation">
          <i data-lucide="plus"></i> Record Valuer Assessment
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Capital Cost (₹)</th>
              <th>Carrying Book Value (₹)</th>
              <th>Assessed Fair Value (₹)</th>
              <th>Gain / Variance (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.assets.map(a => `
              <tr>
                <td class="asset-tag-cell">${a.asset_code}</td>
                <td><strong>${a.name}</strong></td>
                <td class="cost-cell">${formatCurrency(a.purchase_cost)}</td>
                <td class="cost-cell">${formatCurrency(a.current_book_value)}</td>
                <td class="cost-cell" style="color:#38bdf8;">${formatCurrency(a.current_book_value * 1.08)}</td>
                <td style="color:#34d399; font-weight:600;">+${formatCurrency(a.current_book_value * 0.08)}</td>
                <td>
                  <button class="btn btn-outline btn-sm btn-revalue-modal" data-id="${a.id}">
                    <i data-lucide="edit-3"></i> Adjust Value
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 3. Disposal & Scrapping (GST on Asset Scrap)
export function renderDisposalScrap() {
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="trash-2" style="color:#ef4444;"></i>
          <div>
            <h2>Plant Asset Disposal & Scrap Sales</h2>
            <span class="card-header-subtitle">Decommissioning authorizations, GST on scrap metal auctions, and capital gain/loss calculation</span>
          </div>
        </div>
        <button class="btn btn-rose btn-sm" id="btnInitiateDisposal">
          <i data-lucide="plus"></i> Initiate Scrap Auction
        </button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Disposal ID</th>
              <th>Asset / Plant Machinery</th>
              <th>Disposal Method</th>
              <th>Book Value at Write-off</th>
              <th>Realized Scrap Value (excl. 18% GST)</th>
              <th>Capital Gain / Loss</th>
              <th>Approving Authority</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-family:var(--font-mono); font-weight:600; color:#f87171;">PLY-DSP-2026-004</td>
              <td><strong>Legacy 4-Foot Spindle Veneer Peeling Lathe (1998 Make)</strong></td>
              <td><span class="badge badge-disposed">Scrapped via Auction</span></td>
              <td class="cost-cell">${formatCurrency(450000)}</td>
              <td class="cost-cell">${formatCurrency(85000)}</td>
              <td style="color:#f87171; font-weight:700;">-${formatCurrency(365000)} (Capital Loss)</td>
              <td>Sneha Patel (CFO & Finance Director)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
