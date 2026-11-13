<script setup>
import { computed } from 'vue';

const props = defineProps({ lesson: { type: Object, default: null } });

// แปลงลิงก์ YouTube เป็น embed ถ้าไม่ใช่ YouTube จะแสดงเป็นลิงก์ธรรมดา
const embed = computed(() => {
  if (props.lesson?.type !== 'link') return null;
  try {
    const u = new URL(props.lesson.content);
    let id = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(u.hostname)) {
      id = u.searchParams.get('v') || (u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : null);
    }
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
  } catch {
    return null;
  }
});
</script>

<template>
  <div v-if="lesson">
    <video
      v-if="lesson.type === 'video'"
      :src="lesson.content"
      controls
      class="aspect-video w-full rounded-md bg-black"
    />
    <iframe
      v-else-if="lesson.type === 'pdf'"
      :src="lesson.content"
      title="เอกสารบทเรียน"
      class="h-[70vh] w-full rounded-md border border-line bg-white"
    />
    <template v-else-if="lesson.type === 'link'">
      <iframe
        v-if="embed"
        :src="embed"
        title="วิดีโอบทเรียน"
        class="aspect-video w-full rounded-md"
        allowfullscreen
      />
      <a
        v-else
        :href="lesson.content"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-ghost"
      >
        เปิดลิงก์บทเรียนในแท็บใหม่
      </a>
    </template>
    <div v-else class="max-w-prose whitespace-pre-wrap leading-relaxed">{{ lesson.content }}</div>
  </div>
</template>
