<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role', 'student')->orderBy('id')->get();
        $classes = ClassRoom::orderBy('id')->get();

        foreach ($students as $index => $student) {
            // Each student enrolls in 2-3 classes for realistic demo data
            $classCount = ($index % 3 === 0) ? 3 : 2;
            $assignedClasses = $classes->random($classCount);

            foreach ($assignedClasses as $class) {
                $student->enrolledClasses()->syncWithoutDetaching([
                    $class->id => [
                        'enrolled_at' => now()->subMonths(rand(1, 6)),
                        'status' => 'active',
                    ],
                ]);
            }
        }
    }
}
