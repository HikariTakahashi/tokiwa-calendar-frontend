<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-show="show"
      class="fixed bottom-0 left-0 right-0 z-[99999] bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
    >
      <!-- ヘッダー -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-bold">
          {{ isCurrentYear ? "" : dateComponents.year + " 年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + " 月" }}
          {{ dateComponents.day }} 日
        </h2>
        <button
          @click="closeForm"
          class="p-2 text-gray-500 hover:text-gray-700"
        >
          <UIcon name="ic:sharp-close" class="w-6 h-6" />
        </button>
      </div>

      <!-- コンテンツ -->
      <div class="flex-1 overflow-y-auto p-4">
        <h6 class="text-sm font-bold text-red-500 mb-4">
          {{ errorMessage }}
        </h6>

        <!-- 時間入力部分 -->
        <div class="mb-6">
          <div class="mb-3">
            <label class="flex items-center text-sm text-gray-500 mb-2">
              <input
                v-model="isAllDay"
                type="checkbox"
                class="mr-2"
                @change="handleAllDayChange"
              />
              終日
            </label>
          </div>

          <div v-if="!isAllDay" class="max-h-[30vh] overflow-y-auto pr-2">
            <div v-for="(timeSlot, index) in timeSlots" :key="index">
              <div
                class="flex flex-col gap-2 mb-4 p-3 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700"
                    >時間スロット {{ index + 1 }}</span
                  >
                  <button
                    v-if="timeSlots.length > 1"
                    @click="removeTimeSlot(index)"
                    class="p-1 text-red-500 hover:text-red-700"
                  >
                    <UIcon name="ic:sharp-delete" class="w-4 h-4" />
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm text-gray-600 min-w-[60px]"
                    >開始時刻</label
                  >
                  <InputTime
                    :minute-interval="15"
                    :initial-hours="parseTimeSlot(timeSlot.start).hours"
                    :initial-minutes="parseTimeSlot(timeSlot.start).minutes"
                    @update:time="
                      (newStartTime) =>
                        handleStartTimeChange(newStartTime, index)
                    "
                    class="flex-1"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm text-gray-600 min-w-[60px]"
                    >終了時刻</label
                  >
                  <InputTime
                    :minute-interval="15"
                    :initial-hours="parseTimeSlot(timeSlot.end).hours"
                    :initial-minutes="parseTimeSlot(timeSlot.end).minutes"
                    @update:time="
                      (newEndTime) => handleEndTimeChange(newEndTime, index)
                    "
                    class="flex-1"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="addTimeSlot"
              class="w-full py-2 px-4 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50"
            >
              複数時間を入力
            </button>
          </div>
        </div>

        <!-- タスク名 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-500 mb-1">タスク名</label>
          <input
            v-model="taskName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': !taskName.trim() }"
            placeholder="タスク名を入力してください"
            maxlength="40"
          />
          <div class="text-gray-500 text-xs text-right mt-1">
            {{ taskName.length }}/40
          </div>
        </div>

        <!-- 説明 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-500 mb-1">説明</label>
          <textarea
            v-model="taskDescription"
            rows="3"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="タスクの詳細を入力してください"
            maxlength="500"
          ></textarea>
          <div class="text-gray-500 text-xs text-right mt-1">
            {{ taskDescription.length }}/500
          </div>
        </div>

        <!-- 優先度 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-500 mb-1">優先度</label>
          <select
            v-model="taskPriority"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>

        <!-- ステータス -->
        <div class="mb-6">
          <label class="block text-sm text-gray-500 mb-1">ステータス</label>
          <select
            v-model="taskStatus"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">未完了</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
          </select>
        </div>
      </div>

      <!-- フッター -->
      <div class="p-4 border-t bg-gray-50">
        <div class="flex gap-3">
          <button
            v-if="hasExistingTask"
            @click="deleteTask"
            class="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            削除
          </button>
          <button
            @click="save"
            class="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {{ hasExistingTask ? "更新" : "保存" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import InputTime from "@/components/buttons/InputTime.vue";
import { useTimeUtils } from "@/utils/TimeUtils";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  selectedDate: String,
  year: Number,
  month: Number,
  day: Number,
  existingTime: {
    type: Object,
    default: () => ({}),
  },
  timeData: {
    type: Object,
    default: () => ({ events: {} }),
  },
  isCopyMode: {
    type: Boolean,
    default: false,
  },
  allowOtherEdit: {
    type: Boolean,
    default: false,
  },
  initialHour: {
    type: Number,
    default: null,
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

const emit = defineEmits(["save", "delete", "copy", "preview", "close"]);

const { validateTime, validateTimeOrder, validateTimeOverlap } = useTimeUtils();

const isInitialized = ref(false);
const hasNewData = ref(false);
const errorMessage = ref("");

// タスク管理用の状態
const taskName = ref("");
const taskDescription = ref("");
const taskPriority = ref("medium");
const taskStatus = ref("pending");

// 時間関連の状態
const isAllDay = ref(true);
const timeSlots = ref([
  {
    start: "09:00",
    end: "10:00",
  },
]);

const dateComponents = computed(() => {
  const parts = props.selectedDate.split("-");
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
});

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const isCurrentYear = computed(() => {
  return dateComponents.value.year === currentYear;
});

const isCurrentMonth = computed(() => {
  return (
    dateComponents.value.year === currentYear &&
    dateComponents.value.month === currentMonth
  );
});

const hasExistingTask = computed(() => {
  return props.existingTime && Object.keys(props.existingTime).length > 0;
});

// 新しいコンポーネントからのイベントハンドラー
const updateTimeSlots = (newTimeSlots) => {
  timeSlots.value = newTimeSlots;
};

// 時間関連のハンドラー
const handleAllDayChange = () => {
  if (isAllDay.value) {
    // 終日の場合は時間をリセット
    timeSlots.value = [
      {
        start: "00:00",
        end: "24:00",
      },
    ];
  } else {
    // 終日でない場合はデフォルト時間を設定
    timeSlots.value = [
      {
        start: "09:00",
        end: "10:00",
      },
    ];
  }
};

// 時間関連のユーティリティ関数
const parseTimeSlot = (timeString) => {
  if (!timeString) return { hours: 0, minutes: 0 };
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
};

const addTimeSlot = () => {
  const newTimeSlots = [...timeSlots.value];
  newTimeSlots.push({
    start: "09:00",
    end: "10:00",
  });
  timeSlots.value = newTimeSlots;
};

const removeTimeSlot = (index) => {
  if (timeSlots.value.length > 1) {
    const newTimeSlots = [...timeSlots.value];
    newTimeSlots.splice(index, 1);
    timeSlots.value = newTimeSlots;
  }
};

const handleStartTimeChange = (newStartTime, index) => {
  // 開始時刻が変更された時に、終了時刻に+1時間を設定
  if (newStartTime && newStartTime !== "00:00") {
    const startTime = new Date(`2000-01-01T${newStartTime}`);
    const currentEndTime = timeSlots.value[index].end;

    // 現在の終了時刻が有効な場合、開始時刻との差を計算
    if (
      currentEndTime &&
      currentEndTime !== "00:00" &&
      currentEndTime !== "24:00"
    ) {
      const currentEnd = new Date(`2000-01-01T${currentEndTime}`);
      const timeDifference = currentEnd.getTime() - startTime.getTime();

      // 時間差が1時間未満の場合は+1時間に設定
      if (timeDifference < 60 * 60 * 1000) {
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1時間

        // 24時間を超える場合は24:00に設定
        if (endTime.getHours() === 0) {
          timeSlots.value[index].end = "24:00";
        } else {
          const endHours = endTime.getHours().toString().padStart(2, "0");
          const endMinutes = endTime.getMinutes().toString().padStart(2, "0");
          timeSlots.value[index].end = `${endHours}:${endMinutes}`;
        }
      }
      // 時間差が1時間以上の場合は現在の終了時刻を維持
    } else {
      // 現在の終了時刻が無効な場合は+1時間を設定
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1時間

      // 24時間を超える場合は24:00に設定
      if (endTime.getHours() === 0) {
        timeSlots.value[index].end = "24:00";
      } else {
        const endHours = endTime.getHours().toString().padStart(2, "0");
        const endMinutes = endTime.getMinutes().toString().padStart(2, "0");
        timeSlots.value[index].end = `${endHours}:${endMinutes}`;
      }
    }
  }

  timeSlots.value[index].start = newStartTime;
};

const handleEndTimeChange = (newEndTime, index) => {
  timeSlots.value[index].end = newEndTime;
};

const initializeTaskData = () => {
  // 既存データがある場合
  if (props.existingTime && Object.keys(props.existingTime).length > 0) {
    // 既存データがある場合は、そのデータを編集用に設定
    if (props.existingTime.taskName) {
      taskName.value = props.existingTime.taskName;
      taskDescription.value = props.existingTime.taskDescription || "";
      taskPriority.value = props.existingTime.taskPriority || "medium";
      taskStatus.value = props.existingTime.taskStatus || "pending";

      // 時間情報を設定
      const taskStart = props.existingTime.start || "00:00";
      const taskEnd = props.existingTime.end || "24:00";

      if (taskStart === "00:00" && taskEnd === "24:00") {
        isAllDay.value = true;
        timeSlots.value = [
          {
            start: "00:00",
            end: "24:00",
          },
        ];
      } else {
        isAllDay.value = false;
        timeSlots.value = [
          {
            start: taskStart,
            end: taskEnd,
          },
        ];
      }
    }
  } else if (
    Array.isArray(props.existingTime) &&
    props.existingTime.length > 0
  ) {
    // 配列の場合、最初のタスクを編集用に設定
    const firstTask = props.existingTime[0];
    taskName.value = firstTask.taskName || "";
    taskDescription.value = firstTask.taskDescription || "";
    taskPriority.value = firstTask.taskPriority || "medium";
    taskStatus.value = firstTask.taskStatus || "pending";

    // 時間情報を設定
    const taskStart = firstTask.start || "00:00";
    const taskEnd = firstTask.end || "24:00";

    if (taskStart === "00:00" && taskEnd === "24:00") {
      isAllDay.value = true;
      timeSlots.value = [
        {
          start: "00:00",
          end: "24:00",
        },
      ];
    } else {
      isAllDay.value = false;
      timeSlots.value = [
        {
          start: taskStart,
          end: taskEnd,
        },
      ];
    }
  } else {
    // 新規の場合、空のタスクデータを設定
    taskName.value = "";
    taskDescription.value = "";
    taskPriority.value = "medium";
    taskStatus.value = "pending";

    // initialHourが設定されている場合は、その時間から1時間後の範囲を設定
    if (props.initialHour !== undefined && props.initialHour !== null) {
      isAllDay.value = false;
      const startHour = props.initialHour.toString().padStart(2, "0");
      const endHour = (props.initialHour + 1).toString().padStart(2, "0");
      timeSlots.value = [
        {
          start: `${startHour}:00`,
          end: `${endHour}:00`,
        },
      ];
    } else {
      // デフォルトで終日
      isAllDay.value = true;
      timeSlots.value = [
        {
          start: "00:00",
          end: "24:00",
        },
      ];
    }
  }

  // 新規データがあるかどうかを判定
  hasNewData.value = true;

  // 初期化完了をマーク
  isInitialized.value = true;
};

// 初期化時に実行
initializeTaskData();

// selectedDateが変更された時に実行
watch(
  () => props.selectedDate,
  (newDate, oldDate) => {
    // 日付が変更された場合のみ更新
    if (newDate !== oldDate) {
      initializeTaskData();
    }
  }
);

// existingTimeが変更された時に実行
watch(
  () => props.existingTime,
  () => {
    initializeTaskData();
  },
  { deep: true }
);

// initialHourが変更された時に実行
watch(
  () => props.initialHour,
  () => {
    initializeTaskData();
  }
);

const save = () => {
  // バリデーション
  if (!taskName.value.trim()) {
    errorMessage.value = "タスク名を入力してください";
    return;
  }

  // 終日でない場合の時間バリデーション
  if (!isAllDay.value) {
    // 空のスロット（startが00:00かつendが00:00）を除外
    const validTimeSlots = timeSlots.value.filter(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    // 空のスロットが含まれているかチェック
    const emptySlots = timeSlots.value.filter(
      (slot) => slot.start === "00:00" && slot.end === "00:00"
    );

    if (emptySlots.length > 0) {
      errorMessage.value = "空の時間スロットがあります。";
      return;
    }

    // 有効なスロットがない場合は保存しない
    if (validTimeSlots.length === 0) {
      errorMessage.value = "有効な時間スロットを入力してください";
      return;
    }

    // 有効なスロットのみでバリデーションを実行
    if (!validateTime(validTimeSlots)) {
      errorMessage.value = "開始時刻と終了時刻を入力してください";
      return;
    }

    const orderValidation = validateTimeOrder(validTimeSlots);
    if (!orderValidation.isValid) {
      errorMessage.value = orderValidation.errorMessage;
      return;
    }

    const overlapValidation = validateTimeOverlap(validTimeSlots);
    if (!overlapValidation.isValid) {
      errorMessage.value = overlapValidation.errorMessage;
      return;
    }
  }

  errorMessage.value = "";

  // タスク情報を時間スロットに追加
  const taskTimeSlots = timeSlots.value.map((slot) => ({
    ...slot,
    taskName: taskName.value.trim(),
    taskDescription: taskDescription.value.trim(),
    taskPriority: taskPriority.value,
    taskStatus: taskStatus.value,
  }));

  // プレビューデータをクリアするためのイベントを発火
  emit("preview", {
    date: props.selectedDate,
    timeSlots: [],
  });

  emit("save", {
    date: props.selectedDate,
    timeSlots: taskTimeSlots,
  });

  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
  emit("close");
};

const deleteTask = () => {
  emit("delete", {
    date: props.selectedDate,
    keepUserData: false,
  });

  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
  emit("close");
};

const closeForm = () => {
  emit("close");
};

const updatePreview = () => {
  // 新規データまたは既存データがない場合はプレビューを送信しない
  if (!hasNewData.value) {
    return;
  }

  // 空のスロット（startが00:00かつendが00:00）を除外
  const validTimeSlots = timeSlots.value.filter(
    (slot) => !(slot.start === "00:00" && slot.end === "00:00")
  );

  if (validTimeSlots.length > 0) {
    // 新規データのみをプレビューとして送信
    const previewSlots = validTimeSlots
      .map((slot, index) => {
        // 既存データかどうかを判定
        const isExistingData =
          slot.username ||
          (props.existingTime &&
            props.existingTime.start &&
            slot.start === props.existingTime.start &&
            slot.end === props.existingTime.end) ||
          (Array.isArray(props.existingTime) &&
            props.existingTime.some(
              (existing) =>
                existing.start === slot.start && existing.end === slot.end
            ));

        // 新規データの場合のみプレビュー用のorderを設定
        if (!isExistingData) {
          return {
            ...slot,
            order: (slot.order || index + 1) + 1000,
          };
        }
        return null;
      })
      .filter((slot) => slot !== null); // nullを除外

    // 既存データも含めて送信（新規データのみプレビュー表示）
    const allSlots = validTimeSlots.map((slot, index) => {
      const isExistingData =
        slot.username ||
        (props.existingTime &&
          props.existingTime.start &&
          slot.start === props.existingTime.start &&
          slot.end === props.existingTime.end) ||
        (Array.isArray(props.existingTime) &&
          props.existingTime.some(
            (existing) =>
              existing.start === slot.start && existing.end === slot.end
          ));

      return {
        ...slot,
        // 既存データは通常のorder、新規データはプレビュー用のorder
        order: isExistingData
          ? slot.order || index + 1
          : (slot.order || index + 1) + 1000,
      };
    });

    emit("preview", {
      date: props.selectedDate,
      timeSlots: allSlots,
    });
  } else {
    emit("preview", {
      date: props.selectedDate,
      timeSlots: [],
    });
  }
};
</script>
