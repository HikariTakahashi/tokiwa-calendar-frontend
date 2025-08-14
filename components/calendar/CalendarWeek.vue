<template>
  <div class="relative h-full flex flex-col">
    <SideMenu
      :show="props.showSideMenu"
      @toggleSideMenu="toggleSideMenu"
      @import-complete="handleImportComplete"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="props.showSideMenu && !isMobile ? 'ml-80' : 'ml-0'"
    >
      <div class="flex-1 flex flex-col">
        <div class="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div class="flex">
            <div
              class="w-12 sm:w-16 flex-shrink-0 flex justify-center font-bold text-sm sm:text-base p-2 bg-white border-r border-gray-200"
            >
              時間
            </div>
            <div class="flex-1">
              <div class="grid grid-cols-7 gap-0.5 sm:gap-2">
                <div
                  v-for="date in weekDays"
                  :key="date.date"
                  class="flex flex-col items-center justify-center font-bold text-sm sm:text-base p-2 border-l bg-white"
                  :class="[
                    isToday(date.date) ? 'bg-green-100' : '',
                    isDateDisabled(date.date) ? 'bg-gray-300' : '',
                  ]"
                >
                  <div class="text-xs text-gray-600">
                    {{ getDayOfWeek(date.date) }}
                  </div>
                  <div class="text-lg">
                    {{ new Date(date.date).getDate() }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex bg-gray-50">
            <div
              class="w-12 sm:w-16 flex-shrink-0 flex justify-center font-bold text-xs text-gray-600 bg-gray-50 border-r border-gray-200"
            >
              終日
            </div>
            <div class="flex-1">
              <div class="grid grid-cols-7 gap-0.5 sm:gap-2">
                <div
                  v-for="date in weekDays"
                  :key="`allday-${date.date}`"
                  class="flex flex-col items-start justify-start text-xs border-l min-h-8 bg-gray-50 gap-y-1"
                  :class="[isDateDisabled(date.date) ? 'bg-gray-200' : '']"
                >
                  <div
                    v-for="(slot, index) in getAllDaySlots(date.date)"
                    :key="`${date.date}-allday-${slot.start}-${slot.end}-${
                      slot.username || 'default'
                    }-${slot.order || index}`"
                    class="w-full p-1 rounded-t-md rounded-r-md truncate cursor-pointer hover:opacity-80 transition-opacity"
                    :class="getTextColorClass(slot.userColor)"
                    :style="{
                      backgroundColor: slot.userColor || '#3b82f6',
                      opacity: 0.9,
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto relative">
          <div class="flex min-h-full">
            <div class="flex flex-col w-12 sm:w-16 flex-shrink-0">
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

            <div class="flex-1">
              <div class="grid grid-cols-7 gap-0.5 sm:gap-2 min-h-full">
                <div
                  v-for="date in weekDays"
                  :key="date.date"
                  class="flex flex-col relative border-l"
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
                    <div
                      v-for="(slot, index) in getDisplaySlotsForHour(
                        date.date,
                        hour - 1
                      )"
                      :key="`${date.date}-${hour - 1}-${slot.start}-${
                        slot.end
                      }-${slot.username || 'default'}-${slot.order || index}`"
                      class="absolute left-0 right-0 mx-1 text-xs p-1 overflow-hidden"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <TimeForm
        v-if="showModal"
        :close="closeForm"
        :selectedDate="selectedDate"
        :year="year"
        :month="month"
        :existingTime="
          selectedDate ? props.timeData.events[selectedDate] || {} : {}
        "
        :isCopyMode="props.isCopyMode"
        :allowOtherEdit="props.timeData.allowOtherEdit || false"
        @save="onSave"
        @delete="onDelete"
        @copy="handleCopy"
        @cancel-copy-mode="handleCancelCopyMode"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import TimeForm from "@/components/forms/TimeForm.vue";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { type TimeData } from "@/composables/useAPI";
import SideMenu from "@/components/calendar/SideMenu.vue";

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
}

const props = withDefaults(defineProps<Props>(), {
  showSideMenu: false,
});
const emit = defineEmits<{
  (e: "save", data: { date: string; timeSlots: TimeSlot[] }): void;
  (e: "delete", data: { date: string }): void;
  (e: "update:time-data", data: TimeData): void;
  (e: "update:is-copy-mode", value: boolean): void;
  (e: "cancel-copy-mode"): void;
  (e: "toggleSideMenu"): void;
  (e: "import-complete", data: any[]): void;
}>();

const { formatTimeForDisplay, getTextColorClass } = useTimeUtils();
const showModal = ref(false);
const selectedDate = ref<string>("");
const isMobile = ref(false);

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
  if (!slots) return [];

  const convertedSlots = Array.isArray(slots) ? slots : [slots];

  // 終日データのみを抽出（00:00-24:00）
  const allDaySlots = convertedSlots
    .filter((slot) => {
      const slotStart = parseInt(
        (slot as any).Start || (slot as any).start || "0:0",
        10
      );
      const slotEnd = parseInt(
        (slot as any).End || (slot as any).end || "0:0",
        10
      );
      return slotStart === 0 && slotEnd === 24;
    })
    .map((slot) => ({
      start: (slot as any).Start || (slot as any).start,
      end: (slot as any).End || (slot as any).end,
      order: (slot as any).Order || (slot as any).order || 1,
      username: (slot as any).Username || (slot as any).username,
      userColor: (slot as any).UserColor || (slot as any).userColor,
    }))
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
  if (!slots) return [];

  const convertedSlots = Array.isArray(slots) ? slots : [slots];

  // デバッグ用ログ
  if (convertedSlots.length > 2) {
    console.log(
      `[DEBUG] ${date} ${hour}:00 - Processing ${convertedSlots.length} slots:`,
      convertedSlots
    );
  }

  // 指定された時間に表示すべきデータのみを抽出
  const displaySlots = convertedSlots
    .filter((slot) => {
      const normalizedSlot = {
        start: (slot as any).Start || (slot as any).start,
        end: (slot as any).End || (slot as any).end,
        order: (slot as any).Order || (slot as any).order || 1,
        username: (slot as any).Username || (slot as any).username,
        userColor: (slot as any).UserColor || (slot as any).userColor,
      };

      const shouldDisplay = shouldDisplaySlotInHour(normalizedSlot, hour);

      // デバッグ用ログ
      if (convertedSlots.length > 2) {
        console.log(
          `[DEBUG] ${date} ${hour}:00 - Slot ${normalizedSlot.username} (${normalizedSlot.start}-${normalizedSlot.end}) should display: ${shouldDisplay}`
        );
      }

      return shouldDisplay;
    })
    .map((slot) => ({
      start: (slot as any).Start || (slot as any).start,
      end: (slot as any).End || (slot as any).end,
      order: (slot as any).Order || (slot as any).order || 1,
      username: (slot as any).Username || (slot as any).username,
      userColor: (slot as any).UserColor || (slot as any).userColor,
    }))
    .sort((a, b) => (a.order || 1) - (b.order || 1));

  // デバッグ用ログ
  if (displaySlots.length > 0) {
    console.log(
      `[DEBUG] ${date} ${hour}:00 - Display slots: ${displaySlots.length}`,
      displaySlots
    );
  }

  return displaySlots;
};

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
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

  // デバッグ用ログ
  if (displaySlots.length > 2) {
    console.log(
      `[DEBUG] ${date} ${hour}:00 - Slot ${slot.username} (${slot.start}-${slot.end}) index: ${slotIndex}, total slots: ${displaySlots.length}`
    );
  }

  // カラム分割の計算
  let slotWidth: number;
  let leftPosition: number;

  if (displaySlots.length <= 1) {
    // 1つの場合は全幅
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

  // デバッグ用ログ
  if (displaySlots.length > 2) {
    console.log(
      `[DEBUG] ${date} ${hour}:00 - Slot ${slot.username} - width: ${slotWidth}%, left: ${leftPosition}%`
    );
  }

  // スロットの高さを計算（開始時間から終了時間まで）
  const slotHeight = (endHour - startHour) * hourHeight;

  return {
    top: `${timeLabelHeight}px`, // 時間表示の下に配置
    height: `${slotHeight}px`,
    backgroundColor: slot.userColor || "#3b82f6",
    zIndex: 1 + index,
    width: `${slotWidth}%`,
    left: `${leftPosition}%`,
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
    selectedDate.value = date;
    showModal.value = true;
  }
};

const onSave = async (data: { date: string; timeSlots: TimeSlot[] }) => {
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
    selectedDate.value = date;
    showModal.value = true;
  }
};

const closeForm = () => {
  showModal.value = false;
};

const handleCopy = () => {
  if (!selectedDate.value) return;
  const result = copyLogic(selectedDate.value, props.timeData.events);
  emit("update:is-copy-mode", result.isCopyMode);
  showModal.value = false;
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

const isPastedDate = (date: string): boolean => {
  return pastedDates.value.has(date);
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
</script>
