import api from './api'; // හෝ ඔයාගේ api/axios file එක ඇති Path එක

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  me: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
};
