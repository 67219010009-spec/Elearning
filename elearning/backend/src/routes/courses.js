import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { z } from 'zod';
import { query } from '../db.js';
import { auth, optionalAuth, requireRole } from '../middleware/auth.js';
import { UPLOAD_DIR, removeFile } from '../files.js';

const router = Router();

// ชนิดไฟล์ที่รับ และนามสกุลที่ใช้เก็บ (กำหนดจาก mimetype ไม่เชื่อชื่อไฟล์ที่ผู้ใช้ส่งมา)
const MIME_EXT = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'application/pdf': '.pdf' };
const FILE_TYPES = { video: ['video/mp4', 'video/webm'], pdf: ['application/pdf'] };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + MIME_EXT[file.mimetype]),
  }),
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 200) * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in MIME_EXT),
});

const discard = (file) => file && removeFile('/uploads/' + file.filename);

const emptyToUndef = (schema) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

const courseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(''),
});

const lessonSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(['video', 'pdf', 'link', 'text']),
  url: emptyToUndef(z.string().trim().max(2000).regex(/^https?:\/\/\S+$/i)),
  body: emptyToUndef(z.string().trim().max(20000)),
});

// ตรวจว่า :id เป็นตัวเลขก่อนเข้า handler ทุกเส้นทาง
router.param('id', (_req, res, next, val) => {
  if (!/^\d+$/.test(val)) return res.status(400).json({ error: 'รหัสไม่ถูกต้อง' });
  next();
});

async function getOwnedCourse(courseId, user) {
  const { rows } = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
  const course = rows[0];
  if (!course) return { status: 404 };
  if (course.instructor_id !== user.id && user.role !== 'admin') return { status: 403 };
  return { course };
}

/* ---------- รายการคอร์ส ---------- */

// คอร์สทั้งหมด (สาธารณะ)
router.get('/', async (_req, res) => {
  const { rows } = await query(`
    SELECT c.id, c.title, c.description, c.created_at, u.name AS instructor_name,
           (SELECT COUNT(*)::int FROM lessons l WHERE l.course_id = c.id) AS lesson_count
    FROM courses c JOIN users u ON u.id = c.instructor_id
    ORDER BY c.created_at DESC`);
  res.json(rows);
});

