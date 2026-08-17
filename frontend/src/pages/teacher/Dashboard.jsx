import { useEffect, useState } from 'react';
import { BookOpen, CalendarClock, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import { Loading } from '../../components/Loading.jsx';
import { dashboardService } from '../../services/dashboardService';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return null;

  const examColumns = [
    { key: 'title', label: 'Exam' },
    { key: 'class', label: 'Class', render: (r) => r.class_room?.name ?? '—' },
    { key: 'exam_date', label: 'Date' },
    { key: 'max_marks', label: 'Max Marks' },
  ];

  const attentionColumns = [
    { key: 'student', label: 'Student', render: (r) => r.student?.name ?? '—' },
    {
      key: 'attendance_rate',
      label: 'Attendance Rate',
      render: (r) => <Badge tone="danger">{Number(r.attendance_rate).toFixed(0)}%</Badge>,
    },
  ];

  const presentCount = data.attendance_summary?.present ?? 0;
  const absentCount = data.attendance_summary?.absent ?? 0;
  const lateCount = data.attendance_summary?.late ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500">Your classes, attendance, and upcoming exams.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Assigned Classes" value={data.assigned_classes?.length ?? 0} icon={BookOpen} accent="primary" />
        <StatCard
          label="Today's Attendance"
          value={`${presentCount} present / ${absentCount} absent / ${lateCount} late`}
          icon={CalendarClock}
          accent="green"
        />
        <StatCard
          label="Students Needing Attention"
          value={data.students_requiring_attention?.length ?? 0}
          icon={AlertTriangle}
          accent="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Upcoming Exams</h2>
          <Table columns={examColumns} data={data.upcoming_exams} emptyMessage="No upcoming exams." />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Students Requiring Attention (&lt;75% attendance)
          </h2>
          <Table
            columns={attentionColumns}
            data={data.students_requiring_attention}
            emptyMessage="All students have healthy attendance."
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">My Classes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.assigned_classes ?? []).map((cls) => (
            <div key={cls.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">{cls.name}</p>
              <p className="text-sm text-slate-500">{cls.subject} · Grade {cls.grade}</p>
              <p className="mt-2 text-xs text-slate-400">{cls.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
