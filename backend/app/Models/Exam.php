<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'class_id',
        'exam_date',
        'max_marks',
        'pass_marks',
        'created_by',
        'is_published',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'max_marks' => 'decimal:2',
            'pass_marks' => 'decimal:2',
            'is_published' => 'boolean',
        ];
    }

    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function marks()
    {
        return $this->hasMany(Mark::class, 'exam_id');
    }
}
