<script setup>
import { ref, reactive, onMounted } from 'vue';
import api, { errMsg } from '../api.js';
import { spine } from '../spine.js';

const courses = ref([]);
const error = ref('');
const loading = ref(true);
const saving = ref(false);
const form = reactive({ title: '', description: '' });

async function load() {
  try {
    courses.value = (await api.get('/courses/mine')).data;
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    loading.value = false;
  }
}

async function create() {
  error.value = '';
  saving.value = true;
  try {
    await api.post('/courses', { title: form.title, description: form.description });
    form.title = '';
    form.description = '';
    await load();
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    saving.value = false;
  }
}

async function remove(c) {
  if (!confirm(`ลบคอร์ส "${c.title}" พร้อมบทเรียนและไฟล์ทั้งหมด?`)) return;
  try {
    await api.delete(`/courses/${c.id}`);
    await load();
  } catch (e) {
    error.value = errMsg(e);
  }
}

onMounted(load);
</script>

<template>
  <h1 class="mb-6 text-3xl">จัดการคอร์ส</h1>
  <p v-if="error" class="alert mb-4">{{ error }}</p>

  <form class="mb-8 max-w-xl space-y-3 rounded-md border border-line bg-white p-4" @submit.prevent="create">
    <h2 class="text-lg">สร้างคอร์สใหม่</h2>
    <div>
      <label class="label" for="title">ชื่อคอร์ส</label>
      <input id="title" v-model="form.title" class="input" required maxlength="200" />
    </div>
    <div>
      <label class="label" for="desc">คำอธิบาย</label>
      <textarea id="desc" v-model="form.description" rows="3" class="input"></textarea>
    </div>
    <button class="btn" :disabled="saving">{{ saving ? 'กำลังสร้าง...' : 'สร้างคอร์ส' }}</button>
  </form>

  <p v-if="loading" class="text-mute">กำลังโหลด...</p>
  <p v-else-if="!courses.length" class="text-mute">ยังไม่มีคอร์ส สร้างคอร์สแรกได้จากแบบฟอร์มด้านบน</p>

  <ul v-else class="space-y-3">
    <li
      v-for="c in courses"
      :key="c.id"
      class="flex flex-wrap items-center gap-3 rounded-md border border-l-8 border-line bg-white p-4"
      :style="{ borderLeftColor: spine(c.id) }"
    >
      <div class="min-w-0 flex-1">
        <h2 class="text-lg">{{ c.title }}</h2>
        <p class="text-sm text-mute">{{ c.lesson_count }} บทเรียน, ผู้เรียน {{ c.student_count }} คน</p>
      </div>
      <RouterLink :to="`/manage/${c.id}`" class="btn">จัดการบทเรียน</RouterLink>
      <RouterLink :to="`/courses/${c.id}`" class="btn btn-ghost">ดูหน้าคอร์ส</RouterLink>
      <button class="btn btn-danger" @click="remove(c)">ลบ</button>
    </li>
  </ul>
</template>
