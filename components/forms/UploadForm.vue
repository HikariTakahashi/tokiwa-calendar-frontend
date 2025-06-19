<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
  >
    <div
      class="bg-white px-6 rounded-lg w-full sm:w-4/5 max-h-full sm:max-h-[80vh] overflow-y-auto"
    >
      <!-- デバッグ用表示
      <div class="text-red-500 font-bold mb-2">
        現在のspaceId: {{ props.spaceId }}
      </div> -->

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
          v-for="[date, timeSlots] in Object.entries(displayData)
            .filter(([date, slots]) => date && slots)
            .sort(([dateA], [dateB]) => {
              const dateAObj = new Date(dateA);
              const dateBObj = new Date(dateB);
              if (isNaN(dateAObj.getTime()) || isNaN(dateBObj.getTime())) {
                return 0;
              }
              return dateAObj - dateBObj;
            })"
          :key="date"
          class="border p-4 rounded"
        >
          <div class="font-bold flex items-center gap-x-1">
            {{ formatDate(date).date }}
            <span
              class="py-0.5 px-[5px] rounded-full text-white text-sm"
              :class="{
                'bg-red-500': formatDate(date).isSunday,
                'bg-yellow-600': formatDate(date).isMonday,
                'bg-red-800': formatDate(date).isTuesday,
                'bg-indigo-500': formatDate(date).isWednesday,
                'bg-green-700': formatDate(date).isThursday,
                'bg-yellow-500': formatDate(date).isFriday,
                'bg-blue-500': formatDate(date).isSaturday,
                'bg-black':
                  !formatDate(date).isSunday && !formatDate(date).isSaturday,
              }"
            >
              {{ formatDate(date).weekday }}
            </span>
          </div>
          <div class="text-black whitespace-pre-line">
            <template v-if="Array.isArray(timeSlots) && timeSlots.length > 0">
              <div v-for="(slot, index) in timeSlots" :key="index">
                <span
                  v-if="slot && slot.username"
                  class="font-bold px-1.5 rounded-md text-white"
                  :style="{ backgroundColor: slot.userColor || '#3b82f6' }"
                >
                  {{ slot.username }}
                </span>
                {{ slot ? formatTimeForDisplay([slot]) : "無効なデータ" }}
              </div>
            </template>
            <template v-else-if="timeSlots && typeof timeSlots === 'object'">
              <span
                v-if="timeSlots.username"
                :style="{ color: timeSlots.userColor || '#3b82f6' }"
              >
                {{ timeSlots.username }}:
              </span>
              {{ formatTimeForDisplay([timeSlots]) }}
            </template>
            <template v-else>
              <span class="text-red-500">無効なデータ</span>
            </template>
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
          <div class="flex flex-col sm:flex-row gap-y-2 gap-x-2">
            <div class="flex flex-col gap-y-2 w-1/2">
              <p class="font-bold border-b-2 border-gray-600 sm:w-1/4">
                詳細設定
              </p>
              <Switch
                v-model="enablePeriodSetting"
                label="入力可能な期間を設定する"
              />
              <div
                v-if="enablePeriodSetting"
                class="flex flex-row gap-x-2 items-center"
              >
                <input
                  v-model="startDate"
                  type="date"
                  class="border rounded px-2 py-1 w-full"
                />
                <p class="text-xl font-bold">~</p>
                <input
                  v-model="endDate"
                  type="date"
                  class="border rounded px-2 py-1 w-full"
                />
              </div>
            </div>
            <div class="flex flex-col gap-y-2 w-1/2">
              <div class="flex flex-col gap-y-1 w-full">
                <p class="font-bold border-b-2 border-gray-600 sm:w-1/4">
                  ユーザー名
                </p>
                <input
                  v-model="username"
                  type="text"
                  placeholder="ユーザー名を入力"
                  class="border rounded px-2 py-1 font-bold"
                  :style="{ color: userColor }"
                />
              </div>
              <div class="flex flex-col gap-y-1 w-full">
                <p class="font-bold border-b-2 border-gray-600 sm:w-1/4">
                  ユーザーカラー
                </p>
                <div class="flex">
                  <ColorPicker v-model="userColor" />
                  <div class="flex pl-2 items-end">
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
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { copyToClipboard } from "@/utils/CopyDate";
import { useAPI } from "@/composables/useAPI";
import { useTimeUtils } from "@/utils/TimeUtils";
import ColorPicker from "@/components/buttons/ColorPicker.vue";
import Switch from "~/components/buttons/Switch.vue";

