<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetTransfer;
use App\Models\AssetHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AssetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $assets = Asset::with(['category', 'department', 'location', 'custodian', 'vendor'])->get();
        return response()->json(['status' => 'success', 'data' => $assets]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_code' => 'required|string|unique:assets,asset_code',
            'barcode' => 'required|string|unique:assets,barcode',
            'name' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'purchase_cost' => 'required|numeric|min:0',
            'purchase_date' => 'required|date',
            'useful_life_years' => 'nullable|integer',
            'depreciation_method' => 'nullable|string',
        ]);

        $validated['current_book_value'] = $validated['purchase_cost'];
        $asset = Asset::create($validated);

        AssetHistory::create([
            'asset_id' => $asset->id,
            'event_type' => 'PURCHASE',
            'title' => 'Asset Registered',
            'description' => "Initial capital enrollment: {$asset->name}",
            'performed_by' => auth()->user()->name ?? 'Asset Director'
        ]);

        return response()->json(['status' => 'success', 'message' => 'Asset enrolled successfully', 'data' => $asset], 201);
    }

    public function show($id): JsonResponse
    {
        $asset = Asset::with(['category', 'subCategory', 'department', 'location', 'custodian', 'vendor', 'histories', 'maintenanceLogs', 'warranties'])->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $asset]);
    }

    public function assign(Request $request, $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'assigned_date' => 'required|date'
        ]);

        $asset->update([
            'current_custodian_id' => $request->employee_id,
            'status' => 'Assigned'
        ]);

        AssetAssignment::create([
            'asset_id' => $asset->id,
            'employee_id' => $request->employee_id,
            'assigned_date' => $request->assigned_date,
            'status' => 'Active'
        ]);

        AssetHistory::create([
            'asset_id' => $asset->id,
            'event_type' => 'ASSIGNMENT',
            'title' => 'Custodian Assigned',
            'description' => "Asset assigned to employee ID #{$request->employee_id}",
            'performed_by' => auth()->user()->name ?? 'Asset Manager'
        ]);

        return response()->json(['status' => 'success', 'message' => 'Asset assigned successfully']);
    }

    public function returnAsset(Request $request, $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);
        $asset->update([
            'current_custodian_id' => null,
            'status' => 'In Stock'
        ]);

        AssetHistory::create([
            'asset_id' => $asset->id,
            'event_type' => 'RETURN',
            'title' => 'Asset Returned to Inventory',
            'description' => 'Custodian handover completed and returned to stock',
            'performed_by' => auth()->user()->name ?? 'Asset Manager'
        ]);

        return response()->json(['status' => 'success', 'message' => 'Asset returned to stock']);
    }

    public function history($id): JsonResponse
    {
        $histories = AssetHistory::where('asset_id', $id)->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $histories]);
    }
}
