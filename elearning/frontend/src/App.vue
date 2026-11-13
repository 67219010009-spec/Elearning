<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from './stores/auth.js';

const auth = useAuth();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <header class="bg-board text-white">
    <nav class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
      <RouterLink to="/" class="font-display text-xl text-chalk">ห้องเรียนออนไลน์</RouterLink>
      <RouterLink to="/" class="text-sm text-white/80 hover:text-white">คอร์สทั้งหมด</RouterLink>
      <RouterLink v-if="auth.isLoggedIn" to="/my-courses" class="text-sm text-white/80 hover:text-white">
        คอร์สของฉัน
      </RouterLink>
      <RouterLink v-if="auth.isTeacher" to="/manage" class="text-sm text-white/80 hover:text-white">
        จัดการคอร์ส
      </RouterLink>

      <div class="ml-auto flex items-center gap-3 text-sm">
        <template v-if="auth.isLoggedIn">
          <span class="text-white/80">{{ auth.user.name }}</span>
          <button class="btn btn-chalk" @click="logout">ออกจากระบบ</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="text-white/90 hover:text-white">เข้าสู่ระบบ</RouterLink>
          <RouterLink to="/register" class="btn btn-chalk">สมัครสมาชิก</RouterLink>
        </template>
      </div>
    </nav>
  </header>

  <main class="mx-auto max-w-5xl px-4 py-8">
    <RouterView />
  </main>
</template>
