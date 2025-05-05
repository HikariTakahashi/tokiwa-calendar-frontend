<template>
  <div class="w-full h-full p-4">
    <CalendarHeader
      :current-year="currentYear"
      :current-month="currentMonth"
      @next-month="nextMonth"
      @prev-month="prevMonth"
    />
    <CalendarWeek />
    <Calendar
      :calendar-days="calendarDays"
      :month="currentMonth"
      :year="currentYear"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CalendarHeader from "@/components/calendar/CalendarHeader.vue";
import Calendar from "@/components/calendar/Calendar.vue";

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
