<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2 border-b border-gray-300"
  >
    <div class="flex flex-row">
      <Title />
    </div>
    <div class="flex flex-row">
      <button
        class="relative cursor-pointer transition-all duration-300 ease-in-out group px-1.5 sm:px-4 border-x-2 border-gray-300"
        @click="navigateTo('/')"
      >
        <h6 class="text-xs sm:text-base">予定調整モード</h6>
        <div
          class="absolute bottom-[-9px] left-1/2 w-0 h-1 bg-blue-500 transition-all duration-300 ease-in-out transform -translate-x-1/2 group-hover:w-full"
        />
      </button>
      <button
        class="relative cursor-pointer transition-all duration-300 ease-in-out group mr-1.5 sm:mr-4 px-1.5 sm:px-4 border-r-2 border-gray-300"
        @click="navigateTo('/task')"
      >
        <h6 class="text-xs sm:text-base">タスク管理モード</h6>
        <div
          class="absolute bottom-[-9px] left-1/2 w-0 h-1 bg-green-500 transition-all duration-300 ease-in-out transform -translate-x-1/2 group-hover:w-full"
        />
      </button>
      <button
        @click="openFeedbackForm"
        class="flex items-center gap-x-1 border border-gray-300 rounded-md px-2 py-1 hover:bg-green-300"
      >
        <h6 class="text-xs sm:text-base">フィードバック</h6>
        <UIcon name="ic:baseline-expand-more" class="size-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
import Title from "@/components/calendar/Title.vue";

const openFeedbackForm = () => {
  if (typeof window !== "undefined") {
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSduAOVCp2FszfpvPr-noE76hLOXq3TluBUiz8VNDO8GnCAOpA/viewform?usp=dialog",
      "_blank",
      "noopener,noreferrer"
    );
  }
};
</script>
