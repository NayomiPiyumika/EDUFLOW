import api from './api';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/login', { email, password });
    return data; // { user, token }
  },

  async logout() {
    await api.post('/logout');
  },

  async me() {
    const { data } = await api.get('/me');
    return data;
  },
};
