<template>
  <div
    class="absolute right-0 top-0 w-96 h-full border-l border-t rounded-tl-lg border-gray-300 bg-white z-[60] shadow-lg overflow-y-auto"
  >
    <div class="p-4">
      <div class="flex flex-row items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-800">時間設定</h3>
        <buttons-hover
          @click="emit('close')"
          :size="6"
          name="ic:baseline-close"
          color="bg-red-500"
          :ishover="false"
        />
      </div>

      <!-- 日付表示 -->
      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 class="text-lg font-semibold text-gray-800">
          {{ isCurrentYear ? "" : dateComponents.year + "年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
          {{ dateComponents.day }} 日
        </h4>
      </div>

      <!-- エラーメッセージ -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg"
      >
        <h6 class="text-sm font-bold text-red-500">
          {{ errorMessage }}
        </h6>
      </div>

      <!-- 時間スロット入力エリア -->
      <TimeInputDate
        :timeSlots="timeSlots"
        :allowOtherEdit="allowOtherEdit"
        @update:timeSlots="updateTimeSlots"
        @startTimeChange="handleStartTimeChange"
        @endTimeChange="handleEndTimeChange"
      />

      <!-- アクションボタン -->
      <div class="mt-6 flex flex-col gap-y-2">
        <div
          v-if="hasTimeData && !hasOnlyUserTimeSlots"
          class="flex gap-x-2 mb-2"
        >
          <button
            @click="emit('copy')"
            class="flex-1 py-2 px-3 flex justify-center items-center rounded-lg hover:bg-gray-200 border border-gray-300"
          >
            <UIcon name="mdi:calendar-blank-multiple" class="size-4 mr-2" />
            コピー
          </button>
          <button
            @click="copyClipboard"
            class="flex-1 py-2 px-3 flex justify-center items-center rounded-lg hover:bg-gray-200 border border-gray-300"
          >
            <UIcon name="mdi:clipboard-multiple-outline" class="size-4 mr-2" />
            クリップボード
          </button>
          <button
            @click="emit('delete')"
            class="flex-1 py-2 px-3 flex justify-center items-center rounded-lg hover:bg-red-100 border border-red-300 text-red-600"
          >
            <UIcon name="ic:baseline-delete" class="size-4 mr-2" />
            削除
          </button>
        </div>
        <buttons-square
          @click="emit('save')"
          color="bg-blue-200"
          class="w-full"
        >
          保存
        </buttons-square>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TimeInputDate from "@/components/buttons/TimeInputDate.vue";
import { copySingleDateToClipboard } from "@/utils/CopyDate";

interface Props {
  selectedDate: string;
  year: number;
  month: number;
  day: number;
  timeSlots: any[];
  allowOtherEdit: boolean;
  errorMessage: string;
  hasTimeData: boolean;
  hasOnlyUserTimeSlots: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "delete"): void;
  (e: "copy"): void;
  (e: "update:timeSlots", value: any[]): void;
  (e: "startTimeChange", data: any): void;
  (e: "endTimeChange", data: any): void;
}>();

const dateComponents = computed(() => {
  const parts = props.selectedDate.split("-");
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
});

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const isCurrentYear = computed(() => {
  return dateComponents.value.year === currentYear;
});

const isCurrentMonth = computed(() => {
  return (
    dateComponents.value.year === currentYear &&
    dateComponents.value.month === currentMonth
  );
});

const updateTimeSlots = (newTimeSlots: any[]) => {
  emit("update:timeSlots", newTimeSlots);
};

const handleStartTimeChange = (data: any) => {
  emit("startTimeChange", data);
};

const handleEndTimeChange = (data: any) => {
  emit("endTimeChange", data);
};

const copyClipboard = () => {
  copySingleDateToClipboard(props.selectedDate, props.timeSlots).catch(
    (err) => {
      console.error("コピーに失敗しました:", err);
    }
  );
};
</script>
