<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Departments Master
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('head_name')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Locations Master (Hierarchy: Building/Floor/Room)
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->string('room')->nullable();
            $table->string('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Asset Categories Master
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('depreciation_method')->default('Straight Line'); // Straight Line, Reducing Balance
            $table->decimal('depreciation_rate', 5, 2)->default(10.00); // in percentage
            $table->integer('useful_life_years')->default(5);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Sub-Categories Master
        Schema::create('sub_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Vendors / Suppliers Master
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('tax_number')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Employees / Custodians Master
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('designation')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 7. Status & Condition & Type Masters
        Schema::create('asset_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // In Stock, Assigned, In Maintenance, Disposed, Transferred
            $table->string('color')->default('#64748b');
            $table->timestamps();
        });

        Schema::create('asset_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Excellent, Good, Fair, Damaged, Scrap
            $table->timestamps();
        });

        Schema::create('depreciation_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Straight Line Method (SLM), Written Down Value (WDV), Sum of Years
            $table->text('formula_description')->nullable();
            $table->timestamps();
        });

        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Purchase Invoice, Warranty Card, Insurance Policy, AMC Contract, Inspection Certificate
            $table->timestamps();
        });

        Schema::create('maintenance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Preventive, Corrective/Breakdown, Calibration, Safety Inspection
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_types');
        Schema::dropIfExists('document_types');
        Schema::dropIfExists('depreciation_methods');
        Schema::dropIfExists('asset_conditions');
        Schema::dropIfExists('asset_statuses');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('sub_categories');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('departments');
    }
};
