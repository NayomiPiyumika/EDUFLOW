<?php

namespace App\Http\Controllers;

use App\Models\ClassRoom;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClassController extends Controller
{
    /**
     * GET /api/classes
     * List classes. Teachers only see their own classes.
     */
    public function index(Request $request)
    {
        $query = ClassRoom::with('teacher:id,name')->withCount('students');

        if ($request->user()->isTeacher()) {
            $query->where('teacher_id', $request->user()->id);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($teacherId = $request->query('teacher_id')) {
            $query->where('teacher_id', $teacherId);
        }

        return response()->json(
            $query->orderBy('name')->paginate($request->integer('per_page', 15))
        );
    }

    /**
     * POST /api/classes
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:50'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'monthly_fee' => ['required', 'numeric', 'min:0'],
            'schedule' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'description' => ['nullable', 'string'],
        ]);

        $class = ClassRoom::create($data);

        return response()->json($class->load('teacher:id,name'), 201);
    }

    /**
     * GET /api/classes/{class}
     */
    public function show(Request $request, ClassRoom $class)
    {
        if ($request->user()->isTeacher() && $class->teacher_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(
            $class->load(['teacher:id,name', 'students:id,name,email'])
        );
    }

    /**
     * PUT/PATCH /api/classes/{class}
     */
    public function update(Request $request, ClassRoom $class)
    {
        if ($request->user()->isTeacher() && $class->teacher_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:50'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'monthly_fee' => ['sometimes', 'numeric', 'min:0'],
            'schedule' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'description' => ['nullable', 'string'],
        ]);

        $class->update($data);

        return response()->json($class->fresh(['teacher:id,name']));
    }

    /**
     * DELETE /api/classes/{class} (admin only, enforced by route middleware)
     */
    public function destroy(ClassRoom $class)
    {
        $class->delete();

        return response()->json(['message' => 'Class removed successfully.']);
    }

    /**
     * POST /api/classes/{class}/assign-teacher
     */
    public function assignTeacher(Request $request, ClassRoom $class)
    {
        $data = $request->validate([
            'teacher_id' => ['required', 'exists:users,id'],
        ]);

        $teacher = User::findOrFail($data['teacher_id']);
        abort_unless($teacher->role === 'teacher', 422, 'Selected user is not a teacher.');

        $class->update(['teacher_id' => $teacher->id]);

        return response()->json($class->fresh(['teacher:id,name']));
    }

    /**
     * POST /api/classes/{class}/enroll
     */
    public function enrollStudent(Request $request, ClassRoom $class)
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ]);

        $student = User::findOrFail($data['student_id']);
        abort_unless($student->role === 'student', 422, 'Selected user is not a student.');

        $class->students()->syncWithoutDetaching([
            $student->id => ['enrolled_at' => now(), 'status' => 'active'],
        ]);

        return response()->json($class->fresh(['students:id,name,email']));
    }

    /**
     * DELETE /api/classes/{class}/students/{student}
     */
    public function unenrollStudent(ClassRoom $class, User $student)
    {
        $class->students()->detach($student->id);

        return response()->json(['message' => 'Student unenrolled successfully.']);
    }
}
