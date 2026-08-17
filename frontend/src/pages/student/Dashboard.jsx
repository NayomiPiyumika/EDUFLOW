import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ClipboardCheck, Award, Wallet, CalendarClock } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import { Loading } from '../../components/Loading.jsx';
import { dashboardService } from '../../services/dashboardService';

export default function StudentDashboard() {
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
    { key: 'title', label: 'Exam', render: (r) => r.class_room?.name ?? '—' },
    { key: 'exam_date', label: 'Date' },
  ];

  const resultsColumns = [
    { key: 'exam', label: 'Exam', render: (r) => r.exam?.title ?? '—' },
    { key: 'score', label: 'Score' },
    { key: 'grade', label: 'Grade', render: (r) => <Badge tone="info">{r.grade}</Badge> },
  ];

  const feeStatus = data.current_fee_status;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-sm text-slate-500">Your academic overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall Attendance" value={data.overall_attendance} suffix="%" icon={ClipboardCheck} accent="primary" />
        <StatCard label="Average Marks" value={data.average_marks} icon={Award} accent="green" />
        <StatCard
          label="Fee Status"
          value={feeStatus ? feeStatus.status : 'No record'}
          icon={Wallet}
          accent={feeStatus?.status === 'paid' ? 'green' : feeStatus?.status === 'partial' ? 'amber' : 'red'}
        />
        <StatCard label="Performance Score" value={data.performance_score} icon={CalendarClock} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Upcoming Exams</h2>
          <Table columns={examColumns} data={data.upcoming_exams} emptyMessage="No upcoming exams." />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Results</h2>
          <Table columns={resultsColumns} data={data.recent_results} emptyMessage="No published results yet." />
        </div>
      </div>
    </div>
  );
}
