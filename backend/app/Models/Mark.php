<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mark extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'score',
        'grade',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
        ];
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Calculate a letter grade from a numeric score (0-100 scale).
     * Grading scheme from project documentation:
     * 90-100: A+ | 80-89: A | 70-79: B | 60-69: C | 50-59: S | Below 50: F
     */
    public static function calculateGrade(float $score, float $maxMarks = 100): string
    {
        $percentage = $maxMarks > 0 ? ($score / $maxMarks) * 100 : 0;

        return match (true) {
            $percentage >= 90 => 'A+',
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'S',
            default => 'F',
        };
    }
}
