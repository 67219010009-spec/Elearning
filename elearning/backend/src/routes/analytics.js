import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';

const router = Router();
const schema = z.object({
  visitorId: z.string().uuid(),
  pageType: z.enum(['site', 'course']),
  courseId: z.number().int().positive().optional()
}).refine((v) => v.pageType === 'site' ? v.courseId === undefined : v.courseId !== undefined);

router.post('/view', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'ข้อมูลสถิติไม่ถูกต้อง' });
  const { visitorId, pageType, courseId } = parsed.data;
  if (pageType === 'course') {
    const exists = await query('SELECT 1 FROM courses WHERE id = $1', [courseId]);
    if (!exists.rowCount) return res.sendStatus(404);
    await query('INSERT INTO analytics_events (visitor_id, page_type, course_id) VALUES ($1, $2, $3)', [visitorId, pageType, courseId]);
  } else {
    await query('INSERT INTO analytics_events (visitor_id, page_type) VALUES ($1, $2)', [visitorId, pageType]);
  }
  res.sendStatus(204);
});
export default router;
