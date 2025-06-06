<template>
  <div
    ref="modalRef"
    v-if="isOpen"
    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-white rounded shadow-lg"
    :style="modalStyle"
  >
    <div
      class="flex items-center py-1 px-2 border-b-2 hover:bg-gray-100 cursor-move"
      @mousedown="startDrag"
    >
      <div class="flex flex-row justify-between w-full">
        <div v-if="hasTimeData" class="flex gap-x-2">
          <!--あとで実装する-->
          <!-- <button
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
          </button> -->
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
        <div :class="{ 'ml-auto': !hasTimeData }">
          <button
            @click="closeModal"
            class="py-1.5 px-1.5 flex justify-center items-center"
          >
            <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
          </button>
        </div>
      </div>
    </div>

    <div class="pl-5 pr-2 pt-1 pb-5 rounded-lg w-96 shadow-lg relative">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">
          {{ isCurrentYear ? "" : dateComponents.year + "年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
          {{ dateComponents.day }} 日の時間設定
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="(slot, index) in timeSlots"
          :key="index"
          class="flex items-center gap-2"
        >
          <div class="flex pl-5 justify-center items-center gap-x-2 mb-2">
            <label>開始時刻</label>
            <div class="border-r border-gray-400 pr-2">
              <InputTime
                :minute-interval="5"
                :initial-hours="getHoursFromTime(slot.start)"
                :initial-minutes="getMinutesFromTime(slot.start)"
                @update:time="(time) => updateStartTime(index, time)"
              />
            </div>
            <InputTime
              :minute-interval="5"
              :initial-hours="getHoursFromTime(slot.end)"
              :initial-minutes="getMinutesFromTime(slot.end)"
              @update:time="(time) => updateEndTime(index, time)"
            />
            <label>終了時刻</label>
            <button
              v-if="timeSlots.length > 1"
              @click="removeTimeSlot(index)"
              class="text-red-500 hover:text-red-700"
            >
              <UIcon name="ic:baseline-delete" class="size-5" />
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
        <div class="flex justify-end gap-2 mt-4">
          <buttons-square
            @click="saveTimeSlots"
            label="保存"
            color="bg-blue-200"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import InputTime from "@/components/buttons/InputTime.vue";

const props = defineProps<{
  isOpen: boolean;
  selectedDate: string;
  initialTimeSlots?: TimeSlot[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", date: string, slots: TimeSlot[]): void;
  (e: "delete", date: string): void;
}>();

const {
  timeSlots,
  addTimeSlot,
  removeTimeSlot,
  validateTime,
  validateTimeOrder,
  validateTimeOverlap,
} = useTimeUtils();

const closeModal = () => {
  emit("close");
};

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

const hasTimeData = computed(() => {
  return props.initialTimeSlots && props.initialTimeSlots.length > 0;
});

const saveTimeSlots = () => {
  if (!validateTime(timeSlots.value)) {
    alert("すべての時間を入力してください");
    return;
  }

  const orderValidation = validateTimeOrder(timeSlots.value);
  if (!orderValidation.isValid) {
    alert(orderValidation.errorMessage);
    return;
  }

  const overlapValidation = validateTimeOverlap(timeSlots.value);
  if (!overlapValidation.isValid) {
    alert(overlapValidation.errorMessage);
    return;
  }

  emit("save", props.selectedDate, timeSlots.value);
  closeModal();
};

const getHoursFromTime = (time: string): number => {
  if (!time) return 0;
  return parseInt(time.split(":")[0], 10);
};

const getMinutesFromTime = (time: string): number => {
  if (!time) return 0;
  return parseInt(time.split(":")[1], 10);
};

const updateStartTime = (index: number, time: string) => {
  timeSlots.value[index].start = time;
};

const updateEndTime = (index: number, time: string) => {
  timeSlots.value[index].end = time;
};

const deleteTime = () => {
  emit("delete", props.selectedDate);
  closeModal();
};

onMounted(() => {
  if (props.initialTimeSlots && props.initialTimeSlots.length > 0) {
    timeSlots.value = props.initialTimeSlots;
  }
});

// モーダル移動用の変数
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const modalStyle = ref({
  transform: "translate(-50%, -50%)",
});

const modalRef = ref<HTMLElement | null>(null);
const modalWidth = ref(0);
const modalHeight = ref(0);

const updateModalSize = () => {
  if (modalRef.value) {
    const rect = modalRef.value.getBoundingClientRect();
    modalWidth.value = rect.width;
    modalHeight.value = rect.height;
  }
};

const startDrag = (e: MouseEvent) => {
  e.preventDefault();
  isDragging.value = true;
  updateModalSize();
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
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

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeModal();
  }
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
