<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Order matters: users/teachers before classes (teacher_id),
     * classes before enrollment/attendance/exams/fees.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ClassSeeder::class,
            EnrollmentSeeder::class,
            AttendanceSeeder::class,
            ExamSeeder::class,
            FeeSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
