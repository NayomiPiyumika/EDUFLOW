import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { TextField, SelectField } from '../../components/FormField.jsx';
import { teacherService } from '../../services/teacherService';

const emptyForm = { name: '', email: '', phone: '', password: '', status: 'active' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherService.list({ search });
      setTeachers(data.data ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadTeachers, 300);
    return () => clearTimeout(timer);
  }, [loadTeachers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (teacher) => {
    setEditing(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone ?? '',
      password: '',
      status: teacher.status,
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
        await teacherService.update(editing.id, payload);
      } else {
        await teacherService.create(form);
      }
      setModalOpen(false);
      loadTeachers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (!confirm(`Remove ${teacher.name}? This cannot be undone.`)) return;
    try {
      await teacherService.remove(teacher.id);
      loadTeachers();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone ?? '—' },
    { key: 'classes_count', label: 'Classes', render: (r) => r.classes_taught_count ?? 0 },
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
          <h1 className="text-xl font-bold text-slate-900">Teachers</h1>
          <p className="text-sm text-slate-500">Manage teacher accounts and assignments.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Teacher
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />

      <Table columns={columns} data={teachers} loading={loading} emptyMessage="No teachers found." />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Teacher' : 'Add Teacher'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save Changes' : 'Create Teacher'}
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

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
