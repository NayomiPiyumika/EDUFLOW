import api from './api';

export const notificationService = {
  async list(params = {}) {
    const { data } = await api.get('/notifications', { params });
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/notifications', payload);
    return data;
  },
  async markRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
};
