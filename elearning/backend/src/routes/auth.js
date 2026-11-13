import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['student', 'instructor']).default('student'), // admin สร้างผ่าน seed เท่านั้น
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง (รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร)' });
  }
  const { name, email, password, role } = parsed.data;

  const exists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rowCount) return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hash, role]
  );
  res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  const { email, password } = parsed.data;

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', auth, async (req, res) => {
  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  res.json({ user: rows[0] });
});

export default router;
