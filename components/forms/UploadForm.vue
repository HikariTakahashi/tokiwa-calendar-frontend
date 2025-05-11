<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
  >
    <div class="bg-white p-6 rounded-lg w-3/4 max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">時間データ一覧</h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(time, date) in timeData"
          :key="date"
          class="border p-4 rounded"
        >
          <div class="font-bold">{{ formatDate(date) }}</div>
          <div class="text-blue-500">{{ time.start }} ~ {{ time.end }}</div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-4">
        <buttons-square
          @click="copyToClipboard"
          label="コピー"
          color="bg-gray-300"
        />
        <buttons-square @click="syncData" label="同期" color="bg-blue-300" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const emit = defineEmits(["close"]);
const timeData = ref({});

const handleEscKey = (event) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const copyToClipboard = () => {
  const text = Object.entries(timeData.value)
    .map(([date, time]) => `${formatDate(date)}: ${time.start} ~ ${time.end}`)
    .join("\n");

  navigator.clipboard
    .writeText(text)
    .then(() => alert("クリップボードにコピーしました"))
    .catch((err) => console.error("コピーに失敗しました:", err));
};

const syncData = async () => {
  try {
    await $fetch("http://localhost:8080/api/calendar/sync", {
      method: "POST",
      body: timeData.value,
    });
    alert("同期が完了しました");
    emit("close");
  } catch (error) {
    console.error("同期エラー:", error);
    alert("同期に失敗しました");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
  // 時間データを取得
  timeData.value = JSON.parse(localStorage.getItem("timeData") || "{}");
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
});
</script>
