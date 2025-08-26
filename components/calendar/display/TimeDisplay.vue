<template>
  <div
    v-if="timeData.events[date]"
    class="text-center text-xs sm:text-sm font-bold w-full flex flex-col min-h-0"
  >
    <div
      class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
    >
      <template v-for="(slot, index) in getTimeSlots(date)" :key="index">
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
</template>

<script setup lang="ts">
import { useTimeUtils } from "@/utils/TimeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import type { TimeData } from "@/composables/useAPI";

interface Props {
  date: string;
  timeData: TimeData;
}

const props = defineProps<Props>();

const { formatTimeForDisplay } = useTimeUtils();

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
</script>
