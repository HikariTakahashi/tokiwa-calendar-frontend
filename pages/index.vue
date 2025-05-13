<template>
  <div class="h-screen p-1">
    <CalendarHeader
      :current-year="currentYear"
      :current-month="currentMonth"
      :current-day="currentDay"
      :current-week="currentWeek"
      :time-data="timeData"
      @next-month="nextMonth"
      @prev-month="prevMonth"
    />
    <CalendarWeeks />
    <Calendar
      :calendar-days="calendarDays"
      :year="currentYear"
      :month="currentMonth"
      @save="saveTime"
      @delete="deleteTime"
      @update:time-data="updateTimeData"
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
const timeData = ref({});

const calendarDays = ref([]);

const updateTimeData = (newTimeData) => {
  timeData.value = newTimeData;
};

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

const saveTime = ({ date, start, end }) => {
  // try{
  //   同期後の個別送信機能
  //   await $fetch("http://localhost:8080/api/calendar", {
  //     method: "POST",
  // };
  timeData.value[date] = { start, end };
};

const deleteTime = (date) => {
  // try{
  //   同期後の個別送信機能
  //   await $fetch("http://localhost:8080/api/calendar", {
  //     method: "DELETE",
  //     body: { date },
  //   });
    
  // };
  delete timeData.value[date];
};

fetchCalendar();
</script>
