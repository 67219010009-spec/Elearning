import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// แนบ token ทุก request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// token หมดอายุ -> เคลียร์แล้วกลับไปหน้าเข้าสู่ระบบ
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && localStorage.getItem('token') && !isAuthCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.error || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง';
export default api;
