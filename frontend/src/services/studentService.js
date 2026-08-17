import api from './api';

export const studentService = {
  async list(params = {}) {
    const { data } = await api.get('/students', { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/students/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/students', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/students/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  },

  // Student self-service ("my/*") endpoints
  async myClasses() {
    const { data } = await api.get('/my/classes');
    return data;
  },
  async myAttendance(params = {}) {
    const { data } = await api.get('/my/attendance', { params });
    return data;
  },
  async myResults() {
    const { data } = await api.get('/my/results');
    return data;
  },
  async myFees() {
    const { data } = await api.get('/my/fees');
    return data;
  },
  async myPerformance() {
    const { data } = await api.get('/my/performance');
    return data;
  },
};