// คอร์สที่ฉันสอน
router.get('/mine', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const { rows } = await query(
    `SELECT c.id, c.title, c.description,
            (SELECT COUNT(*)::int FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
            (SELECT COUNT(*)::int FROM enrollments e WHERE e.course_id = c.id) AS student_count
     FROM courses c WHERE c.instructor_id = $1 ORDER BY c.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// คอร์สที่ฉันลงทะเบียน พร้อมความคืบหน้า
router.get('/enrolled', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT c.id, c.title, c.description, u.name AS instructor_name,
            (SELECT COUNT(*)::int FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
            (SELECT COUNT(*)::int FROM progress p JOIN lessons l ON l.id = p.lesson_id
              WHERE l.course_id = c.id AND p.user_id = $1) AS done_count
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN users u ON u.id = c.instructor_id
     WHERE e.user_id = $1 ORDER BY e.enrolled_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

/* ---------- รายละเอียดคอร์ส ---------- */

// เนื้อหาบทเรียน (content) จะส่งให้เฉพาะผู้ลงทะเบียน เจ้าของคอร์ส และแอดมิน
router.get('/:id', optionalAuth, async (req, res) => {
  const id = Number(req.params.id);
  const found = await query(
    `SELECT c.*, u.name AS instructor_name
     FROM courses c JOIN users u ON u.id = c.instructor_id WHERE c.id = $1`,
    [id]
  );
  const course = found.rows[0];
  if (!course) return res.status(404).json({ error: 'ไม่พบคอร์ส' });

  const user = req.user;
  const isOwner = !!user && (user.id === course.instructor_id || user.role === 'admin');
  let enrolled = false;
  let completed = [];
  if (user) {
    enrolled =
      (await query('SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2', [user.id, id]))
        .rowCount > 0;
    if (enrolled) {
      completed = (
        await query(
          `SELECT p.lesson_id FROM progress p JOIN lessons l ON l.id = p.lesson_id
           WHERE p.user_id = $1 AND l.course_id = $2`,
          [user.id, id]
        )
      ).rows.map((r) => r.lesson_id);
    }
  }

  const { rows: lessons } = await query(
    'SELECT id, title, type, content, position FROM lessons WHERE course_id = $1 ORDER BY position, id',
    [id]
  );
  const canView = isOwner || enrolled;
  res.json({
    course,
    enrolled,
    isOwner,
    completed,
    lessons: lessons.map((l) => (canView ? l : { ...l, content: '' })),
  });
});

/* ---------- จัดการคอร์ส (ผู้สอน/แอดมิน) ---------- */

router.post('/', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'กรุณาใส่ชื่อคอร์ส' });
  const { rows } = await query(
    'INSERT INTO courses (title, description, instructor_id) VALUES ($1, $2, $3) RETURNING *',
    [parsed.data.title, parsed.data.description, req.user.id]
  );
  res.status(201).json(rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  const owned = await getOwnedCourse(Number(req.params.id), req.user);
  if (owned.status) return res.sendStatus(owned.status);
  const { rows } = await query(
    "SELECT content FROM lessons WHERE course_id = $1 AND type IN ('video', 'pdf')",
    [owned.course.id]
  );
  await query('DELETE FROM courses WHERE id = $1', [owned.course.id]);
  rows.forEach((l) => removeFile(l.content));
  res.sendStatus(204);
});

// เพิ่มบทเรียน (multipart/form-data: title, type, url | body | file)
router.post('/:id/lessons', auth, upload.single('file'), async (req, res) => {
  const owned = await getOwnedCourse(Number(req.params.id), req.user);
  if (owned.status) {
    discard(req.file);
    return res
      .status(owned.status)
      .json({ error: owned.status === 404 ? 'ไม่พบคอร์ส' : 'ไม่มีสิทธิ์จัดการคอร์สนี้' });
  }

  const parsed = lessonSchema.safeParse({ ...req.body });
  if (!parsed.success) {
    discard(req.file);
    return res.status(400).json({ error: 'ข้อมูลบทเรียนไม่ถูกต้อง (ลิงก์ต้องขึ้นต้นด้วย http หรือ https)' });
  }
  const { title, type, url, body } = parsed.data;

  let content;
  if (type === 'video' || type === 'pdf') {
    if (!req.file || !FILE_TYPES[type].includes(req.file.mimetype)) {
      discard(req.file);
      return res
        .status(400)
        .json({ error: type === 'video' ? 'ต้องแนบไฟล์วิดีโอ MP4 หรือ WebM' : 'ต้องแนบไฟล์ PDF' });
    }
    content = '/uploads/' + req.file.filename;
  } else {
    discard(req.file);
    content = type === 'link' ? url : body;
    if (!content) {
      return res
        .status(400)
        .json({ error: type === 'link' ? 'กรุณาใส่ลิงก์' : 'กรุณาใส่เนื้อหาบทเรียน' });
    }
  }

  const { rows } = await query(
    `INSERT INTO lessons (course_id, title, type, content, position)
     VALUES ($1, $2, $3, $4,
       (SELECT COALESCE(MAX(position), 0) + 1 FROM lessons WHERE course_id = $1))
     RETURNING *`,
    [owned.course.id, title, type, content]
  );
  res.status(201).json(rows[0]);
});

/* ---------- นักเรียน ---------- */

router.post('/:id/enroll', auth, async (req, res) => {
  const id = Number(req.params.id);
  const c = await query('SELECT 1 FROM courses WHERE id = $1', [id]);
  if (!c.rowCount) return res.status(404).json({ error: 'ไม่พบคอร์ส' });
  await query(
    'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, id]
  );
  res.status(201).json({ ok: true });
});

export default router;
