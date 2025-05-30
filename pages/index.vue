<template>
  <div class="h-screen flex flex-col">
    <component
      :is="isCopyMode ? CopyModeHeader : CalendarHeader"
      :current-year="currentYear"
      :current-month="currentMonth"
      :current-day="currentDay"
      :current-week="currentWeek"
      :time-data="timeData"
      @next-month="handleNextMonth"
      @prev-month="handlePrevMonth"
      @close-copy-mode="closeCopyMode"
      @cancel-copy-mode="handleCancelCopyMode"
    />
    <CalendarWeeks />
    <div class="flex-1 overflow-auto sx:py-1">
      <Calendar
        :calendar-days="calendarDays"
        :year="currentYear"
        :month="currentMonth"
        :is-copy-mode="isCopyMode"
        @save="saveTime"
        @delete="deleteTime"
        @update:time-data="updateTimeData"
        @update:is-copy-mode="updateIsCopyMode"
        @cancel-copy-mode="handleCancelCopyMode"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CalendarHeader from "@/components/calendar/CalendarHeader.vue";
import CopyModeHeader from "@/components/calendar/CopyModeHeader.vue";
import Calendar from "@/components/calendar/Calendar.vue";
import { useDateUtils } from "@/utils/DateUtils";

const {
  currentYear,
  currentMonth,
  currentDay,
  currentWeek,
  getCalendarDays,
  nextMonth,
  prevMonth,
} = useDateUtils();
const timeData = ref({});
const isCopyMode = ref(false);
const calendarDays = ref(
  getCalendarDays(currentYear.value, currentMonth.value)
);

const updateTimeData = (newTimeData) => {
  timeData.value = newTimeData;
};

const updateIsCopyMode = (value) => {
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

const saveTime = ({ date, timeSlots }) => {
  timeData.value[date] = timeSlots;
};

const deleteTime = (date) => {
  delete timeData.value[date];
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
};
</script>
