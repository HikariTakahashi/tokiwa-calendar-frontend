<template>
  <div class="w-full h-full p-4">
    <!-- ナビゲーション -->

    <div class="flex justify-between items-center mb-4">
      <h1 class="flex justify-center items-center text-xl font-bold">
        シンプルなカレンダー
      </h1>

      <div class="flex items-center gap-x-4">
        <h2 class="text-xl font-bold">
          {{ currentYear }}年 {{ currentMonth + 1 }}月
        </h2>
        <button
          @click="nextMonth"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          次の月
        </button>
        <button
          @click="prevMonth"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          前の月
        </button>
      </div>
    </div>

    <!-- カレンダーグリッド -->
    <div class="grid grid-cols-7 gap-2 w-full h-full">
      <div
        v-for="day in calendarDays"
        :key="day.date"
        class="flex flex-col items-center border rounded p-2"
      >
        <div class="font-bold text-sm">{{ day.day }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const currentYear = ref(0);
const currentMonth = ref(0);
const calendarDays = ref([]);

const fetchCalendar = async (move = "") => {
  const res = await $fetch("http://localhost:8080/api/calendar", {
    params: {
      year: currentYear.value || undefined,
      month: currentMonth.value || undefined,
      move,
    },
  });

  currentYear.value = res.year;
  currentMonth.value = res.month;
  calendarDays.value = res.days;
};

const nextMonth = () => fetchCalendar("next");
const prevMonth = () => fetchCalendar("prev");

fetchCalendar();
</script>
