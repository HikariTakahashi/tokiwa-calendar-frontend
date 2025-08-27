<template>
  <div
    ref="modalRef"
    class="absolute top-1/2 left-1/2 w-1/3 transform -translate-x-1/2 -translate-y-1/2 border bg-white rounded shadow-lg"
    :style="modalStyle"
    style="z-index: 9999"
  >
    <div
      class="flex items-center py-1 px-2 border-b-2 hover:bg-gray-100 cursor-move"
      @mousedown="startDrag"
    >
      <div class="flex flex-row justify-between w-full">
        <div class="flex flex-row mr-auto ml-2 gap-x-2"></div>
        <buttons-hover
          @click="props.close"
          :size="5"
          name="ic:sharp-clear"
          color="bg-red-500"
          :ishover="false"
        />
      </div>
    </div>

    <div
      class="px-5 pt-1 pb-5 rounded-lg shadow-lg relative w-full max-h-[80vh] overflow-y-auto"
    >
      <h6 class="text-sm font-bold text-red-500">
        {{ errorMessage }}
      </h6>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">
          {{ isCurrentYear ? "" : dateComponents.year + " 年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + " 月" }}
          {{ dateComponents.day }} 日
        </h2>
      </div>

      <!-- 時間入力部分をコメントアウト（タスク管理モードでは不要） -->

      <!-- 時間入力 -->
      <div class="mt-4">
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
            <div class="flex pr-3 justify-center items-center gap-x-2 mb-2">
              <label>開始時刻</label>
              <div class="border-r border-gray-400 pr-2">
                <InputTime
                  :minute-interval="15"
                  :initial-hours="parseTimeSlot(timeSlot.start).hours"
                  :initial-minutes="parseTimeSlot(timeSlot.start).minutes"
                  @update:time="
                    (newStartTime) => handleStartTimeChange(newStartTime, index)
                  "
                />
              </div>
              <InputTime
                :minute-interval="15"
                :initial-hours="parseTimeSlot(timeSlot.end).hours"
                :initial-minutes="parseTimeSlot(timeSlot.end).minutes"
                @update:time="
                  (newEndTime) => handleEndTimeChange(newEndTime, index)
                "
              />
              <label>終了時刻</label>
              <buttons-hover
                v-if="timeSlots.length > 1"
                @click="removeTimeSlot(index)"
                :size="5"
                name="ic:sharp-delete"
                color="bg-red-500"
                :ishover="false"
              />
            </div>
          </div>
          <div class="flex items-center gap-x-5">
            <button
              type="button"
              @click="addTimeSlot"
              class="text-blue-500 pb-2 hover:underline"
            >
              複数時間を入力
            </button>
          </div>
        </div>
      </div>

      <!-- 編集モードの場合は単一タスク編集、新規追加モードの場合は複数タスク管理 -->
      <div class="mt-4">
        <!-- タスク名 -->
        <div class="mb-3">
          <label class="block text-sm text-gray-500 mb-1">タスク名</label>
          <input
            v-model="editingTaskData.taskName"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': taskNameErrors.length > 0 }"
            placeholder="タスク名を入力してください"
            maxlength="40"
            @input="handleTaskNameInput"
          />
          <!-- 警告欄 -->
          <div class="flex flex-row gap-x-2 items-center justify-between">
            <div
              v-if="taskNameErrors.length > 0"
              class="text-red-500 text-sm mt-1"
            >
              <div
                v-for="error in taskNameErrors"
                :key="error"
                class="flex items-center gap-1"
              >
                <UIcon name="ic:sharp-error" class="size-4" />
                <span>{{ error }}</span>
              </div>
            </div>
            <div class="text-gray-500 text-xs text-right">
              {{ editingTaskData.taskName.length }}/40
            </div>
          </div>
        </div>

        <!-- 説明 -->
        <div class="mb-3">
          <label class="block text-sm text-gray-500 mb-1">説明</label>
          <textarea
            v-model="editingTaskData.description"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': descriptionErrors.length > 0 }"
            placeholder="タスクの詳細を入力してください"
            maxlength="500"
            @input="handleDescriptionInput"
          ></textarea>
          <!-- 警告欄 -->
          <div class="flex flex-row gap-x-2 items-center justify-between">
            <div
              v-if="descriptionErrors.length > 0"
              class="text-red-500 text-sm mt-1"
            >
              <div
                v-for="error in descriptionErrors"
                :key="error"
                class="flex items-center gap-1"
              >
                <UIcon name="ic:sharp-error" class="size-4" />
                <span>{{ error }}</span>
              </div>
            </div>
            <div class="text-gray-500 text-xs text-right">
              {{ editingTaskData.description.length }}/500
            </div>
          </div>
        </div>

        <!-- タスク色 -->
        <div class="mb-3">
          <label class="block text-sm text-gray-500 mb-1">タスク色</label>
          <div class="flex flex-row gap-3">
            <div class="flex flex-col gap-1">
              <ColorField v-model="taskColor" />
            </div>

            <div class="flex flex-wrap flex-row gap-1">
              <ColorButton
                v-for="color in presetColors"
                :key="color"
                :color="color"
                @update:modelValue="taskColor = color"
              />
            </div>
            <div class="flex flex-col gap-1 justify-end">
              <buttons-square
                v-if="isEditMode"
                @click="deleteTask"
                color="bg-red-200"
                class="w-18"
              >
                削除
              </buttons-square>
              <buttons-square @click="save" color="bg-blue-200" class="w-18">
                {{ isEditMode ? "更新" : "保存" }}
              </buttons-square>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import InputTime from "@/components/buttons/InputTime.vue";
import ColorField from "@/components/buttons/ColorField.vue";
import ColorButton from "@/components/buttons/ColorButton.vue";
import {
  validateUsername,
  applyUsernameRestrictions,
} from "@/utils/ArrayString";
import { useAPI } from "@/composables/useAPI";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  close: Function,
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
  editingTaskIndex: {
    type: Number,
    default: -1,
  },
  editingTask: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "save",
  "delete",
  "copy",
  "preview",
  "openTimeSideMenu",
]);

