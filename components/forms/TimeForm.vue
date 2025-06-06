<template>
  <div
    ref="modalRef"
    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-white rounded shadow-lg"
    :style="modalStyle"
  >
    <div
      class="flex items-center py-1 px-2 border-b-2 hover:bg-gray-100 cursor-move"
      @mousedown="startDrag"
    >
      <div class="flex flex-row justify-between w-full">
        <div v-if="hasTimeData" class="flex gap-x-2">
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
          <div class="flex pr-3 justify-center items-center gap-x-2 mb-2">
            <label>開始時刻</label>
            <div class="border-r border-gray-400 pr-2">
              <InputTime
                v-model:time="timeSlot.start"
                :minute-interval="5"
                :initial-hours="parseTimeSlot(timeSlot.start).hours"
                :initial-minutes="parseTimeSlot(timeSlot.start).minutes"
              />
            </div>
            <InputTime
              v-model:time="timeSlot.end"
              :minute-interval="5"
              :initial-hours="parseTimeSlot(timeSlot.end).hours"
              :initial-minutes="parseTimeSlot(timeSlot.end).minutes"
            />
            <label>終了時刻</label>
            <button
              v-if="timeSlots.length > 1"
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
        <buttons-square @click="save" label="保存" color="bg-blue-200" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import InputTime from "@/components/buttons/InputTime.vue";
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
});

const emit = defineEmits(["save", "delete", "copy"]);

const {
  timeSlots,
  addTimeSlot: addTimeSlotBase,
  removeTimeSlot,
  validateTime,
  validateTimeOrder,
  validateTimeOverlap,
} = useTimeUtils();

const timeSlotsContainer = ref(null);

const addTimeSlot = () => {
  addTimeSlotBase();
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

const updateTimeSlots = () => {
  if (props.existingTime.start && props.existingTime.end) {
    timeSlots.value = [
      {
        start: props.existingTime.start,
        end: props.existingTime.end,
      },
    ];
  } else if (Array.isArray(props.existingTime)) {
    timeSlots.value = props.existingTime.map((slot) => ({
      start: slot.start,
      end: slot.end,
    }));
  } else {
    timeSlots.value = [
      {
        start: "00:00",
        end: "00:00",
      },
    ];
  }
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
  if (!validateTime(timeSlots.value)) {
    alert("開始時刻と終了時刻を入力してください");
    return;
  }

  const orderValidation = validateTimeOrder(timeSlots.value);
  if (!orderValidation.isValid) {
    errorMessage.value = orderValidation.errorMessage;
    return;
  }

  const overlapValidation = validateTimeOverlap(timeSlots.value);
  if (!overlapValidation.isValid) {
    errorMessage.value = overlapValidation.errorMessage;
    return;
  }

  errorMessage.value = "";
  emit("save", {
    date: props.selectedDate,
    timeSlots: timeSlots.value,
  });

  props.close();
};

const deleteTime = () => {
  emit("delete", {
    date: props.selectedDate,
  });
  props.close();
};

const copy = () => {
  emit("copy");
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
  if (modalRef.value) {
    const rect = modalRef.value.getBoundingClientRect();
    modalWidth.value = rect.width;
    modalHeight.value = rect.height;
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
</script>
