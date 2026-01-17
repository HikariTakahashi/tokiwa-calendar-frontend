<!-- vscodeのエラーでシンタックスハイライトが効かなくなるのでscriptタグを上に移動 -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDateUtils } from "@/utils/DateUtils";
import { useViewMode, createViewModeHandlers } from "@/utils/ViewModeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import CalendarHeader from "@/components/header/CalendarHeader.vue";
import CopyModeHeader from "@/components/header/CopyModeHeader.vue";
import LoadingHeader from "@/components/header/LoadingHeader.vue";
import CalendarMonth from "@/components/calendar/CalendarMonth.vue";
import CalendarWeek from "@/components/calendar/CalendarWeek.vue";
import CalendarYear from "@/components/calendar/CalendarYear.vue";
import Loading from "@/components/background/loading.vue";

import { useAPI, type TimeData } from "@/composables/useAPI";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

const route = useRoute();
const showIDsUploadForm = ref(false);
const showSideMenu = ref(false);
const isLoading = ref(true);
const timeData = ref<TimeData>({
  events: {},
  spaceId: "",
  username: "",
  userColor: "",
  startDate: null,
  endDate: null,
  allowOtherEdit: false,
});
const calendarDays = ref<CalendarDay[]>([]);
const isCopyMode = ref(false);

// 表示方法の管理
const viewModeState = useViewMode("month");
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

const { fetchSpaceData: fetchSpaceDataFromAPI } = useAPI();

