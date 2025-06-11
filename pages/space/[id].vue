<template>
  <div class="h-screen flex flex-col">
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

    <IDsCalendar
      :calendar-days="calendarDays"
      :time-data="timeData"
      :current-year="currentYear"
      :current-month="currentMonth"
      @open-time-form="openTimeForm"
      @prev-month="prevMonth"
      @next-month="nextMonth"
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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useDateUtils } from "@/utils/DateUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import IDsTimeForm from "@/components/ids/IDsTimeForm.vue";
import IDsCalendarHeader from "@/components/ids/IDsCalendarHeader.vue";
import IDsUploadForm from "@/components/ids/IDsUploadForm.vue";
import IDsCalendar from "@/components/ids/IDsCalendar.vue";
import CalendarWeeks from "@/components/calendar/CalendarWeeks.vue";
import { useAPI } from "@/composables/useAPI";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface TimeData {
  [key: string]: TimeSlot | TimeSlot[];
}

interface APITimeSlot {
  Start: string;
  End: string;
  Order: number;
}

interface APIResponse {
  events?: {
    [key: string]: APITimeSlot | APITimeSlot[];
  };
}

const route = useRoute();
const showUploadForm = ref(false);
const showIDsUploadForm = ref(false);
const timeData = ref<TimeData>({});
const calendarDays = ref<CalendarDay[]>([]);
const { formatTimeForDisplay } = useTimeUtils();
const { currentYear, currentMonth, getCalendarDays, nextMonth, prevMonth } =
  useDateUtils();

const showTimeForm = ref(false);
const selectedDate = ref("");

const { fetchSpaceData: fetchSpaceDataFromAPI } = useAPI();

const updateCalendarDays = () => {
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

// 月の移動を監視
watch(
  () => [currentYear.value, currentMonth.value],
  () => {
    updateCalendarDays();
  }
);

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

const fetchSpaceDataFromServer = async () => {
  try {
    const spaceId = route.params.id as string;
    const response = await fetchSpaceDataFromAPI(spaceId);

    // APIレスポンスの検証
    if (!response || typeof response !== "object") {
      console.error("APIからのレスポンスが不正です:", response);
      timeData.value = {};
      updateCalendarDays();
      return;
    }

    // 開発用のモックデータ
    const mockData = {
      "2025-06-05": [
        {
          End: "01:00",
          Order: 1,
          Start: "00:00",
        },
        {
          End: "02:00",
          Order: 2,
          Start: "01:05",
        },
      ],
    };

    // APIからのデータを適切な形式に変換
    const convertedData: TimeData = {};
    const apiResponse = response as unknown as APIResponse;
    const events = apiResponse.events || mockData; // APIレスポンスがない場合はモックデータを使用

    Object.entries(events).forEach(([date, slots]) => {
      if (!slots) return;

      convertedData[date] = Array.isArray(slots)
        ? slots.map((slot) => ({
            start: slot.Start,
            end: slot.End,
            order: slot.Order,
          }))
        : [
            {
              start: (slots as APITimeSlot).Start,
              end: (slots as APITimeSlot).End,
              order: (slots as APITimeSlot).Order,
            },
          ];
    });

    timeData.value = convertedData;
    updateCalendarDays();
  } catch (error) {
    console.error("スペースデータの取得に失敗しました:", error);
    // 開発中はモックデータで初期化
    timeData.value = {
      "2025-06-05": [
        {
          start: "00:00",
          end: "01:00",
          order: 1,
        },
        {
          start: "01:05",
          end: "02:00",
          order: 2,
        },
      ],
    };
    updateCalendarDays();
  }
};

onMounted(() => {
  fetchSpaceDataFromServer();
});
</script>
