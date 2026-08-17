import api from './api';

export const teacherService = {
  async list(params = {}) {
    const { data } = await api.get('/teachers', { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/teachers/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/teachers', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/teachers/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/teachers/${id}`);
    return data;
  },
};
