import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const users = [
  ['ผู้ดูแลระบบ', 'admin', 'admin1234', 'admin'],
  ['ผู้สอนตัวอย่าง', 'teacher', 'teacher1234', 'instructor'],
  ['นักเรียนตัวอย่าง', 'student', 'student1234', 'student'],
];

for (const [name, username, password, role] of users) {
  const exists = await pool.query(
    'SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  );

  if (!exists.rowCount) {
    await pool.query(
      `INSERT INTO users (name, username, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [name, username, await bcrypt.hash(password, 10), role]
    );
  }
}

console.log('สร้างบัญชีตัวอย่างเรียบร้อย');
await pool.end();
