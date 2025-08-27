<template>
  <div class="h-full flex flex-col">
    <!-- 固定ヘッダー -->
    <div class="flex-shrink-0 sticky top-0 z-30 bg-white">
      <component
        :is="isCopyMode ? CopyModeHeader : CalendarHeader"
        :current-year="currentYear"
        :current-month="currentMonth"
        :current-day="currentDay"
        :current-week="currentWeek"
        :time-data="timeData"
        :is-sync="false"
        :space-id="spaceId || ''"
        :view-mode="viewModeState.viewMode.value"
        @next-month="handleNextMonth"
        @prev-month="handlePrevMonth"
        @next-year="handleNextYear"
        @prev-year="handlePrevYear"
        @next-week="handleNextWeek"
        @prev-week="handlePrevWeek"
        @view-mode-changed="handleViewModeChanged"
        @close-copy-mode="closeCopyMode"
        @cancel-copy-mode="handleCancelCopyMode"
        @toggleSideMenu="toggleSideMenu"
        @go-to-today="handleGoToToday"
        @go-to-specific-date="handleGoToSpecificDate"
        @open-form="handleOpenForm"
      />
    </div>
    <!-- スクロール可能なコンテンツ -->
    <div class="flex-1 min-h-0 overflow-auto">
      <!-- 年表示 -->
      <CalendarYear
        v-if="viewModeState.isYearView()"
        :year="currentYear"
        :is-copy-mode="isCopyMode"
        :space-id="spaceId"
        :time-data="timeData"
        :show-side-menu="showSideMenu"
        :display-mode="'time'"
        @save="saveTime"
        @delete="deleteTime"
        @update:time-data="updateTimeData"
        @update:is-copy-mode="updateIsCopyMode"
        @cancel-copy-mode="handleCancelCopyMode"
        @toggleSideMenu="toggleSideMenu"
        @import-complete="handleImportComplete"
        @month-selected="handleMonthSelected"
        @open-form="handleOpenForm"
      />

      <!-- 月表示 -->
      <CalendarMonth
        v-else-if="viewModeState.isMonthView()"
        :calendar-days="calendarDays"
        :year="currentYear"
        :month="currentMonth"
        :is-copy-mode="isCopyMode"
        :space-id="spaceId"
        :time-data="timeData"
        :show-side-menu="showSideMenu"
        @save="saveTime"
        @delete="deleteTime"
        @update:time-data="updateTimeData"
        @update:is-copy-mode="updateIsCopyMode"
        @cancel-copy-mode="handleCancelCopyMode"
        @toggleSideMenu="toggleSideMenu"
        @import-complete="handleImportComplete"
        @open-form="handleOpenForm"
      />

      <!-- 週表示 -->
      <CalendarWeek
        v-else-if="viewModeState.isWeekView()"
        :year="currentYear"
        :month="currentMonth"
        :day="currentDay"
        :is-copy-mode="isCopyMode"
        :space-id="spaceId"
        :time-data="timeData"
        :show-side-menu="showSideMenu"
        :display-mode="'time'"
        @save="saveTime"
        @delete="deleteTime"
        @update:time-data="updateTimeData"
        @update:is-copy-mode="updateIsCopyMode"
        @cancel-copy-mode="handleCancelCopyMode"
        @toggleSideMenu="toggleSideMenu"
        @import-complete="handleImportComplete"
        @open-form="handleOpenForm"
      />
    </div>

    <!-- フォームモーダル -->
    <Teleport to="body">
      <!-- デスクトップ用TimeForm -->
      <TimeForm
        v-if="
          showModal && !isTimeSideMenuEditMode && !showTimeSideMenu && !isMobile
        "
        :close="closeForm"
        :selectedDate="selectedDate"
        :year="currentYear"
        :month="currentMonth"
        :existingTime="selectedDate ? timeData.events[selectedDate] || {} : {}"
        :timeData="timeData"
        :is-copy-mode="isCopyMode"
        :allow-other-edit="timeData.allowOtherEdit || false"
        :initial-hour="selectedHour"
        @save="saveTime"
        @delete="deleteTime"
        @copy="handleCopy"
        @cancel-copy-mode="handleCancelCopyMode"
        @preview="handlePreview"
        @open-time-side-menu="handleOpenTimeSideMenu"
      />

      <!-- モバイル用TimeForm -->
      <MobileTimeForm
        v-if="
          showModal && !isTimeSideMenuEditMode && !showTimeSideMenu && isMobile
        "
        :show="showModal"
        :selectedDate="selectedDate"
        :year="currentYear"
        :month="currentMonth"
        :existingTime="selectedDate ? timeData.events[selectedDate] || {} : {}"
        :timeData="timeData"
        :is-copy-mode="isCopyMode"
        :allow-other-edit="timeData.allowOtherEdit || false"
        :initial-hour="selectedHour"
        @save="saveTime"
        @delete="deleteTime"
        @copy="handleCopy"
        @preview="handlePreview"
        @close="closeForm"
      />
    </Teleport>

    <!-- TimeSideMenu -->
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
      @save="saveTime"
      @delete="deleteTime"
      @copy="handleCopy"
      @preview="handlePreview"
      @close="closeTimeSideMenu"
      @editModeChanged="handleTimeSideMenuEditModeChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import CalendarHeader from "@/components/header/CalendarHeader.vue";
