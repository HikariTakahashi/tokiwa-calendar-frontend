<template>
  <div class="absolute top-0 right-0 h-full z-40">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
    >
      <div
        v-show="show && !isMobile"
        class="absolute right-0 top-0 w-96 h-full border-l border-t rounded-tl-lg border-gray-300 bg-white z-[60] shadow-lg overflow-y-auto"
      >
        <div class="p-4">
          <div class="flex flex-row items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">時間設定</h3>
            <buttons-hover
              @click="closeTimeSideMenu"
              :size="6"
              name="ic:baseline-close"
              color="bg-red-500"
              :ishover="false"
            />
          </div>

          <!-- 日付表示 -->
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-lg font-semibold text-gray-800">
              {{ isCurrentYear ? "" : dateComponents.year + "年" }}
              {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
              {{ dateComponents.day }} 日
            </h4>
          </div>

          <!-- エラーメッセージ -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg"
          >
            <h6 class="text-sm font-bold text-red-500">
              {{ errorMessage }}
            </h6>
          </div>

          <!-- 時間スロット入力エリア -->
          <TimeInputDate
            :timeSlots="timeSlots"
            :allowOtherEdit="props.allowOtherEdit"
            @update:timeSlots="updateTimeSlots"
            @startTimeChange="handleStartTimeChange"
            @endTimeChange="handleEndTimeChange"
          />

          <!-- アクションボタン -->
          <div class="mt-6 flex flex-col gap-y-2">
            <div
              v-if="hasTimeData && !hasOnlyUserTimeSlots"
              class="flex gap-x-2 mb-2"
            >
              <button
                @click="copy"
                class="flex-1 py-2 px-3 flex justify-center items-center rounded-lg hover:bg-gray-200 border border-gray-300"
              >
                <UIcon name="mdi:calendar-blank-multiple" class="size-4 mr-2" />
                コピー
              </button>
              <button
                @click="copyClipboard"
                class="flex-1 py-2 px-3 flex justify-center items-center rounded-lg hover:bg-gray-200 border border-gray-300"
              >
                <UIcon
                  name="mdi:clipboard-multiple-outline"
                  class="size-4 mr-2"
                />
                クリップボード
              </button>
              <button
                @click="deleteTime"
                class="flex-1 py-2 px-3 flex justify-center items-center rounded-lg hover:bg-red-100 border border-red-300 text-red-600"
              >
                <UIcon name="ic:baseline-delete" class="size-4 mr-2" />
                削除
              </button>
            </div>
            <buttons-square @click="save" color="bg-blue-200" class="w-full">
              保存
            </buttons-square>
          </div>
        </div>
      </div>
    </Transition>
  </div>

  <!-- デスクトップ用メインコンテンツのオーバーレイ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show && !isMobile"
      class="absolute right-0 top-0 w-96 h-full z-30"
      @click="closeTimeSideMenu"
    ></div>
  </Transition>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  computed,
  ref,
  watch,
  nextTick,
} from "vue";
import TimeInputDate from "@/components/buttons/TimeInputDate.vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useDeleteUtils } from "@/utils/DeleteUtils";
import { copySingleDateToClipboard } from "@/utils/CopyDate";
import { useEventListener } from "@vueuse/core";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
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
  "close",
  "editModeChanged",
]);

const {
  timeSlots,
  addTimeSlot: addTimeSlotBase,
  validateTime,
  validateTimeOrder,
  validateTimeOverlap,
} = useTimeUtils();

const { analyzeTimeSlotsForDeletion, removeTimeSlotAtIndex } = useDeleteUtils();

const isInitialized = ref(false);
const hasNewData = ref(false);
const isMobile = ref(false);

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

const closeTimeSideMenu = () => {
  // 編集モードを終了
  emit("editModeChanged", false);
  emit("close");
};

// 新しいコンポーネントからのイベントハンドラー
const updateTimeSlots = (newTimeSlots) => {
  timeSlots.value = newTimeSlots;
};

const initializeTimeSlots = () => {
  // 日付が変更された場合は、初期化フラグをリセットして新しい日付のデータを読み込む
  if (isInitialized.value) {
    const hasValidTimeSlots = timeSlots.value.some(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    // 日付が変更された場合は、新しい日付のデータを読み込む
    if (hasValidTimeSlots && props.selectedDate !== timeSlots.value[0]?.date) {
      isInitialized.value = false;
    } else if (hasValidTimeSlots) {
      // 同じ日付で有効な時間スロットが存在する場合は、現在の状態を維持
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

// TimeSideMenuが開かれた時に編集モードを開始
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      emit("editModeChanged", true);
    }
  }
);

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
    closeTimeSideMenu();
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
  closeTimeSideMenu();
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

  // プレビューデータをクリアするためのイベントを発火
  emit("preview", {
    date: props.selectedDate,
    timeSlots: [],
  });

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
  closeTimeSideMenu();
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

// コンポーネントマウント時とリサイズ時に判定
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});

// Escapeキーで閉じる
const handleEscapeKey = (event) => {
  if (event.key === "Escape") {
    closeTimeSideMenu();
  }
};

useEventListener(window, "keydown", handleEscapeKey);
</script>
