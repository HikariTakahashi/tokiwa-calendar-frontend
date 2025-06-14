<template>
  <div class="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-2 h-full sm:p-1.5">
    <div
      v-for="date in calendarDays"
      :key="date.date"
      class="flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 shadow-md"
      :class="[
        isCurrentMonth(date.date) ? '' : 'bg-gray-100',
        props.isCopyMode ? 'cursor-pointer' : '',
        props.isCopyMode && date.date === selectedDate
          ? 'border-8 border-dashed border-blue-500'
          : '',
        props.isCopyMode && timeData[date.date] === copiedTimeData
          ? 'border-8 border-blue-500'
          : '',
        props.isCopyMode &&
        hasUsernameInDate(date.date) &&
        isPastedDate(date.date)
          ? 'border-8 border-blue-500'
          : '',
      ]"
      @click="openForm(date.date)"
    >
      <div
        class="flex items-center justify-center sm:pt-2"
        :class="[isCurrentMonth(date.date) ? 'text-black' : 'text-gray-500']"
      >
        {{ new Date(date.date).getDate() }}
      </div>
      <div
        v-if="timeData[date.date]"
        class="text-center text-xs sm:text-sm font-bold w-full flex flex-col min-h-0"
      >
        <div
          class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
        >
          <template
            v-for="(slot, index) in getTimeSlots(date.date)"
            :key="index"
          >
            <!--ここから下のdivのcssは直接の命令がない限り消去・変更しない-->
            <div
              class="flex flex-col sm:flex-row justify-center items-center sm:gap-x-2"
            >
              <div
                v-if="slot.username"
                class="text-xs mb-1 font-bold"
                :style="{ color: slot.userColor || '#3b82f6' }"
              >
                {{ slot.username }}
              </div>
              <div
                class="text-xs sm:text-sm"
                :style="{ color: slot.userColor || '#3b82f6' }"
              >
                {{ formatTimeForDisplay([slot]) }}
              </div>
            </div>
            <!--ここから上のdivのcssは直接の命令がない限り消去・変更しない-->
          </template>
        </div>
      </div>
    </div>
  </div>

  <TimeForm
    v-if="showModal"
    :close="closeForm"
    :selectedDate="selectedDate"
    :year="year"
    :month="month"
    :existingTime="selectedDate ? timeData[selectedDate] || {} : {}"
    :isCopyMode="props.isCopyMode"
    @save="onSave"
    @delete="onDelete"
    @copy="handleCopy"
    @cancel-copy-mode="handleCancelCopyMode"
  />
</template>

<script setup lang="ts">
import TimeForm from "@/components/forms/TimeForm.vue";
import { ref, onMounted } from "vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { useAPI } from "@/composables/useAPI";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface TimeData {
  [key: string]: TimeSlot | TimeSlot[];
}

interface Props {
  calendarDays: CalendarDay[];
  year: number;
  month: number;
  isCopyMode: boolean;
  spaceId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "save", data: { date: string; timeSlots: TimeSlot[] }): void;
  (e: "delete", data: { date: string }): void;
  (e: "update:time-data", data: TimeData): void;
  (e: "update:is-copy-mode", value: boolean): void;
  (e: "cancel-copy-mode"): void;
}>();

const timeData = ref<TimeData>({});
const { formatTimeForDisplay } = useTimeUtils();
const showModal = ref(false);
const selectedDate = ref<string>("");

const {
  copiedTimeData,
  handleCopy: copyLogic,
  handlePaste,
  handleCancelCopyMode: cancelCopyLogic,
  pastedDates,
} = useCopyLogic();

const { fetchSpaceData, syncTimeData } = useAPI();

const onSave = async (data: { date: string; timeSlots: TimeSlot[] }) => {
  timeData.value[data.date] = data.timeSlots;
  emit("update:time-data", timeData.value);

  // if (props.spaceId) {
  //   await syncDataToAPI();
  // }
};

const onDelete = async (data: {
  date: string;
  keepUserData?: boolean;
  userTimeSlots?: TimeSlot[];
}) => {
  if (data.keepUserData && data.userTimeSlots) {
    // Usernameが存在するデータを保持
    timeData.value[data.date] = data.userTimeSlots;
  } else {
    // すべてのデータを削除
    delete timeData.value[data.date];
  }
  emit("update:time-data", timeData.value);
};

const isCurrentMonth = (dateString: string): boolean => {
  const d = new Date(dateString);
  return d.getFullYear() === props.year && d.getMonth() + 1 === props.month;
};

const openForm = (date: string) => {
  if (props.isCopyMode) {
    const result = handlePaste(date, timeData.value);
    if (result.isPasted) {
      timeData.value = result.timeData;
      emit("update:time-data", timeData.value);
    }
  } else {
    selectedDate.value = date;
    showModal.value = true;
  }
};

const closeForm = () => {
  showModal.value = false;
};

const handleCopy = () => {
  if (!selectedDate.value) return;
  const result = copyLogic(selectedDate.value, timeData.value);
  emit("update:is-copy-mode", result.isCopyMode);
  showModal.value = false;
};

const handleCancelCopyMode = () => {
  const result = cancelCopyLogic(timeData.value);
  timeData.value = result.timeData;
  emit("update:time-data", timeData.value);
  emit("update:is-copy-mode", result.isCopyMode);
};

const getTimeSlots = (date: string): TimeSlot[] => {
  const slots = timeData.value[date];
  if (!slots) return [];

  const convertedSlots = Array.isArray(slots) ? slots : [slots];
  return convertedSlots.map((slot) => ({
    start: (slot as any).Start || (slot as any).start,
    end: (slot as any).End || (slot as any).end,
    order: (slot as any).Order || (slot as any).order || 1,
    username: (slot as any).Username || (slot as any).username,
    userColor: (slot as any).UserColor || (slot as any).userColor,
  }));
};

const getTimeSlotStyle = (date: string) => {
  return {}; // スタイルは各スロットに個別に適用するため、ここでは空のオブジェクトを返す
};

const fetchDataFromAPI = async () => {
  if (!props.spaceId) return;

  try {
    const response = await fetchSpaceData(props.spaceId);
    timeData.value = response.events;
    emit("update:time-data", timeData.value);
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
  }
};

const syncDataToAPI = async () => {
  if (!props.spaceId) return;

  try {
    const response = await syncTimeData(
      {
        events: timeData.value,
        spaceId: props.spaceId,
        username: "",
        userColor: "",
      },
      props.spaceId
    );
    console.log("データの同期が完了しました:", response);
  } catch (error) {
    console.error("データの同期に失敗しました:", error);
  }
};

const hasUsernameInDate = (date: string): boolean => {
  const timeSlot = timeData.value[date];
  if (!timeSlot) return false;

  if (Array.isArray(timeSlot)) {
    return timeSlot.some((slot) => slot.username);
  }
  return !!timeSlot.username;
};

const isPastedDate = (date: string): boolean => {
  return pastedDates.value.has(date);
};

onMounted(() => {
  if (props.spaceId) {
    fetchDataFromAPI();
  }
});
</script>
