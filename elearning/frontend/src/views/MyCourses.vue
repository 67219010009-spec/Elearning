<script setup>
import { ref, onMounted } from 'vue';
import api, { errMsg } from '../api.js';
import { spine } from '../spine.js';

const courses = ref([]);
const error = ref('');
const loading = ref(true);

const percent = (c) => (c.lesson_count ? Math.round((c.done_count / c.lesson_count) * 100) : 0);

onMounted(async () => {
  try {
    courses.value = (await api.get('/courses/enrolled')).data;
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <h1 class="mb-6 text-3xl">คอร์สของฉัน</h1>
  <p v-if="error" class="alert">{{ error }}</p>
  <p v-else-if="loading" class="text-mute">กำลังโหลด...</p>
  <p v-else-if="!courses.length" class="text-mute">
    คุณยังไม่ได้ลงทะเบียนคอร์สไหนเลย
    <RouterLink to="/" class="font-medium text-board underline">ดูคอร์สทั้งหมด</RouterLink>
  </p>

  <div v-else class="grid gap-4 sm:grid-cols-2">
    <RouterLink
      v-for="c in courses"
      :key="c.id"
      :to="`/courses/${c.id}`"
      class="block rounded-md border border-l-8 border-line bg-white p-4 hover:border-board"
      :style="{ borderLeftColor: spine(c.id) }"
    >
      <h2 class="text-lg">{{ c.title }}</h2>
      <p class="mt-1 text-sm text-mute">สอนโดย {{ c.instructor_name }}</p>
      <div class="mt-3 flex justify-between text-sm">
        <span>เรียนแล้ว {{ c.done_count }}/{{ c.lesson_count }} บท</span>
        <span>{{ percent(c) }}%</span>
      </div>
      <div class="mt-1 h-2 rounded bg-line">
        <div class="h-2 rounded bg-chalk" :style="{ width: percent(c) + '%' }"></div>
      </div>
    </RouterLink>
  </div>
</template>
