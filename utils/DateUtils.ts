import { ref } from "vue";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

export const useDateUtils = () => {
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const currentYear = ref(new Date().getFullYear());
  const currentMonth = ref(new Date().getMonth() + 1);
  const currentDay = ref(new Date().getDate());
  const currentWeek = ref(getWeekNumber(new Date()));

  const getCalendarDays = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const days: CalendarDay[] = [];

    // 前月の日付を追加
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, -i);
      days.push({
        date: formatDate(date),
        isCurrentMonth: false,
      });
    }

    // 当月の日付を追加
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date: formatDate(date),
        isCurrentMonth: true,
      });
    }

    // 次月の日付を追加
    const remainingDays = 42 - days.length; // 6週間分の日付を確保
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date: formatDate(date),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const nextMonth = () => {
    if (currentMonth.value === 12) {
      currentYear.value++;
      currentMonth.value = 1;
    } else {
      currentMonth.value++;
    }
  };

  const prevMonth = () => {
    if (currentMonth.value === 1) {
      currentYear.value--;
      currentMonth.value = 12;
    } else {
      currentMonth.value--;
    }
  };

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return {
    currentYear,
    currentMonth,
    currentDay,
    currentWeek,
    getCalendarDays,
    nextMonth,
    prevMonth,
    formatDate,
  };
};
