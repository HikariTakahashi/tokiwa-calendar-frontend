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
          <button
            @click="copy"
            class="py-2 px-2 flex justify-center items-center rounded-full hover:bg-gray-300"
          >
            <UIcon
              name="mdi:calendar-blank-multiple"
              class="size-5 bg-gray-600 hover:bg-blue-500"
            />
          </button>
          <button
            @click="copyClipboard"
            class="py-2 px-2 flex justify-center items-center rounded-full hover:bg-gray-300"
          >
            <UIcon
              name="mdi:clipboard-multiple-outline"
              class="size-5 bg-gray-600 hover:bg-green-500"
            />
          </button>
          <button
            @click="deleteTime"
            class="py-2 px-2 flex justify-center items-center rounded-full hover:bg-gray-300"
          >
            <UIcon
              name="ic:baseline-delete"
              class="size-5 bg-gray-600 hover:bg-red-500"
            />
          </button>
        </div>
        <button
          @click="props.close"
          class="py-1.5 px-1.5 flex justify-center items-center"
          :class="{ 'ml-auto': !hasTimeData }"
        >
          <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
        </button>
      </div>
    </div>

    <div class="pl-5 pr-2 pt-1 pb-5 rounded-lg w-96 shadow-lg relative">
      <h6 class="text-sm font-bold text-red-500">
        {{ errorMessage }}
      </h6>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">
          {{ isCurrentYear ? "" : dateComponents.year + "年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
          {{ dateComponents.day }} 日の時間設定
        </h2>
      </div>

      <div class="max-h-[40vh] overflow-y-auto pr-2" ref="timeSlotsContainer">
        <div v-for="(timeSlot, index) in timeSlots" :key="index">
          <div v-if="timeSlot.username" class="mb-2">
            <h3
              class="text-lg font-bold"
              :style="{ color: timeSlot.userColor || '#3b82f6' }"
            >
              {{ timeSlot.username }}
            </h3>
          </div>
          <div class="flex pr-3 justify-center items-center gap-x-2 mb-2">
            <label>開始時刻</label>
            <div class="border-r border-gray-400 pr-2">
              <component
                :is="shouldUseUserTime(timeSlot) ? UserTime : InputTime"
                v-model:time="timeSlot.start"
                :minute-interval="5"
                :initial-hours="parseTimeSlot(timeSlot.start).hours"
                :initial-minutes="parseTimeSlot(timeSlot.start).minutes"
                @update:time="
                  (newStartTime) => handleStartTimeChange(newStartTime, index)
                "
              />
            </div>
            <component
              :is="shouldUseUserTime(timeSlot) ? UserTime : InputTime"
              v-model:time="timeSlot.end"
              :minute-interval="5"
              :initial-hours="parseTimeSlot(timeSlot.end).hours"
              :initial-minutes="parseTimeSlot(timeSlot.end).minutes"
              @update:time="
                (newEndTime) => handleEndTimeChange(newEndTime, index)
              "
            />
            <label>終了時刻</label>
            <button
              v-if="timeSlots.length > 1 && !timeSlot.username"
              @click="removeTimeSlot(index)"
              class="text-red-500"
            >
              <UIcon name="ic:sharp-delete" class="size-5 hover:bg-red-800" />
            </button>
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
      <div class="mt-3 flex justify-end gap-x-2">
        <buttons-square @click="save" color="bg-blue-200">
          保存
        </buttons-square>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import InputTime from "@/components/buttons/InputTime.vue";
import UserTime from "@/components/buttons/UserTime.vue";
import { useTimeUtils } from "@/utils/TimeUtils";
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
});

const emit = defineEmits(["save", "delete", "copy", "preview"]);

const {
  timeSlots,
  addTimeSlot: addTimeSlotBase,
  removeTimeSlot,
  validateTime,
  validateTimeOrder,
  validateTimeOverlap,
} = useTimeUtils();

const timeSlotsContainer = ref(null);
const isInitialized = ref(false);
const hasNewData = ref(false);

const addTimeSlot = () => {
  // ユーザー名が存在する時間スロットの後に新しい時間スロットを追加
  const userSlotIndex = timeSlots.value.findIndex((slot) => slot.username);
  if (userSlotIndex !== -1) {
    timeSlots.value.splice(userSlotIndex + 1, 0, {
      start: "00:00",
      end: "00:00",
    });
  } else {
    addTimeSlotBase();
  }

  nextTick(() => {
    if (timeSlotsContainer.value) {
      timeSlotsContainer.value.scrollTop =
        timeSlotsContainer.value.scrollHeight;
    }
  });
};

const parseTimeSlot = (timeString) => {
  if (!timeString) return { hours: 0, minutes: 0 };
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
};

const hasUserTimeSlot = computed(() => {
  return timeSlots.value.some((slot) => slot.username);
});

const updateTimeSlots = () => {
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
updateTimeSlots();

// selectedDateが変更された時に実行
watch(
  () => props.selectedDate,
  () => {
    updateTimeSlots();
  }
);

// existingTimeが変更された時に実行
watch(
  () => props.existingTime,
  () => {
    updateTimeSlots();
  },
  { deep: true }
);

// initialHourが変更された時に実行
watch(
  () => props.initialHour,
  () => {
    updateTimeSlots();
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

  // 有効なスロットがない場合は保存しない
  if (validTimeSlots.length === 0) {
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
  emit("save", {
    date: props.selectedDate,
    timeSlots: validTimeSlots,
  });

  isInitialized.value = false; // 初期化フラグをリセット
  hasNewData.value = false; // 新規データフラグをリセット
  props.close();
};

const deleteTime = () => {
  // Usernameが存在するデータと存在しないデータを分離
  const userTimeSlots = timeSlots.value.filter((slot) => slot.username);
  const nonUserTimeSlots = timeSlots.value.filter((slot) => !slot.username);

  if (userTimeSlots.length > 0) {
    // Usernameが存在するデータがある場合、それらを保持して削除イベントを発火
    emit("delete", {
      date: props.selectedDate,
      keepUserData: true,
      userTimeSlots: userTimeSlots,
    });
  } else {
    // Usernameが存在するデータがない場合、通常の削除イベントを発火
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
  console.log("ExistingTime:", props.existingTime);
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
      console.warn("Failed to get modal bounds:", error);
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
  updateModalSize();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", updateModalSize);
});

const shouldUseUserTime = (timeSlot) => {
  // allowOtherEditがtrueの場合は、usernameが含まれていてもInputTimeを使用
  if (props.allowOtherEdit) {
    return false;
  }
  // allowOtherEditがfalseの場合は、従来通りusernameが含まれている場合はUserTimeを使用
  return timeSlot.username;
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

  // プレビューを更新
  updatePreview();
};

const handleEndTimeChange = (newEndTime, index) => {
  // 終了時刻が変更された時の処理
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
