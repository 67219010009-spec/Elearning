import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(auth, requireRole('admin'));

router.get('/overview', async (_req, res) => {
  const [users, courses, lessons, enrollments, views, visitors, popular] = await Promise.all([
    query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE role = \'student\')::int AS students, COUNT(*) FILTER (WHERE role = \'instructor\')::int AS instructors FROM users'),
    query('SELECT COUNT(*)::int AS total FROM courses'),
    query('SELECT COUNT(*)::int AS total FROM lessons'),
    query('SELECT COUNT(*)::int AS total FROM enrollments'),
    query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE page_type = \'course\')::int AS course_views FROM analytics_events'),
    query('SELECT COUNT(DISTINCT visitor_id)::int AS total FROM analytics_events'),
    query(`SELECT c.id, c.title, COUNT(e.user_id)::int AS students,
                  (SELECT COUNT(*)::int FROM analytics_events a WHERE a.course_id = c.id) AS views
           FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
           GROUP BY c.id ORDER BY students DESC, views DESC LIMIT 8`)
  ]);
  res.json({
    users: users.rows[0], courses: courses.rows[0].total, lessons: lessons.rows[0].total,
    enrollments: enrollments.rows[0].total, pageViews: views.rows[0].total,
    courseViews: views.rows[0].course_views, uniqueVisitors: visitors.rows[0].total,
    popularCourses: popular.rows
  });
});

router.get('/users', async (_req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.username, u.role, u.created_at,
            (SELECT COUNT(*)::int FROM enrollments e WHERE e.user_id = u.id) AS enrolled_count
     FROM users u ORDER BY u.created_at DESC`
  );
  res.json(rows);
});

router.patch('/users/:id/role', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'รหัสผู้ใช้ไม่ถูกต้อง' });
  const parsed = z.object({ role: z.enum(['student', 'instructor']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'กำหนดสิทธิ์ได้เฉพาะนักเรียนหรือผู้สอน' });
  const { rows } = await query(
    `UPDATE users SET role = $1 WHERE id = $2 AND role <> 'admin'
     RETURNING id, name, username, role`,
    [parsed.data.role, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'ไม่พบผู้ใช้ หรือไม่สามารถเปลี่ยนสิทธิ์บัญชีแอดมินได้' });
  res.json(rows[0]);
});
export default router;