const updateCalendarDays = () => {
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const openForm = () => {
  showIDsUploadForm.value = true;
};

const handleCalendarSave = (data: { date: string; timeSlots: TimeSlot[] }) => {
  timeData.value.events[data.date] = data.timeSlots;
};

const deleteTimeData = (data: {
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

const updateTimeData = (newTimeData: TimeData) => {
  timeData.value = newTimeData;
};

const updateIsCopyMode = (value: boolean) => {
  isCopyMode.value = value;
};

const closeCopyMode = () => {
  isCopyMode.value = false;
};

const toggleSideMenu = () => {
  showSideMenu.value = !showSideMenu.value;
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
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

const handleNextMonth = () => {
  nextMonth();
  updateCalendarDays();
};

const handlePrevMonth = () => {
  prevMonth();
  updateCalendarDays();
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
      updateCalendarDays();
    },
  }
);

const fetchSpaceDataFromServer = async () => {
  try {
    isLoading.value = true;
    const spaceId = route.params.id as string;
    const response = await fetchSpaceDataFromAPI(spaceId);

    if (!response || !response.events) {
      console.warn("APIからのレスポンスが不正です:", response);
      timeData.value = {
        events: {},
        spaceId: "",
        username: "",
        userColor: "",
        startDate: null,
        endDate: null,
        allowOtherEdit: false,
      };
      updateCalendarDays();
      return;
    }

    timeData.value = response;

    // APIデータの期間に基づいてカレンダーの年月を設定
    if (response.events && Object.keys(response.events).length > 0) {
      // データがある日付を取得
      const eventDates = Object.keys(response.events);
      const firstEventDate = new Date(eventDates[0]);
      currentYear.value = firstEventDate.getFullYear();
      currentMonth.value = firstEventDate.getMonth() + 1;
    } else if (response.startDate) {
      const startDate = new Date(response.startDate);
      currentYear.value = startDate.getFullYear();
      currentMonth.value = startDate.getMonth() + 1;
    }

    updateCalendarDays();
  } catch (error) {
    console.error("スペースデータの取得に失敗しました:", error);
    timeData.value = {
      events: {},
      spaceId: "",
      username: "",
      userColor: "",
      startDate: null,
      endDate: null,
      allowOtherEdit: false,
    };
    updateCalendarDays();
  } finally {
    isLoading.value = false;
  }
};

const handleGoToToday = () => {
  const today = new Date();
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth() + 1;
  currentDay.value = today.getDate();
  updateCalendarDays();
};

const handleGoToSpecificDate = (date: string) => {
  const selectedDate = new Date(date);
  currentYear.value = selectedDate.getFullYear();
  currentMonth.value = selectedDate.getMonth() + 1;
  currentDay.value = selectedDate.getDate();
  updateCalendarDays();
};

onMounted(() => {
  fetchSpaceDataFromServer();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 固定ヘッダー -->
    <div class="flex-shrink-0 sticky top-0 z-30 bg-white">
      <!-- ローディング中のヘッダー -->
      <LoadingHeader
        v-if="isLoading"
        :current-year="currentYear"
        :current-month="currentMonth"
        :current-day="currentDay"
        :current-week="currentWeek"
        :time-data="timeData.events"
        :space-id="route.params.id as string"
        @toggleSideMenu="toggleSideMenu"
      />

      <!-- 通常のヘッダー -->
      <!-- コピーモード用ヘッダー -->
      <CopyModeHeader
        v-if="isCopyMode"
        :current-year="currentYear"
        :current-month="currentMonth"
        :current-day="currentDay"
        :current-week="currentWeek"
        :time-data="timeData"
        @next-month="handleNextMonth"
        @prev-month="handlePrevMonth"
        @close-copy-mode="closeCopyMode"
      />

      <!-- 通常のカレンダーヘッダー -->
      <CalendarHeader
        v-else
        :current-year="currentYear"
        :current-month="currentMonth"
        :current-day="currentDay"
        :current-week="currentWeek"
        :is-sync="true"
        :time-data="timeData"
        :space-id="route.params.id as string"
        :view-mode="viewModeState.viewMode.value"
        @next-month="handleNextMonth"
        @prev-month="handlePrevMonth"
        @next-year="handleNextYear"
        @prev-year="handlePrevYear"
        @next-week="handleNextWeek"
        @prev-week="handlePrevWeek"
        @view-mode-changed="handleViewModeChanged"
        @open-form="openForm"
        @cancel-copy-mode="handleCancelCopyMode"
        @toggleSideMenu="toggleSideMenu"
        @go-to-today="handleGoToToday"
        @go-to-specific-date="handleGoToSpecificDate"
      />
    </div>

    <!-- ローディング中のオーバーレイ -->
    <Loading v-if="isLoading" />

    <!-- スクロール可能なコンテンツ -->
    <template v-if="!isLoading">
      <div class="flex-1 min-h-0 overflow-auto">
        <!-- 年表示 -->
        <CalendarYear
          v-if="viewModeState.isYearView()"
          :year="currentYear"
          :is-copy-mode="isCopyMode"
          :space-id="route.params.id as string"
          :time-data="timeData"
          :show-side-menu="showSideMenu"
          @save="handleCalendarSave"
          @delete="deleteTimeData"
          @update:time-data="updateTimeData"
          @update:is-copy-mode="updateIsCopyMode"
          @cancel-copy-mode="handleCancelCopyMode"
          @toggleSideMenu="toggleSideMenu"
          @import-complete="handleImportComplete"
          @month-selected="handleMonthSelected"
        />

        <!-- 月表示 -->
        <CalendarMonth
          v-else-if="viewModeState.isMonthView()"
          :calendar-days="calendarDays"
          :year="currentYear"
          :month="currentMonth"
          :is-copy-mode="isCopyMode"
          :space-id="route.params.id as string"
          :timeData="timeData"
          :show-side-menu="showSideMenu"
          @save="handleCalendarSave"
          @delete="deleteTimeData"
          @update:time-data="updateTimeData"
          @update:is-copy-mode="updateIsCopyMode"
          @cancel-copy-mode="handleCancelCopyMode"
          @toggleSideMenu="toggleSideMenu"
          @import-complete="handleImportComplete"
        />

        <!-- 週表示 -->
        <CalendarWeek
          v-else-if="viewModeState.isWeekView()"
          :year="currentYear"
          :month="currentMonth"
          :day="currentDay"
          :is-copy-mode="isCopyMode"
          :space-id="route.params.id as string"
          :time-data="timeData"
          :show-side-menu="showSideMenu"
          @save="handleCalendarSave"
          @delete="deleteTimeData"
          @update:time-data="updateTimeData"
          @update:is-copy-mode="updateIsCopyMode"
          @cancel-copy-mode="handleCancelCopyMode"
          @toggleSideMenu="toggleSideMenu"
          @import-complete="handleImportComplete"
        />
      </div>
    </template>
  </div>
</template>
