<template>
  <div
    v-if="timeData.events[date]"
    class="text-center text-xs sm:text-sm font-bold w-full flex flex-col min-h-0"
  >
    <div
      class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
    >
      <template
        v-for="(slot, index) in getTaskSlots(date)"
        z
        :key="`${slot.taskName}-${index}`"
      >
        <div
          class="flex flex-col justify-center items-center gap-y-1 mb-1 cursor-pointer hover:opacity-80 transition-opacity"
          @click.stop="handleTaskClick(slot, index)"
        >
          <div
            class="text-xs sm:text-sm font-bold truncate w-full rounded-md"
            :style="{
              backgroundColor: slot.userColor || '#3b82f6',
              color: getTextColor(slot.userColor || '#3b82f6'),
            }"
          >
            {{ slot.taskName }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeData } from "@/composables/useAPI";

// 簡素化されたTaskSlot型定義
interface TaskSlot {
  start: string;
  end: string;
  order?: number;
  username?: string;
  userColor?: string;
  taskName: string;
  description: string;
}

interface Props {
  date: string;
  timeData: TimeData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (
    e: "editTask",
    data: { date: string; taskIndex: number; task: TaskSlot }
  ): void;
}>();

// タスククリック時のハンドラー
const handleTaskClick = (slot: TaskSlot, index: number) => {
  emit("editTask", {
    date: props.date,
    taskIndex: index,
    task: slot,
  });
};

// 優先度・ステータス関連の関数は不要になったため削除

const getTaskSlots = (date: string): TaskSlot[] => {
  const slots = props.timeData.events[date];

  if (!slots) return [];

  const convertedSlots = Array.isArray(slots) ? slots : [slots];
  return convertedSlots.map((slot) => ({
    start: (slot as any).Start || (slot as any).start,
    end: (slot as any).End || (slot as any).end,
    order: (slot as any).Order || (slot as any).order || 1,
    username: (slot as any).Username || (slot as any).username,
    userColor: (slot as any).UserColor || (slot as any).userColor,
    taskName: (slot as any).taskName || (slot as any).TaskName || "",
    description: (slot as any).description || (slot as any).Description || "",
  }));
};

// 説明文を短縮する関数
const truncateDescription = (description: string): string => {
  if (description.length <= 15) {
    return description;
  }
  return description.substring(0, 15) + "...";
};

// 背景色に基づいてテキスト色を決定する関数
const getTextColor = (backgroundColor: string): string => {
  // カラーコードをRGB値に変換
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 輝度を計算（YIQ式）
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 輝度が128以上なら黒、未満なら白
  return brightness >= 128 ? "black" : "white";
};
</script>
