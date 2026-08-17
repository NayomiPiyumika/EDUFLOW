import { useEffect, useState, useCallback } from 'react';
import { Plus, ClipboardList, CheckCircle2 } from 'lucide-react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import { TextField, SelectField, TextAreaField } from '../../components/FormField.jsx';
import { Loading } from '../../components/Loading.jsx';
import { examService } from '../../services/examService';
import { classService } from '../../services/classService';

const emptyForm = { title: '', class_id: '', exam_date: '', max_marks: 100, pass_marks: 50, description: '' };

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [marksOpen, setMarksOpen] = useState(false);
  const [activeExam, setActiveExam] = useState(null);
  const [marksDraft, setMarksDraft] = useState({}); // { studentId: { score, remarks } }
  const [savingMarks, setSavingMarks] = useState(false);

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await examService.list({ per_page: 50 });
      setExams(data.data ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
    classService.list({ per_page: 50 }).then((data) => setClasses(data.data ?? data));
  }, [loadExams]);

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await examService.create(form);
      setCreateOpen(false);
      loadExams();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openMarksEntry = async (exam) => {
    const full = await examService.get(exam.id);
    setActiveExam(full);

    const cls = await classService.get(full.class_id);
    const draft = {};
    (cls.students ?? []).forEach((s) => {
      const existing = full.marks?.find((m) => m.student_id === s.id);
      draft[s.id] = {
        name: s.name,
        score: existing?.score ?? '',
        remarks: existing?.remarks ?? '',
      };
    });
    setMarksDraft(draft);
    setMarksOpen(true);
  };

  const updateDraft = (studentId, field, value) => {
    setMarksDraft((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const handleSaveMarks = async () => {
    setSavingMarks(true);
    try {
      const marks = Object.entries(marksDraft)
        .filter(([, v]) => v.score !== '')
        .map(([studentId, v]) => ({
          student_id: Number(studentId),
          score: Number(v.score),
          remarks: v.remarks || null,
        }));
      await examService.saveMarks(activeExam.id, marks);
      setMarksOpen(false);
      loadExams();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingMarks(false);
    }
  };

  const handlePublish = async (exam) => {
    if (!confirm(`Publish results for "${exam.title}"? Students will be able to see their marks.`)) return;
    try {
      await examService.publish(exam.id);
      loadExams();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { key: 'title', label: 'Exam' },
    { key: 'class', label: 'Class', render: (r) => r.class_room?.name ?? '—' },
    { key: 'exam_date', label: 'Date' },
    { key: 'max_marks', label: 'Max Marks' },
    {
      key: 'is_published',
      label: 'Status',
      render: (r) => <Badge tone={r.is_published ? 'success' : 'neutral'}>{r.is_published ? 'Published' : 'Draft'}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => openMarksEntry(r)}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800"
          >
            <ClipboardList size={14} /> Enter Marks
          </button>
          {!r.is_published && (
            <button
              onClick={() => handlePublish(r)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800"
            >
              <CheckCircle2 size={14} /> Publish
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loading label="Loading exams..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Exams</h1>
          <p className="text-sm text-slate-500">Create exams, enter marks, and publish results.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New Exam
        </Button>
      </div>

      <Table columns={columns} data={exams} emptyMessage="No exams created yet." />

      {/* Create Exam Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Exam"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Create Exam
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <TextField
            label="Exam Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <SelectField
            label="Class"
            required
            value={form.class_id}
            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
          >
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Exam Date"
            type="date"
            required
            value={form.exam_date}
            onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Max Marks"
              type="number"
              required
              value={form.max_marks}
              onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
            />
            <TextField
              label="Pass Marks"
              type="number"
              required
              value={form.pass_marks}
              onChange={(e) => setForm({ ...form, pass_marks: e.target.value })}
            />
          </div>
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </form>
      </Modal>

      {/* Marks Entry Modal */}
      <Modal
        open={marksOpen}
        onClose={() => setMarksOpen(false)}
        title={`Enter Marks — ${activeExam?.title ?? ''} (out of ${activeExam?.max_marks ?? 100})`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarksOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMarks} loading={savingMarks}>
              Save Marks
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {Object.entries(marksDraft).map(([studentId, entry]) => (
            <div key={studentId} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
              <span className="flex-1 text-sm font-medium text-slate-700">{entry.name}</span>
              <input
                type="number"
                min="0"
                max={activeExam?.max_marks}
                placeholder="Score"
                value={entry.score}
                onChange={(e) => updateDraft(studentId, 'score', e.target.value)}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <input
                type="text"
                placeholder="Remarks (optional)"
                value={entry.remarks}
                onChange={(e) => updateDraft(studentId, 'remarks', e.target.value)}
                className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
