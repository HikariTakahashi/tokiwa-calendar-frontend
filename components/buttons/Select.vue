<template>
  <div class="flex flex-row items-center px-2 mb-2 sm:mb-0">
    <button
      @click="handleYearView"
      class="text-sm sm:text-lg border-r border-y border-l rounded-l-md border-gray-300 px-2 py-1 hover:bg-gray-200"
      :class="currentViewMode === 'year' ? 'bg-gray-200 ' : ''"
    >
      年
    </button>
    <button
      @click="handleMonthView"
      class="text-sm sm:text-lg border-r border-y border-gray-300 px-2 py-1 hover:bg-gray-200"
      :class="currentViewMode === 'month' ? 'bg-gray-200 ' : ''"
    >
      月
    </button>
    <button
      @click="handleWeekView"
      class="text-sm sm:text-lg border-r border-y rounded-r-md border-gray-300 px-2 py-1 hover:bg-gray-200"
      :class="currentViewMode === 'week' ? 'bg-gray-200 ' : ''"
    >
      週
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  viewMode?: "year" | "month" | "week";
}>();

const emit = defineEmits<{
  (e: "viewModeChanged", mode: "year" | "month" | "week"): void;
}>();

// viewModeがundefinedの場合は'month'をデフォルトとする
const currentViewMode = computed(() => {
  return props.viewMode || "month";
});

const handleYearView = () => {
  emit("viewModeChanged", "year");
};

const handleMonthView = () => {
  emit("viewModeChanged", "month");
};

const handleWeekView = () => {
  emit("viewModeChanged", "week");
};
</script>
