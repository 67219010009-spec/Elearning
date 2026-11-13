<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api, { errMsg } from '../api.js';

const route = useRoute();
const id = route.params.id;

const data = ref(null);
const error = ref('');
const saving = ref(false);
const file = ref(null);
const fileInput = ref(null);
const form = reactive({ title: '', type: 'video', url: '', body: '' });

const typeLabels = {
  video: 'วิดีโอ',
  pdf: 'เอกสาร PDF',
  link: 'ลิงก์ (เช่น YouTube)',
  text: 'ข้อความ',
};

async function load() {
  try {
    data.value = (await api.get(`/courses/${id}`)).data;
  } catch (e) {
    error.value = errMsg(e);
  }
}

function resetFile() {
  file.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

async function addLesson() {
  error.value = '';
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('type', form.type);
    if (form.type === 'link') fd.append('url', form.url);
    if (form.type === 'text') fd.append('body', form.body);
    if (file.value && (form.type === 'video' || form.type === 'pdf')) fd.append('file', file.value);
    await api.post(`/courses/${id}/lessons`, fd);
    form.title = '';
    form.url = '';
    form.body = '';
    resetFile();
    await load();
  } catch (e) {
    error.value = errMsg(e);
  } finally {
    saving.value = false;
  }
}

async function removeLesson(l) {
  if (!confirm(`ลบบทเรียน "${l.title}" ?`)) return;
  try {
    await api.delete(`/lessons/${l.id}`);
    await load();
  } catch (e) {
    error.value = errMsg(e);
  }
}

onMounted(load);
</script>

<template>
  <RouterLink to="/manage" class="text-sm text-board underline">กลับไปรายการคอร์ส</RouterLink>
  <p v-if="error" class="alert my-4">{{ error }}</p>

  <div v-if="data">
    <h1 class="mb-6 mt-2 text-3xl">{{ data.course.title }}</h1>

    <p v-if="!data.isOwner" class="alert">คุณไม่มีสิทธิ์จัดการคอร์สนี้</p>

    <template v-else>
      <form class="mb-8 max-w-xl space-y-3 rounded-md border border-line bg-white p-4" @submit.prevent="addLesson">
        <h2 class="text-lg">เพิ่มบทเรียน</h2>
        <div>
          <label class="label" for="ltitle">ชื่อบทเรียน</label>
          <input id="ltitle" v-model="form.title" class="input" required maxlength="200" />
        </div>
        <div>
          <label class="label" for="ltype">ชนิดเนื้อหา</label>
          <select id="ltype" v-model="form.type" class="input" @change="resetFile">
            <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>

        <div v-if="form.type === 'video' || form.type === 'pdf'">
          <label class="label" for="lfile">
            {{ form.type === 'video' ? 'ไฟล์วิดีโอ (MP4 หรือ WebM)' : 'ไฟล์ PDF' }}
          </label>
          <input
            id="lfile"
            ref="fileInput"
            type="file"
            class="input"
            required
            :accept="form.type === 'video' ? 'video/mp4,video/webm' : 'application/pdf'"
            @change="file = $event.target.files[0] || null"
          />
        </div>
        <div v-else-if="form.type === 'link'">
          <label class="label" for="lurl">ลิงก์ (ขึ้นต้นด้วย https://)</label>
          <input id="lurl" v-model="form.url" type="url" class="input" required placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div v-else>
          <label class="label" for="lbody">เนื้อหา</label>
          <textarea id="lbody" v-model="form.body" rows="6" class="input" required></textarea>
        </div>

        <button class="btn" :disabled="saving">{{ saving ? 'กำลังบันทึก/อัปโหลด...' : 'เพิ่มบทเรียน' }}</button>
      </form>

      <h2 class="mb-3 text-lg">บทเรียนในคอร์ส</h2>
      <p v-if="!data.lessons.length" class="text-mute">ยังไม่มีบทเรียน เพิ่มบทแรกได้จากแบบฟอร์มด้านบน</p>
      <ol v-else class="space-y-2">
        <li
          v-for="(l, i) in data.lessons"
          :key="l.id"
          class="flex items-center gap-3 rounded-md border border-line bg-white px-4 py-3"
        >
          <span class="w-6 text-sm text-mute">{{ i + 1 }}</span>
          <span class="min-w-0 flex-1">{{ l.title }}</span>
          <span class="text-sm text-mute">{{ typeLabels[l.type] }}</span>
          <button class="btn btn-danger" @click="removeLesson(l)">ลบ</button>
        </li>
      </ol>
    </template>
  </div>
</template>