const props = defineProps({
  timeData: {
    type: Object,
    default: () => ({
      events: {},
      spaceId: "",
      username: "",
      userColor: "",
    }),
  },
  isSync: {
    type: Boolean,
    default: false,
  },
  spaceId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const displayData = ref({});
const showSyncInput = ref(false);
const username = ref("");
const userColor = ref("#3b82f6");
const { formatTimeForDisplay } = useTimeUtils();
const { createNewSpace } = useAPI();
const enablePeriodSetting = ref(false);
const startDate = ref("");
const endDate = ref("");

watch(
  () => props.timeData,
  (newValue) => {
    console.log("UploadForm: timeData changed", newValue);
    // TimeDataの新しい構造に対応
    if (newValue && newValue.events) {
      displayData.value = { ...newValue.events };
      console.log("UploadForm: using events from TimeData", displayData.value);
    } else if (newValue && typeof newValue === "object") {
      displayData.value = { ...newValue };
      console.log("UploadForm: using direct timeData", displayData.value);
    } else {
      displayData.value = {};
      console.log("UploadForm: no valid data, using empty object");
    }
  },
  { immediate: true }
);

const handleEscKey = (event) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

const formatDate = (dateString) => {
  // 日付文字列が無効な場合の処理
  if (!dateString || typeof dateString !== "string") {
    return {
      date: "無効な日付",
      weekday: "?",
      isSunday: false,
      isMonday: false,
      isTuesday: false,
      isWednesday: false,
      isThursday: false,
      isFriday: false,
      isSaturday: false,
    };
  }

  const date = new Date(dateString);

  // 無効な日付の場合の処理
  if (isNaN(date.getTime())) {
    return {
      date: "無効な日付",
      weekday: "?",
      isSunday: false,
      isMonday: false,
      isTuesday: false,
      isWednesday: false,
      isThursday: false,
      isFriday: false,
      isSaturday: false,
    };
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return {
    date: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    weekday: weekdays[date.getDay()],
    isSunday: date.getDay() === 0,
    isMonday: date.getDay() === 1,
    isTuesday: date.getDay() === 2,
    isWednesday: date.getDay() === 3,
    isThursday: date.getDay() === 4,
    isFriday: date.getDay() === 5,
    isSaturday: date.getDay() === 6,
  };
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

    const spaceId = props.isSync ? props.spaceId : generateRandomString();

    const processedData = Object.entries(displayData.value).reduce(
      (acc, [date, slots]) => {
        const processedSlots = Array.isArray(slots) ? slots : [slots];
        acc[date] = processedSlots.map((slot) => {
          if (slot.username && slot.userColor) {
            return slot;
          }
          return {
            ...slot,
            username: username.value,
            userColor: userColor.value,
          };
        });
        return acc;
      },
      {}
    );

    // リクエストデータの構造を変更
    const requestData = {
      ...processedData, // 直接日付をキーとしたオブジェクト
      spaceId: spaceId,
    };

    if (enablePeriodSetting.value && startDate.value && endDate.value) {
      requestData.startDate = startDate.value;
      requestData.endDate = endDate.value;
    }

    console.log("UploadForm: sending request data", requestData);

    const response = await createNewSpace(requestData);

    // レスポンスの構造に応じてdisplayDataを更新
    if (response.savedEvents) {
      displayData.value = response.savedEvents;
    }

    if (props.isSync) {
      window.location.reload();
    } else {
      await navigateTo(`/space/${spaceId}`);
    }

    alert("同期が完了しました");
    showSyncInput.value = false;
    username.value = "";
    userColor.value = "#3b82f6";
    enablePeriodSetting.value = false;
    startDate.value = "";
    endDate.value = "";
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
