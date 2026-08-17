import { useEffect, useState } from 'react';
import { Check, X, Clock3, Save } from 'lucide-react';
import Button from '../../components/Button.jsx';
import { SelectField } from '../../components/FormField.jsx';
import { Loading, EmptyState } from '../../components/Loading.jsx';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: Check, activeClass: 'bg-emerald-600 text-white' },
  { value: 'late', label: 'Late', icon: Clock3, activeClass: 'bg-amber-500 text-white' },
  { value: 'absent', label: 'Absent', icon: X, activeClass: 'bg-red-600 text-white' },
];

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({}); // { studentId: status }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    classService.list({ per_page: 50 }).then((data) => {
      const list = data.data ?? data;
      setClasses(list);
      if (list.length > 0) setClassId(String(list[0].id));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    classService.get(classId).then((cls) => {
      setStudents(cls.students ?? []);
      // Default everyone to "present" unless already changed
      setStatuses((prev) => {
        const next = { ...prev };
        (cls.students ?? []).forEach((s) => {
          if (!next[s.id]) next[s.id] = 'present';
        });
        return next;
      });
    });
  }, [classId]);

  const setStatus = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = students.map((s) => ({ student_id: s.id, status: statuses[s.id] ?? 'present' }));
      const res = await attendanceService.saveBulk({ class_id: Number(classId), date, records });
      setMessage(`Saved attendance for ${res.count} students.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading classes..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">Mark attendance for a class session.</p>
      </div>

      {classes.length === 0 ? (
        <EmptyState title="No classes assigned" description="You need an assigned class to mark attendance." />
      ) : (
        <>
          <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="w-full sm:w-64">
              <SelectField label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {students.length === 0 ? (
            <EmptyState title="No students enrolled in this class" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Student</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 text-slate-700">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map((opt) => {
                            const active = statuses[student.id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setStatus(student.id, opt.value)}
                                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                  active ? opt.activeClass : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                <opt.icon size={13} /> {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving} disabled={students.length === 0}>
              <Save size={16} /> Save Attendance
            </Button>
            {message && <p className="text-sm text-slate-500">{message}</p>}
          </div>
        </>
      )}
    </div>
  );
}
