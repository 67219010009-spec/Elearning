import jwt from 'jsonwebtoken';

function readToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

// บังคับล็อกอิน
export function auth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

// ล็อกอินหรือไม่ก็ได้ (ถ้าล็อกอินจะมี req.user)
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      /* ข้าม: ถือว่าเป็นผู้เยี่ยมชม */
    }
  }
  next();
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ error: 'ไม่มีสิทธิ์ทำรายการนี้' });
