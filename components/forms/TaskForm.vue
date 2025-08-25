<template>
  <div
    ref="modalRef"
    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-white rounded shadow-lg"
    :style="modalStyle"
    style="z-index: 9999"
  >
    <div
      class="flex items-center py-1 px-2 border-b-2 hover:bg-gray-100 cursor-move"
      @mousedown="startDrag"
    >
      <div class="flex flex-row justify-between w-full">
        <div class="flex flex-row mr-auto ml-2 gap-x-2">
          <h3 class="text-sm font-semibold text-gray-700">タスク管理</h3>
        </div>
        <buttons-hover
          @click="props.close"
          :size="5"
          name="ic:sharp-clear"
          color="bg-red-500"
          :ishover="false"
        />
      </div>
    </div>

    <div class="pl-5 pr-2 pt-1 pb-5 rounded-lg shadow-lg relative w-96">
      <!-- <h6 class="text-sm font-bold text-red-500">
        {{ errorMessage }}
      </h6>

      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">
          {{ isCurrentYear ? "" : dateComponents.year + "年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
          {{ dateComponents.day }} 日のタスク設定
        </h2>
      </div>

      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            タスク名
          </label>
          <input
            v-model="taskName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="タスク名を入力してください"
            maxlength="100"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            v-model="taskDescription"
            rows="3"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="タスクの詳細を入力してください"
            maxlength="500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            優先度
          </label>
          <select
            v-model="taskPriority"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">緊急</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            予定時間
          </label>
          <TimeInputDate
            :timeSlots="timeSlots"
            :allowOtherEdit="props.allowOtherEdit"
            @update:timeSlots="updateTimeSlots"
            @startTimeChange="handleStartTimeChange"
            @endTimeChange="handleEndTimeChange"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ステータス
          </label>
          <select
            v-model="taskStatus"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">未着手</option>
            <option value="in-progress">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-x-2">
        <buttons-square
          v-if="hasExistingTask"
          @click="deleteTask"
          color="bg-red-200"
          class="w-24"
        >
          削除
        </buttons-square>
        <buttons-square @click="save" color="bg-blue-200" class="w-24">
          保存
        </buttons-square>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import TimeInputDate from "@/components/buttons/TimeInputDate.vue";
import { useTimeUtils } from "@/utils/TimeUtils";

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
});

const emit = defineEmits([
  "save",
  "delete",
  "copy",
  "preview",
  "openTimeSideMenu",
]);

const { timeSlots, validateTime, validateTimeOrder, validateTimeOverlap } =
  useTimeUtils();

const isInitialized = ref(false);
const hasNewData = ref(false);
const isMobile = ref(false);
const errorMessage = ref("");

// タスク管理用の状態
const taskName = ref("");
const taskDescription = ref("");
const taskPriority = ref("medium");
const taskStatus = ref("pending");

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

const initializeTaskData = () => {
  // 初期化後は、既に有効な時間スロットが存在する場合は、それらを保持
  if (isInitialized.value) {
    const hasValidTimeSlots = timeSlots.value.some(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    if (hasValidTimeSlots) {
      // 既に時間が入力されている場合は、現在の状態を維持
      return;
    }
  }

  // 既存データがある場合
  if (props.existingTime.start && props.existingTime.end) {
    timeSlots.value = [
      {
        start: props.existingTime.start,
        end: props.existingTime.end,
        username: props.existingTime.username,
        userColor: props.existingTime.userColor,
      },
    ];

    // タスク情報を復元
    if (props.existingTime.taskName) {
      taskName.value = props.existingTime.taskName;
    }
    if (props.existingTime.taskDescription) {
      taskDescription.value = props.existingTime.taskDescription;
    }
    if (props.existingTime.taskPriority) {
      taskPriority.value = props.existingTime.taskPriority;
    }
    if (props.existingTime.taskStatus) {
      taskStatus.value = props.existingTime.taskStatus;
    }

    // initialHourが設定されている場合は、新規スロットを追加
    if (props.initialHour !== undefined && props.initialHour !== null) {
      const startHour = props.initialHour.toString().padStart(2, "0");
      const endHour = (props.initialHour + 1).toString().padStart(2, "0");

      timeSlots.value.push({
        start: `${startHour}:00`,
        end: `${endHour}:00`,
      });
    } else {
      // 空のスロットを追加
      timeSlots.value.push({
        start: "00:00",
        end: "00:00",
      });
    }
  } else if (Array.isArray(props.existingTime)) {
    timeSlots.value = [
      ...props.existingTime.map((slot) => ({
        start: slot.start,
        end: slot.end,
        username: slot.username,
        userColor: slot.userColor,
      })),
    ];

    // タスク情報を復元（配列の最初の要素から）
    if (props.existingTime[0]) {
      const firstSlot = props.existingTime[0];
      if (firstSlot.taskName) {
        taskName.value = firstSlot.taskName;
      }
      if (firstSlot.taskDescription) {
        taskDescription.value = firstSlot.taskDescription;
      }
      if (firstSlot.taskPriority) {
        taskPriority.value = firstSlot.taskPriority;
      }
      if (firstSlot.taskStatus) {
        taskStatus.value = firstSlot.taskStatus;
      }
    }

    // initialHourが設定されている場合は、新規スロットを追加
    if (props.initialHour !== undefined && props.initialHour !== null) {
      const startHour = props.initialHour.toString().padStart(2, "0");
      const endHour = (props.initialHour + 1).toString().padStart(2, "0");

      timeSlots.value.push({
        start: `${startHour}:00`,
        end: `${endHour}:00`,
      });
    } else {
      // 空のスロットを追加
      timeSlots.value.push({
        start: "00:00",
        end: "00:00",
      });
    }
  } else if (props.initialHour !== undefined && props.initialHour !== null) {
    // initialHourが設定されている場合、その時間から1時間後の範囲を設定
    const startHour = props.initialHour.toString().padStart(2, "0");
    const endHour = (props.initialHour + 1).toString().padStart(2, "0");

    timeSlots.value = [
      {
        start: `${startHour}:00`,
        end: `${endHour}:00`,
      },
    ];
  } else {
    timeSlots.value = [
      {
        start: "00:00",
        end: "00:00",
      },
    ];
  }

  // 新規データがあるかどうかを判定
  hasNewData.value =
    props.initialHour !== undefined && props.initialHour !== null;

  // 既存データがある場合もプレビュー表示を有効にする
  if (
    !hasNewData.value &&
    (props.existingTime.start || Array.isArray(props.existingTime))
  ) {
    hasNewData.value = true;
  }

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
    // プレビューデータをクリアするためのイベントを発火
    emit("preview", {
      date: props.selectedDate,
      timeSlots: [],
    });

    emit("save", {
      date: props.selectedDate,
      timeSlots: [],
    });
    isInitialized.value = false; // 初期化フラグをリセット
    hasNewData.value = false; // 新規データフラグをリセット
    props.close();
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

  errorMessage.value = "";

  // タスク情報を時間スロットに追加
  const taskTimeSlots = validTimeSlots.map((slot) => ({
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
  props.close();
};

const deleteTask = () => {
  emit("delete", {
    date: props.selectedDate,
    keepUserData: false,
  });

  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
  props.close();
};

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
