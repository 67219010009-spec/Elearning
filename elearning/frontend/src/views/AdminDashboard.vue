<script setup>
import { ref, onMounted } from 'vue';
import api, { errMsg } from '../api.js';
const stats = ref(null); const users = ref([]); const loading = ref(true);
const error = ref(''); const updating = ref(null);
async function load() {
  error.value = ''; loading.value = true;
  try {
    const [overview, userList] = await Promise.all([api.get('/admin/overview'), api.get('/admin/users')]);
    stats.value = overview.data; users.value = userList.data;
  } catch (e) { error.value = errMsg(e); } finally { loading.value = false; }
}
async function setRole(user, role) {
  if (user.role === role) return;
  updating.value = user.id; error.value = '';
  try {
    const { data } = await api.patch(`/admin/users/${user.id}/role`, { role });
    Object.assign(user, data);
  } catch (e) { error.value = errMsg(e); } finally { updating.value = null; }
}
onMounted(load);
</script>
<template>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div><p class="text-sm text-mute">ระบบควบคุม</p><h1 class="text-3xl">ADMIN Dashboard</h1></div>
    <button class="btn btn-ghost" @click="load">รีเฟรชข้อมูล</button>
  </div>
  <p v-if="error" class="alert mb-4">{{ error }}</p>
  <p v-if="loading" class="text-mute">กำลังโหลดข้อมูล...</p>
  <template v-else-if="stats">
    <section class="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">ผู้เข้าชมไม่ซ้ำ</p><p class="mt-1 text-3xl">{{ stats.uniqueVisitors }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">ยอดเข้าชมหน้าเว็บ</p><p class="mt-1 text-3xl">{{ stats.pageViews }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">เข้าชมหน้าคอร์ส</p><p class="mt-1 text-3xl">{{ stats.courseViews }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">ผู้ลงทะเบียนเรียนรวม</p><p class="mt-1 text-3xl">{{ stats.enrollments }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">สมาชิกทั้งหมด</p><p class="mt-1 text-3xl">{{ stats.users.total }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">นักเรียน</p><p class="mt-1 text-3xl">{{ stats.users.students }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">ผู้สอน</p><p class="mt-1 text-3xl">{{ stats.users.instructors }}</p></article>
      <article class="rounded-md border border-line bg-white p-4"><p class="text-sm text-mute">คอร์ส / บทเรียน</p><p class="mt-1 text-3xl">{{ stats.courses }} <span class="text-base text-mute">/ {{ stats.lessons }}</span></p></article>
    </section>
    <section class="mb-8 rounded-md border border-line bg-white p-4">
      <h2 class="mb-3 text-xl">คอร์สที่มีผู้เรียนมาก</h2>
      <p v-if="!stats.popularCourses.length" class="text-sm text-mute">ยังไม่มีคอร์ส</p>
      <div v-else class="overflow-x-auto"><table class="w-full text-left text-sm">
        <thead><tr class="border-b border-line text-mute"><th class="py-2 pr-3">คอร์ส</th><th class="py-2 pr-3">ผู้เรียน</th><th class="py-2">ยอดเข้าชม</th></tr></thead>
        <tbody><tr v-for="c in stats.popularCourses" :key="c.id" class="border-b border-line last:border-0"><td class="py-3 pr-3">{{ c.title }}</td><td class="py-3 pr-3">{{ c.students }}</td><td class="py-3">{{ c.views }}</td></tr></tbody>
      </table></div>
    </section>
    <section class="rounded-md border border-line bg-white p-4">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 class="text-xl">จัดการผู้ใช้งาน</h2><p class="text-xs text-mute">กำหนดสิทธิ์ผู้สอนให้บัญชีที่ได้รับอนุมัติ</p></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[620px] text-left text-sm">
        <thead><tr class="border-b border-line text-mute"><th class="py-2 pr-3">ชื่อ</th><th class="py-2 pr-3">Username</th><th class="py-2 pr-3">สมัครเมื่อ</th><th class="py-2 pr-3">ลงทะเบียน</th><th class="py-2">สิทธิ์</th></tr></thead>
        <tbody><tr v-for="u in users" :key="u.id" class="border-b border-line last:border-0">
          <td class="py-3 pr-3">{{ u.name }}</td><td class="py-3 pr-3">{{ u.username }}</td>
          <td class="py-3 pr-3">{{ new Date(u.created_at).toLocaleDateString('th-TH') }}</td><td class="py-3 pr-3">{{ u.enrolled_count }}</td>
          <td class="py-3"><span v-if="u.role === 'admin'" class="font-medium">ADMIN</span><select v-else class="input max-w-32 py-1" :value="u.role" :disabled="updating === u.id" @change="setRole(u, $event.target.value)"><option value="student">นักเรียน</option><option value="instructor">ผู้สอน</option></select></td>
        </tr></tbody>
      </table></div>
    </section>
  </template>
</template>
