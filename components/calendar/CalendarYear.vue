<template>
  <div class="relative max-h-full flex flex-col z-10">
    <SideMenu
      :show="props.showSideMenu"
      @toggleSideMenu="toggleSideMenu"
      @import-complete="handleImportComplete"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="[
        props.showSideMenu && !isMobile ? 'ml-80' : 'ml-0',
        showTimeSideMenu && !isMobile ? 'mr-96' : 'mr-0',
      ]"
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
                class="aspect-square text-xs flex items-center justify-center border rounded cursor-pointer"
                :class="[
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-400',
                  day.isToday ? 'border-green-500 border-2 font-bold' : '',
                  hasEvents(day.date) && day.isCurrentMonth
                    ? 'border-blue-500 border-2'
                    : 'border-gray-200',
                ]"
                @click="openForm(day.date)"
              >
                {{ day.dayNumber }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月選択時のモーダル -->
    <!-- デスクトップ用TimeForm -->
    <TimeForm
      v-if="
        showModal && !isTimeSideMenuEditMode && !showTimeSideMenu && !isMobile
      "
      :close="closeForm"
      :selectedDate="selectedDate"
      :year="year"
      :month="selectedMonth"
      :existingTime="
        selectedDate ? props.timeData.events[selectedDate] || {} : {}
      "
      :timeData="props.timeData"
      :isCopyMode="props.isCopyMode"
      :allowOtherEdit="props.timeData.allowOtherEdit || false"
      :startDate="
        props.timeData.startDate && props.timeData.startDate !== null
          ? props.timeData.startDate
          : undefined
      "
      :endDate="
        props.timeData.endDate && props.timeData.endDate !== null
          ? props.timeData.endDate
          : undefined
      "
      @save="onSave"
      @delete="onDelete"
      @copy="handleCopy"
      @cancel-copy-mode="handleCancelCopyMode"
      @openTimeSideMenu="handleOpenTimeSideMenu"
    />

    <!-- モバイル用TimeForm -->
    <MobileTimeForm
      v-if="
        showModal && !isTimeSideMenuEditMode && !showTimeSideMenu && isMobile
      "
      :show="showModal"
      :selectedDate="selectedDate"
      :year="year"
      :month="selectedMonth"
      :existingTime="
        selectedDate ? props.timeData.events[selectedDate] || {} : {}
      "
      :timeData="props.timeData"
      :isCopyMode="props.isCopyMode"
      :allowOtherEdit="props.timeData.allowOtherEdit || false"
      :startDate="
        props.timeData.startDate && props.timeData.startDate !== null
          ? props.timeData.startDate
          : undefined
      "
      :endDate="
        props.timeData.endDate && props.timeData.endDate !== null
          ? props.timeData.endDate
          : undefined
      "
      @save="onSave"
      @delete="onDelete"
      @copy="handleCopy"
      @preview="handlePreview"
      @close="closeForm"
    />
  </div>

  <TimeSideMenu
    v-if="showTimeSideMenu"
    :show="showTimeSideMenu"
    :selectedDate="timeSideMenuData.selectedDate"
    :year="timeSideMenuData.year"
    :month="timeSideMenuData.month"
    :day="timeSideMenuData.day"
    :existingTime="timeSideMenuData.existingTime"
    :isCopyMode="timeSideMenuData.isCopyMode"
    :allowOtherEdit="timeSideMenuData.allowOtherEdit"
    :initialHour="timeSideMenuData.initialHour"
    @save="onSave"
    @delete="onDelete"
    @copy="handleCopy"
    @preview="handlePreview"
    @close="closeTimeSideMenu"
    @editModeChanged="handleTimeSideMenuEditModeChanged"
  />
</template>

<script setup lang="ts">
import TimeForm from "@/components/forms/TimeForm.vue";
import MobileTimeForm from "@/components/forms/MobileTimeForm.vue";
import TimeSideMenu from "@/components/sidemenu/TimeSideMenu.vue";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { type TimeData } from "@/composables/useAPI";
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

const showModal = ref(false);
const selectedDate = ref<string>("");
const selectedMonth = ref<number>(1);
const isMobile = ref(false);
const showTimeSideMenu = ref(false);
const isTimeSideMenuEditMode = ref(false);
const timeSideMenuData = ref({
  selectedDate: "",
  year: 0,
  month: 0,
  day: 0,
  existingTime: {},
  isCopyMode: false,
  allowOtherEdit: false,
  initialHour: undefined as number | undefined,
});

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
  handleCopy: copyLogic,
  handleCancelCopyMode: cancelCopyLogic,
  handlePaste,
} = useCopyLogic();

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

const selectMonth = (month: number) => {
  // TimeSideMenuが開いている場合は、月選択を無効にする
  if (showTimeSideMenu.value || isTimeSideMenuEditMode.value) {
    return;
  }

  selectedMonth.value = month;
  emit("month-selected", month);
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
    // TimeSideMenuが開いている場合は、TimeSideMenuの日付を更新
    if (showTimeSideMenu.value) {
      timeSideMenuData.value.selectedDate = date;
      // 既存の時間データを更新
      timeSideMenuData.value.existingTime = props.timeData.events[date] || {};
      return;
    }

    // TimeFormが開いている場合は、TimeFormの日付を更新
    if (showModal.value) {
      selectedDate.value = date;
      return;
    }

    // どちらも開いていない場合は、TimeFormを開く
    selectedDate.value = date;
    showModal.value = true;
  }
};

const onSave = async (data: { date: string; timeSlots: TimeSlot[] }) => {
  // 親コンポーネントに保存イベントを送信
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

const handleOpenTimeSideMenu = (data: any) => {
  // dayがundefinedの場合はselectedDateから抽出
  let day = data.day;
  if (day === undefined && data.selectedDate) {
    const dateParts = data.selectedDate.split("-");
    day = parseInt(dateParts[2], 10);
  }

  timeSideMenuData.value = {
    selectedDate: data.selectedDate,
    year: data.year,
    month: data.month,
    day: day,
    existingTime: data.existingTime,
    isCopyMode: data.isCopyMode,
    allowOtherEdit: data.allowOtherEdit,
    initialHour: data.initialHour,
  };
  showTimeSideMenu.value = true;

  // TimeFormを閉じる
  showModal.value = false;
};

const closeTimeSideMenu = () => {
  showTimeSideMenu.value = false;
};

const handleTimeSideMenuEditModeChanged = (isEditMode: boolean) => {
  isTimeSideMenuEditMode.value = isEditMode;

  // 編集モードが開始された時は、TimeFormを確実に閉じる
  if (isEditMode) {
    showModal.value = false;
  }
};

const handlePreview = (data: { date: string; timeSlots: TimeSlot[] }) => {
  // プレビュー処理を実装（必要に応じて）
  console.log("Preview:", data);
};

// TimeSideMenuの編集モードを検証する関数
const isTimeSideMenuInEditMode = () => {
  return isTimeSideMenuEditMode.value;
};

// TimeSideMenuが開かれた時にshowModalを確実にfalseにする
watch(
  () => showTimeSideMenu.value,
  (newShow) => {
    if (newShow) {
      showModal.value = false;
    }
  }
);
</script>
