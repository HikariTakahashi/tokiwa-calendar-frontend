<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2 border-b border-gray-300"
  >
    <div class="flex flex-row">
      <div
        class="flex items-center text-2xl font-bold mb-2 sm:mb-0 cursor-pointer"
      >
        <h1 class="text-blue-500 font-mono text-lg sm:text-2xl">Toki</h1>
        <h1 class="text-green-500 font-mono text-lg sm:text-2xl">Wa</h1>
        <h1 class="pl-1 font-mono text-lg sm:text-2xl">Calendar</h1>
      </div>
    </div>
    <div class="flex flex-row">
      <button
        class="relative cursor-pointer transition-all duration-300 ease-in-out group px-1.5 sm:px-4 border-x-2 border-gray-300"
        @click="navigateTo('/')"
      >
        予定調整モード
        <div
          class="absolute bottom-[-9px] left-1/2 w-0 h-1 bg-blue-500 transition-all duration-300 ease-in-out transform -translate-x-1/2 group-hover:w-full"
        />
      </button>
      <button
        class="relative cursor-pointer transition-all duration-300 ease-in-out group mr-1.5 sm:mr-4 px-1.5 sm:px-4 border-r-2 border-gray-300"
      >
        タスク管理モード
        <div
          class="absolute bottom-[-9px] left-1/2 w-0 h-1 bg-green-500 transition-all duration-300 ease-in-out transform -translate-x-1/2 group-hover:w-full"
        />
      </button>
      <button
        @click="openFeedbackForm"
        class="flex items-center gap-x-1 border border-gray-300 rounded-md px-2 py-1 hover:bg-green-300"
      >
        フィードバック<UIcon name="ic:baseline-expand-more" class="size-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
const openFeedbackForm = () => {
  if (process) {
    open(
      "https://docs.google.com/forms/d/e/1FAIpQLSduAOVCp2FszfpvPr-noE76hLOXq3TluBUiz8VNDO8GnCAOpA/viewform?usp=dialog"
    );
  }
};
</script>
