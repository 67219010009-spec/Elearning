import api from './api.js';

function visitorId() {
  let id = localStorage.getItem('analyticsVisitorId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('analyticsVisitorId', id);
  }
  return id;
}
export function trackView(courseId = null) {
  const payload = courseId
    ? { visitorId: visitorId(), pageType: 'course', courseId: Number(courseId) }
    : { visitorId: visitorId(), pageType: 'site' };
  api.post('/analytics/view', payload).catch(() => {});
}
