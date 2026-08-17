<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Attendance;
use App\Models\Fee;
use App\Models\Mark;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    /**
     * GET /api/students
     * List/search students (admin only). Supports ?search= and pagination.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'student');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(
            $query->with('enrolledClasses:id,name')
                ->orderBy('name')
                ->paginate($request->integer('per_page', 15))
        );
    }

    /**
     * POST /api/students
     * Create a student and optionally enroll them into classes.
     */
    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();

        $student = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => 'student',
            'status' => $data['status'] ?? 'active',
        ]);

        if (! empty($data['class_ids'])) {
            $student->enrolledClasses()->attach($data['class_ids'], [
                'enrolled_at' => now(),
                'status' => 'active',
            ]);
        }

        return response()->json($student->load('enrolledClasses'), 201);
    }

    /**
     * GET /api/students/{student}
     */
    public function show(User $student)
    {
        abort_unless($student->role === 'student', 404);

        return response()->json(
            $student->load(['enrolledClasses', 'fees', 'attendances'])
        );
    }

    /**
     * PUT/PATCH /api/students/{student}
     */
    public function update(UpdateStudentRequest $request, User $student)
    {
        abort_unless($student->role === 'student', 404);

        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $student->update($data);

        return response()->json($student->fresh());
    }

    /**
     * DELETE /api/students/{student}
     */
    public function destroy(User $student)
    {
        abort_unless($student->role === 'student', 404);

        $student->delete();

        return response()->json(['message' => 'Student removed successfully.']);
    }

    // ---------------------------------------------------------------
    // Student self-service endpoints (role:student middleware)
    // ---------------------------------------------------------------

    /** GET /api/my/classes */
    public function myClasses(Request $request)
    {
        return response()->json(
            $request->user()->enrolledClasses()->with('teacher:id,name')->get()
        );
    }

    /** GET /api/my/attendance */
    public function myAttendance(Request $request)
    {
        $records = Attendance::where('student_id', $request->user()->id)
            ->with('classRoom:id,name')
            ->orderByDesc('date')
            ->paginate($request->integer('per_page', 20));

        return response()->json($records);
    }

    /** GET /api/my/results */
    public function myResults(Request $request)
    {
        $marks = Mark::where('student_id', $request->user()->id)
            ->whereHas('exam', fn ($q) => $q->where('is_published', true))
            ->with(['exam.classRoom:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($marks);
    }

    /** GET /api/my/fees */
    public function myFees(Request $request)
    {
        $fees = Fee::where('student_id', $request->user()->id)
            ->with('classRoom:id,name')
            ->orderByDesc('month')
            ->get();

        return response()->json($fees);
    }

    /** GET /api/my/performance */
    public function myPerformance(Request $request)
    {
        $student = $request->user();

        $attendance = Attendance::where('student_id', $student->id)->get();
        $attendanceRate = $attendance->count() > 0
            ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 1)
            : 0;

        $marks = Mark::where('student_id', $student->id)->get();
        $academicAverage = $marks->count() > 0 ? round($marks->avg('score'), 1) : 0;

        $performanceScore = round(($academicAverage * 0.6) + ($attendanceRate * 0.4), 1);

        $category = match (true) {
            $performanceScore >= 85 => 'Excellent',
            $performanceScore >= 70 => 'Good',
            $performanceScore >= 50 => 'Needs Attention',
            default => 'At Risk',
        };

        return response()->json([
            'attendance_rate' => $attendanceRate,
            'academic_average' => $academicAverage,
            'performance_score' => $performanceScore,
            'category' => $category,
            'marks_trend' => $marks->sortBy('created_at')->values(),
        ]);
    }
}
