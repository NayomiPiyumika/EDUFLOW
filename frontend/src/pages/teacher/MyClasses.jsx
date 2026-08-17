import { useEffect, useState } from 'react';
import { Users, Wallet, Clock } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { Loading, EmptyState } from '../../components/Loading.jsx';
import { classService } from '../../services/classService';

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    classService
      .list({ per_page: 50 })
      .then((data) => setClasses(data.data ?? data))
      .finally(() => setLoading(false));
  }, []);

  const openRoster = async (cls) => {
    const full = await classService.get(cls.id);
    setSelected(full);
  };

  if (loading) return <Loading label="Loading your classes..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Classes</h1>
        <p className="text-sm text-slate-500">Classes you're assigned to teach.</p>
      </div>

      {classes.length === 0 ? (
        <EmptyState title="No classes assigned yet" description="Contact an administrator to get assigned to a class." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => openRoster(cls)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-primary-300 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">{cls.name}</p>
              <p className="text-sm text-slate-500">{cls.subject} · Grade {cls.grade}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Clock size={13} /> {cls.schedule ?? 'No schedule set'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users size={13} /> {cls.students_count ?? 0} students
                </p>
                <p className="flex items-center gap-1.5">
                  <Wallet size={13} /> Rs. {Number(cls.monthly_fee).toLocaleString()} / month
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`${selected?.name ?? ''} — Roster`}
      >
        <div className="space-y-1">
          {(selected?.students ?? []).length === 0 && (
            <p className="text-sm text-slate-400">No students enrolled yet.</p>
          )}
          {(selected?.students ?? []).map((student) => (
            <div key={student.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
              <span className="font-medium text-slate-800">{student.name}</span>
              <span className="text-xs text-slate-400">{student.email}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
