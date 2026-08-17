import { useEffect, useState, useCallback } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { SelectField, TextField } from '../../components/FormField.jsx';
import { feeService } from '../../services/feeService';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeFee, setActiveFee] = useState(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feeService.list({ search, status: status || undefined });
      setFees(data.data ?? data);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const openPay = (fee) => {
    setActiveFee(fee);
    setAmount('');
    setError('');
    setPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await feeService.update(activeFee.id, { add_payment: Number(amount) });
      setPayModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.student?.name ?? '—' },
    { key: 'class', label: 'Class', render: (r) => r.class_room?.name ?? '—' },
    { key: 'month', label: 'Month' },
    { key: 'amount', label: 'Amount', render: (r) => `Rs. ${Number(r.amount).toLocaleString()}` },
    { key: 'paid', label: 'Paid', render: (r) => `Rs. ${Number(r.paid_amount).toLocaleString()}` },
    { key: 'outstanding', label: 'Outstanding', render: (r) => `Rs. ${Number(r.outstanding_amount).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.status !== 'paid' && (
          <button onClick={() => openPay(r)} className="text-xs font-medium text-primary-600 hover:text-primary-800">
            Record Payment
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fees</h1>
        <p className="text-sm text-slate-500">Track payments and outstanding balances across all students.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student name or email..." />
        <div className="w-48">
          <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </SelectField>
        </div>
      </div>

      <Table columns={columns} data={fees} loading={loading} emptyMessage="No fee records found." />

      <Modal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Record Payment — ${activeFee?.student?.name ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} loading={saving}>
              Record Payment
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleRecordPayment}>
          <p className="text-sm text-slate-500">
            Outstanding: <span className="font-semibold text-slate-800">Rs. {Number(activeFee?.outstanding_amount).toLocaleString()}</span>
          </p>
          <TextField
            label="Payment Amount (Rs.)"
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
