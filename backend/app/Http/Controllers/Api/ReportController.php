<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Department;
use App\Models\Category;
use App\Models\MaintenanceLog;
use App\Models\AssetTransfer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Dashboard Summary Metrics
     */
    public function dashboardSummary(): JsonResponse
    {
        $totalCost = Asset::sum('purchase_cost');
        $totalBookValue = Asset::sum('current_book_value');
        $activeCount = Asset::count();
        $inMaintenance = Asset::where('status', 'In Maintenance')->count();
        $pendingApprovals = AssetTransfer::where('transfer_status', 'Pending')->count();

        $categoryBreakdown = Category::withCount('assets')->get()->map(function ($cat) {
            return [
                'name' => $cat->name,
                'asset_count' => $cat->assets_count,
                'total_valuation' => Asset::where('category_id', $cat->id)->sum('current_book_value')
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    'total_cost' => $totalCost,
                    'total_book_value' => $totalBookValue,
                    'active_assets_count' => $activeCount,
                    'in_maintenance_count' => $inMaintenance,
                    'pending_transfers_count' => $pendingApprovals,
                ],
                'category_breakdown' => $categoryBreakdown,
            ]
        ]);
    }

    /**
     * Complete Fixed Asset Register
     */
    public function assetRegister(Request $request): JsonResponse
    {
        $query = Asset::with(['category', 'department', 'location', 'custodian', 'vendor']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $assets = $query->paginate($request->get('per_page', 25));

        return response()->json([
            'status' => 'success',
            'data' => $assets
        ]);
    }
}
