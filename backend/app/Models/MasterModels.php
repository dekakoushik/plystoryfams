<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Department extends Model
{
    use SoftDeletes;
    protected $fillable = ['code', 'name', 'head_name', 'description', 'is_active'];
    public function assets(): HasMany { return $this->hasMany(Asset::class); }
    public function employees(): HasMany { return $this->hasMany(Employee::class); }
}

class Location extends Model
{
    use SoftDeletes;
    protected $fillable = ['code', 'name', 'building', 'floor', 'room', 'address', 'is_active'];
    public function assets(): HasMany { return $this->hasMany(Asset::class); }
}

class Category extends Model
{
    use SoftDeletes;
    protected $fillable = ['code', 'name', 'depreciation_method', 'depreciation_rate', 'useful_life_years', 'description', 'is_active'];
    public function subCategories(): HasMany { return $this->hasMany(SubCategory::class); }
    public function assets(): HasMany { return $this->hasMany(Asset::class); }
}

class SubCategory extends Model
{
    use SoftDeletes;
    protected $fillable = ['category_id', 'code', 'name', 'description', 'is_active'];
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function assets(): HasMany { return $this->hasMany(Asset::class); }
}

class Vendor extends Model
{
    use SoftDeletes;
    protected $fillable = ['code', 'name', 'contact_person', 'email', 'phone', 'tax_number', 'address', 'is_active'];
    public function assets(): HasMany { return $this->hasMany(Asset::class); }
}

class Employee extends Model
{
    use SoftDeletes;
    protected $fillable = ['employee_code', 'name', 'email', 'phone', 'department_id', 'designation', 'is_active'];
    public function department(): BelongsTo { return $this->belongsTo(Department::class); }
    public function assignedAssets(): HasMany { return $this->hasMany(Asset::class, 'current_custodian_id'); }
}
