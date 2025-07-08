<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2"
  >
    <div class="flex flex-row">
      <div
        class="flex items-center text-2xl font-bold mb-2 sm:mb-0 cursor-pointer"
        @click="navigateToWelcome"
      >
        <h1 class="text-blue-500 font-mono text-lg sm:text-2xl">Toki</h1>
        <h1 class="text-green-500 font-mono text-lg sm:text-2xl">Wa</h1>
        <h1 class="pl-1 font-mono text-lg sm:text-2xl">Calendar</h1>
      </div>
      <h2 class="pl-3 text-sm sm:text-xl font-bold font-mono">
        予定調整モード
      </h2>
      <h2 class="text-blue-500 pl-3 sm:text-xl font-bold font-mono">同期中</h2>
    </div>

    <div class="flex items-center gap-x-4">
      <div class="border-r border-gray-400 pr-4">
        <CalendarDays
          :current-year="currentYear"
          :current-month="currentMonth"
        />
      </div>
      <buttons-circle :isUse="false">
        <UIcon name="ic:baseline-file-upload" class="size-5" />
      </buttons-circle>
      <buttons-circle :isUse="false">
        <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
      </buttons-circle>
      <buttons-circle :isUse="false">
        <UIcon name="ic:baseline-arrow-forward-ios" class="size-5" />
      </buttons-circle>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeSlot } from "@/utils/TimeUtils";
import { useRouter } from "vue-router";

const props = defineProps<{
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  currentWeek: number;
  timeData: {
    [key: string]: TimeSlot | TimeSlot[];
  };
  spaceId: string;
}>();

const router = useRouter();

const navigateToWelcome = () => {
  router.push("/welcome");
};
</script>
