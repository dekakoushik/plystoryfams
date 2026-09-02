import { getFamsState, saveFamsState } from '../services/dataStore.js';
import { formatCurrency, showToast, openModal, closeModal } from '../services/uiUtils.js';

// 1. Physical Asset Audit Module (India Statutory)
export function renderPhysicalAudit() {
  const state = getFamsState();
  const campaign = state.auditCampaigns[0];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="scan-face" style="color:#38bdf8;"></i>
          <div>
            <h2>Physical Asset Audit & Floor Verification (Statutory Form FAR)</h2>
            <span class="card-header-subtitle">Statutory verification campaigns under CARO (Companies Auditor's Report Order) 2020</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnLaunchAuditScanner">
          <i data-lucide="camera"></i> Launch Floor Auditor Scanner
        </button>
      </div>

      <!-- Audit Progress Stats -->
      <div class="kpi-grid" style="margin-bottom: 20px;">
        <div class="kpi-card cyan">
          <div class="kpi-info">
            <span class="kpi-label">Floor Audit Progress</span>
            <span class="kpi-value">${Math.round((campaign.verified / campaign.total_assets) * 100)}%</span>
            <span class="kpi-subtext positive">${campaign.verified} of ${campaign.total_assets} Assets Scanned</span>
          </div>
          <div class="kpi-icon"><i data-lucide="check-circle-2"></i></div>
        </div>

        <div class="kpi-card emerald">
          <div class="kpi-info">
            <span class="kpi-label">Matched & Verified (CARO)</span>
            <span class="kpi-value">${campaign.verified}</span>
            <span class="kpi-subtext positive">Exact Plant Location & Active Working</span>
          </div>
          <div class="kpi-icon"><i data-lucide="check"></i></div>
        </div>

        <div class="kpi-card amber">
          <div class="kpi-info">
            <span class="kpi-label">Location Discrepancies</span>
            <span class="kpi-value">${campaign.misplaced}</span>
            <span class="kpi-subtext warning">Moved without formal Gatepass</span>
          </div>
          <div class="kpi-icon"><i data-lucide="alert-triangle"></i></div>
        </div>

        <div class="kpi-card rose">
          <div class="kpi-info">
            <span class="kpi-label">Unaccounted / Missing</span>
            <span class="kpi-value">${campaign.missing}</span>
            <span class="kpi-subtext" style="color:var(--accent-rose);">Flagged for Internal Inquiry</span>
          </div>
          <div class="kpi-icon"><i data-lucide="help-circle"></i></div>
        </div>
      </div>
    </div>
  `;
}

// 2. Barcode & QR Code Management & Batch Label Printing
export function renderBarcodeQr() {
  const state = getFamsState();
  const assets = state.assets || [];

  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="qr-code" style="color:#06b6d4;"></i>
          <div>
            <h2>Plystory Barcode & QR Asset Tag Generation</h2>
            <span class="card-header-subtitle">Standardized Code128 & QR labels formatted for industrial zebra tag printers</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.print()">
          <i data-lucide="printer"></i> Print Batch Labels
        </button>
      </div>

      <div class="barcode-card-grid">
        ${assets.map(a => `
          <div class="barcode-badge-card">
            <div class="barcode-company">PLYSTORY ENTERPRISE &bull; FIXED ASSET</div>
            <div class="barcode-asset-name">${a.name}</div>
            
            <div class="qr-code-box">
              <svg viewBox="0 0 100 100" width="90" height="90" fill="#ffffff">
                <path d="M0 0h30v30H0zm4 4h22v22H4zm3 3h16v16H7zM70 0h30v30H70zm4 4h22v22H74zm3 3h16v16H77zM0 70h30v30H0zm4 4h22v22H4zm3 3h16v16H7zM40 10h10v10H40zm10 20h10v10H50zm-10 10h10v10H40zm20 10h10v10H60zm-10 20h10v10H50zm30-10h10v10H80zm0 20h10v10H80zm-40 10h10v10H40zm20 0h10v10H60z"/>
              </svg>
            </div>

            <div class="barcode-visual">||| | | |||| || | ||</div>
            <div style="font-family:var(--font-mono); font-weight:800; font-size:0.88rem; color:#0f172a;">${a.barcode}</div>
            <div class="barcode-footer">TAG: ${a.asset_code} &bull; PROPERTY OF PLYSTORY</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 3. Asset Documents Vault
export function renderAssetDocuments() {
  return `
    <div class="fams-card">
      <div class="card-header-flex">
        <div class="card-header-title">
          <i data-lucide="file-text" style="color:#8b5cf6;"></i>
          <div>
            <h2>Central Asset Documents & GST Invoice Vault</h2>
            <span class="card-header-subtitle">Statutory storage for Tax Invoices (Form GSTR-2B), OEM Warranties & Insurance Policies</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm"><i data-lucide="upload-cloud"></i> Upload New Document</button>
      </div>

      <div class="table-responsive">
        <table class="fams-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Asset Associated</th>
              <th>Statutory Type</th>
              <th>File Size</th>
              <th>Uploaded Date</th>
              <th>Expiry Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong><i data-lucide="file-text"></i> Premier_HotPress_GST_TaxInvoice_INV-889.pdf</strong></td>
              <td>PLY-AST-2026-001 (Hydraulic Hot Press)</td>
              <td><span class="badge badge-instock">Tax Invoice & E-Way Bill</span></td>
              <td>3.8 MB</td>
              <td>2024-04-01</td>
              <td>—</td>
              <td><button class="btn btn-outline btn-sm"><i data-lucide="download"></i> Download</button></td>
            </tr>
            <tr>
              <td><strong><i data-lucide="file-check"></i> Kirloskar_Genset_AMC_Contract_2026.pdf</strong></td>
              <td>PLY-AST-2026-002 (Kirloskar 1000kVA DG)</td>
              <td><span class="badge badge-assigned">AMC Contract</span></td>
              <td>2.9 MB</td>
              <td>2024-05-15</td>
              <td>2026-11-30</td>
              <td><button class="btn btn-outline btn-sm"><i data-lucide="download"></i> Download</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
