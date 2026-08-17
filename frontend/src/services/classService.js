import api from './api';

export const classService = {
  async list(params = {}) {
    const { data } = await api.get('/classes', { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/classes/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/classes', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/classes/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/classes/${id}`);
    return data;
  },
  async assignTeacher(classId, teacherId) {
    const { data } = await api.post(`/classes/${classId}/assign-teacher`, { teacher_id: teacherId });
    return data;
  },
  async enrollStudent(classId, studentId) {
    const { data } = await api.post(`/classes/${classId}/enroll`, { student_id: studentId });
    return data;
  },
  async unenrollStudent(classId, studentId) {
    const { data } = await api.delete(`/classes/${classId}/students/${studentId}`);
    return data;
  },
};
