<script setup>
import { useRouter, useRoute } from 'vue-router';
import { watch } from 'vue';
import { useAuth } from './stores/auth.js';
import { trackView } from './analytics.js';
const auth = useAuth(); const router = useRouter(); const route = useRoute();
function logout() { auth.logout(); router.push('/login'); }
watch(() => route.fullPath, () => {
  const courseId = route.path.match(/^\/courses\/(\d+)/)?.[1];
  trackView(courseId || null);
}, { immediate: true });
</script>
<template>
  <div class="flex min-h-screen flex-col ">
    <header class=" text-black">
      <nav class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <img src="https://cdn.discordapp.com/attachments/1560554556428128336/1574804269205299271/kokoro_transparent.png?ex=6b06fa44&is=6b05a8c4&hm=ccdda9013695d32e9bdd5487d1c9d8170a54c27eba7ef4806bb86a9a3bb0e3ba&" class="size-[50px]" alt="">
        <RouterLink to="/" class="font-display text-xl text-chalk">ห้องเรียนออนไลน์</RouterLink>
        <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <RouterLink to="/" class="text-right text-sm text-black/80 hover:text-black mg- ">คอร์สทั้งหมด</RouterLink>
          <RouterLink v-if="auth.isLoggedIn" to="/my-courses" class="text-sm tblack/80 hover:text-black">คอร์สของฉัน</RouterLink>
          <RouterLink v-if="auth.isTeacher" to="/manage" class="text-sm text-black/80 hover:text-black">จัดการคอร์ส</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin" class="text-sm text-chalk hover:text-black">ADMIN Dashboard</RouterLink>
        </div>
        <div class="ml-auto flex items-center gap-3 text-sm">
          <template v-if="auth.isLoggedIn"><span class="text-black/80">{{ auth.user.name }} ({{ auth.user.username }})</span><button class="btn btn-chalk" @click="logout">ออกจากระบบ</button></template>
          <template v-else><RouterLink to="/login" class="text-black/90 hover:text-black">เข้าสู่ระบบ</RouterLink><RouterLink to="/register" class="btn btn-chalk">สมัครสมาชิก</RouterLink></template>
        </div>
      </nav>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 "><RouterView /></main>
    <footer class="mt-8 border-t border-line bg-white">
      <div class="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-5 text-center text-sm text-mute sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <img src="https://cdn.discordapp.com/attachments/1560554556428128336/1574804269205299271/kokoro_transparent.png?ex=6b06fa44&is=6b05a8c4&hm=ccdda9013695d32e9bdd5487d1c9d8170a54c27eba7ef4806bb86a9a3bb0e3ba&" class="size-[50px]" alt="">
        <span class="text-center text-sm"> นายภูวดล พุทธาทอง <br> <p class="text-[10px]">ผู้พัฒนาเว็บไซต์</p></span>
        <span class="text-center text-sm"> นายสิริราช ธรรมโกศล <br> <p class="text-[10px]">ผู้จักการเรียนการสอน</p></span>
      </div>
    </footer>
  </div>
</template>
