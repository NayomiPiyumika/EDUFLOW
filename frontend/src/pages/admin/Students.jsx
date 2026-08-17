import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { TextField, SelectField } from '../../components/FormField.jsx';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';

const emptyForm = { name: '', email: '', phone: '', password: '', status: 'active', class_ids: [] };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentService.list({ search });
      setStudents(data.data ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadStudents, 300); // debounce search
    return () => clearTimeout(timer);
  }, [loadStudents]);

  useEffect(() => {
    classService.list({ per_page: 100 }).then((data) => setClasses(data.data ?? data));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone ?? '',
      password: '',
      status: student.status,
      class_ids: [],
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await studentService.update(editing.id, payload);
      } else {
        await studentService.create(form);
      }
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!confirm(`Remove ${student.name}? This cannot be undone.`)) return;
    try {
      await studentService.remove(student.id);
      loadStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleClassSelection = (classId) => {
    setForm((f) => ({
      ...f,
      class_ids: f.class_ids.includes(classId)
        ? f.class_ids.filter((id) => id !== classId)
        : [...f.class_ids, classId],
    }));
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone ?? '—' },
    {
      key: 'classes',
      label: 'Enrolled Classes',
      render: (r) => (r.enrolled_classes?.length ? r.enrolled_classes.map((c) => c.name).join(', ') : '—'),
    },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex gap-2">
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
          <h1 className="text-xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">Manage student profiles and class enrollments.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Student
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." />

      <Table columns={columns} data={students} loading={loading} emptyMessage="No students found." />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Student' : 'Add Student'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save Changes' : 'Create Student'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label={editing ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            required={!editing}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectField>

          {!editing && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <GraduationCap size={16} /> Enroll in Classes
              </label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                {classes.map((cls) => (
                  <label key={cls.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.class_ids.includes(cls.id)}
                      onChange={() => toggleClassSelection(cls.id)}
                    />
                    {cls.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
