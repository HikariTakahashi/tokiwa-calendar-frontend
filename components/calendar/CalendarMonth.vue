<template>
  <div class="relative h-full flex flex-col z-10">
    <LeftSideMenu
      :show="props.showSideMenu"
      @toggleSideMenu="toggleSideMenu"
      @import-complete="handleImportComplete"
      @google-calendar-sync="handleGoogleCalendarSync"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="[
        props.showSideMenu && !isMobile ? 'ml-80' : 'ml-0',
        props.showTimeSideMenu && !isMobile ? 'mr-96' : 'mr-0',
      ]"
    >
      <CalendarWeek />
      <div
        class="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-2 flex-1 sm:p-1.5 min-h-0"
      >
        <div
          v-for="date in calendarDays"
          :key="date.date"
          class="flex flex-col items-center border rounded transition-transform duration-200 shadow-md"
          :class="[
            isCurrentMonth(date.date) ? '' : 'bg-gray-100',
            props.isCopyMode && date.date !== props.copiedFromDate
              ? 'cursor-pointer'
              : '',
            props.isCopyMode && date.date === props.copiedFromDate
              ? 'border-4 border-dashed border-blue-500 cursor-not-allowed'
              : '',
            props.isCopyMode &&
            props.timeData.events[date.date] === effectiveCopiedTimeData
              ? 'border-4 border-blue-500'
              : '',
            props.isCopyMode &&
            hasUsernameInDate(date.date) &&
            isPastedDate(date.date)
              ? 'border-8 border-blue-500'
              : '',
            isDateDisabled(date.date)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'hover:-translate-y-1',
          ]"
          @click="openForm(date.date)"
        >
          <div
            class="flex items-center justify-center sm:mt-1 font-bold"
            :class="[
              isCurrentMonth(date.date) ? 'text-gray-700' : 'text-gray-400',
              isDateDisabled(date.date) ? 'text-white' : '',
              isToday(date.date)
                ? 'bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                : '',
            ]"
          >
            {{ new Date(date.date).getDate() }}
          </div>
          <!-- 予定調整モードの表示 -->
          <TimeDisplay
            v-if="props.displayMode === 'time'"
            :date="date.date"
            :time-data="props.timeData"
          />

          <!-- タスク管理モードの表示 -->
          <TaskDisplay
            v-if="props.displayMode === 'task'"
            :date="date.date"
            :time-data="props.timeData"
            @edit-task="handleEditTask"
          />
        </div>
      </div>
    </div>
  </div>

  <RightSideMenu
    v-if="props.showTimeSideMenu"
    :show="props.showTimeSideMenu"
    :selectedDate="timeSideMenuData.selectedDate"
    :year="timeSideMenuData.year"
    :month="timeSideMenuData.month"
    :day="timeSideMenuData.day"
    :existingTime="timeSideMenuData.existingTime"
    :isCopyMode="timeSideMenuData.isCopyMode"
    :allowOtherEdit="timeSideMenuData.allowOtherEdit"
    :initialHour="timeSideMenuData.initialHour"
    :startDate="props.timeData.startDate"
    :endDate="props.timeData.endDate"
    @save="onSave"
    @delete="onDelete"
    @copy="handleCopy"
    @preview="handlePreview"
    @close="closeTimeSideMenu"
    @editModeChanged="handleTimeSideMenuEditModeChanged"
  />
</template>

<script setup lang="ts">
import RightSideMenu from "@/components/sidemenu/RightSideMenu.vue";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { type DisplayMode } from "@/utils/DisplayUtils";
import { useCopyLogic } from "@/utils/CopyLogicUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import { useAPI, type TimeData } from "@/composables/useAPI";
import CalendarWeek from "@/components/calendar/CalendarWeeks.vue";
import LeftSideMenu from "~/components/sidemenu/LeftSideMenu.vue";
import TimeDisplay from "@/components/calendar/display/TimeDisplay.vue";
import TaskDisplay from "@/components/calendar/display/TaskDisplay.vue";

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

interface Props {
  calendarDays: CalendarDay[];
  year: number;
  month: number;
  isCopyMode: boolean;
  copiedTimeData?: any;
  pastedDates?: Set<string>;
  copiedFromDate?: string | null;
  pasteHandler?: (date: string, timeData: Record<string, any>) => any;
  spaceId?: string;
  timeData: TimeData;
  showSideMenu?: boolean;
  showTimeSideMenu?: boolean;
  displayMode?: DisplayMode;
}