// API機能を使用
const { saveTaskData } = useAPI();

// 認証状態を取得
const { user } = useAuth();

// タスク管理モードでは時間関連の処理をコメントアウト
// const { timeSlots, validateTime, validateTimeOrder, validateTimeOverlap } =
//   useTimeUtils();

const isInitialized = ref(false);
const hasNewData = ref(false);
const isMobile = ref(false);
const errorMessage = ref("");

// 編集モード用の状態
const editingTaskData = ref({
  taskName: "",
  description: "",
});

// バリデーション状態
const taskNameErrors = ref([]);
const descriptionErrors = ref([]);

// タスク色の状態
const taskColor = ref("#3b82f6");

// プリセットカラー
const presetColors = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#dc2626",
  "#10b981",
  "#3b82f6",
  "#eae727",
  "#ec4899",
  "#6366f1",
  "#f59e0b",
  "#cd0000",
  "#7c3aed",
];

// 時間関連の状態
const isAllDay = ref(true);
const timeSlots = ref([
  {
    start: "09:00",
    end: "10:00",
  },
]);

// 編集モードかどうかを判定
const isEditMode = computed(() => {
  return props.editingTaskIndex >= 0 && props.editingTask !== null;
});

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

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// タスク名入力処理
const handleTaskNameInput = () => {
  // 入力制限を適用
  const restrictedTaskName = applyUsernameRestrictions(
    editingTaskData.value.taskName
  );
  if (restrictedTaskName !== editingTaskData.value.taskName) {
    editingTaskData.value.taskName = restrictedTaskName;
  }

  // バリデーションを実行
  const validation = validateUsername(editingTaskData.value.taskName);
  taskNameErrors.value = validation.errors;
};

