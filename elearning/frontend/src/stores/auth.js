import { defineStore } from 'pinia';
import api from '../api.js';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export const useAuth = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: readUser(),
  }),
  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    isTeacher: (s) => ['instructor', 'admin'].includes(s.user?.role),
  },
  actions: {
    _set({ token, user }) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    async login(email, password) {
      this._set((await api.post('/auth/login', { email, password })).data);
    },
    async register(payload) {
      this._set((await api.post('/auth/register', payload)).data);
    },
    // JWT ไม่มีสถานะที่ฝั่งเซิร์ฟเวอร์ ล็อกเอาท์จึงคือการลบ token ฝั่งผู้ใช้
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
