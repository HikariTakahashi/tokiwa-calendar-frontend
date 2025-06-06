<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
  >
    <div class="bg-white px-6 rounded-lg w-3/4 max-h-[80vh] overflow-y-auto">
      <div
        class="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pt-6"
      >
        <h2 class="text-xl font-bold border-b-2 border-gray-200">
          スペース内の時間データ一覧
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
        </button>
      </div>

      <div class="grid sm:grid-cols-5 gap-2">
        <div
          v-if="Object.keys(displayData).length === 0"
          class="text-center py-4"
        >
          データがありません
        </div>
        <div
          v-else
          v-for="(timeSlots, date) in displayData"
          :key="date"
          class="border p-4 rounded"
        >
          <div class="font-bold">{{ formatDate(String(date)) }}</div>
          <div class="text-blue-500 whitespace-pre-line">
            {{ formatTimeForDisplay(getTimeSlots(String(date))) }}
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-4 sticky bottom-0 bg-white pb-6">
        <buttons-square
          @click="handleCopy"
          label="コピー"
          color="bg-gray-300"
          :isUse="Object.keys(displayData).length > 0"
        />
        <buttons-square @click="syncData" label="再同期" color="bg-blue-300" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { TimeSlot } from "@/utils/TimeUtils";
import { useAPI } from "@/composables/useAPI";

const props = defineProps({
  timeData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close"]);
const displayData = ref<{ [key: string]: TimeSlot | TimeSlot[] }>({});
const { formatTimeForDisplay } = useTimeUtils();
const { syncTimeData } = useAPI();

watch(
  () => props.timeData,
  (newValue) => {
    displayData.value = { ...newValue };
  },
  { immediate: true }
);

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const getTimeSlots = (date: string): TimeSlot[] => {
  const slots = displayData.value[date];
  if (!slots) return [];

  // APIから受け取ったデータをTimeSlot形式に変換
  const convertedSlots = Array.isArray(slots) ? slots : [slots];
  return convertedSlots.map((slot) => ({
    start: (slot as any).Start || (slot as any).start,
    end: (slot as any).End || (slot as any).end,
    order: (slot as any).order || 1,
  }));
};

const handleCopy = () => {
  if (Object.keys(displayData.value).length === 0) {
    alert("コピーするデータがありません");
    return;
  }

  const text = Object.entries(displayData.value)
    .map(([date, slots]) => {
      const timeSlots = getTimeSlots(date);
      return `${formatDate(date)}: ${timeSlots
        .map((slot) => `${slot.start} ~ ${slot.end}`)
        .join(", ")}`;
    })
    .join("\n");

  navigator.clipboard
    .writeText(text)
    .then(() => alert("クリップボードにコピーしました"))
    .catch((err) => console.error("コピーに失敗しました:", err));
};

const syncData = async () => {
  try {
    if (Object.keys(displayData.value).length === 0) {
      alert("同期するデータがありません");
      return;
    }

    const route = useRoute();
    const spaceId = route.params.id as string;

    // データを適切な形式に変換
    const formattedData = Object.entries(displayData.value).reduce(
      (acc, [date, slots]) => {
        const timeSlots = getTimeSlots(date);
        acc[date] = timeSlots.map((slot) => ({
          start: slot.start,
          end: slot.end,
          order: slot.order,
        }));
        return acc;
      },
      {} as { [key: string]: any }
    );

    const response = await syncTimeData(formattedData, spaceId);
    displayData.value = response.savedEvents;
    alert("同期が完了しました");
  } catch (error) {
    console.error("同期エラー:", error);
    alert("同期に失敗しました");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
});
</script>
