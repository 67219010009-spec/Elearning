import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const users = [
  ['ผู้ดูแลระบบ', 'admin@example.com', 'admin1234', 'admin'],
  ['อาจารย์ตัวอย่าง', 'teacher@example.com', 'teacher1234', 'instructor'],
  ['นักเรียนตัวอย่าง', 'student@example.com', 'student1234', 'student'],
];

for (const [name, email, password, role] of users) {
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [name, email, await bcrypt.hash(password, 10), role]
  );
}
console.log('สร้างบัญชีตัวอย่างเรียบร้อย (ดูรหัสผ่านใน README)');
await pool.end();
