import { useEffect, useState } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import StatCard from '../../components/StatCard.jsx';
import { Loading } from '../../components/Loading.jsx';
import { ClipboardCheck } from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService
      .myAttendance()
      .then((data) => setRecords(data.data ?? data))
      .finally(() => setLoading(false));
  }, []);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const rate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'class', label: 'Class', render: (r) => r.class_room?.name ?? '—' },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    { key: 'remarks', label: 'Remarks', render: (r) => r.remarks ?? '—' },
  ];

  if (loading) return <Loading label="Loading attendance..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Attendance</h1>
        <p className="text-sm text-slate-500">Your attendance history across all enrolled classes.</p>
      </div>

      <div className="max-w-xs">
        <StatCard label="Overall Attendance Rate" value={rate} suffix="%" icon={ClipboardCheck} accent="primary" />
      </div>

      <Table columns={columns} data={records} emptyMessage="No attendance records yet." />
    </div>
  );
}
