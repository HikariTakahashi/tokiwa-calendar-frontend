<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="flex justify-center items-center text-xl font-bold">
      スケジュール生成ジェネレーター
    </h1>

    <div class="flex items-center gap-x-4">
      <h2 class="text-xl font-bold">
        {{ currentYear }}年 {{ currentMonth }}月
      </h2>
      <buttons-circle @click="$emit('prev-month')">
        <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="$emit('next-month')">
        <Icon name="ic:baseline-arrow-forward-ios" class="size-5" />
      </buttons-circle>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentYear: Number,
  currentMonth: Number,
});

defineEmits(["next-month", "prev-month"]);
</script>
