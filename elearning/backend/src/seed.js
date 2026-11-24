import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const users = [
  ['ผู้ดูแลระบบ', 'admin', 'admin1234', 'admin'],
  ['ผู้สอนตัวอย่าง', 'teacher', 'teacher1234', 'instructor'],
  ['นักเรียนตัวอย่าง', 'student', 'student1234', 'student'],
];
for (const [name, username, password, role] of users) {
  await pool.query(
    `INSERT INTO users (name, username, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING`,
    [name, username, await bcrypt.hash(password, 10), role]
  );
}
console.log('สร้างบัญชีตัวอย่างเรียบร้อย (ดูชื่อผู้ใช้และรหัสผ่านใน README)');
await pool.end();
