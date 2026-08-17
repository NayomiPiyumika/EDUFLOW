<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Exam;
use App\Models\Fee;
use App\Models\Mark;
use App\Models\NotificationItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     * Returns role-specific dashboard metrics.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return match ($user->role) {
            'admin' => response()->json($this->adminDashboard()),
            'teacher' => response()->json($this->teacherDashboard($user)),
            'student' => response()->json($this->studentDashboard($user)),
            default => response()->json(['message' => 'Unknown role.'], 400),
        };
    }

    private function adminDashboard(): array
    {
        $totalStudents = User::where('role', 'student')->count();
        $activeTeachers = User::where('role', 'teacher')->where('status', 'active')->count();
        $activeClasses = ClassRoom::where('status', 'active')->count();

        $currentMonth = Carbon::now()->format('Y-m');
        $monthlyRevenue = Fee::where('month', $currentMonth)->sum('paid_amount');
        $outstandingFees = Fee::where('month', $currentMonth)->sum('outstanding_amount');

        $totalAttendanceRecords = Attendance::count();
        $presentCount = Attendance::where('status', 'present')->count();
        $overallAttendanceRate = $totalAttendanceRecords > 0
            ? round(($presentCount / $totalAttendanceRecords) * 100, 1)
            : 0;

        // Student growth over the last 6 months
        $studentGrowth = User::where('role', 'student')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Revenue trend over the last 6 months
        $revenueTrend = Fee::selectRaw("month, SUM(paid_amount) as revenue")
            ->where('month', '>=', Carbon::now()->subMonths(6)->format('Y-m'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $recentActivities = Attendance::with(['student:id,name', 'classRoom:id,name'])
            ->latest()
            ->take(10)
            ->get();

        return [
            'total_students' => $totalStudents,
            'active_teachers' => $activeTeachers,
            'active_classes' => $activeClasses,
            'monthly_revenue' => (float) $monthlyRevenue,
            'outstanding_fees' => (float) $outstandingFees,
            'overall_attendance_rate' => $overallAttendanceRate,
            'student_growth_chart' => $studentGrowth,
            'revenue_trend_chart' => $revenueTrend,
            'recent_activities' => $recentActivities,
        ];
    }

    private function teacherDashboard(User $teacher): array
    {
        $classIds = ClassRoom::where('teacher_id', $teacher->id)->pluck('id');

        $todaysSessions = ClassRoom::whereIn('id', $classIds)->count();

        $attendanceSummary = Attendance::whereIn('class_id', $classIds)
            ->whereDate('date', Carbon::today())
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $upcomingExams = Exam::whereIn('class_id', $classIds)
            ->where('exam_date', '>=', Carbon::today())
            ->orderBy('exam_date')
            ->take(5)
            ->get();

        // Students with attendance below 75% (needing attention)
        $studentsRequiringAttention = Attendance::whereIn('class_id', $classIds)
            ->selectRaw('student_id, AVG(status = "present") * 100 as attendance_rate')
            ->groupBy('student_id')
            ->havingRaw('attendance_rate < 75')
            ->with('student:id,name')
            ->get();

        return [
            'assigned_classes' => ClassRoom::whereIn('id', $classIds)->get(),
            'todays_sessions' => $todaysSessions,
            'attendance_summary' => $attendanceSummary,
            'upcoming_exams' => $upcomingExams,
            'students_requiring_attention' => $studentsRequiringAttention,
            'recent_announcements' => NotificationItem::where('target_role', 'teacher')
                ->orWhere('recipient_id', $teacher->id)
                ->latest()
                ->take(5)
                ->get(),
        ];
    }

    private function studentDashboard(User $student): array
    {
        $attendanceRecords = Attendance::where('student_id', $student->id)->get();
        $overallAttendance = $attendanceRecords->count() > 0
            ? round(($attendanceRecords->where('status', 'present')->count() / $attendanceRecords->count()) * 100, 1)
            : 0;

        $marks = Mark::where('student_id', $student->id)->with('exam')->get();
        $averageMarks = $marks->count() > 0 ? round($marks->avg('score'), 1) : 0;

        $currentMonth = Carbon::now()->format('Y-m');
        $currentFee = Fee::where('student_id', $student->id)
            ->where('month', $currentMonth)
            ->first();

        $upcomingExams = Exam::whereIn('class_id', $student->enrolledClasses()->pluck('classes.id'))
            ->where('exam_date', '>=', Carbon::today())
            ->orderBy('exam_date')
            ->take(5)
            ->get();

        $recentResults = $marks->sortByDesc('created_at')->take(5)->values();

        // Performance score: 60% academic average + 40% attendance
        $performanceScore = round(($averageMarks * 0.6) + ($overallAttendance * 0.4), 1);

        return [
            'overall_attendance' => $overallAttendance,
            'average_marks' => $averageMarks,
            'current_fee_status' => $currentFee,
            'upcoming_exams' => $upcomingExams,
            'recent_results' => $recentResults,
            'performance_score' => $performanceScore,
        ];
    }
}
