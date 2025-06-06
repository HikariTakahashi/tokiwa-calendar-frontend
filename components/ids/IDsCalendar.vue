<template>
  <div class="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-2 h-full sm:p-1.5">
    <div
      v-for="date in calendarDays"
      :key="date.date"
      class="flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 shadow-md min-h-[100px] cursor-pointer"
      :class="[isCurrentMonth(date.date) ? '' : 'bg-gray-100']"
      @click="$emit('open-time-form', date.date)"
    >
      <div
        class="flex items-center justify-center pt-2"
        :class="[isCurrentMonth(date.date) ? 'text-black' : 'text-gray-500']"
      >
        {{ new Date(date.date).getDate() }}
      </div>
      <div
        v-if="timeData[date.date]"
        class="text-center text-xs sm:text-sm font-bold text-blue-500 w-full flex flex-col min-h-0 p-1"
      >
        <div
          class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
        >
          {{ formatTimeForDisplay(getTimeSlots(date.date)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTimeUtils } from "@/utils/TimeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface TimeData {
  [key: string]: TimeSlot | TimeSlot[];
}

interface Props {
  calendarDays: CalendarDay[];
  timeData: TimeData;
  currentYear: number;
  currentMonth: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "open-time-form", date: string): void;
}>();

const { formatTimeForDisplay } = useTimeUtils();

const isCurrentMonth = (dateString: string): boolean => {
  const d = new Date(dateString);
  return (
    d.getFullYear() === props.currentYear &&
    d.getMonth() + 1 === props.currentMonth
  );
};

const getTimeSlots = (date: string): TimeSlot[] => {
  const slots = props.timeData[date];
  if (!slots) return [];

  const convertedSlots = Array.isArray(slots) ? slots : [slots];
  return convertedSlots.map((slot) => ({
    start: (slot as any).Start || (slot as any).start,
    end: (slot as any).End || (slot as any).end,
    order: (slot as any).order || 1,
  }));
};
</script>
