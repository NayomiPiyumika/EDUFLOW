<?php

namespace App\Http\Controllers;

use App\Models\ClassRoom;
use App\Models\Exam;
use App\Models\Mark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    /**
     * GET /api/exams
     * List exams, filterable by class_id and date.
     */
    public function index(Request $request)
    {
        $query = Exam::with('classRoom:id,name');

        if ($request->user()->isTeacher()) {
            $classIds = ClassRoom::where('teacher_id', $request->user()->id)->pluck('id');
            $query->whereIn('class_id', $classIds);
        }

        if ($classId = $request->query('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('exam_date', $date);
        }

        return response()->json(
            $query->orderByDesc('exam_date')->paginate($request->integer('per_page', 15))
        );
    }

    /**
     * POST /api/exams
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'class_id' => ['required', 'exists:classes,id'],
            'exam_date' => ['required', 'date'],
            'max_marks' => ['required', 'numeric', 'min:1'],
            'pass_marks' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $class = ClassRoom::findOrFail($data['class_id']);
        if ($request->user()->isTeacher() && $class->teacher_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: not your class.'], 403);
        }

        $exam = Exam::create([
            ...$data,
            'created_by' => $request->user()->id,
            'is_published' => false,
        ]);

        return response()->json($exam->load('classRoom:id,name'), 201);
    }

    /**
     * GET /api/exams/{exam}
     */
    public function show(Exam $exam)
    {
        return response()->json(
            $exam->load(['classRoom:id,name', 'marks.student:id,name'])
        );
    }

    /**
     * PUT/PATCH /api/exams/{exam}
     */
    public function update(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'exam_date' => ['sometimes', 'date'],
            'max_marks' => ['sometimes', 'numeric', 'min:1'],
            'pass_marks' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $exam->update($data);

        return response()->json($exam->fresh());
    }

    /**
     * DELETE /api/exams/{exam}
     */
    public function destroy(Exam $exam)
    {
        $exam->delete();

        return response()->json(['message' => 'Exam removed successfully.']);
    }

    /**
     * POST /api/exams/{exam}/marks
     * Submit/update marks for multiple students; grades are auto-calculated.
     *
     * Payload:
     * {
     *   "marks": [
     *     { "student_id": 5, "score": 87, "remarks": null },
     *     { "student_id": 6, "score": 42, "remarks": "needs improvement" }
     *   ]
     * }
     */
    public function storeMarks(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'marks' => ['required', 'array', 'min:1'],
            'marks.*.student_id' => ['required', 'exists:users,id'],
            'marks.*.score' => ['required', 'numeric', 'min:0', "max:{$exam->max_marks}"],
            'marks.*.remarks' => ['nullable', 'string'],
        ]);

        $saved = DB::transaction(function () use ($data, $exam) {
            $results = [];

            foreach ($data['marks'] as $entry) {
                $grade = Mark::calculateGrade((float) $entry['score'], (float) $exam->max_marks);

                $results[] = Mark::updateOrCreate(
                    [
                        'exam_id' => $exam->id,
                        'student_id' => $entry['student_id'],
                    ],
                    [
                        'score' => $entry['score'],
                        'grade' => $grade,
                        'remarks' => $entry['remarks'] ?? null,
                    ]
                );
            }

            return $results;
        });

        return response()->json([
            'message' => 'Marks saved successfully.',
            'count' => count($saved),
            'marks' => $saved,
        ], 201);
    }

    /**
     * PATCH /api/exams/{exam}/publish
     * Publish results so students can view them.
     */
    public function publish(Exam $exam)
    {
        $exam->update(['is_published' => true]);

        return response()->json([
            'message' => 'Results published successfully.',
            'exam' => $exam->fresh(),
        ]);
    }
}
