import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from './stores/auth.js';
const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/login', component: () => import('./views/Login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('./views/Register.vue'), meta: { guest: true } },
  { path: '/courses/:id', component: () => import('./views/CourseDetail.vue') },
  { path: '/my-courses', component: () => import('./views/MyCourses.vue'), meta: { auth: true } },
  { path: '/manage', component: () => import('./views/Manage.vue'), meta: { auth: true, teacher: true } },
  { path: '/manage/:id', component: () => import('./views/ManageCourse.vue'), meta: { auth: true, teacher: true } },
  { path: '/admin', component: () => import('./views/AdminDashboard.vue'), meta: { auth: true, admin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];
const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach((to) => {
  const auth = useAuth();
  if (to.meta.auth && !auth.isLoggedIn) return { path: '/login', query: { redirect: to.fullPath } };
  if (to.meta.admin && !auth.isAdmin) return '/';
  if (to.meta.teacher && !auth.isTeacher) return '/';
  if (to.meta.guest && auth.isLoggedIn) return auth.isAdmin ? '/admin' : '/';
});
export default router;
