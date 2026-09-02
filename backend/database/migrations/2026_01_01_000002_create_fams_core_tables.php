<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Assets Main Table
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code')->unique(); // e.g., AST-IT-2026-001
            $table->string('barcode')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Classification & Relations
            $table->foreignId('category_id')->constrained('categories');
            $table->foreignId('sub_category_id')->nullable()->constrained('sub_categories');
            $table->foreignId('vendor_id')->nullable()->constrained('vendors');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('location_id')->nullable()->constrained('locations');
            $table->foreignId('current_custodian_id')->nullable()->constrained('employees');
            
            // Status & Condition
            $table->string('status')->default('In Stock'); // In Stock, Assigned, In Maintenance, Under Transfer, Disposed
            $table->string('condition')->default('Good'); // Excellent, Good, Fair, Damaged, Scrap
            
            // Purchase / Financial Specs
            $table->string('po_number')->nullable();
            $table->string('invoice_number')->nullable();
            $table->date('purchase_date');
            $table->date('installation_date')->nullable();
            $table->decimal('purchase_cost', 15, 2);
            $table->decimal('salvage_value', 15, 2)->default(0.00);
            $table->decimal('current_book_value', 15, 2);
            $table->decimal('accumulated_depreciation', 15, 2)->default(0.00);
            $table->integer('useful_life_years')->default(5);
            $table->string('depreciation_method')->default('Straight Line');
            $table->decimal('depreciation_rate', 5, 2)->default(10.00);

            // Technical Specs
            $table->string('brand')->nullable();
            $table->string('model_number')->nullable();
            $table->string('serial_number')->nullable();
            $table->json('custom_attributes')->nullable();
            
            // Warranty & AMC Summary
            $table->date('warranty_expiry_date')->nullable();
            $table->date('amc_expiry_date')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Asset Lifecycle Assignments & Transfers
        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees');
            $table->foreignId('assigned_by_user_id')->nullable();
            $table->date('assigned_date');
            $table->date('expected_return_date')->nullable();
            $table->date('actual_return_date')->nullable();
            $table->string('return_condition')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status')->default('Active'); // Active, Returned
            $table->string('acknowledgement_signature_path')->nullable();
            $table->timestamps();
        });

        Schema::create('asset_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number')->unique();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('from_department_id')->nullable()->constrained('departments');
            $table->foreignId('to_department_id')->constrained('departments');
            $table->foreignId('from_location_id')->nullable()->constrained('locations');
            $table->foreignId('to_location_id')->constrained('locations');
            $table->foreignId('initiated_by_user_id')->nullable();
            $table->foreignId('approved_by_user_id')->nullable();
            $table->string('transfer_status')->default('Pending'); // Pending, Approved, In-Transit, Completed, Rejected
            $table->date('transfer_date');
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        // 3. Asset Audit Trail & Movement History
        Schema::create('asset_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('event_type'); // PURCHASE, ASSIGNMENT, TRANSFER, RETURN, MAINTENANCE, DEPRECIATION, DISPOSAL, AUDIT
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('performed_by')->nullable();
            $table->timestamps();
        });

        // 4. Warranty & AMC Management
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors');
            $table->string('warranty_code')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('coverage_type')->default('Comprehensive'); // Comprehensive, Non-Comprehensive, Parts Only
            $table->text('terms')->nullable();
            $table->string('support_contact')->nullable();
            $table->string('status')->default('Active'); // Active, Expired, Claimed
            $table->timestamps();
        });

        Schema::create('amc_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('cost', 12, 2)->default(0.00);
            $table->integer('preventive_visits_per_year')->default(4);
            $table->string('status')->default('Active'); // Active, Expiring Soon, Expired, Renewed
            $table->text('scope_of_work')->nullable();
            $table->timestamps();
        });

        // 5. Maintenance, Repairs & PM Schedules
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors');
            $table->string('maintenance_type')->default('Corrective'); // Preventive, Corrective/Breakdown, Calibration
            $table->string('priority')->default('Medium'); // Low, Medium, High, Critical
            $table->string('issue_description');
            $table->text('action_taken')->nullable();
            $table->decimal('cost', 12, 2)->default(0.00);
            $table->date('scheduled_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->string('technician_name')->nullable();
            $table->string('status')->default('Open'); // Open, In Progress, On Hold, Completed, Cancelled
            $table->timestamps();
        });

        // 6. Depreciation Schedules & Valuation & Disposal
        Schema::create('depreciation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('fiscal_year');
            $table->date('calculation_date');
            $table->decimal('opening_book_value', 15, 2);
            $table->decimal('depreciation_amount', 15, 2);
            $table->decimal('closing_book_value', 15, 2);
            $table->string('method_used');
            $table->timestamps();
        });

        Schema::create('asset_valuations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->date('valuation_date');
            $table->decimal('previous_value', 15, 2);
            $table->decimal('new_value', 15, 2);
            $table->string('revaluation_type'); // Upward, Downward / Impairment
            $table->string('valuing_authority')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('asset_disposals', function (Blueprint $table) {
            $table->id();
            $table->string('disposal_number')->unique();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->date('disposal_date');
            $table->string('disposal_type'); // Scrapped, Sold, Donated, Lost/Stolen
            $table->decimal('book_value_at_disposal', 15, 2);
            $table->decimal('sale_amount', 15, 2)->default(0.00);
            $table->decimal('gain_loss_amount', 15, 2)->default(0.00);
            $table->string('approved_by')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // 7. Physical Audit Campaigns & Discrepancies
        Schema::create('audit_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('In Progress'); // Scheduled, In Progress, Completed
            $table->integer('total_assets_to_audit')->default(0);
            $table->integer('verified_count')->default(0);
            $table->integer('missing_count')->default(0);
            $table->integer('misplaced_count')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_campaign_id')->constrained('audit_campaigns')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('scanned_location_id')->nullable()->constrained('locations');
            $table->string('verification_status')->default('Pending'); // Verified, Missing, Misplaced, Condition Degraded
            $table->string('verified_by')->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. Documents & Attachments
        Schema::create('asset_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('document_type'); // Purchase Invoice, Warranty, Insurance, AMC, Inspection
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_size')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });

        // 9. System Administration (Roles, Workflows, Audit Logs, Settings)
        Schema::create('approval_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('module_name'); // Asset Purchase, Asset Transfer, Asset Disposal
            $table->string('role_required'); // Dept Head, Asset Manager, Finance Director
            $table->decimal('min_amount', 15, 2)->default(0.00);
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->integer('sequence_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('system_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_name')->nullable();
            $table->string('action'); // CREATE, UPDATE, DELETE, LOGIN, EXPORT, APPROVE
            $table->string('module'); // Assets, Maintenance, Depreciation, Masters
            $table->string('ip_address')->nullable();
            $table->text('details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_audit_logs');
        Schema::dropIfExists('approval_workflows');
        Schema::dropIfExists('asset_documents');
        Schema::dropIfExists('audit_items');
        Schema::dropIfExists('audit_campaigns');
        Schema::dropIfExists('asset_disposals');
        Schema::dropIfExists('asset_valuations');
        Schema::dropIfExists('depreciation_logs');
        Schema::dropIfExists('maintenance_logs');
        Schema::dropIfExists('amc_contracts');
        Schema::dropIfExists('warranties');
        Schema::dropIfExists('asset_histories');
        Schema::dropIfExists('asset_transfers');
        Schema::dropIfExists('asset_assignments');
        Schema::dropIfExists('assets');
    }
};
