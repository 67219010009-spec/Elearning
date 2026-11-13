// สีสันประจำคอร์ส (เหมือนสันหนังสือ) เลือกจาก id
const COLORS = ['#3B5BA9', '#8A4F9E', '#2F8F83', '#D08A1E'];
export const spine = (id) => COLORS[Number(id) % COLORS.length];
