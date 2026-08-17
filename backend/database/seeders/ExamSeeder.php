<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Exam;
use App\Models\Mark;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $classes = ClassRoom::with('students', 'teacher')->get();

        $examTitles = ['Term 1 Test', 'Mid-Term Examination', 'Term 2 Test'];

        foreach ($classes as $class) {
            if ($class->students->isEmpty()) {
                continue;
            }

            foreach ($examTitles as $i => $title) {
                $examDate = Carbon::now()->subMonths(count($examTitles) - $i)->addDays(rand(1, 10));
                $isPastExam = $examDate->isPast();

                $exam = Exam::create([
                    'title' => $title,
                    'class_id' => $class->id,
                    'exam_date' => $examDate->toDateString(),
                    'max_marks' => 100,
                    'pass_marks' => 50,
                    'created_by' => $class->teacher_id,
                    // Publish all but the most recent exam, so students see a mix
                    'is_published' => $isPastExam && $i < count($examTitles) - 1,
                ]);

                if ($isPastExam) {
                    foreach ($class->students as $student) {
                        // Realistic score distribution (normal-ish spread around 65)
                        $score = max(20, min(100, round(65 + (rand(-35, 35)))));
                        $grade = Mark::calculateGrade($score, 100);

                        Mark::create([
                            'exam_id' => $exam->id,
                            'student_id' => $student->id,
                            'score' => $score,
                            'grade' => $grade,
                        ]);
                    }
                }
            }
        }
    }
}
