<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2"
  >
    <div class="flex items-center text-2xl font-bold mb-2 sm:mb-0">
      <h1 class="text-blue-500 font-mono text-lg sm:text-2xl">Toki</h1>
      <h1 class="text-green-500 font-mono text-lg sm:text-2xl">Wa</h1>
      <h1 class="pl-1 font-mono text-lg sm:text-2xl">Calendar</h1>
      <h2 class="pl-3 text-sm sm:text-xl font-mono">予定調整モード</h2>
      <h2 v-if="isSync" class="text-blue-500 pl-3 sm:text-xl font-mono">
        同期中
      </h2>
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
    <UploadForm
      v-if="showModal"
      @close="closeForm"
      :time-data="timeData"
      :is-sync="isSync"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TimeSlot } from "@/utils/TimeUtils";
import UploadForm from "@/components/forms/UploadForm.vue";

const props = defineProps<{
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  currentWeek: number;
  isSync: boolean;
  timeData: {
    [key: string]: TimeSlot | TimeSlot[];
  };
}>();

const showModal = ref(false);

const emit = defineEmits<{
  (e: "openForm"): void;
  (e: "prevMonth"): void;
  (e: "nextMonth"): void;
  (e: "closeCopyMode"): void;
  (e: "cancelCopyMode"): void;
}>();

const openForm = () => {
  showModal.value = true;
  emit("openForm");
};

const closeForm = () => {
  showModal.value = false;
};

const prevMonth = () => {
  emit("prevMonth");
};

const nextMonth = () => {
  emit("nextMonth");
};
</script>
