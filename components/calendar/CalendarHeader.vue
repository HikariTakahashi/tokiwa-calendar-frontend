<template>
  <div class="flex flex-col sm:flex-row justify-between items-center py-1 px-2">
    <div class="flex items-center text-2xl font-bold mb-2 sm:mb-0">
      <h1 class="text-blue-500 font-mono">Toki</h1>
      <h1 class="text-green-500 font-mono">Wa</h1>
      <h1 class="pl-1 font-mono">Calendar</h1>
      <h1 class="pl-3 text-xl font-mono">予定調整モード</h1>
    </div>

    <div class="flex items-center gap-x-4">
      <div class="border-r border-gray-400 pr-4">
        <CalendarDays
          :current-year="currentYear"
          :current-month="currentMonth"
        />
      </div>
      <buttons-circle @click="openForm">
        <UIcon name="ic:outline-download-for-offline" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="$emit('prev-month')">
        <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="$emit('next-month')">
        <UIcon name="ic:baseline-arrow-forward-ios" class="size-5" />
      </buttons-circle>
    </div>
  </div>

  <Teleport to="body">
    <UploadForm v-if="showModal" @close="closeForm" :time-data="timeData" />
  </Teleport>
</template>

<script setup>
import { ref } from "vue";
import UploadForm from "@/components/forms/UploadForm.vue";

defineProps({
  currentYear: Number,
  currentMonth: Number,
  currentDay: Number,
  currentWeek: Number,
  timeData: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(["next-month", "prev-month"]);

const showModal = ref(false);

const openForm = () => {
  showModal.value = true;
};

const closeForm = () => {
  showModal.value = false;
};
</script>
