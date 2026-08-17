<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = User::where('role', 'teacher')->orderBy('id')->get();

        $classes = [
            [
                'name' => 'Grade 10 - Mathematics',
                'subject' => 'Mathematics',
                'grade' => '10',
                'teacher_id' => $teachers[0]->id,
                'monthly_fee' => 3500,
                'schedule' => 'Mon & Wed, 4:00 PM - 6:00 PM',
                'status' => 'active',
                'description' => 'O/L Mathematics — algebra, geometry, and problem solving.',
            ],
            [
                'name' => 'Grade 11 - Mathematics',
                'subject' => 'Mathematics',
                'grade' => '11',
                'teacher_id' => $teachers[0]->id,
                'monthly_fee' => 4000,
                'schedule' => 'Tue & Thu, 4:00 PM - 6:00 PM',
                'status' => 'active',
                'description' => 'O/L Mathematics revision and exam preparation.',
            ],
            [
                'name' => 'Grade 10 - Science',
                'subject' => 'Science',
                'grade' => '10',
                'teacher_id' => $teachers[1]->id,
                'monthly_fee' => 3500,
                'schedule' => 'Mon & Thu, 2:00 PM - 4:00 PM',
                'status' => 'active',
                'description' => 'O/L combined Science: physics, chemistry, biology basics.',
            ],
            [
                'name' => 'Grade 9 - Science',
                'subject' => 'Science',
                'grade' => '9',
                'teacher_id' => $teachers[1]->id,
                'monthly_fee' => 3000,
                'schedule' => 'Wed & Fri, 2:00 PM - 4:00 PM',
                'status' => 'active',
                'description' => 'Foundation Science concepts for Grade 9 students.',
            ],
            [
                'name' => 'Grade 10 - English',
                'subject' => 'English',
                'grade' => '10',
                'teacher_id' => $teachers[2]->id,
                'monthly_fee' => 3000,
                'schedule' => 'Sat, 9:00 AM - 11:00 AM',
                'status' => 'active',
                'description' => 'English language skills for O/L examinations.',
            ],
            [
                'name' => 'Grade 11 - ICT',
                'subject' => 'ICT',
                'grade' => '11',
                'teacher_id' => $teachers[3]->id,
                'monthly_fee' => 3800,
                'schedule' => 'Sat, 1:00 PM - 3:00 PM',
                'status' => 'active',
                'description' => 'Information & Communication Technology for O/L.',
            ],
        ];

        foreach ($classes as $class) {
            ClassRoom::create($class);
        }
    }
}
