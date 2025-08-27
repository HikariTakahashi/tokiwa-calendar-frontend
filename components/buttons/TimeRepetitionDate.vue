<template>
  <div>
    <!-- 繰り返しパターンの選択 -->
    <div class="mb-3 p-2 bg-gray-50 rounded">
      <label class="text-sm font-medium text-gray-700 mb-2 block"
        >繰り返しパターン:</label
      >
      <div class="flex gap-2">
        <label class="flex items-center">
          <input
            type="radio"
            v-model="repetitionPattern"
            value="daily"
            @change="generateRepetitionDates"
            class="mr-1"
          />
          <span class="text-sm">毎日</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            v-model="repetitionPattern"
            value="weekly"
            @change="initializePatternSettings"
            class="mr-1"
          />
          <span class="text-sm">毎週</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            v-model="repetitionPattern"
            value="monthly"
            @change="generateRepetitionDates"
            class="mr-1"
          />
          <span class="text-sm">毎月</span>
        </label>
      </div>
    </div>

    <!-- 開始日・終了日の設定 -->
    <div class="mb-3 p-2 bg-gray-50 rounded">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm font-medium text-gray-700 block">開始日:</label>
          <input
            type="date"
            v-model="repetitionStartDate"
            :min="startDate"
            :max="endDate"
            @change="generateRepetitionDates"
            class="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
            :disabled="!!startDate"
          />
          <div v-if="startDate" class="text-xs text-gray-500 mt-1">
            制限: {{ formatDisplayDate(startDate) }}以降
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block">終了日:</label>
          <input
            type="date"
            v-model="repetitionEndDate"
            :min="repetitionStartDate"
            :max="endDate"
            @change="generateRepetitionDates"
            class="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
            :disabled="!!endDate"
          />
          <div v-if="endDate" class="text-xs text-gray-500 mt-1">
            制限: {{ formatDisplayDate(endDate) }}まで
          </div>
        </div>
      </div>
    </div>

    <!-- 毎週の場合の曜日選択 -->
    <div
      v-if="repetitionPattern === 'weekly'"
      class="mb-3 p-2 bg-gray-50 rounded"
    >
      <label class="text-sm font-medium text-gray-700 mb-2 block"
        >曜日選択:</label
      >
      <div class="flex flex-wrap gap-2">
        <label
          v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
          :key="day"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :value="day"
            v-model="selectedWeekdays"
            @change="generateRepetitionDates"
            class="mr-1"
          />
          <span class="text-sm">{{ day }}</span>
        </label>
      </div>
    </div>

    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold">対象日付:</h3>
      <button
        @click="toggleAllDates"
        class="text-blue-500 hover:text-blue-700 text-sm"
      >
        {{
          selectedRepetitionDates.length === repetitionDates.length
            ? "全解除"
            : "全選択"
        }}
      </button>
    </div>

    <div class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
      <div
        v-for="date in repetitionDates"
        :key="date"
        class="p-2 border border-gray-300 rounded text-sm flex items-center"
      >
        <input
          type="checkbox"
          :id="'date-' + date"
          :value="date"
          v-model="selectedRepetitionDates"
          class="mr-2"
        />
        <label :for="'date-' + date" class="text-sm cursor-pointer">
          {{ formatDisplayDate(date) }}
        </label>
      </div>
    </div>
    <div class="mt-2 text-sm text-gray-600">
      選択された日付: {{ selectedRepetitionDates.length }}日
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  selectedDate: {
    type: String,
    required: true,
  },
  startDate: {
    type: [String, null],
    default: null,
  },
  endDate: {
    type: [String, null],
    default: null,
  },
});

const emit = defineEmits([
  "update:repetitionDates",
  "update:selectedRepetitionDates",
  "update:repetitionPattern",
  "update:repetitionStartDate",
  "update:repetitionEndDate",
  "update:selectedWeekdays",
]);

const repetitionPattern = ref("daily");
const repetitionStartDate = ref("");
const repetitionEndDate = ref("");
const repetitionDates = ref([]);
const selectedRepetitionDates = ref([]);
const selectedWeekdays = ref([]);

// 表示用の日付フォーマット関数
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
};

