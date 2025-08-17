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
        <div v-if="hasTimeData && !hasOnlyUserTimeSlots" class="flex gap-x-2">
          <buttons-hover
            @click="copy"
            :size="5"
            name="mdi:calendar-blank-multiple"
            color="bg-blue-500"
          />
          <buttons-hover
            @click="inputRepetitionDate"
            :size="5"
            name="ic:baseline-calendar-month"
            color="bg-blue-600"
          />
          <buttons-hover
            @click="copyClipboard"
            :size="5"
            name="mdi:clipboard-multiple-outline"
            color="bg-green-500"
          />
          <buttons-hover
            @click="deleteTime"
            :size="5"
            name="ic:baseline-delete"
            color="bg-red-500"
          />
        </div>
        <div class="flex flex-row mr-auto ml-2 gap-x-2">
          <buttons-hover
            v-if="!isMobile"
            @click="openTimeSideMenu"
            :size="5"
            name="material-symbols:side-navigation"
            color="bg-gray-600"
          />
        </div>
        <buttons-hover
          @click="props.close"
          :size="5"
          name="ic:sharp-clear"
          color="bg-red-500"
          :ishover="false"
          :class="{ 'ml-auto': !hasTimeData }"
        />
      </div>
    </div>

    <div
      class="pl-5 pr-2 pt-1 pb-5 rounded-lg shadow-lg relative"
      :class="isRepetitionMode && !isMobile ? 'w-[800px]' : 'w-96'"
    >
      <h6 class="text-sm font-bold text-red-500">
        {{ errorMessage }}
      </h6>

      <div v-if="isRepetitionMode">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">繰り返し日付の設定</h2>
          <button
            @click="cancelRepetitionMode"
            class="text-gray-500 hover:text-gray-700 text-sm"
          >
            キャンセル
          </button>
        </div>

        <div
          :class="isMobile ? 'flex flex-col gap-y-4' : 'flex flex-row gap-x-6'"
        >
          <div :class="isMobile ? 'w-full' : 'flex-1'">
            <TimeRepetitionDate
              :selectedDate="props.selectedDate"
              :startDate="props.startDate"
              :endDate="props.endDate"
              @update:repetitionDates="updateRepetitionDates"
              @update:selectedRepetitionDates="updateSelectedRepetitionDates"
              @update:repetitionPattern="updateRepetitionPattern"
              @update:repetitionStartDate="updateRepetitionStartDate"
              @update:repetitionEndDate="updateRepetitionEndDate"
              @update:selectedWeekdays="updateSelectedWeekdays"
            />
          </div>

          <div :class="isMobile ? 'w-full' : 'flex-1'">
            <TimeInputDate
              :timeSlots="timeSlots"
              :allowOtherEdit="props.allowOtherEdit"
              @update:timeSlots="updateTimeSlots"
              @startTimeChange="handleStartTimeChange"
              @endTimeChange="handleEndTimeChange"
            />
          </div>
        </div>

        <div class="mt-3 flex justify-end gap-x-2">
          <buttons-square
            @click="saveRepetition"
            color="bg-blue-200"
            class="w-32"
          >
            繰り返し保存
          </buttons-square>
        </div>
      </div>

      <!-- 通常モードの場合は従来のUIを表示 -->
      <div v-else>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">
            {{ isCurrentYear ? "" : dateComponents.year + "年" }}
            {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
            {{ dateComponents.day }} 日の時間設定
          </h2>
        </div>

        <TimeInputDate
          :timeSlots="timeSlots"
          :allowOtherEdit="props.allowOtherEdit"
          @update:timeSlots="updateTimeSlots"
          @startTimeChange="handleStartTimeChange"
          @endTimeChange="handleEndTimeChange"
        />
        <div class="mt-3 flex justify-end gap-x-2">
          <buttons-square @click="save" color="bg-blue-200">
            保存
          </buttons-square>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import TimeInputDate from "@/components/buttons/TimeInputDate.vue";
import TimeRepetitionDate from "@/components/buttons/TimeRepetitionDate.vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useDeleteUtils } from "@/utils/DeleteUtils";
import { copySingleDateToClipboard } from "@/utils/CopyDate";

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

const openTimeSideMenu = () => {
  // selectedDateから日付を抽出
  const dateParts = props.selectedDate.split("-");
  const day = parseInt(dateParts[2], 10);

  // TimeSideMenuを開くためのイベントを発火
  emit("openTimeSideMenu", {
    selectedDate: props.selectedDate,
    year: props.year,
    month: props.month,
    day: day,
    existingTime: props.existingTime,
    isCopyMode: props.isCopyMode,
    allowOtherEdit: props.allowOtherEdit,
    initialHour: props.initialHour,
  });

  // TimeFormを閉じる
  props.close();
};

const { timeSlots, validateTime, validateTimeOrder, validateTimeOverlap } =
  useTimeUtils();

const { analyzeTimeSlotsForDeletion } = useDeleteUtils();

const isInitialized = ref(false);
const hasNewData = ref(false);
const isMobile = ref(false);
const isRepetitionMode = ref(false);
const repetitionDates = ref([]);
const selectedRepetitionDates = ref([]);
const repetitionPattern = ref("daily");
const repetitionStartDate = ref("");
const repetitionEndDate = ref("");
const selectedWeekdays = ref([]);

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// 繰り返し日付入力モードを開始
const inputRepetitionDate = () => {
  isRepetitionMode.value = true;
};

// 新しいコンポーネントからのイベントハンドラー
const updateTimeSlots = (newTimeSlots) => {
  timeSlots.value = newTimeSlots;
};

const updateRepetitionDates = (newRepetitionDates) => {
  repetitionDates.value = newRepetitionDates;
};

const updateSelectedRepetitionDates = (newSelectedRepetitionDates) => {
  selectedRepetitionDates.value = newSelectedRepetitionDates;
};

const updateRepetitionPattern = (newRepetitionPattern) => {
  repetitionPattern.value = newRepetitionPattern;
};

const updateRepetitionStartDate = (newRepetitionStartDate) => {
  repetitionStartDate.value = newRepetitionStartDate;
};

const updateRepetitionEndDate = (newRepetitionEndDate) => {
  repetitionEndDate.value = newRepetitionEndDate;
};

const updateSelectedWeekdays = (newSelectedWeekdays) => {
  selectedWeekdays.value = newSelectedWeekdays;
};

// 繰り返しモードをキャンセル
const cancelRepetitionMode = () => {
  isRepetitionMode.value = false;
  repetitionDates.value = [];
  selectedRepetitionDates.value = [];
  repetitionPattern.value = "daily";
  repetitionStartDate.value = "";
  repetitionEndDate.value = "";
  selectedWeekdays.value = [];
};

// 繰り返し保存を実行
const saveRepetition = () => {
  // 開始日・終了日が設定されていない場合
  if (!repetitionStartDate.value || !repetitionEndDate.value) {
    errorMessage.value = "開始日と終了日を設定してください";
    return;
  }

  // バックエンドの制限をチェック
  if (props.startDate && repetitionStartDate.value < props.startDate) {
    errorMessage.value = `開始日は${formatDisplayDate(
      props.startDate
    )}以降に設定してください`;
    return;
  }

  if (props.endDate && repetitionEndDate.value > props.endDate) {
    errorMessage.value = `終了日は${formatDisplayDate(
      props.endDate
    )}までに設定してください`;
    return;
  }

  // 毎週の場合、曜日が選択されていない場合
  if (
    repetitionPattern.value === "weekly" &&
    selectedWeekdays.value.length === 0
  ) {
    errorMessage.value = "曜日を選択してください";
    return;
  }

  // 日付が選択されていない場合
  if (selectedRepetitionDates.value.length === 0) {
    errorMessage.value = "対象日付を選択してください";
    return;
  }

  // 空のスロットが含まれているかチェック
  const emptySlots = timeSlots.value.filter(
    (slot) => slot.start === "00:00" && slot.end === "00:00"
  );

  if (emptySlots.length > 0) {
    errorMessage.value = "空の時間スロットがあります。";
    return;
  }

  // 空のスロット（startが00:00かつendが00:00）を除外
  const validTimeSlots = timeSlots.value.filter(
    (slot) => !(slot.start === "00:00" && slot.end === "00:00")
  );

  // 有効なスロットがない場合は保存しない
  if (validTimeSlots.length === 0) {
    errorMessage.value = "時間を入力してください";
    return;
  }

  // バリデーションを実行
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

  // 選択された日付に時間データを保存
  selectedRepetitionDates.value.forEach((date) => {
    emit("save", {
      date: date,
      timeSlots: validTimeSlots,
    });
  });

  isInitialized.value = false;
  hasNewData.value = false;
  isRepetitionMode.value = false;
  repetitionDates.value = [];
  selectedRepetitionDates.value = [];
  repetitionPattern.value = "daily";
  repetitionStartDate.value = "";
  repetitionEndDate.value = "";
  selectedWeekdays.value = [];
  props.close();
};

const initializeTimeSlots = () => {
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
initializeTimeSlots();

// selectedDateが変更された時に実行
watch(
  () => props.selectedDate,
  (newDate, oldDate) => {
    // 日付が変更された場合のみ更新
    if (newDate !== oldDate) {
      initializeTimeSlots();
    }
  }
);

// existingTimeが変更された時に実行
watch(
  () => props.existingTime,
  () => {
    initializeTimeSlots();
  },
  { deep: true }
);

// initialHourが変更された時に実行
watch(
  () => props.initialHour,
  () => {
    initializeTimeSlots();
  }
);

// プレビュー機能を無効化（時間変更の問題を解決するため）
// watch(
//   timeSlots,
//   (newTimeSlots) => {
//     // 空のスロット（startが00:00かつendが00:00）を除外
//     const validTimeSlots = newTimeSlots.filter(
//       (slot) => !(slot.start === "00:00" && slot.end === "00:00")
//     );

//     if (validTimeSlots.length > 0) {
//       emit("preview", {
//         date: props.selectedDate,
//         timeSlots: validTimeSlots,
//       });
//     } else {
//       emit("preview", {
//         date: props.selectedDate,
//         timeSlots: [],
//       });
//     }
//   },
//   { deep: true }
// );

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

const errorMessage = ref("");

const save = () => {
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

  // プレビューデータをクリアするためのイベントを発火
  emit("preview", {
    date: props.selectedDate,
    timeSlots: [],
  });

  emit("save", {
    date: props.selectedDate,
    timeSlots: validTimeSlots,
  });

  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
  props.close();
};

const deleteTime = () => {
  // 削除処理前の状態確認
  const userDataCount = timeSlots.value.filter((slot) => slot.username).length;
  const nonUserDataCount = timeSlots.value.filter(
    (slot) =>
      !slot.username && !(slot.start === "00:00" && slot.end === "00:00")
  ).length;
  const emptyDataCount = timeSlots.value.filter(
    (slot) => slot.start === "00:00" && slot.end === "00:00"
  ).length;

  // DeleteUtilsを使用して削除分析を実行
  const deleteResult = analyzeTimeSlotsForDeletion(timeSlots.value, {
    allowUserDataDeletion: false, // ユーザーデータの削除は許可しない
    confirmUserDataDeletion: false,
  });

  if (!deleteResult.shouldDelete) {
    // 削除するデータがない場合
    errorMessage.value = deleteResult.message || "削除するデータがありません";
    return;
  }

  // 削除前の確認メッセージを表示
  if (deleteResult.keepUserData) {
    errorMessage.value = `削除を実行します: ${deleteResult.message}`;
  } else {
    errorMessage.value = `削除を実行します: ${deleteResult.message}`;
  }

  // 削除可能なスロットを個別に削除
  const updatedTimeSlots = [...timeSlots.value];

  // 削除対象のスロットを逆順で削除（インデックスがずれないように）
  const slotsToDelete = deleteResult.deletedSlots;

  // 削除対象のスロットを逆順でソート（インデックスがずれないように）
  const slotsToDeleteWithIndex = [];
  for (let i = 0; i < updatedTimeSlots.length; i++) {
    const slot = updatedTimeSlots[i];
    const isTarget = slotsToDelete.some((slotToDelete) => {
      const match =
        slot.start === slotToDelete.start &&
        slot.end === slotToDelete.end &&
        slot.username === slotToDelete.username &&
        slot.userColor === slotToDelete.userColor;

      if (match) {
      }

      return match;
    });

    if (isTarget) {
      slotsToDeleteWithIndex.push({ index: i, slot });
    }
  }

  // インデックスの大きい順に削除（インデックスがずれないように）
  slotsToDeleteWithIndex
    .sort((a, b) => b.index - a.index)
    .forEach(({ index, slot }) => {
      updatedTimeSlots.splice(index, 1);
    });

  // orderを再割り当て
  const finalTimeSlots = updatedTimeSlots.map((slot, index) => ({
    ...slot,
    order: index + 1,
  }));

  // 時間スロットを更新
  timeSlots.value = finalTimeSlots;

  // 削除イベントを発火
  if (deleteResult.keepUserData) {
    emit("delete", {
      date: props.selectedDate,
      keepUserData: true,
      userTimeSlots: deleteResult.userTimeSlots,
    });
  } else {
    emit("delete", {
      date: props.selectedDate,
      keepUserData: false,
    });
  }

  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
  props.close();
};

const copy = () => {
  emit("copy");
  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
};

const copyClipboard = () => {
  copySingleDateToClipboard(props.selectedDate, timeSlots.value).catch(
    (err) => {
      console.error("コピーに失敗しました:", err);
    }
  );
};

const onKeyDown = (e) => {
  if (e.key === "Escape") {
    props.close();
  }
};

const hasOnlyUserTimeSlots = computed(() => {
  // 空のスロットを除外して判定
  const nonEmptySlots = timeSlots.value.filter(
    (slot) => slot.start !== "00:00" || slot.end !== "00:00"
  );
  return (
    nonEmptySlots.length > 0 && nonEmptySlots.every((slot) => slot.username)
  );
});

const hasTimeData = computed(() => {
  return props.existingTime && Object.keys(props.existingTime).length > 0;
});

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

const handleStartTimeChange = (data) => {
  // プレビューを更新
  updatePreview();
};

const handleEndTimeChange = (data) => {
  // プレビューを更新
  updatePreview();
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
