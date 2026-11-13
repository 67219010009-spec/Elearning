<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';
import { errMsg } from '../api.js';

const auth = useAuth();
const router = useRouter();

const form = reactive({ name: '', email: '', password: '', role: 'student' });
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.register({ ...form });
    router.push('/');
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm">
    <h1 class="mb-6 text-2xl">สมัครสมาชิก</h1>
    <p v-if="error" class="alert mb-4">{{ error }}</p>
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label" for="name">ชื่อที่แสดง</label>
        <input id="name" v-model="form.name" class="input" required maxlength="100" autocomplete="name" />
      </div>
      <div>
        <label class="label" for="email">อีเมล</label>
        <input id="email" v-model="form.email" type="email" class="input" required autocomplete="email" />
      </div>
      <div>
        <label class="label" for="password">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</label>
        <input id="password" v-model="form.password" type="password" class="input" required minlength="8" autocomplete="new-password" />
      </div>
      <div>
        <label class="label" for="role">สมัครในฐานะ</label>
        <select id="role" v-model="form.role" class="input">
          <option value="student">นักเรียน</option>
          <option value="instructor">ผู้สอน</option>
        </select>
      </div>
      <button class="btn w-full" :disabled="loading">{{ loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}</button>
    </form>
    <p class="mt-4 text-sm text-mute">
      มีบัญชีอยู่แล้ว?
      <RouterLink to="/login" class="font-medium text-board underline">เข้าสู่ระบบ</RouterLink>
    </p>
  </div>
</template>
