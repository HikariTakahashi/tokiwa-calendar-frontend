<!-- vscodeのエラーでシンタックスハイライトが効かなくなるのでscriptタグを上に移動 -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDateUtils } from "@/utils/DateUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import CalendarHeader from "@/components/calendar/CalendarHeader.vue";
import CopyModeHeader from "@/components/calendar/CopyModeHeader.vue";
import Calendar from "@/components/calendar/Calendar.vue";
import CalendarWeeks from "@/components/calendar/CalendarWeeks.vue";
import { useAPI, type TimeData } from "@/composables/useAPI";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

const route = useRoute();
const showIDsUploadForm = ref(false);
const timeData = ref<TimeData>({
  events: {},
  spaceId: "",
  username: "",
  userColor: "",
  startDate: null,
  endDate: null,
  allowOtherEdit: false,
});
const calendarDays = ref<CalendarDay[]>([]);
const isCopyMode = ref(false);
const {
  currentYear,
  currentMonth,
  currentDay,
  currentWeek,
  getCalendarDays,
  nextMonth,
  prevMonth,
} = useDateUtils();

const { fetchSpaceData: fetchSpaceDataFromAPI } = useAPI();

const updateCalendarDays = () => {
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const openForm = () => {
  showIDsUploadForm.value = true;
};

const handleCalendarSave = (data: { date: string; timeSlots: TimeSlot[] }) => {
  timeData.value.events[data.date] = data.timeSlots;
};

const deleteTimeData = (data: { date: string }) => {
  delete timeData.value.events[data.date];
};

const updateTimeData = (newTimeData: TimeData) => {
  timeData.value = newTimeData;
};

const updateIsCopyMode = (value: boolean) => {
  isCopyMode.value = value;
};

const closeCopyMode = () => {
  isCopyMode.value = false;
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
};

const handleNextMonth = () => {
  nextMonth();
  updateCalendarDays();
};

const handlePrevMonth = () => {
  prevMonth();
  updateCalendarDays();
};

const fetchSpaceDataFromServer = async () => {
  try {
    const spaceId = route.params.id as string;
    const response = await fetchSpaceDataFromAPI(spaceId);

    if (!response || !response.events) {
      console.warn("APIからのレスポンスが不正です:", response);
      timeData.value = {
        events: {},
        spaceId: "",
        username: "",
        userColor: "",
        startDate: null,
        endDate: null,
        allowOtherEdit: false,
      };
      updateCalendarDays();
      return;
    }

    timeData.value = response;
    
    // APIデータの期間に基づいてカレンダーの年月を設定
    if (response.events && Object.keys(response.events).length > 0) {
      // データがある日付を取得
      const eventDates = Object.keys(response.events);
      const firstEventDate = new Date(eventDates[0]);
      currentYear.value = firstEventDate.getFullYear();
      currentMonth.value = firstEventDate.getMonth() + 1;
    } else if (response.startDate) {
      const startDate = new Date(response.startDate);
      currentYear.value = startDate.getFullYear();
      currentMonth.value = startDate.getMonth() + 1;
    }
    
    updateCalendarDays();
  } catch (error) {
    console.error("スペースデータの取得に失敗しました:", error);
    timeData.value = {
      events: {},
      spaceId: "",
      username: "",
      userColor: "",
      startDate: null,
      endDate: null,
      allowOtherEdit: false,
    };
    updateCalendarDays();
  }
};

onMounted(() => {
  fetchSpaceDataFromServer();
});
</script>

<template>
  <div class="h-screen flex flex-col">
    <component
      :is="isCopyMode ? CopyModeHeader : CalendarHeader"
      :current-year="currentYear"
      :current-month="currentMonth"
      :current-day="currentDay"
      :current-week="currentWeek"
      :is-sync="true"
      :time-data="timeData"
      :space-id="route.params.id as string"
      @next-month="handleNextMonth"
      @prev-month="handlePrevMonth"
      @open-form="openForm"
      @close-copy-mode="closeCopyMode"
      @cancel-copy-mode="handleCancelCopyMode"
    />
    <CalendarWeeks />
    <div class="h-full overflow-y-auto">
      <Calendar
        :calendar-days="calendarDays"
        :year="currentYear"
        :month="currentMonth"
        :is-copy-mode="isCopyMode"
        :space-id="route.params.id as string"
        :time-data="timeData"
        @save="handleCalendarSave"
        @delete="deleteTimeData"
        @update:time-data="updateTimeData"
        @update:is-copy-mode="updateIsCopyMode"
        @cancel-copy-mode="handleCancelCopyMode"
      />
    </div>
  </div>
</template>
