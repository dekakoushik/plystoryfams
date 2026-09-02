<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\DepreciationLog;
use Carbon\Carbon;

class DepreciationService
{
    /**
     * Calculate Straight Line Method (SLM) Depreciation
     * SLM Amount = (Purchase Cost - Salvage Value) / Useful Life Years
     */
    public function calculateSLM(float $cost, float $salvageValue, int $usefulLifeYears, float $rate = null): float
    {
        if ($rate && $rate > 0) {
            return ($cost - $salvageValue) * ($rate / 100);
        }
        if ($usefulLifeYears <= 0) return 0.0;
        return ($cost - $salvageValue) / $usefulLifeYears;
    }

    /**
     * Calculate Written Down Value (WDV) / Reducing Balance Depreciation
     * WDV Amount = Current Book Value * (Rate / 100)
     */
    public function calculateWDV(float $currentBookValue, float $rate): float
    {
        return $currentBookValue * ($rate / 100);
    }

    /**
     * Run full asset depreciation schedule projection
     */
    public function generateSchedule(Asset $asset): array
    {
        $schedule = [];
        $cost = (float)$asset->purchase_cost;
        $salvage = (float)$asset->salvage_value;
        $currentValue = $cost;
        $years = (int)$asset->useful_life_years ?: 5;
        $method = $asset->depreciation_method;
        $rate = (float)$asset->depreciation_rate ?: (100 / max(1, $years));
        $startYear = Carbon::parse($asset->purchase_date)->year;

        for ($i = 1; $i <= $years; $i++) {
            $fy = 'FY ' . ($startYear + $i - 1) . '-' . substr((string)($startYear + $i), 2);
            $opening = $currentValue;

            if ($method === 'Straight Line') {
                $depAmount = $this->calculateSLM($cost, $salvage, $years, $rate);
            } else {
                $depAmount = $this->calculateWDV($opening, $rate);
            }

            // Ensure book value doesn't drop below salvage value
            if (($opening - $depAmount) < $salvage) {
                $depAmount = max(0, $opening - $salvage);
            }

            $closing = max($salvage, $opening - $depAmount);
            $currentValue = $closing;

            $schedule[] = [
                'year_index' => $i,
                'fiscal_year' => $fy,
                'opening_book_value' => round($opening, 2),
                'depreciation_amount' => round($depAmount, 2),
                'closing_book_value' => round($closing, 2),
                'accumulated_depreciation' => round($cost - $closing, 2)
            ];

            if ($closing <= $salvage) break;
        }

        return $schedule;
    }
}
