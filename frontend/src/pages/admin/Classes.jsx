import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import { TextField, SelectField, TextAreaField } from '../../components/FormField.jsx';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';

const emptyForm = {
  name: '',
  subject: '',
  grade: '',
  teacher_id: '',
  monthly_fee: '',
  schedule: '',
  status: 'active',
  description: '',
};

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollClass, setEnrollClass] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classService.list({ per_page: 50 });
      setClasses(data.data ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
    teacherService.list({ per_page: 100 }).then((data) => setTeachers(data.data ?? data));
  }, [loadClasses]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cls) => {
    setEditing(cls);
    setForm({
      name: cls.name,
      subject: cls.subject ?? '',
      grade: cls.grade ?? '',
      teacher_id: cls.teacher_id ?? '',
      monthly_fee: cls.monthly_fee,
      schedule: cls.schedule ?? '',
      status: cls.status,
      description: cls.description ?? '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...form, teacher_id: form.teacher_id || null };
      if (editing) {
        await classService.update(editing.id, payload);
      } else {
        await classService.create(payload);
      }
      setModalOpen(false);
      loadClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls) => {
    if (!confirm(`Delete class "${cls.name}"? This cannot be undone.`)) return;
    try {
      await classService.remove(cls.id);
      loadClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  // ---- Enrollment modal ----

  const openEnroll = async (cls) => {
    const fullClass = await classService.get(cls.id);
    setEnrollClass(fullClass);
    setEnrollModalOpen(true);
    const students = await studentService.list({ per_page: 100 });
    setAllStudents(students.data ?? students);
  };

  const isEnrolled = (studentId) => enrollClass?.students?.some((s) => s.id === studentId);

  const toggleEnrollment = async (student) => {
    try {
      if (isEnrolled(student.id)) {
        await classService.unenrollStudent(enrollClass.id, student.id);
      } else {
        await classService.enrollStudent(enrollClass.id, student.id);
      }
      const refreshed = await classService.get(enrollClass.id);
      setEnrollClass(refreshed);
      loadClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredStudents = allStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Class Name' },
    { key: 'subject', label: 'Subject', render: (r) => r.subject ?? '—' },
    { key: 'grade', label: 'Grade', render: (r) => r.grade ?? '—' },
    { key: 'teacher', label: 'Teacher', render: (r) => r.teacher?.name ?? 'Unassigned' },
    { key: 'students_count', label: 'Students', render: (r) => r.students_count ?? 0 },
    {
      key: 'fee',
      label: 'Monthly Fee',
      render: (r) => `Rs. ${Number(r.monthly_fee).toLocaleString()}`,
    },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEnroll(r)} className="text-slate-400 hover:text-primary-600" aria-label="Manage students">
            <Users size={16} />
          </button>
          <button onClick={() => openEdit(r)} className="text-slate-400 hover:text-primary-600" aria-label="Edit">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(r)} className="text-slate-400 hover:text-red-600" aria-label="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Classes</h1>
          <p className="text-sm text-slate-500">Manage classes, teacher assignments, and enrollments.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Class
        </Button>
      </div>

      <Table columns={columns} data={classes} loading={loading} emptyMessage="No classes found." />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Class' : 'Add Class'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save Changes' : 'Create Class'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextField
            label="Class Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <TextField
              label="Grade"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />
          </div>
          <SelectField
            label="Teacher"
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
          >
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Monthly Fee (Rs.)"
              type="number"
              min="0"
              required
              value={form.monthly_fee}
              onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })}
            />
            <SelectField
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
          </div>
          <TextField
            label="Schedule"
            placeholder="e.g. Mon & Wed, 4:00 PM - 6:00 PM"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          />
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal
        open={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title={`Manage Students — ${enrollClass?.name ?? ''}`}
        footer={
          <Button variant="secondary" onClick={() => setEnrollModalOpen(false)}>
            Done
          </Button>
        }
      >
        <input
          type="text"
          placeholder="Search students..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {filteredStudents.map((student) => {
            const enrolled = isEnrolled(student.id);
            return (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.email}</p>
                </div>
                <button
                  onClick={() => toggleEnrollment(student)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    enrolled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {enrolled ? (
                    <span className="flex items-center gap-1">
                      <X size={12} /> Remove
                    </span>
                  ) : (
                    'Enroll'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
