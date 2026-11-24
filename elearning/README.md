# ห้องเรียนออนไลน์ (E-learning) — Vue + Tailwind + Express + PostgreSQL

โปรเจคเริ่มต้นที่ใช้งานได้ครบวงจรขั้นพื้นฐาน: สมัคร/ล็อกอิน/ล็อกเอาท์, แยกบทบาท (นักเรียน / ผู้สอน / แอดมิน),
สร้างคอร์ส, อัปโหลดสื่อ (วิดีโอ MP4/WebM, PDF), ลิงก์ YouTube, บทเรียนข้อความ, ลงทะเบียนเรียน และติดตามความคืบหน้า

## โครงสร้าง

```
backend/    Express + PostgreSQL + Multer (API)
  db/schema.sql      ตารางทั้งหมด
  src/routes/        auth, courses, lessons
frontend/   Vue 3 + Vite + Pinia + Vue Router + Tailwind
deploy/     ตัวอย่างค่า Nginx สำหรับ deploy เอง
docker-compose.yml   PostgreSQL (+ API ถ้าต้องการ)
```

## รันบนเครื่องตัวเอง (ต้องมี Node.js 20+ และ Docker)

```bash
# 1) ฐานข้อมูล (สร้างตารางให้อัตโนมัติครั้งแรก)
docker compose up -d db

# 2) Backend
cd backend
cp .env.example .env
npm install
npm run seed        # สร้างบัญชีทดลอง
npm run dev         # http://localhost:3000

# 3) Frontend (เปิดอีกหน้าต่าง)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

ไม่ใช้ Docker: ติดตั้ง PostgreSQL เอง สร้างฐานข้อมูล แล้วรัน `psql -d <db> -f backend/db/schema.sql`
จากนั้นแก้ `DATABASE_URL` ใน `backend/.env`

### บัญชีทดลอง (หลัง `npm run seed`)

| บทบาท | Username | รหัสผ่าน |
|---|---|---|
| แอดมิน | admin | admin1234 |
| ผู้สอน | teacher | teacher1234 |
| นักเรียน | student | student1234 |

ลองใช้งาน: ล็อกอินเป็น admin → ADMIN Dashboard → เปลี่ยนสิทธิ์บัญชีที่อนุมัติเป็นผู้สอน → ล็อกอินบัญชีผู้สอน → "จัดการคอร์ส" → สร้างคอร์สและเพิ่มบทเรียน → ล็อกเอาท์ → ล็อกอินเป็นนักเรียน → ลงทะเบียนเรียน

## เส้นทาง API

| Method | Path | สิทธิ์ |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | ทุกคน |
| GET | /api/auth/me | ล็อกอิน |
| GET | /api/courses | ทุกคน |
| GET | /api/courses/:id | ทุกคน (เนื้อหาบทเรียนส่งให้เฉพาะผู้ลงทะเบียน/เจ้าของ) |
| GET | /api/courses/enrolled, /api/courses/mine | ล็อกอิน / ผู้สอน |
| POST | /api/courses, DELETE /api/courses/:id | ผู้สอน (เจ้าของ) / แอดมิน |
| POST | /api/courses/:id/lessons | เจ้าของคอร์ส / แอดมิน |
| POST | /api/courses/:id/enroll | ล็อกอิน |
| DELETE | /api/lessons/:id | เจ้าของคอร์ส / แอดมิน |
| POST | /api/lessons/:id/complete | นักเรียนที่ลงทะเบียนแล้ว |\n| POST | /api/analytics/view | ทุกคน (บันทึกสถิติการเข้าชม) |\n| GET | /api/admin/overview, /api/admin/users | แอดมิน |\n| PATCH | /api/admin/users/:id/role | แอดมิน (กำหนด student / instructor) |

## Deploy

**ทางเลือก A: เครื่อง Ubuntu ของคุณเอง** (แนะนำเมื่อเปิดพอร์ตจากภายนอกได้)

- เครื่อง DB: รัน `docker compose up -d db` (เปลี่ยน `DB_PASSWORD` ใน `.env`) และจำกัดให้เครื่อง API เข้าถึงพอร์ต 5432 ได้เท่านั้น
  (ใน compose ตั้งไว้ที่ `127.0.0.1:5432` ถ้าจะให้เครื่องอื่นเชื่อมต่อต้องปรับเป็น IP ภายในและตั้งกฎ firewall)
- เครื่อง API: คัดลอก `backend/` ไปไว้ แล้วตั้ง `.env` (`DATABASE_URL` ชี้ไปเครื่อง DB, `JWT_SECRET` ค่าสุ่มยาว ๆ,
  `CLIENT_ORIGIN` เป็นโดเมนเว็บ) รันด้วย Docker หรือ PM2 (`pm2 start src/index.js --name elearning-api`)
- เครื่อง Nginx: `cd frontend && npm run build` แล้วนำ `dist/` ไปไว้ตาม `deploy/nginx.conf.example`
  เปิด HTTPS ด้วย certbot
- Firewall: อนุญาตขาเข้าเฉพาะ 80/443 ไปที่เครื่อง Nginx

**ทางเลือก B: Vercel + Supabase** — ต้องปรับส่วนอัปโหลดไฟล์ก่อน เพราะ Vercel เขียนไฟล์ลงดิสก์ไม่ได้
และจำกัดขนาด request ราว 4.5 MB (ใช้ Supabase Storage แทน Multer สำหรับวิดีโอ)
ส่วน Express ควรรันที่ Render/Railway ส่วน PostgreSQL ใช้ของ Supabase ได้ทันที (แก้แค่ `DATABASE_URL`)

## ข้อจำกัดของเวอร์ชันเริ่มต้น (ที่ควรพัฒนาต่อ)

- ยังไม่มีแบบทดสอบ (quiz), ใบประกาศนียบัตร และกระดานถามตอบ
- ไฟล์ใน `/uploads` เปิดดูได้ถ้ารู้ URL (ชื่อไฟล์เป็นสุ่ม UUID และ URL ส่งให้เฉพาะผู้มีสิทธิ์เท่านั้น) ถ้าต้องการเข้มงวดขึ้น ให้เสิร์ฟผ่าน route ที่ตรวจสิทธิ์
- ล็อกเอาท์ลบ token ฝั่งผู้ใช้ (JWT ไม่มีสถานะที่เซิร์ฟเวอร์) และ token มีอายุ 7 วัน
- ก่อนใช้งานจริงต้องเปลี่ยน `JWT_SECRET`, `DB_PASSWORD` และไม่ใช้บัญชีทดลอง
\n\n## การอัปเดตระบบ\n\n- รัน SQL ใน `backend/db/schema.sql` กับฐานข้อมูลเดิมเพื่อเพิ่ม username และตารางสถิติ (บัญชีตัวอย่างเดิมจะเปลี่ยนเป็น `admin`, `teacher`, `student` ตามลำดับ ส่วนบัญชีอื่นจะเป็น `user<ID>` เพื่อให้ล็อกอินต่อได้ด้วย username ใหม่)\n- สมัครสมาชิกใหม่จะได้สิทธิ์นักเรียนเท่านั้น การอนุมัติผู้สอนทำได้จาก ADMIN Dashboard\n- สถิตินับจำนวน page views, ผู้เข้าชมไม่ซ้ำตาม browser identifier (นับอุปกรณ์/เบราว์เซอร์ ไม่ใช่การยืนยันตัวบุคคล) และยอดเปิดหน้าคอร์ส/ยอดลงทะเบียนเรียน\n- เปลี่ยนชื่อเครดิตท้ายเว็บได้ที่ `frontend/src/App.vue`\n