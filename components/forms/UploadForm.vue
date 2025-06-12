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

      <div
        class="grid"
        :class="{ 'sm:grid-cols-5 gap-2': Object.keys(displayData).length > 0 }"
      >
        <div
          v-if="Object.keys(displayData).length === 0"
          class="flex justify-center items-center text-center py-4"
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

      <div class="flex flex-col sticky bottom-0 bg-white pb-4 mt-6 gap-y-2">
        <div class="flex justify-end gap-x-2">
          <buttons-square
            @click="handleCopy"
            label="コピー"
            color="bg-gray-300"
            :isUse="Object.keys(displayData).length > 0"
          />
          <buttons-square
            v-if="!isSync"
            @click="syncData"
            label="共有"
            color="bg-blue-300"
            :isUse="Object.keys(displayData).length > 0"
          />
          <buttons-square
            v-else
            @click="syncData"
            label="再同期"
            color="bg-blue-300"
          />
        </div>
        <div v-if="showSyncInput">
          <div class="flex flex-col items-center mb-4">
            <div class="flex flex-row items-center">
              <div class="flex items-center w-20 h-0.5 bg-gray-700" />
              <h2 class="text-xl font-bold ml-4">カレンダー共有設定</h2>
              <h2
                class="font-bold ml-2 mr-4 bg-blue-500 rounded-sm px-1.5 text-white font-mono"
              >
                Beta
              </h2>
              <div class="flex items-center w-20 h-0.5 bg-gray-700" />
            </div>
            <p class="text-sm text-red-500 font-bold">
              一度共有した場合、ユーザー名と色を変更することはできません。
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-y-2 gap-x-2 justify-end">
            <div class="flex items-center">
              <input
                v-model="username"
                type="text"
                placeholder="ユーザー名を入力"
                class="border rounded px-2 py-1 font-bold"
                :style="{ color: userColor }"
              />
            </div>
            <ColorPicker v-model="userColor" />
            <div class="flex items-end">
              <buttons-square
                @click="confirmSync"
                label="確定"
                color="bg-green-300"
                :isUse="username.length > 0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { copyToClipboard } from "@/utils/CopyDate";
import { useAPI } from "@/composables/useAPI";
import ColorPicker from "@/components/buttons/ColorPicker.vue";

const props = defineProps({
  timeData: {
    type: Object,
    default: () => ({}),
  },
  isSync: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const displayData = ref({});
const showSyncInput = ref(false);
const username = ref("");
const userColor = ref("#3b82f6");
const { formatTimeForDisplay } = useTimeUtils();
const { createNewSpace } = useAPI();

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
  showSyncInput.value = true;
};

const confirmSync = async () => {
  try {
    if (Object.keys(displayData.value).length === 0) {
      alert("同期するデータがありません");
      return;
    }

    const randomId = generateRandomString();

    const response = await createNewSpace({
      ...displayData.value,
      spaceId: randomId,
      username: username.value,
      userColor: userColor.value,
    });

    displayData.value = response.savedEvents;

    await navigateTo(`/space/${randomId}`);

    alert("同期が完了しました");
    showSyncInput.value = false;
    username.value = "";
    userColor.value = "#000000";
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

<style scoped>
.cursor-crosshair {
  cursor: crosshair;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #666;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #666;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
</style>
