<template>
  <div class="relative h-full flex flex-col">
    <!-- サイドメニューをヘッダーの下、カレンダーの左側に配置 -->
    <SideMenu
      :show="props.showSideMenu"
      @toggleSideMenu="toggleSideMenu"
      @import-complete="handleImportComplete"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="props.showSideMenu && !isMobile ? 'ml-80' : 'ml-0'"
    >
      <CalendarWeek />
      <div
        class="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-2 flex-1 sm:p-1.5 min-h-0"
      >
        <div
          v-for="date in calendarDays"
          :key="date.date"
          class="flex flex-col items-center border rounded transition-transform duration-200 shadow-md"
          :class="[
            isCurrentMonth(date.date) ? '' : 'bg-gray-100',
            props.isCopyMode ? 'cursor-pointer' : '',
            props.isCopyMode && date.date === selectedDate
              ? 'border-8 border-dashed border-blue-500'
              : '',
            props.isCopyMode &&
            props.timeData.events[date.date] === copiedTimeData
              ? 'border-8 border-blue-500'
              : '',
            props.isCopyMode &&
            hasUsernameInDate(date.date) &&
            isPastedDate(date.date)
              ? 'border-8 border-blue-500'
              : '',
            isDateDisabled(date.date)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'hover:-translate-y-1',
          ]"
          @click="openForm(date.date)"
        >
          <div
            class="flex items-center justify-center sm:mt-1 font-bold"
            :class="[
              isCurrentMonth(date.date) ? 'text-gray-700' : 'text-gray-400',
              isDateDisabled(date.date) ? 'text-white' : '',
              isToday(date.date)
                ? 'bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                : '',
            ]"
          >
            {{ new Date(date.date).getDate() }}
          </div>
          <div
            v-if="props.timeData.events[date.date]"
            class="text-center text-xs sm:text-sm font-bold w-full flex flex-col min-h-0"
          >
            <div
              class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
            >
              <template
                v-for="(slot, index) in getTimeSlots(date.date)"
                :key="index"
              >
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
              </template>
            </div>
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
      :existingTime="
        selectedDate ? props.timeData.events[selectedDate] || {} : {}
      "
      :isCopyMode="props.isCopyMode"
      :allowOtherEdit="props.timeData.allowOtherEdit || false"
      @save="onSave"
      @delete="onDelete"
      @copy="handleCopy"
      @cancel-copy-mode="handleCancelCopyMode"
    />
  </div>
</template>

<script setup lang="ts">
import TimeForm from "@/components/forms/TimeForm.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { useAPI, type TimeData } from "@/composables/useAPI";
import CalendarWeek from "@/components/calendar/CalendarWeeks.vue";
import SideMenu from "@/components/calendar/SideMenu.vue";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface Props {
  calendarDays: CalendarDay[];
  year: number;
  month: number;
  isCopyMode: boolean;
  spaceId?: string;
  timeData: TimeData;
  showSideMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSideMenu: false,
});
const emit = defineEmits<{
  (e: "save", data: { date: string; timeSlots: TimeSlot[] }): void;
  (e: "delete", data: { date: string }): void;
  (e: "update:time-data", data: TimeData): void;
  (e: "update:is-copy-mode", value: boolean): void;
  (e: "cancel-copy-mode"): void;
  (e: "toggleSideMenu"): void;
  (e: "import-complete", data: any[]): void;
}>();

const { formatTimeForDisplay } = useTimeUtils();
const showModal = ref(false);
const selectedDate = ref<string>("");
const isMobile = ref(false);

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// コンポーネントマウント時とリサイズ時に判定
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

const {
  copiedTimeData,
  handleCopy: copyLogic,
  handlePaste,
  handleCancelCopyMode: cancelCopyLogic,
  pastedDates,
} = useCopyLogic();

const { fetchSpaceData, syncTimeData } = useAPI();

const onSave = async (data: { date: string; timeSlots: TimeSlot[] }) => {
  emit("save", data);
};

const onDelete = async (data: {
  date: string;
  keepUserData?: boolean;
  userTimeSlots?: TimeSlot[];
}) => {
  emit("delete", data);
};

const handleImportComplete = (importedData: any[]) => {
  const updatedEvents = { ...props.timeData.events };

  importedData.forEach((item) => {
    const { date, timeSlots } = item;
    if (timeSlots && timeSlots.length > 0) {
      updatedEvents[date] = timeSlots;
    }
  });

  const updatedTimeData = {
    ...props.timeData,
    events: updatedEvents,
  };

  emit("update:time-data", updatedTimeData);
};

const isCurrentMonth = (dateString: string): boolean => {
  const d = new Date(dateString);
  return d.getFullYear() === props.year && d.getMonth() + 1 === props.month;
};

const openForm = (date: string) => {
  if (isDateDisabled(date)) {
    return;
  }

  if (props.isCopyMode) {
    const result = handlePaste(date, props.timeData.events);
    if (result.isPasted) {
      const updatedTimeData = {
        ...props.timeData,
        events: result.timeData,
      };
      emit("update:time-data", updatedTimeData);
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
  const result = copyLogic(selectedDate.value, props.timeData.events);
  emit("update:is-copy-mode", result.isCopyMode);
  showModal.value = false;
};

const handleCancelCopyMode = () => {
  const result = cancelCopyLogic(props.timeData.events);
  const updatedTimeData = {
    ...props.timeData,
    events: result.timeData,
  };
  emit("update:time-data", updatedTimeData);
  emit("update:is-copy-mode", result.isCopyMode);
};

const getTimeSlots = (date: string): TimeSlot[] => {
  const slots = props.timeData.events[date];

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

const hasUsernameInDate = (date: string): boolean => {
  const timeSlot = props.timeData.events[date];
  if (!timeSlot) return false;

  if (Array.isArray(timeSlot)) {
    return timeSlot.some((slot: TimeSlot) => !!slot.username);
  }
  return !!(timeSlot as TimeSlot).username;
};

const isPastedDate = (date: string): boolean => {
  return pastedDates.value.has(date);
};

const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isDateDisabled = (date: string): boolean => {
  const selectedDate = new Date(date);

  if (props.timeData.startDate) {
    const startDate = new Date(props.timeData.startDate);
    if (selectedDate < startDate) {
      return true;
    }
  }

  if (props.timeData.endDate) {
    const endDate = new Date(props.timeData.endDate);
    if (selectedDate > endDate) {
      return true;
    }
  }

  return false;
};

const toggleSideMenu = () => {
  emit("toggleSideMenu");
};
</script>
