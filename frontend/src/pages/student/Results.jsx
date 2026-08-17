import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import { Loading, EmptyState } from '../../components/Loading.jsx';
import { studentService } from '../../services/studentService';

export default function StudentResults() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService
      .myResults()
      .then(setMarks)
      .finally(() => setLoading(false));
  }, []);

  const chartData = [...marks]
    .reverse()
    .map((m) => ({ name: m.exam?.title ?? 'Exam', score: Number(m.score) }));

  const columns = [
    { key: 'exam', label: 'Exam', render: (r) => r.exam?.title ?? '—' },
    { key: 'class', label: 'Class', render: (r) => r.exam?.class_room?.name ?? '—' },
    { key: 'date', label: 'Date', render: (r) => r.exam?.exam_date ?? '—' },
    { key: 'score', label: 'Score', render: (r) => `${r.score} / ${r.exam?.max_marks ?? 100}` },
    { key: 'grade', label: 'Grade', render: (r) => <Badge tone="info">{r.grade}</Badge> },
    { key: 'remarks', label: 'Remarks', render: (r) => r.remarks ?? '—' },
  ];

  if (loading) return <Loading label="Loading results..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Results</h1>
        <p className="text-sm text-slate-500">Published exam results and grades.</p>
      </div>

      {marks.length === 0 ? (
        <EmptyState title="No published results yet" description="Check back after your teacher publishes exam results." />
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Score Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table columns={columns} data={marks} emptyMessage="No results found." />
        </>
      )}
    </div>
  );
}
