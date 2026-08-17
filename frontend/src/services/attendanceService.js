import api from './api';

export const attendanceService = {
  async list(params = {}) {
    const { data } = await api.get('/attendance', { params });
    return data;
  },
  async saveBulk(payload) {
    // payload: { class_id, date, records: [{ student_id, status, remarks }] }
    const { data } = await api.post('/attendance/bulk', payload);
    return data;
  },
};
