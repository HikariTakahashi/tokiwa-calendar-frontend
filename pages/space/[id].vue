<template>
  <div class="container p-2 max-w-full h-screen flex flex-col">
    <div
      class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2"
    >
      <div class="flex items-center text-2xl font-bold mb-2 sm:mb-0">
        <h1 class="text-blue-500 font-mono">Toki</h1>
        <h1 class="text-green-500 font-mono">Wa</h1>
        <h1 class="pl-1 font-mono">Calendar</h1>
        <h2 class="pl-3 text-xl font-mono">予定調整モード(閲覧用)</h2>
      </div>

      <div class="flex items-center gap-x-4">
        <div class="border-r border-gray-400 pr-4">
          <CalendarDays
            :current-year="currentYear"
            :current-month="currentMonth"
          />
        </div>
        <buttons-circle @click="prevMonth">
          <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
        </buttons-circle>
        <buttons-circle @click="nextMonth">
          <UIcon name="ic:baseline-arrow-forward-ios" class="size-5" />
        </buttons-circle>
      </div>
    </div>

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

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface TimeData {
  [key: string]: TimeSlot | TimeSlot[];
}

const route = useRoute();
const showUploadForm = ref(false);
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

const openUploadForm = () => {
  showUploadForm.value = true;
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
