<template>
  <!-- モバイル用オーバーレイ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show"
      class="fixed inset-0 bg-black bg-opacity-50 z-[99998]"
      @click="closeForm"
    ></div>
  </Transition>

  <!-- モバイル用モーダル -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-show="show"
      class="fixed bottom-0 left-0 right-0 z-[99999] bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
    >
      <!-- ヘッダー部分 -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-gray-800">
            {{ isCurrentYear ? "" : dateComponents.year + "年" }}
            {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
            {{ dateComponents.day }} 日
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="hasTimeData && !hasOnlyUserTimeSlots"
            @click="copy"
            class="p-2 rounded-full hover:bg-gray-100"
          >
            <UIcon
              name="mdi:calendar-blank-multiple"
              class="size-5 text-blue-500"
            />
          </button>
          <button
            v-if="hasTimeData && !hasOnlyUserTimeSlots"
            @click="copyClipboard"
            class="p-2 rounded-full hover:bg-gray-100"
          >
            <UIcon
              name="mdi:clipboard-multiple-outline"
              class="size-5 text-green-500"
            />
          </button>
          <button
            v-if="hasTimeData && !hasOnlyUserTimeSlots"
            @click="deleteTime"
            class="p-2 rounded-full hover:bg-gray-100"
          >
            <UIcon name="ic:baseline-delete" class="size-5 text-red-500" />
          </button>
          <button @click="closeForm" class="p-2 rounded-full hover:bg-gray-100">
            <UIcon name="ic:baseline-close" class="size-5 text-gray-500" />
          </button>
        </div>
      </div>

      <!-- エラーメッセージ -->
      <div
        v-if="errorMessage"
        class="mx-4 mt-2 p-3 bg-red-100 border border-red-300 rounded-lg"
      >
        <h6 class="text-sm font-bold text-red-500">
          {{ errorMessage }}
        </h6>
      </div>

      <!-- コンテンツ部分 -->
      <div class="flex-1 overflow-y-auto p-4 pb-8 min-h-0">
        <!-- 繰り返しモード -->
        <div v-if="isRepetitionMode">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">繰り返し日付の設定</h3>
            <button
              @click="cancelRepetitionMode"
              class="text-gray-500 hover:text-gray-700 text-sm"
            >
              キャンセル
            </button>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-50 p-3 rounded-lg">
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

            <div class="bg-gray-50 p-3 rounded-lg">
              <TimeInputDate
                :timeSlots="timeSlots"
                :allowOtherEdit="props.allowOtherEdit"
                @update:timeSlots="updateTimeSlots"
                @startTimeChange="handleStartTimeChange"
                @endTimeChange="handleEndTimeChange"
              />
            </div>
          </div>

          <div
            class="mt-6 sticky bottom-0 bg-white pt-2 border-t border-gray-200"
          >
            <button
              @click="saveRepetition"
              class="w-full py-4 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-lg"
            >
              繰り返し保存
            </button>
          </div>
        </div>

        <!-- 通常モード -->
        <div v-else>
          <div class="bg-gray-50 p-3 rounded-lg">
            <TimeInputDate
              :timeSlots="timeSlots"
              :allowOtherEdit="props.allowOtherEdit"
              @update:timeSlots="updateTimeSlots"
              @startTimeChange="handleStartTimeChange"
              @endTimeChange="handleEndTimeChange"
            />
          </div>

          <!-- アクションボタン -->
          <div
            class="mt-6 space-y-3 sticky bottom-0 bg-white pt-2 border-t border-gray-200"
          >
            <button
              @click="save"
              class="w-full py-4 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-lg"
            >
              保存
            </button>

            <button
              v-if="hasTimeData && !hasOnlyUserTimeSlots && hasNonUserTimeSlots"
              @click="inputRepetitionDate"
              class="w-full py-4 px-4 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-lg"
            >
              繰り返し設定
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import TimeInputDate from "@/components/buttons/TimeInputDate.vue";
import TimeRepetitionDate from "@/components/buttons/TimeRepetitionDate.vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useDeleteUtils } from "@/utils/DeleteUtils";
import { copySingleDateToClipboard } from "@/utils/CopyDate";
import { useRepetitionUtils } from "@/utils/RepetitionUtils";

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

const { timeSlots, validateTime, validateTimeOrder, validateTimeOverlap } =
  useTimeUtils();

const { analyzeTimeSlotsForDeletion } = useDeleteUtils();

const {
  validateRepetitionSave,
  generateRepetitionSaveData,
  shouldShowRepetitionButton,
} = useRepetitionUtils();

const isInitialized = ref(false);
const hasNewData = ref(false);
const isRepetitionMode = ref(false);
const repetitionDates = ref([]);
const selectedRepetitionDates = ref([]);
const repetitionPattern = ref("daily");
const repetitionStartDate = ref("");
const repetitionEndDate = ref("");
const selectedWeekdays = ref([]);

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
  // RepetitionUtilsを使用してバリデーション
  const validation = validateRepetitionSave(
    repetitionStartDate.value,
    repetitionEndDate.value,
    repetitionPattern.value,
    selectedWeekdays.value,
    selectedRepetitionDates.value,
    timeSlots.value,
    props.startDate,
    props.endDate,
    validateTime,
    validateTimeOrder,
    validateTimeOverlap
  );

  if (!validation.isValid) {
    errorMessage.value = validation.errorMessage;
    return;
  }

  errorMessage.value = "";

  // RepetitionUtilsを使用して保存データを生成
  const saveDataList = generateRepetitionSaveData(
    selectedRepetitionDates.value,
    timeSlots.value,
    props.timeData
  );

  // 選択された日付に時間データを保存
  saveDataList.forEach((saveData) => {
    emit("save", saveData);
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
  closeForm();
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

const closeForm = () => {
  emit("close");
};

const save = () => {
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
    closeForm();
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
  closeForm();
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
  closeForm();
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

const hasOnlyUserTimeSlots = computed(() => {
  // 空のスロットを除外して判定
  const nonEmptySlots = timeSlots.value.filter(
    (slot) => slot.start !== "00:00" || slot.end !== "00:00"
  );
  return (
    nonEmptySlots.length > 0 && nonEmptySlots.every((slot) => slot.username)
  );
});

const hasNonUserTimeSlots = computed(() => {
  return shouldShowRepetitionButton(
    hasTimeData.value,
    hasOnlyUserTimeSlots.value,
    timeSlots.value
  );
});

const hasTimeData = computed(() => {
  return props.existingTime && Object.keys(props.existingTime).length > 0;
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

// 表示用の日付フォーマット関数（RepetitionUtilsから取得）
const { formatDisplayDate } = useRepetitionUtils();
</script>
