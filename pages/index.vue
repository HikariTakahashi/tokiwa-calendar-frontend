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
    <Calendar
      :calendar-days="calendarDays"
      :year="currentYear"
      :month="currentMonth"
      :is-copy-mode="isCopyMode"
      :space-id="spaceId"
      @save="saveTime"
      @delete="deleteTime"
      @update:time-data="updateTimeData"
      @update:is-copy-mode="updateIsCopyMode"
      @cancel-copy-mode="handleCancelCopyMode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CalendarHeader from "@/components/calendar/CalendarHeader.vue";
import CopyModeHeader from "@/components/calendar/CopyModeHeader.vue";
import Calendar from "@/components/calendar/Calendar.vue";
import { useDateUtils } from "@/utils/DateUtils";
import type { TimeSlot } from "@/utils/TimeUtils";

interface TimeData {
  [key: string]: TimeSlot | TimeSlot[];
}

const {
  currentYear,
  currentMonth,
  currentDay,
  currentWeek,
  getCalendarDays,
  nextMonth,
  prevMonth,
} = useDateUtils();

const timeData = ref<TimeData>({});
const isCopyMode = ref(false);
const spaceId = ref<string | undefined>(undefined);
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

const saveTime = ({
  date,
  timeSlots,
}: {
  date: string;
  timeSlots: TimeSlot[];
}) => {
  timeData.value[date] = timeSlots;
};

const deleteTime = (data: { date: string }) => {
  delete timeData.value[data.date];
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
};
</script>
