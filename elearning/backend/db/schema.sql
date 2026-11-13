CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'instructor', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  instructor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- type: video/pdf = path ของไฟล์ที่อัปโหลด, link = URL, text = เนื้อหาข้อความ (เก็บใน content)
CREATE TABLE lessons (
  id         SERIAL PRIMARY KEY,
  course_id  INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('video', 'pdf', 'link', 'text')),
  content    TEXT NOT NULL DEFAULT '',
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE enrollments (
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE progress (
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_lessons_course ON lessons(course_id, position);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