const props = withDefaults(defineProps<Props>(), {
  showSideMenu: false,
  showTimeSideMenu: false,
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
  (
    e: "openForm",
    data: { date: string; hour?: number; taskIndex?: number; editMode?: string }
  ): void;
  (e: "openTimeSideMenu", data: any): void;
  (e: "closeTimeSideMenu"): void;
}>();

const showModal = ref(false);
const selectedDate = ref<string>("");
const isMobile = ref(false);
const isTimeSideMenuEditMode = ref(false);
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

// 親コンポーネントからコピーデータを受け取る場合は、それを使用
// そうでなければ独自のuseCopyLogicを使用
const localCopyLogic = useCopyLogic();
const effectiveCopiedTimeData = computed(
  () => props.copiedTimeData || localCopyLogic.copiedTimeData.value
);
const effectivePastedDates = computed(
  () => props.pastedDates || localCopyLogic.pastedDates.value
);
const effectiveHandlePaste = props.pasteHandler || localCopyLogic.handlePaste;

// effectiveCopiedTimeDataの変更を監視

const { fetchSpaceData, syncTimeData } = useAPI();

const onSave = async (data: { date: string; timeSlots: TimeSlot[] }) => {
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

// Googleカレンダー同期処理
const handleGoogleCalendarSync = (tasks: any[]) => {
  const updatedEvents = { ...props.timeData.events };

  tasks.forEach((task) => {
    // イベントの日付を使用（convertToTokiwaTaskで設定されたeventDate）
    const eventDate = task.eventDate || new Date().toISOString().split("T")[0];

    // タスクをTokiwaの形式に変換
    const tokiwaTask = {
      taskName: task.taskName,
      description: task.description,
      start: task.start,
      end: task.end,
      userColor: task.userColor || "#3b82f6",
      order: task.order || 1,
      googleEventId: task.googleEventId,
      location: task.location || "",
      isAllDay: task.isAllDay || false, // 終日フラグを追加
    };

    // 既存のタスクがある場合は追加、ない場合は新規作成
    if (updatedEvents[eventDate]) {
      updatedEvents[eventDate].push(tokiwaTask);
    } else {
      updatedEvents[eventDate] = [tokiwaTask];
    }
  });

  const updatedTimeData = {
    ...props.timeData,
    events: updatedEvents,
  };

  emit("update:time-data", updatedTimeData);
};

const isCurrentMonth = (dateString: string): boolean => {
  const d = new Date(dateString);
  return d.getFullYear() === props.year && d.getMonth() + 1 === props.month;
};

const openForm = (date: string) => {
  if (isDateDisabled(date)) {
    return;
  }

  // コピーモードでコピー元の日付をクリックした場合は何もしない
  if (props.isCopyMode && date === props.copiedFromDate) {
    return;
  }

  if (props.isCopyMode) {
    const result = effectiveHandlePaste(date, props.timeData.events);
    if (result.isPasted) {
      const updatedTimeData = {
        ...props.timeData,
        events: result.timeData,
      };
      emit("update:time-data", updatedTimeData);
    }
  } else {
    // TimeSideMenuが開いている場合は、TimeSideMenuの日付を更新
    if (props.showTimeSideMenu) {
      timeSideMenuData.value.selectedDate = date;
      // 既存の時間データを更新
      timeSideMenuData.value.existingTime = props.timeData.events[date] || {};
      return;
    }

    // 親コンポーネントにフォームを開くイベントを送信
    emit("openForm", { date });
  }
};

// タスク編集時のハンドラー
const handleEditTask = (data: {
  date: string;
  taskIndex: number;
  task: any;
}) => {
  // 親コンポーネントにタスク編集イベントを送信
  emit("openForm", {
    date: data.date,
    taskIndex: data.taskIndex,
    editMode: "edit",
  });
};

const handleCopy = () => {
  if (!selectedDate.value) return;
  const result = localCopyLogic.handleCopy(
    selectedDate.value,
    props.timeData.events
  );
  emit("update:is-copy-mode", result.isCopyMode);
};

// getTimeSlots関数は各表示コンポーネントで実装するため削除
// const getTimeSlots = (date: string): TimeSlot[] | TaskSlot[] => {
//   const slots = props.timeData.events[date];

//   if (!slots) return [];

//   const convertedSlots = Array.isArray(slots) ? slots : [slots];
//   return convertedSlots.map((slot) => ({
//     start: (slot as any).Start || (slot as any).start,
//     end: (slot as any).End || (slot as any).end,
//     order: (slot as any).Order || (slot as any).order || 1,
//     username: (slot as any).Username || (slot as any).username,
//     userColor: (slot as any).UserColor || (slot as any).userColor,
//     // タスク管理モード用のフィールド
//     taskName: (slot as any).taskName || (slot as any).TaskName || "",
//     description: (slot as any).description || (slot as any).Description || "",
//     priority: (slot as any).priority || (slot as any).Priority || "medium",
//     status: (slot as any).status || (slot as any).Status || "pending",
//   }));
// };

const hasUsernameInDate = (date: string): boolean => {
  const timeSlot = props.timeData.events[date];
  if (!timeSlot) return false;

  if (Array.isArray(timeSlot)) {
    return timeSlot.some((slot: TimeSlot) => !!slot.username);
  }
  return !!(timeSlot as TimeSlot).username;
};

const isPastedDate = (date: string): boolean => {
  if (effectivePastedDates instanceof Set) {
    return effectivePastedDates.has(date);
  } else {
    return effectivePastedDates.value.has(date);
  }
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

  emit("openTimeSideMenu", timeSideMenuData.value);

  // TimeFormを閉じる
  showModal.value = false;
};

const closeTimeSideMenu = () => {
  emit("closeTimeSideMenu");
};

const handleTimeSideMenuEditModeChanged = (isEditMode: boolean) => {
  isTimeSideMenuEditMode.value = isEditMode;

  // 編集モードが開始された時は、TimeFormを確実に閉じる
  if (isEditMode) {
    showModal.value = false;
  }
};

const handlePreview = (data: { date: string; timeSlots: TimeSlot[] }) => {
  // プレビュー処理を実装（必要に応じて）
};

// TimeSideMenuの編集モードを検証する関数
const isTimeSideMenuInEditMode = () => {
  return isTimeSideMenuEditMode.value;
};

// TimeSideMenuが開かれた時にshowModalを確実にfalseにする
watch(
  () => props.showTimeSideMenu,
  (newShow) => {
    if (newShow) {
      showModal.value = false;
    }
  }
);
</script>
