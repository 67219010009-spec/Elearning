import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  username: z.string().trim().toLowerCase().min(3).max(50).regex(/^[a-z0-9_.-]+$/, 'ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, 0-9, จุด ขีด และขีดล่าง'),
  password: z.string().min(8).max(100),
});
const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(50),
  password: z.string().min(1),
});
const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u.id, name: u.name, username: u.username, role: u.role });

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง: ชื่อผู้ใช้ 3-50 ตัว และรหัสผ่านอย่างน้อย 8 ตัวอักษร' });
  const { name, username, password } = parsed.data;
  const exists = await query('SELECT 1 FROM users WHERE LOWER(username) = $1', [username]);
  if (exists.rowCount) return res.status(409).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await query(
      'INSERT INTO users (name, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, username, hash, 'student']
    );
    res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    throw e;
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  const { username, password } = parsed.data;
  const { rows } = await query('SELECT * FROM users WHERE LOWER(username) = $1', [username]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', auth, async (req, res) => {
  const { rows } = await query('SELECT id, name, username, role FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  res.json({ user: rows[0] });
});
export default router;