// 日付をフォーマットする関数
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// 全選択/全解除の切り替え
const toggleAllDates = () => {
  if (selectedRepetitionDates.value.length === repetitionDates.value.length) {
    // すべて選択されている場合は全解除
    selectedRepetitionDates.value = [];
  } else {
    // すべて選択されていない場合は全選択
    selectedRepetitionDates.value = [...repetitionDates.value];
  }
  emit("update:selectedRepetitionDates", selectedRepetitionDates.value);
};

// パターン変更時の初期化
const initializePatternSettings = () => {
  if (repetitionPattern.value === "weekly") {
    // 毎週の場合、現在の曜日を初期選択
    const currentDate = new Date(repetitionStartDate.value);
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    const currentDay = dayNames[currentDate.getDay()];
    if (!selectedWeekdays.value.includes(currentDay)) {
      selectedWeekdays.value = [currentDay];
      emit("update:selectedWeekdays", selectedWeekdays.value);
    }
  }
  generateRepetitionDates();
};

// 繰り返し日付を生成する関数
const generateRepetitionDates = () => {
  if (!repetitionStartDate.value || !repetitionEndDate.value) {
    return;
  }

  const startDate = new Date(repetitionStartDate.value);
  const endDate = new Date(repetitionEndDate.value);

  // バックエンドの制限をチェック
  const backendStartDate = props.startDate ? new Date(props.startDate) : null;
  const backendEndDate = props.endDate ? new Date(props.endDate) : null;

  // 開始日がバックエンドの制限を超えている場合
  if (backendStartDate && startDate < backendStartDate) {
    repetitionStartDate.value = formatDate(backendStartDate);
    emit("update:repetitionStartDate", repetitionStartDate.value);
    return;
  }

  // 終了日がバックエンドの制限を超えている場合
  if (backendEndDate && endDate > backendEndDate) {
    repetitionEndDate.value = formatDate(backendEndDate);
    emit("update:repetitionEndDate", repetitionEndDate.value);
    return;
  }

  const dates = [];

  if (repetitionPattern.value === "daily") {
    // 毎日: 開始日から終了日までのすべての日付
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (repetitionPattern.value === "weekly") {
    // 毎週: 選択された曜日の日付のみ
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
      if (selectedWeekdays.value.includes(dayNames[dayOfWeek])) {
        dates.push(formatDate(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (repetitionPattern.value === "monthly") {
    // 毎月: 開始日の日付と同じ日付を毎月
    const currentDate = new Date(startDate);
    const targetDay = currentDate.getDate();

    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      // 次の月の同じ日付に移動
      currentDate.setMonth(currentDate.getMonth() + 1);
      // 月の日数が少ない場合の調整
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      if (targetDay > lastDayOfMonth) {
        currentDate.setDate(lastDayOfMonth);
      } else {
        currentDate.setDate(targetDay);
      }
    }
  }

  repetitionDates.value = dates;
  emit("update:repetitionDates", dates);
};

// 初期化
const initialize = () => {
  // 現在の日付を開始日として設定
  repetitionStartDate.value = props.selectedDate;

  // 終了日の設定
  let endDate;
  if (props.endDate) {
    // バックエンドからendDateが指定されている場合はそれを使用
    endDate = new Date(props.endDate);
  } else {
    // 指定されていない場合は1週間後に設定
    endDate = new Date(props.selectedDate);
    endDate.setDate(endDate.getDate() + 7);
  }
  repetitionEndDate.value = formatDate(endDate);

  // 繰り返し日付を生成
  generateRepetitionDates();
  // 初期状態ではすべての日付を選択
  selectedRepetitionDates.value = [...repetitionDates.value];
  // パターン設定を初期化
  initializePatternSettings();

  // 初期値を親コンポーネントに送信
  emit("update:repetitionStartDate", repetitionStartDate.value);
  emit("update:repetitionEndDate", repetitionEndDate.value);
  emit("update:selectedRepetitionDates", selectedRepetitionDates.value);
};

// 監視
watch(repetitionPattern, (newValue) => {
  emit("update:repetitionPattern", newValue);
});

watch(repetitionStartDate, (newValue) => {
  emit("update:repetitionStartDate", newValue);
});

watch(repetitionEndDate, (newValue) => {
  emit("update:repetitionEndDate", newValue);
});

watch(selectedWeekdays, (newValue) => {
  emit("update:selectedWeekdays", newValue);
});

// 初期化を実行
initialize();
</script>
