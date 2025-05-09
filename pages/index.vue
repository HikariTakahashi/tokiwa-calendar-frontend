<template>
  <div class="h-screen p-4">
    <CalendarHeader
      :current-year="currentYear"
      :current-month="currentMonth"
      :current-day="currentDay"
      :current-week="currentWeek"
      @next-month="nextMonth"
      @prev-month="prevMonth"
    />
    <CalendarWeek />
    <Calendar
      :calendar-days="calendarDays"
      :year="currentYear"
      :month="currentMonth"
      @save="saveTime"
      @delete="deleteTime"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CalendarHeader from "@/components/calendar/CalendarHeader.vue";
import Calendar from "@/components/calendar/Calendar.vue";

const currentYear = ref(0);
const currentMonth = ref(0);
const currentDay = ref(0); // 現時点では無使用
const currentWeek = ref(0); // 現時点では無使用

const calendarDays = ref([]);

const fetchCalendar = async (move = "") => {
  const res = await $fetch("http://localhost:8080/api/calendar", {
    params: {
      year: currentYear.value || undefined,
      month: currentMonth.value || undefined,
      day: currentDay.value || undefined,
      week: currentWeek.value || undefined,
      move,
    },
  });

  currentYear.value = res.year;
  currentMonth.value = res.month;
  currentDay.value = res.day;
  currentWeek.value = res.week;

  calendarDays.value = res.days;
};

const nextMonth = () => fetchCalendar("next");
const prevMonth = () => fetchCalendar("prev");

const saveTime = async ({ date, start, end }) => {
  try {
    await $fetch("http://localhost:8080/api/calendar", {
      method: "POST",
      body: { date, start, end },
    });
    await fetchCalendar();
  } catch (error) {
    console.error("保存エラー:", error);
  }
};

const deleteTime = async (date) => {
  try {
    await $fetch("http://localhost:8080/api/calendar", {
      method: "DELETE",
      body: { date },
    });
    await fetchCalendar();
  } catch (error) {
    console.error("削除エラー:", error);
  }
};

fetchCalendar();
</script>
