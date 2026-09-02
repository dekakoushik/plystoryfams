# Enterprise Fixed Asset Management System (FAMS)

Clean, modern, corporate Fixed Asset Management System engineered with a high-performance interactive frontend and a structured Laravel 11 enterprise REST backend.

---

## 🏛 System Architecture

### 1. Frontend Web Application (`/frontend`)
- **Design Aesthetic**: Clean Corporate Dark Slate/Navy palette with glassmorphism touches, Lucide icons, responsive layout, dynamic charts, and interactive modals.
- **Modules Covered**:
  1. **Executive Dashboard**: Top-level KPI metric cards, category distribution charts, asset health indices, and live enrollment tables.
  2. **Asset Management Lifecycle**:
     - Asset Registration & Purchase Wizard (with auto-generated Tags & Barcodes)
     - Custodian Assignment & Return workflows
     - Inter-departmental Asset Transfers with multi-level approval triggers
     - Chronological Asset History & Movement Audit Trail
  3. **Service & Maintenance Modules**:
     - Warranty Management & Claims filing
     - Annual Maintenance Contract (AMC) renewal manager
     - Repair Tickets & Work Order dispatching
     - Preventive Maintenance (PM) inspection schedules
  4. **Financial Modules**:
     - Automated Depreciation Engine (SLM & WDV schedules)
     - Asset Revaluation & Impairment tracking
     - Asset Disposal, Scrap auctions & gain/loss calculations
  5. **Audit & Physical Tracking**:
     - Physical Floor Verification campaign dashboard
     - Barcode & QR Code Tag Generator with industrial print layouts
     - Live Camera QR/Barcode Scanner optical module
     - Asset Document Vault for PDF invoices, warranties & certificates
  6. **Master Modules (11 Master Tables)**:
     - Categories, Sub-categories, Vendors, Custodians/Employees, Departments, Locations, Statuses, Conditions, Depreciation Methods, Document Types, and Maintenance Types
  7. **Administration & Governance**:
     - User Management & RBAC Permission matrix
     - Multi-tier Approval Workflow rules
     - System Audit & Activity Security logs
  8. **Reports & BI Tools**:
     - Comprehensive Asset Register exports (CSV/PDF)
     - Fiscal Depreciation schedules
     - Bulk Data Import & Encrypted Database Snapshot/Backup

---

### 2. Laravel 11 Backend API (`/backend`)
- **Database Migrations**:
  - `create_fams_masters_tables.php` (All 11 lookup and structural master tables)
  - `create_fams_core_tables.php` (Assets, Assignments, Transfers, Histories, Maintenance, Warranties, AMC, Depreciation, Valuations, Disposals, Audits, Workflows, and System Logs)
- **Eloquent Models & Relationships**:
  - `Asset.php`, `MasterModels.php` (Departments, Locations, Categories, Vendors, Employees)
- **Services & Logic**:
  - `DepreciationService.php` (Formula engine for Straight Line & Reducing Balance methods)
- **RESTful Controllers & Routes**:
  - `AssetController.php`, `ReportController.php`, `api.php`
