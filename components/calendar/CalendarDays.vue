<template>
  <!-- 日付の表示方式を変更できるよう将来的に変更 -->
  <h2 class="text-2xl font-bold">{{ currentYear }}年 {{ currentMonth }}月</h2>
</template>

<script setup>
const props = defineProps({
  currentYear: Number,
  currentMonth: Number,
  currentDay: Number,
  currentWeek: Number,
});
</script>
