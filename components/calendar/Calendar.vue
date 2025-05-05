<template>
  <div class="flex-1 grid grid-cols-7 grid-rows-6 gap-2 h-screen">
    <div
      v-for="date in calendarDays"
      :key="date.date"
      :class="[
        'flex flex-col items-center border rounded transition-transform duration-200 relative shadow-md',
        isCurrentMonth(date.date) ? '' : 'bg-gray-200',
      ]"
    >
      <div class="flex items-center justify-center pt-3">
        {{ new Date(date.date).getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  calendarDays: {
    type: Array,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
});

const isCurrentMonth = (dateString) => {
  const d = new Date(dateString);
  return d.getFullYear() === props.year && d.getMonth() + 1 === props.month;
};
</script>
