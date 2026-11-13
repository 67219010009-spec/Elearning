import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// content ของบทเรียนไฟล์จะเป็น "/uploads/<ชื่อไฟล์>"
export function removeFile(content) {
  if (!content || !content.startsWith('/uploads/')) return;
  fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(content))).catch(() => {});
}
