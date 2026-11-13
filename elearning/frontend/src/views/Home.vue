<script setup>
import { ref, computed, onMounted } from 'vue';
import api, { errMsg } from '../api.js';
import { spine } from '../spine.js';

const courses = ref([]);
const q = ref('');
const error = ref('');
const loading = ref(true);

const filtered = computed(() => {
  const k = q.value.trim().toLowerCase();
  return courses.value.filter((c) => (c.title + ' ' + c.description).toLowerCase().includes(k));
});

onMounted(async () => {
  try {
    courses.value = (await api.get('/courses')).data;
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="mb-8">
    <h1 class="text-3xl">เลือกคอร์สที่อยากเรียน</h1>
    <input v-model="q" class="input mt-4 max-w-md" placeholder="ค้นหาชื่อคอร์สหรือคำอธิบาย" aria-label="ค้นหาคอร์ส" />
  </section>

  <p v-if="error" class="alert">{{ error }}</p>
  <p v-else-if="loading" class="text-mute">กำลังโหลดคอร์ส...</p>
  <p v-else-if="!courses.length" class="text-mute">
    ยังไม่มีคอร์สในระบบ ผู้สอนสามารถเข้าสู่ระบบแล้วสร้างคอร์สแรกได้ที่เมนู "จัดการคอร์ส"
  </p>
  <p v-else-if="!filtered.length" class="text-mute">ไม่พบคอร์สที่ตรงกับคำค้น ลองใช้คำอื่น</p>

  <div v-else class="grid gap-4 sm:grid-cols-2">
    <RouterLink
      v-for="c in filtered"
      :key="c.id"
      :to="`/courses/${c.id}`"
      class="block rounded-md border border-l-8 border-line bg-white p-4 hover:border-board"
      :style="{ borderLeftColor: spine(c.id) }"
    >
      <h2 class="text-lg">{{ c.title }}</h2>
      <p class="mt-1 text-sm text-mute">สอนโดย {{ c.instructor_name }}</p>
      <p class="mt-2 line-clamp-2 text-sm">{{ c.description }}</p>
      <p class="mt-3 text-sm text-mute">{{ c.lesson_count }} บทเรียน</p>
    </RouterLink>
  </div>
</template>
