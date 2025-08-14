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

  // 週の日付を取得する関数
  const getWeekDays = (year: number, month: number, day: number) => {
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date: formatDate(date),
        isCurrentMonth: date.getMonth() === month - 1,
      });
    }
    return days;
  };

  // 年表示用の月データを取得する関数
  const getYearMonths = (year: number) => {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const days = [];

      // 前月の日付を追加
      const firstDayOfWeek = firstDay.getDay();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, -i);
        days.push({
          date: formatDate(date),
          dayNumber: date.getDate(),
          isCurrentMonth: false,
        });
      }

      // 当月の日付を追加
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month - 1, i);
        days.push({
          date: formatDate(date),
          dayNumber: i,
          isCurrentMonth: true,
        });
      }

      // 次月の日付を追加（6週間分を確保）
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month, i);
        days.push({
          date: formatDate(date),
          dayNumber: date.getDate(),
          isCurrentMonth: false,
        });
      }

      months.push({
        month,
        days,
      });
    }
    return months;
  };

  // 年を変更する関数
  const nextYear = () => {
    currentYear.value++;
  };

  const prevYear = () => {
    currentYear.value--;
  };

  // 週を変更する関数
  const nextWeek = () => {
    const currentDate = new Date(
      currentYear.value,
      currentMonth.value - 1,
      currentDay.value
    );
    currentDate.setDate(currentDate.getDate() + 7);
    currentYear.value = currentDate.getFullYear();
    currentMonth.value = currentDate.getMonth() + 1;
    currentDay.value = currentDate.getDate();
  };

  const prevWeek = () => {
    const currentDate = new Date(
      currentYear.value,
      currentMonth.value - 1,
      currentDay.value
    );
    currentDate.setDate(currentDate.getDate() - 7);
    currentYear.value = currentDate.getFullYear();
    currentMonth.value = currentDate.getMonth() + 1;
    currentDay.value = currentDate.getDate();
  };

  return {
    currentYear,
    currentMonth,
    currentDay,
    currentWeek,
    getCalendarDays,
    getWeekDays,
    getYearMonths,
    nextMonth,
    prevMonth,
    nextYear,
    prevYear,
    nextWeek,
    prevWeek,
    formatDate,
  };
};
