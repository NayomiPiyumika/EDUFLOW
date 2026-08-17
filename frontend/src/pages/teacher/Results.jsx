import { useEffect, useState } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import { SelectField } from '../../components/FormField.jsx';
import { Loading, EmptyState } from '../../components/Loading.jsx';
import { examService } from '../../services/examService';
import { classService } from '../../services/classService';

export default function TeacherResults() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    examService.list({ class_id: classId, per_page: 50 }).then((data) => {
      const list = data.data ?? data;
      setExams(list);
      setSelectedExam(list[0] ? String(list[0].id) : '');
    });
  }, [classId]);

  useEffect(() => {
    if (!selectedExam) {
      setMarks([]);
      return;
    }
    examService.get(selectedExam).then((exam) => setMarks(exam.marks ?? []));
  }, [selectedExam]);

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.student?.name ?? '—' },
    { key: 'score', label: 'Score' },
    { key: 'grade', label: 'Grade', render: (r) => <Badge tone="info">{r.grade}</Badge> },
    { key: 'remarks', label: 'Remarks', render: (r) => r.remarks ?? '—' },
  ];

  if (loading) return <Loading label="Loading..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Results</h1>
        <p className="text-sm text-slate-500">View marks by class and exam.</p>
      </div>

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
        <div className="w-full sm:w-64">
          <SelectField label="Exam" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
            {exams.length === 0 && <option value="">No exams for this class</option>}
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.exam_date})
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {marks.length === 0 ? (
        <EmptyState title="No marks recorded" description="Enter marks from the Exams page first." />
      ) : (
        <Table columns={columns} data={marks} />
      )}
    </div>
  );
}
