import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// ตอนพัฒนา: proxy /api และ /uploads ไปที่ backend (ไม่ต้องตั้ง CORS)
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
});
