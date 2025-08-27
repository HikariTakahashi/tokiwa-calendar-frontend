<template>
  <div class="relative h-full flex flex-col z-10">
    <SideMenu
      :show="props.showSideMenu"
      @toggleSideMenu="toggleSideMenu"
      @import-complete="handleImportComplete"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="[
        props.showSideMenu && !isMobile ? 'ml-80' : 'ml-0',
        showTimeSideMenu && !isMobile ? 'mr-96' : 'mr-0',
      ]"
    >
      <div class="flex-1 flex flex-col">
        <!-- 全体を横スクロール可能にするコンテナ -->
        <div class="flex-1 overflow-auto relative">
          <div class="flex min-h-full overflow-x-auto" ref="scrollContainer">
            <!-- 時間列（固定幅） -->
            <div class="flex flex-col w-16 sm:w-16 flex-shrink-0">
              <!-- ヘッダー部分の時間列 -->
              <div class="sticky top-0 z-20 bg-white border-b border-gray-200">
                <div
                  class="flex justify-center font-bold text-sm sm:text-base p-2 bg-white border-r border-gray-200 h-16"
                >
                  時間
                </div>
              </div>

              <!-- 終日部分の時間列 -->
              <div
                class="sticky top-16 z-20 bg-gray-50 border-b border-gray-200"
              >
                <div
                  class="flex justify-center font-bold text-xs text-gray-600 bg-gray-50 border-r border-gray-200 h-8"
                >
                  終日
                </div>
              </div>

              <!-- 時間スケール -->
              <div class="flex flex-col">
                <div
                  v-for="hour in 24"
                  :key="hour - 1"
                  class="h-8 sm:h-12 border-b border-gray-200 bg-white relative"
                >
                  <div
                    class="absolute top-0 left-0 right-0 h-4 flex items-center justify-center text-xs text-gray-500 bg-gray-50 border-b border-gray-200"
                  >
                    {{ formatHour(hour - 1) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 7日分の列（横スクロール可能） -->
            <div class="flex-1 min-w-[700px] sm:min-w-0">
              <!-- ヘッダー部分（曜日） -->
              <div class="sticky top-0 z-20 bg-white border-b border-gray-200">
                <div class="grid grid-cols-7 gap-0.5 sm:gap-2">
                  <div
                    v-for="date in weekDays"
                    :key="date.date"
                    class="flex flex-col items-center justify-center font-bold text-sm sm:text-base p-2 border-l bg-white min-w-[100px] h-16"
                    :class="[
                      isToday(date.date) ? 'bg-green-100' : '',
                      isDateDisabled(date.date) ? 'bg-gray-300' : '',
                    ]"
                  >
                    <div class="text-xs text-gray-600">
                      {{ getDayOfWeek(date.date) }}
                    </div>
                    <div
                      class="flex items-center justify-center text-lg"
                      :class="[
                        isToday(date.date)
                          ? 'rounded-full px-1 bg-green-500 text-white'
                          : '',
                      ]"
                    >
                      {{ new Date(date.date).getDate() }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 終日予定部分 -->
              <div
                class="sticky top-16 z-20 bg-gray-50 border-b border-gray-200"
              >
                <div class="grid grid-cols-7 gap-0.5 sm:gap-2">
                  <div
                    v-for="date in weekDays"
                    :key="`allday-${date.date}`"
                    class="flex flex-col text-xs border-l min-h-8 bg-gray-50 gap-y-1 min-w-[100px]"
                    :class="[isDateDisabled(date.date) ? 'bg-gray-200' : '']"
                  >
                    <!-- 時間管理モードの終日予定 -->
                    <div
                      v-if="props.displayMode === 'time'"
                      v-for="(slot, index) in getAllDaySlots(date.date)"
                      :key="`${date.date}-allday-${slot.start}-${slot.end}-${
                        slot.username || 'default'
                      }-${slot.order || index}`"
                      class="w-full p-1 rounded-t-md rounded-r-md truncate cursor-pointer hover:opacity-80 transition-opacity"
                      :class="getTextColorClass(slot.userColor)"
                      :style="{
                        backgroundColor: slot.userColor || '#3b82f6',
                        opacity: slot.order && slot.order > 1000 ? 0.6 : 0.9,
                        border:
                          slot.order && slot.order > 1000
                            ? '2px dashed #666'
                            : 'none',
                      }"
                      @click="openForm(date.date)"
                    >
                      <div
                        v-if="slot.username"
                        class="font-bold text-xs"
                        :class="getTextColorClass(slot.userColor)"
                      >
                        {{ slot.username }}
                      </div>
                    </div>

                    <!-- タスク管理モードの終日タスク -->
                    <div
                      v-if="props.displayMode === 'task'"
                      v-for="(slot, index) in getAllDayTaskSlots(date.date)"
                      :key="`${date.date}-task-${slot.taskName}-${index}`"
                      class="w-full p-1 rounded-t-md rounded-r-md truncate cursor-pointer hover:opacity-80 transition-opacity"
                      :style="{
                        backgroundColor: slot.userColor || '#3b82f6',
                        opacity: slot.order && slot.order > 1000 ? 0.6 : 0.9,
                        border:
                          slot.order && slot.order > 1000
                            ? '2px dashed #666'
                            : 'none',
                      }"
                      @click="openForm(date.date)"
                    >
                      <div
                        class="font-bold text-xs"
                        :style="{
                          color: getTextColor(slot.userColor || '#3b82f6'),
                        }"
                      >
                        {{ slot.taskName }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- メインコンテンツ部分（時間スロット） -->
              <div class="grid grid-cols-7 gap-0.5 sm:gap-2 min-h-full">
                <div
                  v-for="date in weekDays"
                  :key="date.date"
                  class="flex flex-col relative border-l min-w-[100px]"
                  :class="[isDateDisabled(date.date) ? 'bg-gray-100' : '']"
                >
                  <div
                    v-for="(allDaySlot, allDayIndex) in getAllDaySlots(
                      date.date
                    )"
                    :key="`${date.date}-allday-line-${allDaySlot.username}-${allDaySlot.order}`"
                    class="absolute top-4 bottom-0 w-1 z-10 mt-[-16px]"
                    :style="{
                      left: `${allDayIndex * 5}px`,
                      backgroundColor: allDaySlot.userColor || '#3b82f6',
                      opacity: 0.8,
                    }"
                  ></div>

                  <div
                    v-for="hour in 24"
                    :key="hour - 1"
                    class="h-8 sm:h-12 border-b border-gray-200 relative"
                    @click="openFormAtTime(date.date, hour - 1)"
                  >
                    <!-- 時間管理モードの時間スロット -->
                    <div
                      v-if="props.displayMode === 'time'"
                      v-for="(slot, index) in getDisplaySlotsForHour(
                        date.date,
                        hour - 1
                      )"
                      :key="`${date.date}-${hour - 1}-${slot.start}-${
                        slot.end
                      }-${slot.username || 'default'}-${slot.order || index}`"
                      class="absolute left-0 right-0 mx-1 text-xs p-1 mt-[-16px] overflow-hidden"
                      :style="getSlotStyle(slot, hour - 1, index, date.date)"
                      :class="[
                        slot.username
                          ? 'border-l-4 cursor-pointer hover:opacity-80 transition-opacity rounded'
                          : 'border-l-2 cursor-pointer hover:opacity-80 transition-opacity rounded',
                      ]"
                      @click.stop="openForm(date.date)"
                    >
                      <div
                        v-if="slot.username"
                        class="font-bold truncate"
                        :class="getTextColorClass(slot.userColor)"
                      >
                        {{ slot.username }}
                      </div>
                      <div
                        class="truncate"
                        :class="getTextColorClass(slot.userColor)"
                      >
                        {{ formatTimeForDisplay([slot]) }}
                      </div>
                    </div>

                    <!-- タスク管理モードの時間スロット -->
                    <div
                      v-if="props.displayMode === 'task'"
                      v-for="(slot, index) in getDisplayTaskSlotsForHour(
                        date.date,
                        hour - 1
                      )"
                      :key="`${date.date}-${hour - 1}-task-${
                        slot.taskName
                      }-${index}`"
                      class="absolute left-0 right-0 mx-1 text-xs p-1 mt-[-16px] overflow-hidden"
                      :style="getSlotStyle(slot, hour - 1, index, date.date)"
                      :class="[
                        'border-l-4 cursor-pointer hover:opacity-80 transition-opacity rounded',
                      ]"
                      @click.stop="openForm(date.date)"
                    >
                      <div class="font-bold truncate text-white">
                        {{ slot.taskName }}
                      </div>
                      <div class="truncate text-white">
                        {{ formatTimeForDisplay([slot]) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TimeSideMenu
    v-if="showTimeSideMenu"
    :show="showTimeSideMenu"
    :selectedDate="timeSideMenuData.selectedDate"
    :year="timeSideMenuData.year"
    :month="timeSideMenuData.month"
    :day="timeSideMenuData.day"
    :existingTime="timeSideMenuData.existingTime"
    :isCopyMode="timeSideMenuData.isCopyMode"
    :allowOtherEdit="timeSideMenuData.allowOtherEdit"
    :initialHour="timeSideMenuData.initialHour"
    @save="onSave"
    @delete="onDelete"
    @copy="handleCopy"
    @preview="handlePreview"
    @close="closeTimeSideMenu"
    @editModeChanged="handleTimeSideMenuEditModeChanged"
  />
</template>

<script setup lang="ts">
import TimeSideMenu from "@/components/sidemenu/TimeSideMenu.vue";
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { type TimeData } from "@/composables/useAPI";
import SideMenu from "@/components/calendar/SideMenu.vue";
import TimeDisplay from "@/components/calendar/display/TimeDisplay.vue";
import TaskDisplay from "@/components/calendar/display/TaskDisplay.vue";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface Props {
  year: number;
  month: number;
  day: number;
  isCopyMode: boolean;
  spaceId?: string;
  timeData: TimeData;
  showSideMenu?: boolean;
  displayMode?: "time" | "task";
}

const props = withDefaults(defineProps<Props>(), {
  showSideMenu: false,
  displayMode: "time",
});
const emit = defineEmits<{
  (e: "save", data: { date: string; timeSlots: TimeSlot[] }): void;
  (e: "delete", data: { date: string }): void;
  (e: "update:time-data", data: TimeData): void;
  (e: "update:is-copy-mode", value: boolean): void;
  (e: "cancel-copy-mode"): void;
  (e: "toggleSideMenu"): void;
  (e: "import-complete", data: any[]): void;
  (e: "preview", data: { date: string; timeSlots: TimeSlot[] }): void;
  (e: "openForm", data: { date: string; hour?: number }): void;
}>();

const { formatTimeForDisplay, getTextColorClass } = useTimeUtils();
const showModal = ref(false);
const selectedDate = ref<string>("");
const previewData = ref<{ [date: string]: TimeSlot[] }>({});
const isMobile = ref(false);
const showTimeSideMenu = ref(false);
const isTimeSideMenuEditMode = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);
const timeSideMenuData = ref({
  selectedDate: "",
  year: 0,
  month: 0,
  day: 0,
  existingTime: {},
  isCopyMode: false,
  allowOtherEdit: false,
  initialHour: undefined as number | undefined,
});

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// コンポーネントマウント時とリサイズ時に判定
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

const {
  copiedTimeData,
  handleCopy: copyLogic,
  handlePaste,
  handleCancelCopyMode: cancelCopyLogic,
  pastedDates,
} = useCopyLogic();

// 週の日付を計算
const weekDays = computed(() => {
  const currentDate = new Date(props.year, props.month - 1, props.day);
  const dayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date: formatDate(date),
      isCurrentMonth: date.getMonth() === props.month - 1,
    });
  }
  return days;
});

// 終日予定を取得（終日列ヘッダー用）
const getAllDaySlots = (date: string): TimeSlot[] => {
  const slots = props.timeData.events[date];
  const previewSlots = previewData.value[date];

  let allSlots: TimeSlot[] = [];

  // プレビューデータがある場合は、プレビューデータのみを使用
  if (previewSlots && previewSlots.length > 0) {
    allSlots.push(...previewSlots);
  } else {
    // プレビューデータがない場合は、既存のデータを使用
    if (slots) {
      const convertedSlots = Array.isArray(slots) ? slots : [slots];
      allSlots.push(
        ...convertedSlots.map((slot) => ({
          start: (slot as any).Start || (slot as any).start,
          end: (slot as any).End || (slot as any).end,
          order: (slot as any).Order || (slot as any).order || 1,
          username: (slot as any).Username || (slot as any).username,
          userColor: (slot as any).UserColor || (slot as any).userColor,
        }))
      );
    }
  }

  // 終日データのみを抽出（00:00-24:00）
  const allDaySlots = allSlots
    .filter((slot) => {
      const slotStart = parseInt(slot.start || "0:0", 10);
      const slotEnd = parseInt(slot.end || "0:0", 10);
      return slotStart === 0 && slotEnd === 24;
    })
    .sort((a, b) => (a.order || 1) - (b.order || 1));

  return allDaySlots;
};

// 終日タスクを取得（タスク管理モード用）
const getAllDayTaskSlots = (date: string): any[] => {
  const slots = props.timeData.events[date];
  const previewSlots = previewData.value[date];

  let allSlots: any[] = [];

  // プレビューデータがある場合は、プレビューデータのみを使用
  if (previewSlots && previewSlots.length > 0) {
    allSlots.push(...previewSlots);
  } else {
    // プレビューデータがない場合は、既存のデータを使用
    if (slots) {
      const convertedSlots = Array.isArray(slots) ? slots : [slots];
      allSlots.push(
        ...convertedSlots.map((slot) => ({
          start: (slot as any).Start || (slot as any).start,
          end: (slot as any).End || (slot as any).end,
          order: (slot as any).Order || (slot as any).order || 1,
          username: (slot as any).Username || (slot as any).username,
          userColor: (slot as any).UserColor || (slot as any).userColor,
          taskName: (slot as any).taskName || (slot as any).TaskName || "",
          description:
            (slot as any).description || (slot as any).Description || "",
        }))
      );
    }
  }

  // 終日データのみを抽出（00:00-24:00）
  const allDaySlots = allSlots
    .filter((slot) => {
      const slotStart = parseInt(slot.start || "0:0", 10);
      const slotEnd = parseInt(slot.end || "0:0", 10);
      return slotStart === 0 && slotEnd === 24;
    })
    .sort((a, b) => (a.order || 1) - (b.order || 1));

  return allDaySlots;
};

// より効率的な表示制御のための関数
const shouldDisplaySlotInHour = (slot: TimeSlot, hour: number): boolean => {
  const startHour = parseInt(slot.start || "0", 10);
  const endHour = parseInt(slot.end || "0", 10);

  // 終日データは除外
  if (startHour === 0 && endHour === 24) return false;

  // データの開始時間が指定された時間と一致する場合のみ表示
  return startHour === hour;
};

// 各時間スロットで表示するデータを管理する関数（改善版）
const getDisplaySlotsForHour = (date: string, hour: number): TimeSlot[] => {
  const slots = props.timeData.events[date];
  const previewSlots = previewData.value[date];

  let allSlots: TimeSlot[] = [];

  // プレビューデータがある場合は、プレビューデータのみを使用
  if (previewSlots && previewSlots.length > 0) {
    allSlots.push(...previewSlots);
  } else {
    // プレビューデータがない場合は、既存のデータを使用
    if (slots) {
      const convertedSlots = Array.isArray(slots) ? slots : [slots];
      allSlots.push(
        ...convertedSlots.map((slot) => ({
          start: (slot as any).Start || (slot as any).start,
          end: (slot as any).End || (slot as any).end,
          order: (slot as any).Order || (slot as any).order || 1,
          username: (slot as any).Username || (slot as any).username,
          userColor: (slot as any).UserColor || (slot as any).userColor,
        }))
      );
    }
  }

  // 指定された時間に表示すべきデータのみを抽出
  const displaySlots = allSlots
    .filter((slot) => {
      const shouldDisplay = shouldDisplaySlotInHour(slot, hour);

      return shouldDisplay;
    })
    .sort((a, b) => (a.order || 1) - (b.order || 1));

  return displaySlots;
};

// 各時間スロットで表示するタスクデータを管理する関数（タスク管理モード用）
const getDisplayTaskSlotsForHour = (date: string, hour: number): any[] => {
  const slots = props.timeData.events[date];
  const previewSlots = previewData.value[date];

  let allSlots: any[] = [];

  // プレビューデータがある場合は、プレビューデータのみを使用
  if (previewSlots && previewSlots.length > 0) {
    allSlots.push(...previewSlots);
  } else {
    // プレビューデータがない場合は、既存のデータを使用
    if (slots) {
      const convertedSlots = Array.isArray(slots) ? slots : [slots];
      allSlots.push(
        ...convertedSlots.map((slot) => ({
          start: (slot as any).Start || (slot as any).start,
          end: (slot as any).End || (slot as any).end,
          order: (slot as any).Order || (slot as any).order || 1,
          username: (slot as any).Username || (slot as any).username,
          userColor: (slot as any).UserColor || (slot as any).userColor,
          taskName: (slot as any).taskName || (slot as any).TaskName || "",
          description:
            (slot as any).description || (slot as any).Description || "",
        }))
      );
    }
  }

  // 指定された時間に表示すべきデータのみを抽出
  const displaySlots = allSlots
    .filter((slot) => {
      const shouldDisplay = shouldDisplaySlotInHour(slot, hour);

      return shouldDisplay;
    })
    .sort((a, b) => (a.order || 1) - (b.order || 1));

  return displaySlots;
};

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
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

// 時間をフォーマット（00:00形式）
const formatHour = (hour: number): string => {
  return `${String(hour).padStart(2, "0")}:00`;
};

// 曜日を取得
const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return days[date.getDay()];
};

// スロットのスタイルを計算（通常データのみ）
const getSlotStyle = (
  slot: TimeSlot,
  hour: number,
  index: number,
  date: string
) => {
  const startHour = parseInt(slot.start || "0", 10);
  const endHour = parseInt(slot.end || "0", 10);
  const hourHeight = isMobile.value ? 32 : 48;
  const timeLabelHeight = 16;

  // 表示用のデータを取得（開始時間が一致するデータのみ）
  const displaySlots = getDisplaySlotsForHour(date, hour);

  // 現在のスロットのインデックスを取得
  const slotIndex = displaySlots.findIndex(
    (s) =>
      s.start === slot.start &&
      s.end === slot.end &&
      s.username === slot.username &&
      s.order === slot.order
  );

  // 終日データの数を取得
  const allDaySlots = getAllDaySlots(date);
  const allDayCount = allDaySlots.length;

  // 終日データの表示幅を計算（1つにつき5px + 余白2px）
  const allDayWidth = allDayCount * 7; // 5px + 2px余白
  const allDayMargin = Math.max(allDayWidth, 0);

  // カラム分割の計算（終日データの幅を考慮）
  let slotWidth: number;
  let leftPosition: number;

  if (displaySlots.length <= 1) {
    // 1つの場合は全幅（終日データの幅を除く）
    slotWidth = 100;
    leftPosition = 0;
  } else if (displaySlots.length === 2) {
    // 2つの場合は2等分
    slotWidth = 50;
    leftPosition = slotIndex * 50;
  } else {
    // 3つ以上の場合は均等分割（最大4つまで）
    const maxSlots = Math.min(displaySlots.length, 4);
    slotWidth = 100 / maxSlots;
    leftPosition = (slotIndex % maxSlots) * slotWidth;
  }

  // 終日データがある場合、幅を調整
  if (allDayCount > 0) {
    const adjustedWidth = Math.max(slotWidth - allDayCount * 2, 20); // 最小20%は確保
    slotWidth = adjustedWidth;
  }

  // 終日データがある場合、右寄せにするための左位置を調整
  let adjustedLeftPosition = leftPosition;
  if (allDayCount > 0) {
    // 終日データの幅分だけ右にずらす
    adjustedLeftPosition = leftPosition + allDayCount * 2;
  }

  // スロットの高さを計算（開始時間から終了時間まで）
  const slotHeight = (endHour - startHour) * hourHeight;

  // プレビューデータかどうかを判定
  const isPreview = slot.order && slot.order > 1000;

  return {
    top: `${timeLabelHeight}px`,
    height: `${slotHeight}px`,
    backgroundColor: slot.userColor || "#3b82f6",
    opacity: isPreview ? 0.6 : 1,
    border: isPreview ? "2px dashed #666" : "none",
    zIndex: 1 + index,
    width: `${slotWidth}%`,
    left: `${adjustedLeftPosition}%`,
  };
};

// 指定された時間にフォームを開く
const openFormAtTime = (date: string, hour: number) => {
  if (isDateDisabled(date)) {
    return;
  }

  if (props.isCopyMode) {
    const result = handlePaste(date, props.timeData.events);
    if (result.isPasted) {
      const updatedTimeData = {
        ...props.timeData,
        events: result.timeData,
      };
      emit("update:time-data", updatedTimeData);
    }
  } else {
    // 親コンポーネントにフォームを開くイベントを送信
    emit("openForm", { date, hour });
  }
};

const onSave = async (data: { date: string; timeSlots: TimeSlot[] }) => {
  // プレビューデータをクリア
  if (data.date) {
    delete previewData.value[data.date];
  }

  // 親コンポーネントに保存イベントを送信
  emit("save", data);
};

const onDelete = async (data: {
  date: string;
  keepUserData?: boolean;
  userTimeSlots?: TimeSlot[];
}) => {
  emit("delete", data);
};

const handleImportComplete = (importedData: any[]) => {
  const updatedEvents = { ...props.timeData.events };

  importedData.forEach((item) => {
    const { date, timeSlots } = item;
    if (timeSlots && timeSlots.length > 0) {
      updatedEvents[date] = timeSlots;
    }
  });

  const updatedTimeData = {
    ...props.timeData,
    events: updatedEvents,
  };

  emit("update:time-data", updatedTimeData);
};

const openForm = (date: string) => {
  if (isDateDisabled(date)) {
    return;
  }

  if (props.isCopyMode) {
    const result = handlePaste(date, props.timeData.events);
    if (result.isPasted) {
      const updatedTimeData = {
        ...props.timeData,
        events: result.timeData,
      };
      emit("update:time-data", updatedTimeData);
    }
  } else {
    // TimeSideMenuが開いている場合は、TimeSideMenuの日付を更新
    if (showTimeSideMenu.value) {
      timeSideMenuData.value.selectedDate = date;
      // 既存の時間データを更新
      timeSideMenuData.value.existingTime = props.timeData.events[date] || {};
      return;
    }

    // 親コンポーネントにフォームを開くイベントを送信
    emit("openForm", { date });
  }
};

const handleCopy = () => {
  if (!selectedDate.value) return;
  const result = copyLogic(selectedDate.value, props.timeData.events);
  emit("update:is-copy-mode", result.isCopyMode);
};

const handlePreview = (data: { date: string; timeSlots: TimeSlot[] }) => {
  if (data.timeSlots.length > 0) {
    previewData.value[data.date] = data.timeSlots;
  } else {
    delete previewData.value[data.date];
  }
};

const handleCancelCopyMode = () => {
  const result = cancelCopyLogic(props.timeData.events);
  const updatedTimeData = {
    ...props.timeData,
    events: result.timeData,
  };
  emit("update:time-data", updatedTimeData);
  emit("update:is-copy-mode", result.isCopyMode);
};

const getTimeSlots = (date: string): TimeSlot[] => {
  const slots = props.timeData.events[date];

  if (!slots) return [];

  const convertedSlots = Array.isArray(slots) ? slots : [slots];
  return convertedSlots.map((slot) => ({
    start: (slot as any).Start || (slot as any).start,
    end: (slot as any).End || (slot as any).end,
    order: (slot as any).Order || (slot as any).order || 1,
    username: (slot as any).Username || (slot as any).username,
    userColor: (slot as any).UserColor || (slot as any).userColor,
  }));
};

const hasUsernameInDate = (date: string): boolean => {
  const timeSlot = props.timeData.events[date];
  if (!timeSlot) return false;

  if (Array.isArray(timeSlot)) {
    return timeSlot.some((slot: TimeSlot) => !!slot.username);
  }
  return !!(timeSlot as TimeSlot).username;
};

const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isDateDisabled = (date: string): boolean => {
  const selectedDate = new Date(date);

  if (props.timeData.startDate) {
    const startDate = new Date(props.timeData.startDate);
    if (selectedDate < startDate) {
      return true;
    }
  }

  if (props.timeData.endDate) {
    const endDate = new Date(props.timeData.endDate);
    if (selectedDate > endDate) {
      return true;
    }
  }

  return false;
};

const toggleSideMenu = () => {
  emit("toggleSideMenu");
};

const handleOpenTimeSideMenu = (data: any) => {
  // dayがundefinedの場合はselectedDateから抽出
  let day = data.day;
  if (day === undefined && data.selectedDate) {
    const dateParts = data.selectedDate.split("-");
    day = parseInt(dateParts[2], 10);
  }

  timeSideMenuData.value = {
    selectedDate: data.selectedDate,
    year: data.year,
    month: data.month,
    day: day,
    existingTime: data.existingTime,
    isCopyMode: data.isCopyMode,
    allowOtherEdit: data.allowOtherEdit,
    initialHour: data.initialHour,
  };
  showTimeSideMenu.value = true;

  // TimeFormを閉じる
  showModal.value = false;
};

const closeTimeSideMenu = () => {
  showTimeSideMenu.value = false;
};

const handleTimeSideMenuEditModeChanged = (isEditMode: boolean) => {
  isTimeSideMenuEditMode.value = isEditMode;

  // 編集モードが開始された時は、TimeFormを確実に閉じる
  if (isEditMode) {
    showModal.value = false;
  }
};

// TimeSideMenuの編集モードを検証する関数
const isTimeSideMenuInEditMode = () => {
  return isTimeSideMenuEditMode.value;
};

// TimeSideMenuが開かれた時にshowModalを確実にfalseにする
watch(
  () => showTimeSideMenu.value,
  (newShow) => {
    if (newShow) {
      showModal.value = false;
    }
  }
);
</script>
