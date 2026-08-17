<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'class_id',
        'month',
        'amount',
        'paid_amount',
        'outstanding_amount',
        'status',
        'due_date',
        'paid_at',
        'payment_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'outstanding_amount' => 'decimal:2',
            'due_date' => 'date',
            'paid_at' => 'date',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /** Recalculate outstanding amount + status based on paid_amount */
    public function recalculate(): void
    {
        $this->outstanding_amount = max(0, $this->amount - $this->paid_amount);

        if ($this->paid_amount <= 0) {
            $this->status = 'unpaid';
        } elseif ($this->outstanding_amount <= 0) {
            $this->status = 'paid';
            $this->paid_at = $this->paid_at ?? now();
        } else {
            $this->status = 'partial';
        }
    }
}
