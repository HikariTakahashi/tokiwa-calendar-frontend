<template>
  <div class="relative max-h-full flex flex-col">
    <SideMenu
      :show="props.showSideMenu"
      @toggleSideMenu="toggleSideMenu"
      @import-complete="handleImportComplete"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="props.showSideMenu && !isMobile ? 'ml-80' : 'ml-0'"
    >
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2 flex-1 overflow-y-auto"
      >
        <div
          v-for="month in 12"
          :key="month"
          class="border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          @click="selectMonth(month)"
        >
          <div class="p-2 rounded-t-lg text-center font-bold">
            {{ month }}月
          </div>
          <div class="p-2">
            <CalendarWeeks />
            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="day in getMonthDays(year, month)"
                :key="day.date"
                class="aspect-square text-xs flex items-center justify-center border rounded"
                :class="[
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-400',
                  day.isToday ? 'border-green-500 border-2 font-bold' : '',
                  hasEvents(day.date) && day.isCurrentMonth
                    ? 'border-blue-500 border-2'
                    : 'border-gray-200',
                ]"
              >
                {{ day.dayNumber }}
                <!-- イベントがある場合のインジケーター -->
                <div
                  v-if="hasEvents(day.date)"
                  class="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月選択時のモーダル -->
    <TimeForm
      v-if="showModal"
      :close="closeForm"
      :selectedDate="selectedDate"
      :year="year"
      :month="selectedMonth"
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
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { useAPI, type TimeData } from "@/composables/useAPI";
import SideMenu from "@/components/calendar/SideMenu.vue";

interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface Props {
  year: number;
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
  (e: "month-selected", month: number): void;
}>();

const { formatTimeForDisplay } = useTimeUtils();
const showModal = ref(false);
const selectedDate = ref<string>("");
const selectedMonth = ref<number>(1);
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

// 指定された月の日付を取得
const getMonthDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days: CalendarDay[] = [];

  // 前月の日付を追加
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, -i);
    days.push({
      date: formatDate(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isToday(date),
    });
  }

  // 当月の日付を追加
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month - 1, i);
    days.push({
      date: formatDate(date),
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isToday(date),
    });
  }

  // 次月の日付を追加（6週間分を確保）
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month, i);
    days.push({
      date: formatDate(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isToday(date),
    });
  }

  return days;
};

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const hasEvents = (date: string): boolean => {
  return !!props.timeData.events[date];
};

const getMonthEventCount = (month: number): number => {
  let count = 0;
  const monthStart = new Date(props.year, month - 1, 1);
  const monthEnd = new Date(props.year, month, 0);

  Object.keys(props.timeData.events).forEach((date) => {
    const eventDate = new Date(date);
    if (eventDate >= monthStart && eventDate <= monthEnd) {
      count++;
    }
  });

  return count;
};

const selectMonth = (month: number) => {
  selectedMonth.value = month;
  emit("month-selected", month);
};

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
