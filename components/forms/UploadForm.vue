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
          <buttons-square @click="syncData" label="同期" color="bg-blue-300" />
        </div>
        <div v-if="showSyncInput" class="flex justify-end gap-x-2 items-center">
          <div class="flex flex-col gap-y-2 pr-2">
            <div>
              <p>HEX</p>
              <input
                v-model="username"
                type="text"
                placeholder="ここにテキストを入力"
                class="border rounded px-2 py-1 font-bold"
              />
            </div>
            <div>
              <p>RGB</p>
              <input
                v-model="username"
                type="text"
                placeholder="ここにテキストを入力"
                class="border rounded px-2 py-1 font-bold"
              />
            </div>
            <div>
              <p>HSV</p>
              <input
                v-model="username"
                type="text"
                placeholder="ここにテキストを入力"
                class="border rounded px-2 py-1 font-bold"
              />
            </div>
          </div>
          <div class="flex flex-col gap-y-2">
            <input
              v-model="username"
              type="text"
              placeholder="ユーザー名を入力"
              class="border rounded px-2 py-1 font-bold"
              :style="{ color: userColor }"
            />
            <div class="flex justify-center gap-x-2">
              <ColorPicker v-model="userColor" />
              <!--色を表示-->
              <div class="flex flex-wrap max-w-20 gap-y-2">
                <div
                  class="w-20 h-8 rounded border"
                  :style="{ backgroundColor: userColor }"
                ></div>
                <div class="flex flex-wrap gap-2 justify-center">
                  <button
                    class="w-5 h-5 rounded border bg-red-500"
                    @click="userColor = '#ef4444'"
                  ></button>
                  <button
                    class="w-5 h-5 rounded border bg-green-500"
                    @click="userColor = '#22c55e'"
                  ></button>
                  <button
                    class="w-5 h-5 rounded border bg-pink-500"
                    @click="userColor = '#ec4899'"
                  ></button>
                  <button
                    class="w-5 h-5 rounded border bg-purple-500"
                    @click="userColor = '#a855f7'"
                  ></button>
                  <button
                    class="w-5 h-5 rounded border bg-blue-500"
                    @click="userColor = '#3b82f6'"
                  ></button>
                  <button
                    class="w-5 h-5 rounded border bg-indigo-500"
                    @click="userColor = '#6366f1'"
                  ></button>
                </div>
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
