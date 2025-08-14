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
        :view-mode="viewMode"
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
      />
    </div>
    <!-- スクロール可能なコンテンツ -->
    <div class="flex-1 min-h-0 overflow-auto">
      <!-- 年表示 -->
      <CalendarYear
        v-if="viewMode === 'year'"
        :year="currentYear"
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
        @month-selected="handleMonthSelected"
      />

      <!-- 月表示 -->
      <CalendarMonth
        v-else-if="viewMode === 'month'"
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
      />

      <!-- 週表示 -->
      <CalendarWeek
        v-else-if="viewMode === 'week'"
        :year="currentYear"
        :month="currentMonth"
        :day="currentDay"
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CalendarHeader from "@/components/header/CalendarHeader.vue";
import CopyModeHeader from "@/components/header/CopyModeHeader.vue";
import CalendarMonth from "@/components/calendar/CalendarMonth.vue";
import CalendarWeek from "@/components/calendar/CalendarWeek.vue";
import CalendarYear from "@/components/calendar/CalendarYear.vue";

import { useDateUtils } from "@/utils/DateUtils";
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
const viewMode = ref<"year" | "month" | "week">("month");
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

const handleViewModeChanged = (mode: "year" | "month" | "week") => {
  viewMode.value = mode;
};

const handleMonthSelected = (month: number) => {
  currentMonth.value = month;
  viewMode.value = "month";
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const saveTime = ({
  date,
  timeSlots,
}: {
  date: string;
  timeSlots: TimeSlot[];
}) => {
  timeData.value.events[date] = timeSlots;
};

const deleteTime = (data: { date: string }) => {
  delete timeData.value.events[data.date];
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
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
</script>
