import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, UserCog, BookOpen, Wallet, AlertCircle, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import { Loading } from '../../components/Loading.jsx';
import { dashboardService } from '../../services/dashboardService';

export default function AdminDashboard() {
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

  const activityColumns = [
    { key: 'student', label: 'Student', render: (r) => r.student?.name ?? '—' },
    { key: 'class', label: 'Class', render: (r) => r.class_room?.name ?? '—' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge>{r.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Organization-wide overview and key metrics.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={data.total_students} icon={Users} accent="primary" />
        <StatCard label="Active Teachers" value={data.active_teachers} icon={UserCog} accent="green" />
        <StatCard label="Active Classes" value={data.active_classes} icon={BookOpen} accent="amber" />
        <StatCard
          label="Monthly Revenue"
          value={`Rs. ${Number(data.monthly_revenue).toLocaleString()}`}
          icon={Wallet}
          accent="green"
        />
        <StatCard
          label="Outstanding Fees"
          value={`Rs. ${Number(data.outstanding_fees).toLocaleString()}`}
          icon={AlertCircle}
          accent="red"
        />
        <StatCard
          label="Overall Attendance"
          value={data.overall_attendance_rate}
          suffix="%"
          icon={TrendingUp}
          accent="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Student Growth (last 6 months)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.student_growth_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f6ef7" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Revenue Trend (last 6 months)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.revenue_trend_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Attendance Activity</h2>
        <Table columns={activityColumns} data={data.recent_activities} emptyMessage="No recent activity." />
      </div>
    </div>
  );
}
