import { useEffect, useState, useCallback } from 'react';
import { Bell, Plus, Check } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Badge from '../../components/Badge.jsx';
import { TextField, SelectField, TextAreaField } from '../../components/FormField.jsx';
import { Loading, EmptyState } from '../../components/Loading.jsx';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext.jsx';

const emptyForm = { title: '', message: '', target_role: 'all' };

export default function Notifications() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await notificationService.list();
    setItems(data.data ?? data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (item) => {
    if (item.is_read) return;
    await notificationService.markRead(item.id);
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await notificationService.create(form);
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading notifications..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Announcements and updates.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New Announcement
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${
                item.is_read ? 'border-slate-200 bg-white' : 'border-primary-200 bg-primary-50/40'
              }`}
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <Bell size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {!item.is_read && <Badge tone="info">New</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {item.sender?.name ? `From ${item.sender.name} · ` : ''}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              {!item.is_read && (
                <button
                  onClick={() => handleMarkRead(item)}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800"
                >
                  <Check size={14} /> Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Announcement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Send Announcement
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <TextField
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextAreaField
            label="Message"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <SelectField
            label="Audience"
            value={form.target_role}
            onChange={(e) => setForm({ ...form, target_role: e.target.value })}
          >
            <option value="all">Everyone</option>
            <option value="teacher">Teachers only</option>
            <option value="student">Students only</option>
          </SelectField>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
