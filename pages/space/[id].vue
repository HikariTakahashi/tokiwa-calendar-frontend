<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">カレンダー</h1>
      <div class="flex gap-4">
        <buttons-square
          @click="openUploadForm"
          label="アップロード"
          color="bg-blue-300"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(date, index) in calendarDates"
        :key="index"
        class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <h2 class="text-lg font-semibold mb-2">{{ date.date }}</h2>
        <p class="text-gray-600">{{ date.start }} - {{ date.end }}</p>
      </div>
    </div>

    <UploadForm
      v-if="showUploadForm"
      :timeData="timeData"
      @close="showUploadForm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const showUploadForm = ref(false);
const timeData = ref({});
const calendarDates = ref([]);

const openUploadForm = () => {
  showUploadForm.value = true;
};

const fetchSpaceData = async () => {
  try {
    const spaceId = route.params.id;
    const response = await $fetch(`http://localhost:8080/api/time`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: {
        spaceId: spaceId,
      },
    });
    timeData.value = response;

    // カレンダー表示用のデータを整形
    calendarDates.value = Object.entries(response).map(([date, time]) => ({
      date: formatDate(date),
      start: time.start,
      end: time.end,
    }));
  } catch (error) {
    console.error("スペースデータの取得に失敗しました:", error);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

onMounted(() => {
  fetchSpaceData();
});
</script>
