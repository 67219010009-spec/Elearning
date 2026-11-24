import { defineStore } from 'pinia';
import api from '../api.js';
function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
export const useAuth = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('token') || '', user: readUser() }),
  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    isTeacher: (s) => ['instructor', 'admin'].includes(s.user?.role),
    isAdmin: (s) => s.user?.role === 'admin',
  },
  actions: {
    _set({ token, user }) {
      this.token = token; this.user = user;
      localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
    },
    async login(username, password) {
      this._set((await api.post('/auth/login', { username, password })).data);
    },
    async register(payload) {
      this._set((await api.post('/auth/register', payload)).data);
    },
    logout() {
      this.token = ''; this.user = null;
      localStorage.removeItem('token'); localStorage.removeItem('user');
    },
  },
});
