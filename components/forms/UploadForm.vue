<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
  >
    <div class="bg-white px-6 rounded-lg w-3/4 max-h-[80vh] overflow-y-auto">
      <div
        class="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pt-6"
      >
        <h2 class="text-xl font-bold border-b-2 border-gray-200">
          時間データ一覧
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
        </button>
      </div>

      <div class="grid sm:grid-cols-5 gap-2">
        <div
          v-if="Object.keys(displayData).length === 0"
          class="text-center py-4"
        >
          データがありません
        </div>
        <div
          v-else
          v-for="(timeSlots, date) in displayData"
          :key="date"
          class="border p-4 rounded"
        >
          <div class="font-bold">{{ formatDate(date) }}</div>
          <div class="text-blue-500 whitespace-pre-line">
            {{ formatTimeForDisplay(timeSlots) }}
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-4 sticky bottom-0 bg-white pb-6">
        <buttons-square
          @click="handleCopy"
          label="コピー"
          color="bg-gray-300"
          :isUse="Object.keys(displayData).length > 0"
        />
        <buttons-square @click="syncData" label="同期" color="bg-blue-300" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { copyToClipboard } from "@/utils/CopyDate";

const props = defineProps({
  timeData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close"]);
const displayData = ref({});
const { formatTimeForDisplay } = useTimeUtils();

watch(
  () => props.timeData,
  (newValue) => {
    displayData.value = { ...newValue };
  },
  { immediate: true }
);

const handleEscKey = (event) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const handleCopy = () => {
  copyToClipboard(displayData.value);
};

const generateRandomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const syncData = async () => {
  try {
    if (Object.keys(displayData.value).length === 0) {
      alert("同期するデータがありません");
      return;
    }

    // ランダムなURLを生成
    const randomId = generateRandomString();

    const response = await $fetch("http://localhost:8080/api/time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: {
        ...displayData.value,
        spaceId: randomId,
      },
    });

    displayData.value = response;

    // 生成したランダムIDでURLに遷移
    await navigateTo(`/space/${randomId}`);

    alert("同期が完了しました");
  } catch (error) {
    console.error("同期エラー:", error);
    alert("同期に失敗しました");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
});
</script>
