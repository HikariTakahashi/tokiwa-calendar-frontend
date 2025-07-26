<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
  >
    <div
      class="bg-white px-6 rounded-lg w-full sm:w-4/5 max-h-full sm:max-h-[80vh] overflow-y-auto"
    >

      <div
        class="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pt-6"
      >
        <div class="flex flex-col sm:flex-row items-center gap-8">
          <h2 class="text-xl font-bold border-b-2 border-gray-200">
            時間データ一覧
          </h2>
          <div v-if="isSync">
            <Switch
              v-model="showOverlappingTime"
              label="重なる時間のみ表示する"
            />
          </div>
        </div>
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
            .filter(([date, slots]) => {
              // 重複時刻表示モードの場合、重複する時刻が存在する日付のみを表示
              if (showOverlappingTime) {
                return getOverlapData(date).length > 0;
              }
              // 通常モードの場合、全ての日付データを表示
              return true;
            })
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
            <!-- 重複時刻表示モード -->
            <template v-if="showOverlappingTime">
              <div
                v-for="(overlapSlot, index) in getOverlapData(date)"
                :key="index"
                class="mb-2"
              >
                <div class="flex flex-wrap gap-1 mb-1">
                  <span
                    v-for="(username, userIndex) in overlapSlot.usernames"
                    :key="userIndex"
                    class="font-bold px-1.5 rounded-md text-white text-sm"
                    :style="{
                      backgroundColor:
                        overlapSlot.userColors[userIndex] || '#3b82f6',
                    }"
                  >
                    {{ username }}
                  </span>
                </div>
                <div class="text-blue-600 font-semibold">
                  {{ formatOverlapTimeForDisplay(overlapSlot) }}
                </div>
              </div>
            </template>
            <!-- 通常表示モード -->
            <template v-else>
              <template v-if="Array.isArray(timeSlots) && timeSlots.length > 0">
                <div v-for="(slot, index) in timeSlots" :key="index">
                  <template v-if="slot && slot.username">
                    <span
                      class="font-bold px-1.5 rounded-md text-white"
                      :style="{ backgroundColor: slot.userColor || '#3b82f6' }"
                    >
                      {{ slot.username }}
                    </span>
                    {{ slot ? formatTimeForDisplay([slot]) : "無効なデータ" }}
                  </template>
                  <template v-else-if="slot && !slot.username">
                    <span class="text-blue-500 font-semibold"> あなた </span>
                    {{ slot ? formatTimeForDisplay([slot]) : "無効なデータ" }}
                  </template>
                </div>
              </template>
              <template v-else-if="timeSlots && typeof timeSlots === 'object'">
                <template v-if="timeSlots.username">
                  <span :style="{ color: timeSlots.userColor || '#3b82f6' }">
                    {{ timeSlots.username }}:
                  </span>
                  {{ formatTimeForDisplay([timeSlots]) }}
                </template>
                <template v-else-if="!timeSlots.username">
                  <span class="text-blue-500 font-semibold"> あなた </span>
                  {{ formatTimeForDisplay([timeSlots]) }}
                </template>
              </template>
              <template v-else>
                <span class="text-red-500">無効なデータ</span>
              </template>
            </template>
          </div>
        </div>
      </div>

      <div class="flex flex-col sticky bottom-0 bg-white pb-4 mt-6 gap-y-2">
        <div class="flex justify-end gap-x-2">
          <buttons-square
            @click="handleCopy"
            color="bg-gray-300"
            :isUse="hasOwnInputData()"
          >
            コピー
          </buttons-square>
          <buttons-square
            v-if="!isSync"
            @click="syncData"
            color="bg-blue-300"
            :isUse="hasOwnInputData()"
          >
            共有
          </buttons-square>
          <buttons-square
            v-else
            @click="syncData"
            color="bg-blue-300"
            :isUse="hasOwnInputData() && !showSyncInput"
          >
            再同期
          </buttons-square>
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
            <div class="flex flex-col gap-y-2 sm:w-1/2">
              <p class="font-bold border-b-2 border-gray-600 sm:w-1/4">
                詳細設定
              </p>
              <div v-if="!isSync" class="flex flex-col gap-y-2">
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
                <Switch
                  v-model="allowOtherUserEdit"
                  label="他ユーザーのデータ変更を許可する"
                />
                <div
                  v-if="allowOtherUserEdit"
                  class="flex flex-col gap-y-2 mx-1 bg-gray-200 rounded-md p-1 px-2"
                >
                  <p>
                    本設定を許可した場合、他ユーザーの日付データに対する変更が許可されます
                  </p>
                </div>
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
                  :class="{ 'border-red-500': usernameErrors.length > 0 }"
                  :style="{ color: userColor }"
                  @input="handleUsernameInput"
                  maxlength="40"
                />
                <!-- 警告欄 -->
                <div class="flex flex-row gap-x-2 items-center justify-between">
                  <div
                    v-if="usernameErrors.length > 0"
                    class="text-red-500 text-sm mt-1"
                  >
                    <div
                      v-for="error in usernameErrors"
                      :key="error"
                      class="flex items-center gap-1"
                    >
                      <UIcon name="ic:sharp-error" class="size-4" />
                      <span>{{ error }}</span>
                    </div>
                  </div>
                  <div class="text-gray-500 text-xs text-right">
                    {{ username.length }}/40
                  </div>
                </div>
                <!-- 文字数表示 -->
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
                      color="bg-green-300"
                      :isUse="
                        username.length > 0 &&
                        !isConfirming &&
                        usernameErrors.length === 0
                      "
                    >
                      <div
                        v-if="isConfirming"
                        class="flex items-center justify-center"
                      >
                        <UIcon name="line-md:loading-loop" class="size-6" />
                      </div>
                      <span v-else>確定</span>
                    </buttons-square>
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
import { useOverlapTimeUtils } from "@/utils/OverlapTimeUtils";
import {
  validateUsername,
  applyUsernameRestrictions,
} from "@/utils/ArrayString";
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
const { generateOverlapDisplayData, formatOverlapTimeForDisplay } =
  useOverlapTimeUtils();
