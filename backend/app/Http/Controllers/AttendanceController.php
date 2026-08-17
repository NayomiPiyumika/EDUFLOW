<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    /**
     * GET /api/attendance
     * Retrieve attendance records with filters: class_id, date, student_id.
     */
    public function index(Request $request)
    {
        $query = Attendance::with(['student:id,name', 'classRoom:id,name']);

        if ($request->user()->isTeacher()) {
            $classIds = ClassRoom::where('teacher_id', $request->user()->id)->pluck('id');
            $query->whereIn('class_id', $classIds);
        }

        if ($classId = $request->query('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date', $date);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        return response()->json(
            $query->orderByDesc('date')->paginate($request->integer('per_page', 30))
        );
    }

    /**
     * POST /api/attendance/bulk
     * Save attendance for multiple students in one class/date at once.
     *
     * Payload:
     * {
     *   "class_id": 1,
     *   "date": "2026-08-16",
     *   "records": [
     *     { "student_id": 5, "status": "present", "remarks": null },
     *     { "student_id": 6, "status": "absent", "remarks": "sick" }
     *   ]
     * }
     */
    public function storeBulk(Request $request)
    {
        $data = $request->validate([
            'class_id' => ['required', 'exists:classes,id'],
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'exists:users,id'],
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late'])],
            'records.*.remarks' => ['nullable', 'string'],
        ]);

        $class = ClassRoom::findOrFail($data['class_id']);

        if ($request->user()->isTeacher() && $class->teacher_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: not your class.'], 403);
        }

        $saved = DB::transaction(function () use ($data, $request) {
            $results = [];

            foreach ($data['records'] as $record) {
                // updateOrCreate guards against duplicate attendance for
                // the same student/class/date (also enforced by DB unique index).
                $results[] = Attendance::updateOrCreate(
                    [
                        'class_id' => $data['class_id'],
                        'student_id' => $record['student_id'],
                        'date' => $data['date'],
                    ],
                    [
                        'status' => $record['status'],
                        'remarks' => $record['remarks'] ?? null,
                        'marked_by' => $request->user()->id,
                    ]
                );
            }

            return $results;
        });

        return response()->json([
            'message' => 'Attendance saved successfully.',
            'count' => count($saved),
            'records' => $saved,
        ], 201);
    }
}
