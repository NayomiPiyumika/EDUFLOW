<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Demo credentials (documented here for README / interview demo):
     *   Admin:   admin@eduflow.test   / password
     *   Teacher: teacher1@eduflow.test / password  (Ms. Nadeesha Perera - Mathematics)
     *            teacher2@eduflow.test / password  (Mr. Kasun Silva - Science)
     *            teacher3@eduflow.test / password  (Ms. Ishara Fernando - English)
     *            teacher4@eduflow.test / password  (Mr. Ruwan Jayasuriya - ICT)
     *   Student: student1@eduflow.test .. student20@eduflow.test / password
     */
    public function run(): void
    {
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@eduflow.test',
            'phone' => '0771234567',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $teachers = [
            ['name' => 'Nadeesha Perera', 'email' => 'teacher1@eduflow.test', 'phone' => '0712345601'],
            ['name' => 'Kasun Silva', 'email' => 'teacher2@eduflow.test', 'phone' => '0712345602'],
            ['name' => 'Ishara Fernando', 'email' => 'teacher3@eduflow.test', 'phone' => '0712345603'],
            ['name' => 'Ruwan Jayasuriya', 'email' => 'teacher4@eduflow.test', 'phone' => '0712345604'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                ...$teacher,
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'status' => 'active',
            ]);
        }

        $firstNames = ['Amaya', 'Binura', 'Chathumi', 'Dilan', 'Eshani', 'Fathima', 'Gimhana', 'Hansi',
            'Isuru', 'Janani', 'Kavindu', 'Lakshi', 'Malith', 'Nethmi', 'Oshan', 'Piyumi',
            'Ravindu', 'Sachini', 'Tharindu', 'Umaya'];
        $lastNames = ['Perera', 'Silva', 'Fernando', 'Jayasuriya', 'Bandara', 'Wickramasinghe',
            'Dissanayake', 'Rathnayake', 'Gunasekara', 'Herath'];

        for ($i = 1; $i <= 20; $i++) {
            $name = $firstNames[$i - 1].' '.$lastNames[$i % count($lastNames)];

            User::create([
                'name' => $name,
                'email' => "student{$i}@eduflow.test",
                'phone' => '07'.rand(10000000, 99999999),
                'password' => Hash::make('password'),
                'role' => 'student',
                'status' => 'active',
            ]);
        }
    }
}
