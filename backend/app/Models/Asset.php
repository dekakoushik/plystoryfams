<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'asset_code', 'barcode', 'name', 'description',
        'category_id', 'sub_category_id', 'vendor_id', 'department_id', 'location_id', 'current_custodian_id',
        'status', 'condition', 'po_number', 'invoice_number',
        'purchase_date', 'installation_date', 'purchase_cost', 'salvage_value',
        'current_book_value', 'accumulated_depreciation', 'useful_life_years',
        'depreciation_method', 'depreciation_rate',
        'brand', 'model_number', 'serial_number', 'custom_attributes',
        'warranty_expiry_date', 'amc_expiry_date'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'installation_date' => 'date',
        'warranty_expiry_date' => 'date',
        'amc_expiry_date' => 'date',
        'purchase_cost' => 'decimal:2',
        'salvage_value' => 'decimal:2',
        'current_book_value' => 'decimal:2',
        'accumulated_depreciation' => 'decimal:2',
        'depreciation_rate' => 'decimal:2',
        'custom_attributes' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function custodian(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'current_custodian_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(AssetTransfer::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(AssetHistory::class)->orderBy('created_at', 'desc');
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function depreciationLogs(): HasMany
    {
        return $this->hasMany(DepreciationLog::class);
    }

    public function warranties(): HasMany
    {
        return $this->hasMany(Warranty::class);
    }

    public function amcContracts(): HasMany
    {
        return $this->hasMany(AmcContract::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AssetDocument::class);
    }
}
