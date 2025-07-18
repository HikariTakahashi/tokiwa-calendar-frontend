<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2 relative"
  >
    <div class="flex flex-row items-center gap-x-2 w-full sm:w-auto">
      <button
        @click="openMenu"
        class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 flex-shrink-0 order-1"
      >
        <UIcon name="ic:sharp-density-medium" class="size-5" />
      </button>
      <div
        class="flex flex-row items-center gap-x-2 order-2 flex-1 sm:flex-none sm:justify-start justify-center"
      >
        <Title />
        <h2 class="text-sm sm:text-xl font-bold font-mono">予定調整モード</h2>
        <h2
          v-if="isSync"
          class="text-blue-500 text-sm sm:text-xl font-bold font-mono"
        >
          同期中
        </h2>
      </div>
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
      :space-id="spaceId"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TimeSlot } from "@/utils/TimeUtils";
import UploadForm from "@/components/forms/UploadForm.vue";
import { useRouter } from "vue-router";
import Title from "@/components/calendar/Title.vue";

const props = defineProps<{
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  currentWeek: number;
  isSync: boolean;
  timeData: {
    [key: string]: TimeSlot | TimeSlot[];
  };
  spaceId: string;
}>();

const showModal = ref(false);
const router = useRouter();

const emit = defineEmits<{
  (e: "openForm"): void;
  (e: "prevMonth"): void;
  (e: "nextMonth"): void;
  (e: "closeCopyMode"): void;
  (e: "cancelCopyMode"): void;
  (e: "toggleSideMenu"): void;
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

const openMenu = () => {
  emit("toggleSideMenu");
};
</script>
