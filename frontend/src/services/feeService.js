import api from './api';

export const feeService = {
  async list(params = {}) {
    const { data } = await api.get('/fees', { params });
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/fees', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/fees/${id}`, payload);
    return data;
  },
};
