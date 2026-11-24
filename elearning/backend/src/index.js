import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import { UPLOAD_DIR } from './files.js';

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('ต้องตั้งค่า JWT_SECRET และ DATABASE_URL ในไฟล์ .env');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // ใช้งานหลัง Nginx

// ไฟล์สื่อ: เสิร์ฟก่อน helmet เพื่อให้ PDF/วิดีโอฝังในหน้าเว็บได้
// (รับเฉพาะ mp4/webm/pdf และตั้งนามสกุลจาก mimetype จึงปลอดภัย)
app.use('/uploads', express.static(UPLOAD_DIR));

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json());

app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, limit: 30 }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'ไฟล์ใหญ่เกินกำหนด' : 'อัปโหลดไฟล์ไม่สำเร็จ';
    return res.status(400).json({ error: msg });
  }
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API พร้อมใช้งานที่พอร์ต ${port}`));
