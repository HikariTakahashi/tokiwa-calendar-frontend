<template>
  <!-- 今日の日付に移動 -->
  <button
    class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center border-b border-gray-200"
    @click="goToToday"
  >
    <span>今日の日付に移動</span>
  </button>

  <!-- 特定の日付に移動 -->
  <div class="px-4 py-2 border-b border-gray-200">
    <div class="mb-2">特定の日付に移動</div>
    <div class="flex gap-2">
      <input
        type="date"
        v-model="selectedDate"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        :max="maxDate"
        :min="minDate"
      />
      <buttons-square @click="confirmDateSelection" color="bg-blue-00">
        移動
      </buttons-square>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const emit = defineEmits<{
  goToToday: [];
  goToSpecificDate: [date: string];
}>();

const selectedDate = ref("");

// 日付の最大値・最小値を設定（例：現在から前後10年）
const maxDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 10);
  return date.toISOString().split("T")[0];
});

const minDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10);
  return date.toISOString().split("T")[0];
});

const goToToday = () => {
  emit("goToToday");
};

const confirmDateSelection = () => {
  if (selectedDate.value) {
    emit("goToSpecificDate", selectedDate.value);
    selectedDate.value = "";
  }
};
</script>
