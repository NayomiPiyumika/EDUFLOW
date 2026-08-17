<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Fee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class FeeSeeder extends Seeder
{
    public function run(): void
    {
        $classes = ClassRoom::with('students')->get();

        // Generate fee records for the last 3 months
        for ($m = 2; $m >= 0; $m--) {
            $monthDate = Carbon::now()->subMonths($m);
            $month = $monthDate->format('Y-m');

            foreach ($classes as $class) {
                foreach ($class->students as $student) {
                    $amount = $class->monthly_fee;

                    // Weighted payment scenario
                    $roll = rand(1, 100);
                    $paidAmount = match (true) {
                        $roll <= 65 => $amount,                              // fully paid
                        $roll <= 85 => round($amount * (rand(30, 70) / 100)), // partial
                        default => 0,                                        // unpaid
                    };

                    $fee = Fee::firstOrNew([
                        'student_id' => $student->id,
                        'class_id' => $class->id,
                        'month' => $month,
                    ]);

                    $fee->amount = $amount;
                    $fee->paid_amount = $paidAmount;
                    $fee->due_date = $monthDate->copy()->endOfMonth();
                    $fee->payment_method = $paidAmount > 0 ? 'Cash' : null;
                    $fee->recalculate();
                    $fee->save();
                }
            }
        }
    }
}
