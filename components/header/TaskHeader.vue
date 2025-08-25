<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2 relative bg-white border-b border-gray-200 shadow-sm"
  >
    <div class="flex flex-row items-center gap-x-2 w-full sm:w-auto">
      <button
        @click="toggleSideMenu"
        class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 flex-shrink-0 order-1 relative z-50"
        type="button"
      >
        <UIcon name="ic:sharp-density-medium" class="size-5" />
      </button>
      <div
        class="flex flex-row items-center gap-x-2 order-2 flex-1 sm:flex-none sm:justify-start justify-center"
      >
        <Title />
        <h2 class="text-sm sm:text-xl font-bold font-mono">タスク管理モード</h2>
        <h2
          v-if="isSync"
          class="text-blue-500 text-sm sm:text-xl font-bold font-mono"
        >
          同期中
        </h2>
      </div>
    </div>
    <buttons-select
      :view-mode="props.viewMode"
      @view-mode-changed="handleViewModeChanged"
    />
    <div class="flex items-center gap-x-4">
      <div class="border-r border-gray-400 pr-4">
        <CalendarDays
          :current-year="currentYear"
          :current-month="currentMonth"
          @go-to-today="handleGoToToday"
          @go-to-specific-date="handleGoToSpecificDate"
        />
      </div>
      <buttons-circle @click="openForm">
        <UIcon name="ic:baseline-file-upload" class="size-5" />
      </buttons-circle>
      <buttons-circle
        @click="
          props.viewMode === 'year'
            ? prevYear()
            : props.viewMode === 'week'
            ? prevWeek()
            : prevMonth()
        "
      >
        <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
      </buttons-circle>
      <buttons-circle
        @click="
          props.viewMode === 'year'
            ? nextYear()
            : props.viewMode === 'week'
            ? nextWeek()
            : nextMonth()
        "
      >
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
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { TimeSlot } from "@/utils/TimeUtils";
import UploadForm from "@/components/forms/UploadForm.vue";
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
  viewMode?: "year" | "month" | "week";
}>();

const showModal = ref(false);

const handleViewModeChanged = (mode: "year" | "month" | "week") => {
  emit("viewModeChanged", mode);
};

const emit = defineEmits<{
  (e: "openForm"): void;
  (e: "prevMonth"): void;
  (e: "nextMonth"): void;
  (e: "prevYear"): void;
  (e: "nextYear"): void;
  (e: "prevWeek"): void;
  (e: "nextWeek"): void;
  (e: "closeCopyMode"): void;
  (e: "cancelCopyMode"): void;
  (e: "toggleSideMenu"): void;
  (e: "viewModeChanged", mode: "year" | "month" | "week"): void;
  (e: "goToToday"): void;
  (e: "goToSpecificDate", date: string): void;
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

const prevYear = () => {
  emit("prevYear");
};

const nextYear = () => {
  emit("nextYear");
};

const prevWeek = () => {
  emit("prevWeek");
};

const nextWeek = () => {
  emit("nextWeek");
};

const toggleSideMenu = () => {
  emit("toggleSideMenu");
};

const handleGoToToday = () => {
  emit("goToToday");
};

const handleGoToSpecificDate = (date: string) => {
  emit("goToSpecificDate", date);
};

// 右矢印キーで次の月に、左矢印キーで前の月に移動する
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight") {
    nextMonth();
  } else if (e.key === "ArrowLeft") {
    prevMonth();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
