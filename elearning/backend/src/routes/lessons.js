import { Router } from 'express';
import { query } from '../db.js';
import { auth } from '../middleware/auth.js';
import { removeFile } from '../files.js';

const router = Router();

router.param('id', (_req, res, next, val) => {
  if (!/^\d+$/.test(val)) return res.status(400).json({ error: 'รหัสไม่ถูกต้อง' });
  next();
});

// ลบบทเรียน (เจ้าของคอร์ส/แอดมิน)
router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT l.id, l.content, c.instructor_id
     FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = $1`,
    [req.params.id]
  );
  const lesson = rows[0];
  if (!lesson) return res.sendStatus(404);
  if (lesson.instructor_id !== req.user.id && req.user.role !== 'admin') return res.sendStatus(403);
  await query('DELETE FROM lessons WHERE id = $1', [lesson.id]);
  removeFile(lesson.content);
  res.sendStatus(204);
});

// นักเรียนทำเครื่องหมายว่าเรียนบทนี้จบ
router.post('/:id/complete', auth, async (req, res) => {
  const { rows } = await query('SELECT course_id FROM lessons WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.sendStatus(404);
  const enrolled = await query(
    'SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2',
    [req.user.id, rows[0].course_id]
  );
  if (!enrolled.rowCount) return res.status(403).json({ error: 'ต้องลงทะเบียนคอร์สก่อน' });
  await query(
    'INSERT INTO progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, req.params.id]
  );
  res.json({ ok: true });
});

export default router;
