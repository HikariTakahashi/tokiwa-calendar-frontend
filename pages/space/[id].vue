<template>
  <div class="container p-2 max-w-full h-screen flex flex-col">
    <IDsCalendarHeader
      :current-year="currentYear"
      :current-month="currentMonth"
      :timeData="timeData"
      @open-form="openForm"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    />

    <!-- デバッグ表示 -->
    <!-- <div class="mb-4 p-4 bg-gray-100 rounded-lg">
      <p>Debug: timeData = {{ JSON.stringify(timeData, null, 2) }}</p>
    </div> -->

    <CalendarWeeks />

    <div class="grid grid-cols-7 gap-2 flex-1">
      <div
        v-for="date in calendarDays"
        :key="date.date"
        class="flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 shadow-md min-h-[100px] cursor-pointer"
        :class="[isCurrentMonth(date.date) ? '' : 'bg-gray-100']"
        @click="openTimeForm(date.date)"
      >
        <div
          class="flex items-center justify-center pt-2"
          :class="[isCurrentMonth(date.date) ? 'text-black' : 'text-gray-500']"
        >
          {{ new Date(date.date).getDate() }}
        </div>
        <div
          v-if="timeData[date.date]"
          class="text-center text-xs sm:text-sm font-bold text-blue-500 w-full flex flex-col min-h-0 p-1"
        >
          <div
            class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
          >
            {{ formatTimeForDisplay(getTimeSlots(date.date)) }}
          </div>
        </div>
      </div>
    </div>

    <UploadForm
      v-if="showUploadForm"
      :timeData="timeData"
      @close="showUploadForm = false"
    />

    <IDsUploadForm
      v-if="showIDsUploadForm"
      :timeData="timeData"
      @close="showIDsUploadForm = false"
    />

    <IDsTimeForm
      v-if="showTimeForm"
      :is-open="showTimeForm"
      :selected-date="selectedDate"
      :initial-time-slots="getTimeSlots(selectedDate)"
      @close="closeTimeForm"
      @save="saveTimeData"
      @delete="deleteTimeData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useTimeUtils } from "@/utils/TimeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import IDsTimeForm from "@/components/ids/IDsTimeForm.vue";
import IDsCalendarHeader from "@/components/ids/IDsCalendarHeader.vue";
import IDsUploadForm from "@/components/ids/IDsUploadForm.vue";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface TimeData {
  [key: string]: TimeSlot | TimeSlot[];
}

const route = useRoute();
const showUploadForm = ref(false);
const showIDsUploadForm = ref(false);
const timeData = ref<TimeData>({});
const calendarDays = ref<CalendarDay[]>([]);
const { formatTimeForDisplay } = useTimeUtils();

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

const showTimeForm = ref(false);
const selectedDate = ref("");

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const openForm = () => {
  showIDsUploadForm.value = true;
};

const openTimeForm = (date: string) => {
  selectedDate.value = date;
  showTimeForm.value = true;
};

const closeTimeForm = () => {
  showTimeForm.value = false;
};

const saveTimeData = (date: string, slots: TimeSlot[]) => {
  timeData.value[date] = slots;
};

const deleteTimeData = (date: string) => {
  delete timeData.value[date];
};

const getTimeSlots = (date: string): TimeSlot[] => {
  const slots = timeData.value[date];
  if (!slots) return [];

  // APIから受け取ったデータをTimeSlot形式に変換
  const convertedSlots = Array.isArray(slots) ? slots : [slots];
  return convertedSlots.map((slot) => ({
    start: (slot as any).Start || (slot as any).start,
    end: (slot as any).End || (slot as any).end,
    order: (slot as any).order || 1,
  }));
};

const getCalendarDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days = [];

  // 前月の日付を追加
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, -i);
    days.push({
      date: date.toISOString().split("T")[0],
      isCurrentMonth: false,
    });
  }

  // 当月の日付を追加
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month - 1, i);
    days.push({
      date: date.toISOString().split("T")[0],
      isCurrentMonth: true,
    });
  }

  // 次月の日付を追加
  const remainingDays = 42 - days.length; // 6行分のカレンダー
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month, i);
    days.push({
      date: date.toISOString().split("T")[0],
      isCurrentMonth: false,
    });
  }

  return days;
};

const isCurrentMonth = (dateString: string): boolean => {
  const d = new Date(dateString);
  return (
    d.getFullYear() === currentYear.value &&
    d.getMonth() + 1 === currentMonth.value
  );
};

const fetchSpaceData = async () => {
  try {
    const spaceId = route.params.id;
    const response = await $fetch(`http://localhost:8080/api/time/${spaceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log("API Response:", response); // デバッグログ
    timeData.value = response as TimeData;
    calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
  } catch (error) {
    console.error("スペースデータの取得に失敗しました:", error);
  }
};

onMounted(() => {
  fetchSpaceData();
});
</script>
