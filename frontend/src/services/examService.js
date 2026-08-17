import api from './api';

export const examService = {
  async list(params = {}) {
    const { data } = await api.get('/exams', { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/exams/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/exams', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/exams/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/exams/${id}`);
    return data;
  },
  async saveMarks(examId, marks) {
    // marks: [{ student_id, score, remarks }]
    const { data } = await api.post(`/exams/${examId}/marks`, { marks });
    return data;
  },
  async publish(examId) {
    const { data } = await api.patch(`/exams/${examId}/publish`);
    return data;
  },
};