import CopyModeHeader from "@/components/header/CopyModeHeader.vue";
import CalendarMonth from "@/components/calendar/CalendarMonth.vue";
import CalendarWeek from "@/components/calendar/CalendarWeek.vue";
import CalendarYear from "@/components/calendar/CalendarYear.vue";
import TimeForm from "@/components/forms/TimeForm.vue";
import MobileTimeForm from "@/components/forms/MobileTimeForm.vue";
import TimeSideMenu from "@/components/sidemenu/TimeSideMenu.vue";

import { useDateUtils } from "@/utils/DateUtils";
import { useViewMode, createViewModeHandlers } from "@/utils/ViewModeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import type { TimeData } from "@/composables/useAPI";

const {
  currentYear,
  currentMonth,
  currentDay,
  currentWeek,
  getCalendarDays,
  nextMonth,
  prevMonth,
  nextYear,
  prevYear,
  nextWeek,
  prevWeek,
} = useDateUtils();

const timeData = ref<TimeData>({
  events: {},
  spaceId: "",
  username: "",
  userColor: "",
});
const isCopyMode = ref(false);
const showSideMenu = ref(false);
const spaceId = ref<string | undefined>(undefined);

// フォーム関連の状態
const showModal = ref(false);
const selectedDate = ref<string>("");
const selectedHour = ref<number | undefined>(undefined);
const isMobile = ref(false);
const showTimeSideMenu = ref(false);
const isTimeSideMenuEditMode = ref(false);

// TimeSideMenu関連の状態
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

// 表示方法の管理
const viewModeState = useViewMode("month");
const calendarDays = ref(
  getCalendarDays(currentYear.value, currentMonth.value)
);

const updateTimeData = (newTimeData: TimeData) => {
  timeData.value = newTimeData;
};

const updateIsCopyMode = (value: boolean) => {
  isCopyMode.value = value;
};

const closeCopyMode = () => {
  isCopyMode.value = false;
};

const handleNextMonth = () => {
  nextMonth();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const handlePrevMonth = () => {
  prevMonth();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const handleNextYear = () => {
  nextYear();
};

const handlePrevYear = () => {
  prevYear();
};

const handleNextWeek = () => {
  nextWeek();
};

const handlePrevWeek = () => {
  prevWeek();
};

// 表示方法のハンドラー
const { handleViewModeChanged, handleMonthSelected } = createViewModeHandlers(
  viewModeState,
  {
    onMonthSelected: (month: number) => {
      currentMonth.value = month;
      calendarDays.value = getCalendarDays(
        currentYear.value,
        currentMonth.value
      );
    },
  }
);

const saveTime = ({
  date,
  timeSlots,
}: {
  date: string;
  timeSlots: TimeSlot[];
}) => {
  timeData.value.events[date] = timeSlots;
};

const deleteTime = (data: {
  date: string;
  keepUserData?: boolean;
  userTimeSlots?: TimeSlot[];
}) => {
  if (
    data.keepUserData &&
    data.userTimeSlots &&
    data.userTimeSlots.length > 0
  ) {
    timeData.value.events[data.date] = data.userTimeSlots;
  } else {
    delete timeData.value.events[data.date];
  }
};

const toggleSideMenu = () => {
  showSideMenu.value = !showSideMenu.value;
};

const handleImportComplete = (importedData: any[]) => {
  const updatedEvents = { ...timeData.value.events };

  importedData.forEach((item) => {
    const { date, timeSlots } = item;
    if (timeSlots && timeSlots.length > 0) {
      updatedEvents[date] = timeSlots;
    }
  });

  timeData.value = {
    ...timeData.value,
    events: updatedEvents,
  };
};

const handleGoToToday = () => {
  const today = new Date();
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth() + 1;
  currentDay.value = today.getDate();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const handleGoToSpecificDate = (date: string) => {
  const selectedDate = new Date(date);
  currentYear.value = selectedDate.getFullYear();
  currentMonth.value = selectedDate.getMonth() + 1;
  currentDay.value = selectedDate.getDate();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

// フォーム関連のハンドラー
const closeForm = () => {
  showModal.value = false;
  selectedHour.value = undefined;
};

const handleCopy = () => {
  // コピーモードの処理
  isCopyMode.value = true;
  showModal.value = false;
};

const handlePreview = (data: { date: string; timeSlots: TimeSlot[] }) => {
  // プレビュー処理
  console.log("Preview:", data);
};

const handleOpenTimeSideMenu = (data: any) => {
  // TimeSideMenuを開く処理
  timeSideMenuData.value = {
    selectedDate: data.selectedDate,
    year: data.year,
    month: data.month,
    day: data.day,
    existingTime: data.existingTime,
    isCopyMode: data.isCopyMode,
    allowOtherEdit: data.allowOtherEdit,
    initialHour: data.initialHour,
  };
  showTimeSideMenu.value = true;
  showModal.value = false;
};

const closeTimeSideMenu = () => {
  showTimeSideMenu.value = false;
  isTimeSideMenuEditMode.value = false;
};

const handleTimeSideMenuEditModeChanged = (isEditMode: boolean) => {
  isTimeSideMenuEditMode.value = isEditMode;
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
};

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// カレンダーコンポーネントからのフォーム開要求を処理
const handleOpenForm = (data: { date: string; hour?: number }) => {
  selectedDate.value = data.date;
  selectedHour.value = data.hour;
  showModal.value = true;
};

// コンポーネントマウント時にモバイル判定を実行
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>