const { createNewSpace } = useAPI();
const enablePeriodSetting = ref(false);
const allowOtherUserEdit = ref(false);
const startDate = ref("");
const endDate = ref("");
const isConfirming = ref(false);
const usernameErrors = ref([]);
// showOverlapsは削除し、showOverlappingTimeを使用
const showOverlappingTime = ref(false);

watch(
  () => props.timeData,
  (newValue) => {
    // TimeDataの新しい構造に対応
    if (newValue && newValue.events) {
      displayData.value = { ...newValue.events };
    } else if (newValue && typeof newValue === "object") {
      displayData.value = { ...newValue };
    } else {
      displayData.value = {};
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
  if (showOverlappingTime.value) {
    copyToClipboard(displayData.value, true);
  } else {
    copyToClipboard(displayData.value, false);
  }
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

    // リクエストデータの構造を変更（spaceIdはバックエンドで自動生成されるため削除）
    const requestData = {
      ...processedData, // 直接日付をキーとしたオブジェクト
      allowOtherEdit: allowOtherUserEdit.value,
    };

    // isSync時は既存のスペースデータから期間設定を取得
    if (props.isSync && props.timeData) {
      if (props.timeData.startDate) {
        requestData.startDate = props.timeData.startDate;
      }
      if (props.timeData.endDate) {
        requestData.endDate = props.timeData.endDate;
      }
    } else if (enablePeriodSetting.value && startDate.value && endDate.value) {
      // 新規作成時は新しく設定された期間を使用
      requestData.startDate = startDate.value;
      requestData.endDate = endDate.value;
    }

    console.log("UploadForm: sending request data", requestData);

    isConfirming.value = true;
    const response = await createNewSpace(
      requestData,
      allowOtherUserEdit.value
    );

    // 新しいレスポンス形式に対応：eventsプロパティを使用
    if (response.events) {
      displayData.value = response.events;
    }

    // バックエンドから返されたspaceIdを使用
    const spaceId = response.spaceId;

    if (props.isSync) {
      window.location.reload();
    } else {
      // バックエンドから取得したspaceIdでページ遷移
      await navigateTo(`/space/${spaceId}`);
    }

    alert("同期が完了しました");
    showSyncInput.value = false;
    username.value = "";
    userColor.value = "#3b82f6";
    enablePeriodSetting.value = false;
    startDate.value = "";
    endDate.value = "";
    isConfirming.value = false;
  } catch (error) {
    console.error("同期エラー:", error);
    alert("同期に失敗しました");
    isConfirming.value = false;
  }
};

const handleUsernameInput = () => {
  // 入力制限を適用
  const restrictedUsername = applyUsernameRestrictions(username.value);
  if (restrictedUsername !== username.value) {
    username.value = restrictedUsername;
  }

  // バリデーションを実行
  const validation = validateUsername(username.value);
  usernameErrors.value = validation.errors;
};

const getOverlapData = (date) => {
  if (!displayData.value[date] || !Array.isArray(displayData.value[date])) {
    return [];
  }

  const overlapData = generateOverlapDisplayData({
    [date]: displayData.value[date],
  });
  return overlapData[date]?.overlaps || [];
};

// 自身の入力データの有無を判定する関数
const hasOwnInputData = () => {
  for (const [date, timeSlots] of Object.entries(displayData.value)) {
    if (Array.isArray(timeSlots) && timeSlots.length > 0) {
      // ユーザーネームが存在しないスロットがあるかチェック
      const hasOwnInput = timeSlots.some((slot) => slot && !slot.username);
      if (hasOwnInput) {
        return true;
      }
    }
  }
  return false;
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
