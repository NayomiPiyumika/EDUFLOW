<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\ClassRoom;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $classes = ClassRoom::with('teacher', 'students')->get();

        foreach ($classes as $class) {
            if ($class->students->isEmpty()) {
                continue;
            }

            // Generate attendance for the last 8 session dates (roughly 2x/week over a month)
            for ($session = 0; $session < 8; $session++) {
                $date = Carbon::now()->subDays($session * 3 + rand(0, 1));

                foreach ($class->students as $student) {
                    // Weighted random status: mostly present, some late/absent
                    $roll = rand(1, 100);
                    $status = match (true) {
                        $roll <= 78 => 'present',
                        $roll <= 92 => 'late',
                        default => 'absent',
                    };

                    Attendance::updateOrCreate(
                        [
                            'class_id' => $class->id,
                            'student_id' => $student->id,
                            'date' => $date->toDateString(),
                        ],
                        [
                            'status' => $status,
                            'marked_by' => $class->teacher_id,
                        ]
                    );
                }
            }
        }
    }
}