// 説明入力処理
const handleDescriptionInput = () => {
  // 説明の文字数制限（500文字）
  if (editingTaskData.value.description.length > 500) {
    editingTaskData.value.description =
      editingTaskData.value.description.substring(0, 500);
  }

  // 説明のバリデーション
  const errors = [];
  if (editingTaskData.value.description.length > 500) {
    errors.push("説明は500文字以内で入力してください");
  }
  descriptionErrors.value = errors;
};

// タスク管理モードでは時間関連の処理をコメントアウト
/*
// 新しいコンポーネントからのイベントハンドラー
const updateTimeSlots = (newTimeSlots) => {
  timeSlots.value = newTimeSlots;
};

const handleStartTimeChange = (data) => {
  // プレビューを更新
  updatePreview();
};

const handleEndTimeChange = (data) => {
  // プレビューを更新
  updatePreview();
};
*/

const initializeTaskData = () => {
  // 編集モードの場合
  if (isEditMode.value && props.editingTask) {
    editingTaskData.value = {
      taskName: props.editingTask.taskName || "",
      description: props.editingTask.description || "",
    };

    // タスク色を設定
    taskColor.value = props.editingTask.userColor || "#3b82f6";

    // 時間情報を設定
    const taskStart = props.editingTask.start || "00:00";
    const taskEnd = props.editingTask.end || "24:00";

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
    // 新規追加モードの場合
    if (props.existingTime && Object.keys(props.existingTime).length > 0) {
      // 既存データがある場合は、そのデータを編集用に設定
      if (props.existingTime.taskName) {
        editingTaskData.value = {
          taskName: props.existingTime.taskName,
          description: props.existingTime.description || "",
        };

        // タスク色を設定
        taskColor.value = props.existingTime.userColor || "#3b82f6";

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
      editingTaskData.value = {
        taskName: firstTask.taskName || "",
        description: firstTask.description || "",
      };

      // タスク色を設定
      taskColor.value = firstTask.userColor || "#3b82f6";

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
      editingTaskData.value = {
        taskName: "",
        description: "",
      };

      // デフォルトのタスク色を設定
      taskColor.value = "#3b82f6";

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
  }

  // バリデーションエラーをリセット
  taskNameErrors.value = [];
  descriptionErrors.value = [];

  // タスク管理モードでは新規データ判定を簡素化
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

const save = async () => {
  // タスク名のバリデーション
  if (!editingTaskData.value.taskName.trim()) {
    errorMessage.value = "タスク名を入力してください";
    return;
  }

  // バリデーションエラーのチェック
  if (taskNameErrors.value.length > 0) {
    errorMessage.value = "タスク名にエラーがあります";
    return;
  }

  if (descriptionErrors.value.length > 0) {
    errorMessage.value = "説明にエラーがあります";
    return;
  }

  try {
    // バックエンドAPI用のデータ構造を作成
    const taskData = {
      useruid: user.value?.uid || "",
      events: {
        [props.selectedDate]: [
          {
            description: editingTaskData.value.description.trim(),
            start: timeSlots.value[0].start,
            end: timeSlots.value[0].end,
            title: editingTaskData.value.taskName.trim(),
            userColor: taskColor.value,
            order: 1,
          },
        ],
      },
    };

    // 既存のタスクがある場合は、それらも含める
    if (isEditMode.value) {
      // 編集モードの場合
      const existingTasks = Array.isArray(props.existingTime)
        ? [...props.existingTime]
        : props.existingTime && props.existingTime.taskName
        ? [props.existingTime]
        : [];

      // 編集対象のタスクを更新
      if (existingTasks[props.editingTaskIndex]) {
        existingTasks[props.editingTaskIndex] = {
          ...existingTasks[props.editingTaskIndex],
          taskName: editingTaskData.value.taskName.trim(),
          description: editingTaskData.value.description.trim(),
          start: timeSlots.value[0].start,
          end: timeSlots.value[0].end,
          userColor: taskColor.value,
        };
      }

      // 既存タスクをバックエンド形式に変換
      taskData.events[props.selectedDate] = existingTasks.map(
        (task, index) => ({
          description: task.description || "",
          start: task.start,
          end: task.end,
          title: task.taskName || "",
          userColor: task.userColor || "#3b82f6",
          order: index + 1,
        })
      );
    } else {
      // 新規追加モードの場合
      const existingTasks = Array.isArray(props.existingTime)
        ? [...props.existingTime]
        : props.existingTime && props.existingTime.taskName
        ? [props.existingTime]
        : [];

      const updatedTasks = [
        ...existingTasks,
        {
          taskName: editingTaskData.value.taskName.trim(),
          description: editingTaskData.value.description.trim(),
          start: timeSlots.value[0].start,
          end: timeSlots.value[0].end,
          userColor: taskColor.value,
          order: existingTasks.length + 1,
        },
      ];

      // 既存タスクをバックエンド形式に変換
      taskData.events[props.selectedDate] = updatedTasks.map((task, index) => ({
        description: task.description || "",
        start: task.start,
        end: task.end,
        title: task.taskName || "",
        userColor: task.userColor || "#3b82f6",
        order: index + 1,
      }));
    }

    // バックエンドAPIを呼び出し
    const response = await saveTaskData(taskData);

    if (response.success) {
      // プレビューデータをクリアするためのイベントを発火
      emit("preview", {
        date: props.selectedDate,
        timeSlots: [],
      });

      // ローカル状態も更新
      if (isEditMode.value) {
        const existingTasks = Array.isArray(props.existingTime)
          ? [...props.existingTime]
          : props.existingTime && props.existingTime.taskName
          ? [props.existingTime]
          : [];

        if (existingTasks[props.editingTaskIndex]) {
          existingTasks[props.editingTaskIndex] = {
            ...existingTasks[props.editingTaskIndex],
            taskName: editingTaskData.value.taskName.trim(),
            description: editingTaskData.value.description.trim(),
            start: timeSlots.value[0].start,
            end: timeSlots.value[0].end,
            userColor: taskColor.value,
          };
        }

        emit("save", {
          date: props.selectedDate,
          timeSlots: existingTasks,
        });
      } else {
        const existingTasks = Array.isArray(props.existingTime)
          ? [...props.existingTime]
          : props.existingTime && props.existingTime.taskName
          ? [props.existingTime]
          : [];

        const updatedTasks = [
          ...existingTasks,
          {
            taskName: editingTaskData.value.taskName.trim(),
            description: editingTaskData.value.description.trim(),
            start: timeSlots.value[0].start,
            end: timeSlots.value[0].end,
            userColor: taskColor.value,
            order: existingTasks.length + 1,
          },
        ];

        emit("save", {
          date: props.selectedDate,
          timeSlots: updatedTasks,
        });
      }

      isInitialized.value = false; // 初期化フラグをリセット
      hasNewData.value = false; // 新規データフラグをリセット
      props.close();
    } else {
      errorMessage.value = response.error || "タスクの保存に失敗しました";
    }
  } catch (error) {
    console.error("タスク保存エラー:", error);
    errorMessage.value = "タスクの保存中にエラーが発生しました";
  }
};

const deleteTask = async () => {
  try {
    // 編集モードで特定のタスクを削除
    const existingTasks = Array.isArray(props.existingTime)
      ? [...props.existingTime]
      : props.existingTime && props.existingTime.taskName
      ? [props.existingTime]
      : [];

    // 指定されたタスクを削除
    existingTasks.splice(props.editingTaskIndex, 1);

    // バックエンドAPI用のデータ構造を作成
    const taskData = {
      useruid: user.value?.uid || "",
      events: {},
    };

    if (existingTasks.length === 0) {
      // すべてのタスクが削除された場合、空の配列を送信
      taskData.events[props.selectedDate] = [];
    } else {
      // 残りのタスクをバックエンド形式に変換
      taskData.events[props.selectedDate] = existingTasks.map(
        (task, index) => ({
          description: task.description || "",
          start: task.start,
          end: task.end,
          title: task.taskName || "",
          userColor: task.userColor || "#3b82f6",
          order: index + 1,
        })
      );
    }

    console.log("削除後のタスクデータ（バックエンド送信用）:", taskData);

    // バックエンドAPIを呼び出し
    const response = await saveTaskData(taskData);

    if (response.success) {
      console.log("タスク削除成功:", response.message);

      // プレビューデータをクリアするためのイベントを発火
      emit("preview", {
        date: props.selectedDate,
        timeSlots: [],
      });

      // ローカル状態も更新
      if (existingTasks.length === 0) {
        // すべてのタスクが削除された場合
        emit("delete", {
          date: props.selectedDate,
          keepUserData: false,
        });
      } else {
        // 残りのタスクを保存
        emit("save", {
          date: props.selectedDate,
          timeSlots: existingTasks,
        });
      }

      isInitialized.value = false;
      hasNewData.value = false;
      props.close();
    } else {
      errorMessage.value = response.error || "タスクの削除に失敗しました";
    }
  } catch (error) {
    console.error("タスク削除エラー:", error);
    errorMessage.value = "タスクの削除中にエラーが発生しました";
  }
};

// 不要になった関数を削除

const onKeyDown = (e) => {
  if (e.key === "Escape") {
    props.close();
  }
};

//モーダル移動
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const modalStyle = ref({
  transform: "translate(-50%, -50%)",
});

const modalRef = ref(null);
const modalWidth = ref(0);
const modalHeight = ref(0);

const updateModalSize = () => {
  if (modalRef.value && modalRef.value.getBoundingClientRect) {
    try {
      const rect = modalRef.value.getBoundingClientRect();
      modalWidth.value = rect.width;
      modalHeight.value = rect.height;
    } catch (error) {
      // フォールバック値を使用
      modalWidth.value = 400;
      modalHeight.value = 300;
    }
  }
};

const startDrag = (e) => {
  e.preventDefault();
  isDragging.value = true;
  updateModalSize();
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  const dx = e.clientX - dragStartX.value;
  const dy = e.clientY - dragStartY.value;

  // 新しい位置を計算
  let newOffsetX = offsetX.value + dx;
  let newOffsetY = offsetY.value + dy;

  // 画面の端との距離を計算
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // モーダルのサイズを更新
  updateModalSize();

  // X軸の制限（左右の余白を考慮）
  const maxOffsetX = (windowWidth - modalWidth.value) / 2 - 2;
  const minOffsetX = -(windowWidth - modalWidth.value) / 2 + 2;
  newOffsetX = Math.min(Math.max(newOffsetX, minOffsetX), maxOffsetX);

  // Y軸の制限（上下の余白を考慮）
  const maxOffsetY = (windowHeight - modalHeight.value) / 2 - 2;
  const minOffsetY = -(windowHeight - modalHeight.value) / 2 + 2;
  newOffsetY = Math.min(Math.max(newOffsetY, minOffsetY), maxOffsetY);

  // 制限された位置を適用
  offsetX.value = newOffsetX;
  offsetY.value = newOffsetY;

  modalStyle.value = {
    transform: `translate(calc(-50% + ${offsetX.value}px), calc(-50% + ${offsetY.value}px))`,
  };

  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

// タスク管理モードではプレビュー機能を簡素化
const updatePreview = () => {
  // タスク管理モードではプレビューを無効化
  return;
};

// ウィンドウのリサイズ時にモーダルのサイズを更新
onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", updateModalSize);
  window.addEventListener("resize", checkMobile);
  updateModalSize();
  checkMobile();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", updateModalSize);
  window.removeEventListener("resize", checkMobile);
});
</script>
