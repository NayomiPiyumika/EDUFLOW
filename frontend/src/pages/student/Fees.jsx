import { useEffect, useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import StatCard from '../../components/StatCard.jsx';
import { Loading } from '../../components/Loading.jsx';
import { studentService } from '../../services/studentService';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService
      .myFees()
      .then(setFees)
      .finally(() => setLoading(false));
  }, []);

  const totalOutstanding = fees.reduce((sum, f) => sum + Number(f.outstanding_amount), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paid_amount), 0);

  const columns = [
    { key: 'month', label: 'Month' },
    { key: 'class', label: 'Class', render: (r) => r.class_room?.name ?? '—' },
    { key: 'amount', label: 'Amount', render: (r) => `Rs. ${Number(r.amount).toLocaleString()}` },
    { key: 'paid', label: 'Paid', render: (r) => `Rs. ${Number(r.paid_amount).toLocaleString()}` },
    { key: 'outstanding', label: 'Outstanding', render: (r) => `Rs. ${Number(r.outstanding_amount).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    { key: 'due_date', label: 'Due Date', render: (r) => r.due_date ?? '—' },
  ];

  if (loading) return <Loading label="Loading fee records..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Fees</h1>
        <p className="text-sm text-slate-500">Payment history and outstanding balances.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
        <StatCard label="Total Paid" value={`Rs. ${totalPaid.toLocaleString()}`} icon={Wallet} accent="green" />
        <StatCard
          label="Outstanding"
          value={`Rs. ${totalOutstanding.toLocaleString()}`}
          icon={AlertCircle}
          accent={totalOutstanding > 0 ? 'red' : 'green'}
        />
      </div>

      <Table columns={columns} data={fees} emptyMessage="No fee records yet." />
    </div>
  );
}
