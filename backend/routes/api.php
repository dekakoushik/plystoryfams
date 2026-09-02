<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\DepreciationController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ReportController;

Route::prefix('v1')->group(function () {
    // 1. Dashboard Metrics
    Route::get('/dashboard/summary', [ReportController::class, 'dashboardSummary']);

    // 2. Asset Lifecycle Endpoints
    Route::apiResource('assets', AssetController::class);
    Route::post('/assets/{id}/assign', [AssetController::class, 'assign']);
    Route::post('/assets/{id}/return', [AssetController::class, 'returnAsset']);
    Route::post('/assets/{id}/transfer', [AssetController::class, 'transfer']);
    Route::get('/assets/{id}/history', [AssetController::class, 'history']);
    Route::get('/assets/{id}/depreciation-schedule', [DepreciationController::class, 'getSchedule']);
    Route::post('/assets/{id}/revalue', [DepreciationController::class, 'revalue']);
    Route::post('/assets/{id}/dispose', [DepreciationController::class, 'dispose']);
    Route::get('/assets/barcode/batch-print', [AssetController::class, 'batchPrintBarcodes']);

    // 3. Service & Maintenance Modules
    Route::get('/warranties', [MaintenanceController::class, 'warranties']);
    Route::post('/warranties', [MaintenanceController::class, 'storeWarranty']);
    Route::get('/amc-contracts', [MaintenanceController::class, 'amcContracts']);
    Route::post('/amc-contracts', [MaintenanceController::class, 'storeAmcContract']);
    Route::apiResource('maintenance-logs', MaintenanceController::class);
    Route::get('/preventive-maintenance/schedules', [MaintenanceController::class, 'preventiveSchedules']);

    // 4. Physical Audit & Barcodes
    Route::get('/audits/campaigns', [AuditController::class, 'campaigns']);
    Route::post('/audits/campaigns', [AuditController::class, 'createCampaign']);
    Route::post('/audits/scan-verify', [AuditController::class, 'scanAndVerify']);
    Route::get('/audits/discrepancies', [AuditController::class, 'discrepancies']);

    // 5. Masters Modules
    Route::get('/masters/categories', [MasterController::class, 'categories']);
    Route::post('/masters/categories', [MasterController::class, 'storeCategory']);
    Route::get('/masters/sub-categories', [MasterController::class, 'subCategories']);
    Route::get('/masters/departments', [MasterController::class, 'departments']);
    Route::post('/masters/departments', [MasterController::class, 'storeDepartment']);
    Route::get('/masters/locations', [MasterController::class, 'locations']);
    Route::post('/masters/locations', [MasterController::class, 'storeLocation']);
    Route::get('/masters/vendors', [MasterController::class, 'vendors']);
    Route::post('/masters/vendors', [MasterController::class, 'storeVendor']);
    Route::get('/masters/employees', [MasterController::class, 'employees']);
    Route::post('/masters/employees', [MasterController::class, 'storeEmployee']);
    Route::get('/masters/lookups', [MasterController::class, 'lookups']);

    // 6. Administration
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/roles', [AdminController::class, 'roles']);
    Route::get('/admin/approval-workflows', [AdminController::class, 'workflows']);
    Route::put('/admin/approval-workflows/{id}', [AdminController::class, 'updateWorkflow']);
    Route::get('/admin/audit-logs', [AdminController::class, 'auditLogs']);
    Route::get('/admin/settings', [AdminController::class, 'getSettings']);
    Route::post('/admin/settings', [AdminController::class, 'updateSettings']);

    // 7. Reports & Analytics & Data
    Route::get('/reports/asset-register', [ReportController::class, 'assetRegister']);
    Route::get('/reports/depreciation-summary', [ReportController::class, 'depreciationReport']);
    Route::get('/reports/maintenance-cost', [ReportController::class, 'maintenanceCostReport']);
    Route::get('/reports/disposal-scrap', [ReportController::class, 'disposalReport']);
    Route::post('/data/import', [ReportController::class, 'importAssets']);
    Route::get('/data/export', [ReportController::class, 'exportAssets']);
    Route::post('/data/backup', [AdminController::class, 'createBackup']);
});
