<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';
import { errMsg } from '../api.js';

const auth = useAuth();
const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push(route.query.redirect || '/');
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm">
    <h1 class="mb-6 text-2xl">เข้าสู่ระบบ</h1>
    <p v-if="error" class="alert mb-4">{{ error }}</p>
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="email">อีเมล</label>
        <input id="email" v-model="email" type="email" class="input" required autocomplete="email" />
      </div>
      <div>
        <label class="label" for="password">รหัสผ่าน</label>
        <input id="password" v-model="password" type="password" class="input" required autocomplete="current-password" />
      </div>
      <button class="btn w-full" :disabled="loading">{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</button>
    </form>
    <p class="mt-4 text-sm text-mute">
      ยังไม่มีบัญชี?
      <RouterLink to="/register" class="font-medium text-board underline">สมัครสมาชิก</RouterLink>
    </p>
  </div>
</template>
