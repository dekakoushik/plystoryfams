// Plystory FAMS - India Corporate Dataset & Local Storage Engine

export const initialData = {
  departments: [
    { id: 1, code: 'DEP-IT', name: 'Information Technology & Infra', head_name: 'Rajesh Sharma', description: 'Tech systems, cloud and network operations' },
    { id: 2, code: 'DEP-FIN', name: 'Finance & Accounts', head_name: 'Pooja Iyer', description: 'Treasury, GST compliance and asset audit' },
    { id: 3, code: 'DEP-MFG', name: 'Manufacturing & Plywood Plant', head_name: 'Vikramaditya Rao', description: 'Hydraulic presses, peeling & factory lines' },
    { id: 4, code: 'DEP-OPS', name: 'Supply Chain & Logistics', head_name: 'Amitabh Sen', description: 'Warehousing, raw timber transit and dispatch' },
    { id: 5, code: 'DEP-HR', name: 'Human Resources & Admin', head_name: 'Sunita Menon', description: 'Corporate facilities and personnel management' },
    { id: 6, code: 'DEP-QC', name: 'Quality Control & Lab Testing', head_name: 'Dr. Alok Verma', description: 'BIS / ISI compliance and resin testing' }
  ],
  locations: [
    { id: 1, code: 'LOC-HQ-BLR', name: 'Plystory Corporate HQ - Bengaluru', building: 'Prestige Tech Cloud', floor: 'Level 4', room: 'Suite 401' },
    { id: 2, code: 'LOC-PLANT-GJ', name: 'Plywood & Veneer Plant - Gandhidham, Gujarat', building: 'Heavy Industry Zone A', floor: 'Ground', room: 'Pressing Unit 1' },
    { id: 3, code: 'LOC-DC-MUM', name: 'Tier-4 Data Center - Mumbai (Navi Mumbai)', building: 'Sify Infinit Spaces', floor: 'B1', room: 'Server Vault A4' },
    { id: 4, code: 'LOC-WH-DEL', name: 'North India Central Distribution Hub - Gurugram', building: 'Logistics Park Phase II', floor: 'Ground', room: 'Bay 12' }
  ],
  categories: [
    { id: 1, code: 'CAT-IND-MACH', name: 'Industrial Plywood Machinery & Presses', method: 'Straight Line', rate: 15.0, life: 10 },
    { id: 2, code: 'CAT-IT-HW', name: 'IT Hardware, Servers & Compute', method: 'Straight Line', rate: 33.33, life: 3 },
    { id: 3, code: 'CAT-NET-COMM', name: 'Networking & Telecommunications', method: 'Straight Line', rate: 20.0, life: 5 },
    { id: 4, code: 'CAT-HV-PWR', name: 'Heavy Power Gen & Solar Plants', method: 'Reducing Balance', rate: 15.0, life: 15 },
    { id: 5, code: 'CAT-FLEET', name: 'Commercial Logistics & Fleet Vehicles', method: 'Reducing Balance', rate: 30.0, life: 6 },
    { id: 6, code: 'CAT-OFF-FURN', name: 'Office Furniture, Fitouts & Fixtures', method: 'Straight Line', rate: 10.0, life: 10 }
  ],
  subCategories: [
    { id: 1, category_id: 1, code: 'SUB-HYD-PRESS', name: 'Multi-Daylight Hydraulic Hot Press' },
    { id: 2, category_id: 1, code: 'SUB-PEEL-LATHE', name: 'Heavy Duty Core Veneer Peeling Lathe' },
    { id: 3, category_id: 2, code: 'SUB-SRV-RACK', name: 'Enterprise Hyper-Converged Rack Servers' },
    { id: 4, category_id: 2, code: 'SUB-DEV-LAP', name: 'Corporate Executive Laptops' },
    { id: 5, category_id: 4, code: 'SUB-DG-SET', name: 'Industrial Silent DG Genset (Kirloskar / Cummins)' },
    { id: 6, category_id: 5, code: 'SUB-TRUCK', name: 'Heavy Commercial Transport Trucks (Tata / Ashok Leyland)' }
  ],
  vendors: [
    { id: 1, code: 'VND-KIRLOSKAR', name: 'Kirloskar Oil Engines Ltd', contact_person: 'Anil Deshmukh', email: 'corporate@kirloskar.co.in', phone: '+91 20 2581 0341', gst_number: '27AAACK1234F1Z8' },
    { id: 2, code: 'VND-TATA-MOTORS', name: 'Tata Motors Commercial Vehicles', contact_person: 'Ramesh Kulkarni', email: 'fleet.sales@tatamotors.com', phone: '+91 22 6656 1800', gst_number: '27AAACT2727Q1ZW' },
    { id: 3, code: 'VND-DELL-INDIA', name: 'Dell Technologies India Pvt Ltd', contact_person: 'Kavita Sundaram', email: 'enterprise_in@dell.com', phone: '+91 80 2510 8000', gst_number: '29AAACD4532L1Z4' },
    { id: 4, code: 'VND-PREMIER-MACH', name: 'Premier Industrial Plywood Machinery Works', contact_person: 'Harpreet Singh', email: 'sales@premiermachinery.in', phone: '+91 161 245 8890', gst_number: '03AAACP9981K1Z2' }
  ],
  employees: [
    { id: 1, code: 'PLY-EMP-101', name: 'Arun Varma', email: 'arun.varma@plystory.in', department_id: 1, designation: 'Principal Enterprise Architect' },
    { id: 2, code: 'PLY-EMP-102', name: 'Sneha Patel', email: 'sneha.patel@plystory.in', department_id: 2, designation: 'Chief Financial Officer' },
    { id: 3, code: 'PLY-EMP-103', name: 'Gurpreet Singh', email: 'gurpreet.singh@plystory.in', department_id: 3, designation: 'Plant Operations General Manager' },
    { id: 4, code: 'PLY-EMP-104', name: 'Manoj Nambiar', email: 'manoj.n@plystory.in', department_id: 4, designation: 'Head of National Logistics' },
    { id: 5, code: 'PLY-EMP-105', name: 'Neha Chawla', email: 'neha.c@plystory.in', department_id: 1, designation: 'Senior Cloud & Systems Engineer' }
  ],
  statuses: [
    { id: 1, code: 'STAT-IN-STOCK', name: 'In Stock', color: '#2ecc71', description: 'Available in warehouse or plant storage' },
    { id: 2, code: 'STAT-ASSIGNED', name: 'Assigned', color: '#3498db', description: 'Allocated to custodian or active machine floor' },
    { id: 3, code: 'STAT-MAINT', name: 'In Maintenance', color: '#f39c12', description: 'Under repair, overhaul or preventive check' },
    { id: 4, code: 'STAT-DISP', name: 'Disposed', color: '#e74c3c', description: 'Scrapped, written off or auctioned' },
    { id: 5, code: 'STAT-TRANS', name: 'In Transit', color: '#9b59b6', description: 'Inter-plant transfer under E-Way bill' }
  ],
  conditions: [
    { id: 1, code: 'COND-EXC', name: 'Excellent', score: '90-100%', description: 'Brand new or newly overhauled' },
    { id: 2, code: 'COND-GOOD', name: 'Good', score: '70-89%', description: 'Normal operational factory wear' },
    { id: 3, code: 'COND-FAIR', name: 'Fair', score: '50-69%', description: 'Requires servicing or parts replacement' },
    { id: 4, code: 'COND-POOR', name: 'Poor / Damaged', score: '30-49%', description: 'Impaired efficiency, major breakdown' },
    { id: 5, code: 'COND-SCRAP', name: 'Scrap Only', score: '< 30%', description: 'Beyond economical repair' }
  ],
  deprMethods: [
    { id: 1, code: 'DEP-SLM', name: 'Straight Line Method (SLM)', formula: '(Cost - Salvage) / Useful Life', legal_basis: 'Companies Act 2013 (Schedule II)' },
    { id: 2, code: 'DEP-WDV', name: 'Written Down Value (WDV)', formula: 'Opening Net Book Value * Depr Rate', legal_basis: 'Income Tax Act 1961 (Block of Assets)' },
    { id: 3, code: 'DEP-PROD', name: 'Production Units Method', formula: 'Cost * (Actual Output / Est Total Output)', legal_basis: 'Ind AS 16 Property, Plant & Equipment' }
  ],
  docTypes: [
    { id: 1, code: 'DOC-INV', name: 'Tax Invoice & E-Way Bill', retention_years: 8, required: true },
    { id: 2, code: 'DOC-WAR', name: 'OEM Warranty Card / SLA', retention_years: 5, required: true },
    { id: 3, code: 'DOC-AMC', name: 'AMC Service Agreement', retention_years: 3, required: false },
    { id: 4, code: 'DOC-INS', name: 'Asset Insurance Policy', retention_years: 7, required: true },
    { id: 5, code: 'DOC-VAL', name: 'Valuation & Impairment Report', retention_years: 8, required: false }
  ],
  maintTypes: [
    { id: 1, code: 'MNT-PREV', name: 'Preventive Routine Maintenance', frequency: 'Monthly / Quarterly', priority: 'Medium' },
    { id: 2, code: 'MNT-CORR', name: 'Corrective / Breakdown Repair', frequency: 'On-Demand Emergency', priority: 'High / Critical' },
    { id: 3, code: 'MNT-CALIB', name: 'Instrumentation Calibration & Testing', frequency: 'Bi-Annual / Annual', priority: 'High' },
    { id: 4, code: 'MNT-OVER', name: 'Major Plant Overhaul & Refurbishment', frequency: 'Every 2-3 Years', priority: 'High' }
  ],
  assets: [
    {
      id: 1,
      asset_code: 'PLY-AST-2026-001',
      barcode: '890800123401',
      name: 'Premier 20-Daylight Hydraulic Hot Plywood Press (600 Ton)',
      manufacturer: 'Premier Industrial Works',
      category_id: 1,
      sub_category_id: 1,
      department_id: 3,
      location_id: 2,
      current_custodian_id: 3,
      vendor_id: 4,
      status: 'In Stock',
      condition: 'Excellent',
      purchase_cost: 8500000.00,
      current_book_value: 7225000.00,
      salvage_value: 850000.00,
      depreciation_method: 'Straight Line',
      depreciation_rate: 15.0,
      useful_life_years: 10,
      purchase_date: '2024-04-01',
      serial_number: 'PRM-HOTPR-9982-GJ',
      warranty_expiry_date: '2027-03-31',
      amc_expiry_date: '2026-12-31'
    },
    {
      id: 2,
      asset_code: 'PLY-AST-2026-002',
      barcode: '890800123402',
      name: 'Kirloskar MegaPower 1000 kVA Silent Industrial DG Genset',
      manufacturer: 'Kirloskar Oil Engines',
      category_id: 4,
      sub_category_id: 5,
      department_id: 3,
      location_id: 2,
      current_custodian_id: 3,
      vendor_id: 1,
      status: 'In Maintenance',
      condition: 'Fair',
      purchase_cost: 4200000.00,
      current_book_value: 3570000.00,
      salvage_value: 500000.00,
      depreciation_method: 'Reducing Balance',
      depreciation_rate: 15.0,
      useful_life_years: 15,
      purchase_date: '2024-05-15',
      serial_number: 'KIRL-GEN-1000-8812',
      warranty_expiry_date: '2026-05-14',
      amc_expiry_date: '2026-11-30'
    },
    {
      id: 3,
      asset_code: 'PLY-AST-2026-003',
      barcode: '890800123403',
      name: 'Tata Signa 4825.TK 16-Wheeler Heavy Timber Hauler',
      manufacturer: 'Tata Motors CV',
      category_id: 5,
      sub_category_id: 6,
      department_id: 4,
      location_id: 4,
      current_custodian_id: 4,
      vendor_id: 2,
      status: 'Assigned',
      condition: 'Good',
      purchase_cost: 5400000.00,
      current_book_value: 3780000.00,
      salvage_value: 600000.00,
      depreciation_method: 'Reducing Balance',
      depreciation_rate: 30.0,
      useful_life_years: 6,
      purchase_date: '2024-08-10',
      serial_number: 'MH-12-RN-8890-TAT',
      warranty_expiry_date: '2027-08-09',
      amc_expiry_date: '2026-08-09'
    },
    {
      id: 4,
      asset_code: 'PLY-AST-2026-004',
      barcode: '890800123404',
      name: 'Dell PowerEdge R760 Enterprise SAP HANA Cluster Server',
      manufacturer: 'Dell Technologies',
      category_id: 2,
      sub_category_id: 3,
      department_id: 1,
      location_id: 3,
      current_custodian_id: 1,
      vendor_id: 3,
      status: 'In Stock',
      condition: 'Excellent',
      purchase_cost: 1450000.00,
      current_book_value: 966700.00,
      salvage_value: 100000.00,
      depreciation_method: 'Straight Line',
      depreciation_rate: 33.33,
      useful_life_years: 3,
      purchase_date: '2025-01-10',
      serial_number: 'DEL-PE-R760-IN994',
      warranty_expiry_date: '2028-01-09',
      amc_expiry_date: '2027-01-09'
    },
    {
      id: 5,
      asset_code: 'PLY-AST-2026-005',
      barcode: '890800123405',
      name: 'Apple MacBook Pro M3 Max 36GB (Executive Tech Suite)',
      manufacturer: 'Apple Inc.',
      category_id: 2,
      sub_category_id: 4,
      department_id: 1,
      location_id: 1,
      current_custodian_id: 5,
      vendor_id: 3,
      status: 'Assigned',
      condition: 'Excellent',
      purchase_cost: 349900.00,
      current_book_value: 233300.00,
      salvage_value: 40000.00,
      depreciation_method: 'Straight Line',
      depreciation_rate: 33.33,
      useful_life_years: 3,
      purchase_date: '2025-02-01',
      serial_number: 'C02LN4499MD2',
      warranty_expiry_date: '2028-01-31',
      amc_expiry_date: null
    }
  ],
  transfers: [
    {
      id: 1,
      transfer_number: 'PLY-TRF-2026-0041',
      asset_id: 4,
      from_dept: 'Information Technology & Infra',
      to_dept: 'Quality Control & Lab Testing',
      from_loc: 'Plystory Corporate HQ - Bengaluru',
      to_loc: 'Tier-4 Data Center - Mumbai',
      status: 'Approved',
      date: '2026-02-15',
      reason: 'SAP ERP Production Database expansion'
    },
    {
      id: 2,
      transfer_number: 'PLY-TRF-2026-0042',
      asset_id: 5,
      from_dept: 'Human Resources & Admin',
      to_dept: 'Information Technology & Infra',
      from_loc: 'North India Central Distribution Hub - Gurugram',
      to_loc: 'Plystory Corporate HQ - Bengaluru',
      status: 'Pending',
      date: '2026-02-24',
      reason: 'Reallocation to Senior Cloud Systems Engineer'
    }
  ],
  maintenanceLogs: [
    {
      id: 1,
      ticket_number: 'PLY-MNT-2026-018',
      asset_id: 2,
      asset_name: 'Kirloskar MegaPower 1000 kVA Silent Industrial DG Genset',
      type: 'Preventive',
      priority: 'High',
      issue: 'Quarterly full engine decarbonization, coolant filter replacement & governor calibration',
      cost: 45000.00,
      technician: 'Kirloskar Authorized Field Service (Pune Hub)',
      status: 'In Progress',
      date: '2026-02-22'
    },
    {
      id: 2,
      ticket_number: 'PLY-MNT-2026-019',
      asset_id: 1,
      asset_name: 'Premier 20-Daylight Hydraulic Hot Plywood Press (600 Ton)',
      type: 'Corrective/Breakdown',
      priority: 'Critical',
      issue: 'Replaced hydraulic cylinder seal kit and high-pressure steam valve',
      cost: 88500.00,
      technician: 'Premier In-house Senior Maintenance Team',
      status: 'Completed',
      date: '2026-01-28'
    }
  ],
  auditCampaigns: [
    {
      id: 1,
      title: 'FY 2025-26 Indian Companies Act & Tax Audit Physical Verification',
      start_date: '2026-02-01',
      end_date: '2026-03-31',
      total_assets: 312,
      verified: 298,
      missing: 3,
      misplaced: 11,
      status: 'In Progress'
    }
  ],
  auditLogs: [
    { id: 1, user: 'IT Helpdesk Admin', action: 'CREATE', module: 'Asset Register', details: 'Enrolled Capital Asset PLY-AST-2026-005 (Apple MacBook Pro M3 Max 36GB)', time: '2026-02-26 10:00:00', ip: '10.20.1.45' }
  ],
  users: [
    {
      id: 1,
      name: 'IT Helpdesk Admin',
      email: 'ithelpdesk@plystory.com',
      username: 'ithelpdesk@plystory.com',
      password: 'Kdeka@2602',
      role: 'Super Admin',
      department: 'Information Technology & Infra',
      plant: 'Plystory Corporate HQ - Bengaluru',
      status: 'Active',
      created_at: '2026-02-26 00:00:00'
    }
  ],
  smtpConfig: {
    host: 'smtp.office365.com',
    port: 587,
    encryption: 'STARTTLS',
    username: 'ithelpdesk@plystory.com',
    password: '••••••••••••',
    from_name: 'Plystory FAMS Notifications',
    from_email: 'noreply@plystory.com',
    reply_to: 'ithelpdesk@plystory.com',
    enable_asset_alerts: true,
    enable_custody_notifications: true,
    enable_maintenance_reminders: true,
    last_tested: '2026-02-26 15:30:00',
    status: 'Connected'
  }
};

const STORAGE_KEY = 'plystory_fams_india_state_v8';
const AUTH_KEY = 'plystory_fams_current_user_v8';

// Direct synchronous state fetcher ensuring live localStorage sync
export function getFamsState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.users || parsed.users.length === 0) {
        parsed.users = JSON.parse(JSON.stringify(initialData.users));
      }
      if (!parsed.smtpConfig) {
        parsed.smtpConfig = JSON.parse(JSON.stringify(initialData.smtpConfig));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      console.error('Failed to parse localStorage state, resetting:', e);
    }
  }

  const fresh = JSON.parse(JSON.stringify(initialData));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveFamsState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Current Logged-in User Session Manager
export function getCurrentUser() {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse auth user session:', e);
    }
  }
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}
