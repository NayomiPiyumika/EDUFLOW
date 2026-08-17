<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FeeController extends Controller
{
    /**
     * GET /api/fees
     * Retrieve fee information, filterable by month, status, student_id, class_id.
     */
    public function index(Request $request)
    {
        $query = Fee::with(['student:id,name,email', 'classRoom:id,name']);

        if ($month = $request->query('month')) {
            $query->where('month', $month);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($classId = $request->query('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderByDesc('month')->paginate($request->integer('per_page', 20))
        );
    }

    /**
     * POST /api/fees
     * Record a fee record for a student (typically generated per class/month)
     * or record a payment against an existing fee record.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'month' => ['required', 'string', 'date_format:Y-m'],
            'amount' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $fee = Fee::firstOrNew([
            'student_id' => $data['student_id'],
            'class_id' => $data['class_id'],
            'month' => $data['month'],
        ]);

        $fee->amount = $data['amount'];
        $fee->paid_amount = ($fee->paid_amount ?? 0) + ($data['paid_amount'] ?? 0);
        $fee->due_date = $data['due_date'] ?? $fee->due_date;
        $fee->payment_method = $data['payment_method'] ?? $fee->payment_method;
        $fee->notes = $data['notes'] ?? $fee->notes;
        $fee->recalculate();
        $fee->save();

        return response()->json($fee->load(['student:id,name', 'classRoom:id,name']), 201);
    }

    /**
     * PATCH /api/fees/{fee}
     * Record an additional payment or update a fee record.
     */
    public function update(Request $request, Fee $fee)
    {
        $data = $request->validate([
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'paid_amount' => ['sometimes', 'numeric', 'min:0'],
            'add_payment' => ['nullable', 'numeric', 'min:0.01'],
            'due_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        if (isset($data['amount'])) {
            $fee->amount = $data['amount'];
        }

        if (isset($data['add_payment'])) {
            $fee->paid_amount += $data['add_payment'];
        } elseif (isset($data['paid_amount'])) {
            $fee->paid_amount = $data['paid_amount'];
        }

        $fee->due_date = $data['due_date'] ?? $fee->due_date;
        $fee->payment_method = $data['payment_method'] ?? $fee->payment_method;
        $fee->notes = $data['notes'] ?? $fee->notes;

        $fee->recalculate();
        $fee->save();

        return response()->json($fee->fresh(['student:id,name', 'classRoom:id,name']));
    }
}
