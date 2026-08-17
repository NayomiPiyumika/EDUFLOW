<?php

namespace Database\Seeders;

use App\Models\NotificationItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $announcements = [
            [
                'title' => 'Term 2 Examinations Schedule Released',
                'message' => 'The Term 2 examination timetable has been published. Please check your class schedule for exact dates and times.',
                'target_role' => 'all',
            ],
            [
                'title' => 'Fee Payment Reminder',
                'message' => 'Monthly fees for this month are due by the end of the month. Please make payments to avoid late fees.',
                'target_role' => 'student',
            ],
            [
                'title' => 'Staff Meeting Notice',
                'message' => 'All teachers are requested to attend the monthly staff meeting this Saturday at 9:00 AM.',
                'target_role' => 'teacher',
            ],
            [
                'title' => 'Platform Maintenance',
                'message' => 'EduFlow will undergo scheduled maintenance this weekend. Some features may be temporarily unavailable.',
                'target_role' => 'all',
            ],
        ];

        foreach ($announcements as $announcement) {
            NotificationItem::create([
                ...$announcement,
                'sender_id' => $admin->id,
                'is_read' => false,
            ]);
        }

        // A couple of direct, per-student notifications
        $students = User::where('role', 'student')->take(3)->get();
        foreach ($students as $student) {
            NotificationItem::create([
                'title' => 'Welcome to EduFlow',
                'message' => "Hi {$student->name}, your account has been set up successfully. Explore your dashboard to view classes, attendance, and results.",
                'sender_id' => $admin->id,
                'recipient_id' => $student->id,
                'is_read' => false,
            ]);
        }
    }
}
