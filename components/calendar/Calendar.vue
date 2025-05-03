<template>
  <div class="flex-1 grid grid-cols-7 grid-rows-6 gap-2 h-screen">
    <div
      v-for="day in calendarDays"
      :key="day.date"
      class="flex flex-col items-center border rounded transition-transform duration-200 relative shadow-md"
    >
      <div class="flex items-center justify-center pt-3">
        {{ day.day }}
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  calendarDays: Array,
});
</script>
