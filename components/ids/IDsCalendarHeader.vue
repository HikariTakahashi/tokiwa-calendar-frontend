<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2"
  >
    <div class="flex items-center text-2xl font-bold mb-2 sm:mb-0">
      <h1 class="text-blue-500 font-mono text-lg sm:text-2xl">Toki</h1>
      <h1 class="text-green-500 font-mono text-lg sm:text-2xl">Wa</h1>
      <h1 class="pl-1 font-mono text-lg sm:text-2xl">Calendar</h1>
      <h2 class="pl-3 text-sm sm:text-xl font-mono">予定調整モード</h2>
      <h2 class="text-blue-500 pl-3 sm:text-xl font-mono">同期中</h2>
    </div>

    <div class="flex items-center gap-x-4">
      <div class="border-r border-gray-400 pr-4">
        <CalendarDays
          :current-year="currentYear"
          :current-month="currentMonth"
        />
      </div>
      <buttons-circle @click="openForm">
        <UIcon name="ic:baseline-file-upload" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="prevMonth">
        <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="nextMonth">
        <UIcon name="ic:baseline-arrow-forward-ios" class="size-5" />
      </buttons-circle>
    </div>
  </div>
  <Teleport to="body">
    <IDsUploadForm
      v-if="showForm"
      :timeData="timeData"
      @close="showForm = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { TimeSlot } from "@/utils/TimeUtils";

const props = defineProps<{
  currentYear: number;
  currentMonth: number;
  timeData: {
    [key: string]: TimeSlot | TimeSlot[];
  };
}>();

const showForm = ref(false);

const emit = defineEmits<{
  (e: "openForm"): void;
  (e: "prevMonth"): void;
  (e: "nextMonth"): void;
}>();

const openForm = () => {
  showForm.value = true;
  emit("openForm");
};

const prevMonth = () => {
  emit("prevMonth");
};

const nextMonth = () => {
  emit("nextMonth");
};
</script>
