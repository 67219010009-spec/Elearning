<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { errMsg } from '../api.js';
import { useAuth } from '../stores/auth.js';
import { spine } from '../spine.js';
import LessonViewer from '../components/LessonViewer.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const data = ref(null);
const current = ref(null);
const error = ref('');

const canView = computed(() => !!data.value && (data.value.enrolled || data.value.isOwner));
const done = computed(() => new Set(data.value?.completed || []));
const percent = computed(() => {
  const n = data.value?.lessons.length || 0;
  return n ? Math.round((done.value.size / n) * 100) : 0;
});

async function load() {
  error.value = '';
  try {
    data.value = (await api.get(`/courses/${route.params.id}`)).data;
    current.value = data.value.lessons[0] || null;
  } catch (e) {
    error.value = errMsg(e);
  }
}

async function enroll() {
  if (!auth.isLoggedIn) {
    return router.push({ path: '/login', query: { redirect: route.fullPath } });
  }
  try {
    await api.post(`/courses/${route.params.id}/enroll`);
    await load();
  } catch (e) {
    error.value = errMsg(e);
  }
}

async function complete() {
  try {
    await api.post(`/lessons/${current.value.id}/complete`);
    if (!done.value.has(current.value.id)) data.value.completed.push(current.value.id);
  } catch (e) {
    error.value = errMsg(e);
  }
}

watch(() => route.params.id, load, { immediate: true });
</script>

<template>
  <p v-if="error" class="alert mb-4">{{ error }}</p>

  <div v-if="data">
    <div class="mb-6 border-l-8 pl-4" :style="{ borderLeftColor: spine(data.course.id) }">
      <h1 class="text-3xl">{{ data.course.title }}</h1>
      <p class="mt-1 text-sm text-mute">สอนโดย {{ data.course.instructor_name }}</p>
      <p v-if="data.course.description" class="mt-3 max-w-prose whitespace-pre-line">
        {{ data.course.description }}
      </p>
    </div>

    <div v-if="!canView" class="mb-6 flex flex-wrap items-center gap-3">
      <button class="btn btn-chalk" @click="enroll">ลงทะเบียนเรียน</button>
      <span class="text-sm text-mute">ลงทะเบียนแล้วจึงจะเปิดบทเรียนได้</span>
    </div>
    <div v-else-if="data.enrolled" class="mb-6 max-w-sm">
      <div class="mb-1 flex justify-between text-sm">
        <span>ความคืบหน้า</span><span>{{ percent }}%</span>
      </div>
      <div class="h-2 rounded bg-line">
        <div class="h-2 rounded bg-chalk" :style="{ width: percent + '%' }"></div>
      </div>
    </div>
    <RouterLink v-else :to="`/manage/${data.course.id}`" class="btn btn-ghost mb-6">
      แก้ไขบทเรียนของคอร์สนี้
    </RouterLink>

    <p v-if="!data.lessons.length" class="text-mute">คอร์สนี้ยังไม่มีบทเรียน</p>

    <div v-else class="grid gap-6 md:grid-cols-[16rem_1fr]">
      <ol class="space-y-1">
        <li v-for="(l, i) in data.lessons" :key="l.id">
          <button
            :disabled="!canView"
            class="flex w-full items-center gap-3 rounded-md border border-line px-3 py-2 text-left text-sm disabled:opacity-60"
            :class="current?.id === l.id && canView ? 'bg-board text-white' : 'bg-white hover:border-board'"
            @click="current = l"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
              :class="done.has(l.id) ? 'bg-chalk text-ink' : 'border border-current'"
            >
              {{ done.has(l.id) ? '✓' : i + 1 }}
            </span>
            <span>{{ l.title }}</span>
          </button>
        </li>
      </ol>

      <section v-if="canView && current">
        <h2 class="mb-3 text-xl">{{ current.title }}</h2>
        <LessonViewer :lesson="current" />
        <button
          v-if="data.enrolled"
          class="btn mt-4"
          :disabled="done.has(current.id)"
          @click="complete"
        >
          {{ done.has(current.id) ? 'เรียนบทนี้จบแล้ว' : 'ทำเครื่องหมายว่าเรียนจบ' }}
        </button>
      </section>
      <section v-else class="rounded-md border border-dashed border-line p-8 text-center text-mute">
        ลงทะเบียนเพื่อเริ่มเรียนบทเรียนเหล่านี้
      </section>
    </div>
  </div>
</template>
