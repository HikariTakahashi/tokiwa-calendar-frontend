<template>
  <div class="h-full flex flex-col">
    <!-- 初期化前のローディング表示 -->
    <div
      v-if="!isClientMounted"
      class="h-full flex items-center justify-center"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">読み込み中...</p>
      </div>
    </div>

    <!-- 初期化後の表示 -->
    <div v-else class="h-full flex flex-col">
      <!-- 非ログイン時の表示 -->
      <div
        v-if="!isAuthenticated && isInitialized"
        class="min-h-screen bg-gray-50"
      >
        <LoginPrompt
          title="タスク管理モード"
          description="タスク管理機能を利用するには、ログインまたは新規登録が必要です。"
          footerText="ログインすると、タスクの作成・編集・管理が可能になります。"
        />
      </div>

      <!-- ログイン時の表示 -->
      <div v-else-if="isAuthenticated" class="h-full flex flex-col">
        <!-- 固定ヘッダー -->
        <div class="flex-shrink-0 sticky top-0 z-30 bg-white">
          <component
            :is="isCopyMode ? CopyModeHeader : TaskHeader"
            :current-year="currentYear"
            :current-month="currentMonth"
            :current-day="currentDay"
            :current-week="currentWeek"
            :time-data="timeData"
            :is-sync="false"
            :space-id="spaceId || ''"
            :view-mode="viewModeState.viewMode.value"
            @next-month="handleNextMonth"
            @prev-month="handlePrevMonth"
            @next-year="handleNextYear"
            @prev-year="handlePrevYear"
            @next-week="handleNextWeek"
            @prev-week="handlePrevWeek"
            @view-mode-changed="handleViewModeChanged"
            @close-copy-mode="closeCopyMode"
            @cancel-copy-mode="handleCancelCopyMode"
            @toggleSideMenu="toggleSideMenu"
            @go-to-today="handleGoToToday"
            @go-to-specific-date="handleGoToSpecificDate"
            @open-form="handleOpenForm"
          />
        </div>
        <!-- スクロール可能なコンテンツ -->
        <div class="flex-1 min-h-0 overflow-auto">
          <!-- 年表示 -->
          <CalendarYear
            v-if="viewModeState.isYearView()"
            :year="currentYear"
            :is-copy-mode="isCopyMode"
            :space-id="spaceId"
            :time-data="timeData"
            :show-side-menu="showSideMenu"
            :display-mode="'task'"
            @save="saveTime"
            @delete="deleteTime"
            @update:time-data="updateTimeData"
            @update:is-copy-mode="updateIsCopyMode"
            @cancel-copy-mode="handleCancelCopyMode"
            @toggleSideMenu="toggleSideMenu"
            @import-complete="handleImportComplete"
            @month-selected="handleMonthSelected"
            @open-form="handleOpenForm"
          />

          <!-- 月表示 -->
          <CalendarMonth
            v-else-if="viewModeState.isMonthView()"
            :calendar-days="calendarDays"
            :year="currentYear"
            :month="currentMonth"
            :is-copy-mode="isCopyMode"
            :space-id="spaceId"
            :time-data="timeData"
            :show-side-menu="showSideMenu"
            :display-mode="'task'"
            @save="saveTime"
            @delete="deleteTime"
            @update:time-data="updateTimeData"
            @update:is-copy-mode="updateIsCopyMode"
            @cancel-copy-mode="handleCancelCopyMode"
            @toggleSideMenu="toggleSideMenu"
            @import-complete="handleImportComplete"
            @open-form="handleOpenForm"
          />

          <!-- 週表示 -->
          <CalendarWeek
            v-else-if="viewModeState.isWeekView()"
            :year="currentYear"
            :month="currentMonth"
            :day="currentDay"
            :is-copy-mode="isCopyMode"
            :space-id="spaceId"
            :time-data="timeData"
            :show-side-menu="showSideMenu"
            :display-mode="'task'"
            @save="saveTime"
            @delete="deleteTime"
            @update:time-data="updateTimeData"
            @update:is-copy-mode="updateIsCopyMode"
            @cancel-copy-mode="handleCancelCopyMode"
            @toggleSideMenu="toggleSideMenu"
            @import-complete="handleImportComplete"
            @open-form="handleOpenForm"
          />
        </div>
      </div>

      <!-- ローディング表示 -->
      <div v-else class="h-full flex items-center justify-center">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">読み込み中...</p>
        </div>
      </div>

      <!-- フォームモーダル -->
      <Teleport to="body">
        <!-- デスクトップ用TaskForm -->
        <TaskForm
          v-if="
            showModal &&
            !isTimeSideMenuEditMode &&
            !showTimeSideMenu &&
            !isMobile
          "
          :close="closeForm"
          :selectedDate="selectedDate"
          :year="currentYear"
          :month="currentMonth"
          :existingTime="
            selectedDate ? timeData.events[selectedDate] || {} : {}
          "
          :timeData="timeData"
          :is-copy-mode="isCopyMode"
          :allow-other-edit="timeData.allowOtherEdit || false"
          :initial-hour="selectedHour"
          :editing-task-index="editingTaskIndex"
          :editing-task="editingTask"
          @save="saveTime"
          @delete="deleteTime"
          @copy="handleCopy"
          @cancel-copy-mode="handleCancelCopyMode"
          @preview="handlePreview"
          @open-time-side-menu="handleOpenTimeSideMenu"
        />

        <!-- モバイル用TaskForm -->
        <MobileTaskForm
          v-if="
            showModal &&
            !isTimeSideMenuEditMode &&
            !showTimeSideMenu &&
            isMobile
          "
          :show="showModal"
          :selectedDate="selectedDate"
          :year="currentYear"
          :month="currentMonth"
          :existingTime="
            selectedDate ? timeData.events[selectedDate] || {} : {}
          "
          :timeData="timeData"
          :is-copy-mode="isCopyMode"
          :allow-other-edit="timeData.allowOtherEdit || false"
          :initial-hour="selectedHour"
          :editing-task-index="editingTaskIndex"
          :editing-task="editingTask"
          @save="saveTime"
          @delete="deleteTime"
          @copy="handleCopy"
          @preview="handlePreview"
          @close="closeForm"
        />
      </Teleport>

      <!-- TimeSideMenu -->
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
        @save="saveTime"
        @delete="deleteTime"
        @copy="handleCopy"
        @preview="handlePreview"
        @close="closeTimeSideMenu"
        @editModeChanged="handleTimeSideMenuEditModeChanged"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import TaskHeader from "@/components/header/TaskHeader.vue";
import CopyModeHeader from "@/components/header/CopyModeHeader.vue";
import CalendarMonth from "@/components/calendar/CalendarMonth.vue";
import CalendarWeek from "@/components/calendar/CalendarWeek.vue";
import CalendarYear from "@/components/calendar/CalendarYear.vue";
import LoginPrompt from "@/components/forms/LoginPrompt.vue";
import TaskForm from "@/components/forms/TaskForm.vue";
import MobileTaskForm from "@/components/forms/MobileTaskForm.vue";
import TimeSideMenu from "@/components/sidemenu/TimeSideMenu.vue";

import { useDateUtils } from "@/utils/DateUtils";
import { useViewMode, createViewModeHandlers } from "@/utils/ViewModeUtils";
import type { TimeSlot } from "@/utils/TimeUtils";
import type { TimeData } from "@/composables/useAPI";
import { useAuth } from "@/composables/useAuth";
import { useAPI } from "@/composables/useAPI";

// 認証状態の管理
const { user, isAuthenticated, isInitialized, initializeAuth } = useAuth();

// API機能を使用
const { getTaskData } = useAPI();

// クライアントサイドマウント状態
const isClientMounted = ref(false);

const {
  currentYear,
  currentMonth,
  currentDay,
  currentWeek,
  getCalendarDays,
  nextMonth,
  prevMonth,
  nextYear,
  prevYear,
  nextWeek,
  prevWeek,
} = useDateUtils();

const timeData = ref<TimeData>({
  events: {},
  spaceId: "",
  username: "",
  userColor: "",
});
const isCopyMode = ref(false);
const showSideMenu = ref(false);
const spaceId = ref<string | undefined>(undefined);

// フォーム関連の状態
const showModal = ref(false);
const selectedDate = ref<string>("");
const selectedHour = ref<number | undefined>(undefined);
const isMobile = ref(false);
const showTimeSideMenu = ref(false);
const isTimeSideMenuEditMode = ref(false);

// タスク編集用の状態
const editingTaskIndex = ref<number>(-1);
const editingTask = ref<any>(null);

// TimeSideMenu関連の状態
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

// 表示方法の管理
const viewModeState = useViewMode("month");
const calendarDays = ref(
  getCalendarDays(currentYear.value, currentMonth.value)
);

const updateTimeData = (newTimeData: TimeData) => {
  timeData.value = newTimeData;
};

const updateIsCopyMode = (value: boolean) => {
  isCopyMode.value = value;
};

const closeCopyMode = () => {
  isCopyMode.value = false;
};

const handleNextMonth = () => {
  nextMonth();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const handlePrevMonth = () => {
  prevMonth();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const handleNextYear = () => {
  nextYear();
};

const handlePrevYear = () => {
  prevYear();
};

const handleNextWeek = () => {
  nextWeek();
};

const handlePrevWeek = () => {
  prevWeek();
};

// 表示方法のハンドラー
const { handleViewModeChanged, handleMonthSelected } = createViewModeHandlers(
  viewModeState,
  {
    onMonthSelected: (month: number) => {
      currentMonth.value = month;
      calendarDays.value = getCalendarDays(
        currentYear.value,
        currentMonth.value
      );
    },
  }
);

const saveTime = ({
  date,
  timeSlots,
}: {
  date: string;
  timeSlots: TimeSlot[];
}) => {
  timeData.value.events[date] = timeSlots;
};

const deleteTime = (data: {
  date: string;
  keepUserData?: boolean;
  userTimeSlots?: TimeSlot[];
}) => {
  if (
    data.keepUserData &&
    data.userTimeSlots &&
    data.userTimeSlots.length > 0
  ) {
    timeData.value.events[data.date] = data.userTimeSlots;
  } else {
    delete timeData.value.events[data.date];
  }
};

const toggleSideMenu = () => {
  showSideMenu.value = !showSideMenu.value;
};

const handleImportComplete = (importedData: any[]) => {
  const updatedEvents = { ...timeData.value.events };

  importedData.forEach((item) => {
    const { date, timeSlots } = item;
    if (timeSlots && timeSlots.length > 0) {
      updatedEvents[date] = timeSlots;
    }
  });

  timeData.value = {
    ...timeData.value,
    events: updatedEvents,
  };
};

const handleGoToToday = () => {
  const today = new Date();
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth() + 1;
  currentDay.value = today.getDate();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

const handleGoToSpecificDate = (date: string) => {
  const selectedDate = new Date(date);
  currentYear.value = selectedDate.getFullYear();
  currentMonth.value = selectedDate.getMonth() + 1;
  currentDay.value = selectedDate.getDate();
  calendarDays.value = getCalendarDays(currentYear.value, currentMonth.value);
};

// フォーム関連のハンドラー
const closeForm = () => {
  showModal.value = false;
  selectedHour.value = undefined;
};

const handleCopy = () => {
  // コピーモードの処理
  isCopyMode.value = true;
  showModal.value = false;
};

const handlePreview = (data: { date: string; timeSlots: TimeSlot[] }) => {
  // プレビュー処理
  console.log("Preview:", data);
};

const handleOpenTimeSideMenu = (data: any) => {
  // TimeSideMenuを開く処理
  timeSideMenuData.value = {
    selectedDate: data.selectedDate,
    year: data.year,
    month: data.month,
    day: data.day,
    existingTime: data.existingTime,
    isCopyMode: data.isCopyMode,
    allowOtherEdit: data.allowOtherEdit,
    initialHour: data.initialHour,
  };
  showTimeSideMenu.value = true;
  showModal.value = false;
};

const closeTimeSideMenu = () => {
  showTimeSideMenu.value = false;
  isTimeSideMenuEditMode.value = false;
};

const handleTimeSideMenuEditModeChanged = (isEditMode: boolean) => {
  isTimeSideMenuEditMode.value = isEditMode;
};

const handleCancelCopyMode = () => {
  isCopyMode.value = false;
};

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// カレンダーコンポーネントからのフォーム開要求を処理
const handleOpenForm = (data: {
  date: string;
  hour?: number;
  taskIndex?: number;
  editMode?: string;
}) => {
  selectedDate.value = data.date;
  selectedHour.value = data.hour;

  // タスク編集モードの場合は、編集対象のタスク情報を設定
  if (data.editMode === "edit" && data.taskIndex !== undefined) {
    const existingTasks = timeData.value.events[data.date];
    if (
      existingTasks &&
      Array.isArray(existingTasks) &&
      existingTasks[data.taskIndex]
    ) {
      // 編集対象のタスクを設定
      editingTaskIndex.value = data.taskIndex;
      editingTask.value = { ...existingTasks[data.taskIndex] };
    }
  } else {
    // 新規追加モード
    editingTaskIndex.value = -1;
    editingTask.value = null;
  }

  showModal.value = true;
};

// タスクデータを取得する関数
const loadTaskData = async () => {
  try {
    console.log(
      "loadTaskData called - isAuthenticated:",
      isAuthenticated.value,
      "user:",
      user.value
    );

    if (isAuthenticated.value && user.value) {
      console.log("タスクデータを取得中...");
      const response = await getTaskData();

      if (response.success && response.events) {
        console.log("バックエンドから取得した生データ:", response.events);

        // バックエンド形式からフロントエンド形式に変換
        const convertedEvents: { [key: string]: any[] } = {};
        Object.entries(response.events).forEach(([date, tasks]) => {
          console.log(`日付 ${date} のタスク数:`, tasks.length);
          console.log(
            `日付 ${date} のタスク詳細（JSON）:`,
            JSON.stringify(tasks, null, 2)
          );

          convertedEvents[date] = tasks.map((task, index) => {
            // バックエンドのTaskSlot形式からフロントエンドのTaskSlot形式に変換
            const convertedTask = {
              taskName: task.title || "", // バックエンドではTitleフィールド
              description: task.description || "",
              start: task.start || "00:00",
              end: task.end || "24:00",
              userColor: task.userColor || "#3b82f6",
              order: task.order || index + 1,
            };
            console.log(`タスク ${index} の変換結果:`, convertedTask);
            return convertedTask;
          });
        });

        console.log("変換後のイベントデータ:", convertedEvents);
        timeData.value.events = convertedEvents;
        console.log(
          "timeData.value.events に設定されたデータ:",
          timeData.value.events
        );
        console.log("タスクデータを正常に取得しました:", convertedEvents);

        // 強制的な再レンダリングをトリガー
        await nextTick();
        console.log("再レンダリング後のtimeData:", timeData.value);
      } else {
        console.log("タスクデータがありません");
        timeData.value.events = {};
      }
    }
  } catch (error) {
    console.error("タスクデータの取得に失敗しました:", error);
    timeData.value.events = {};
  }
};

// 認証状態の変更を監視
watch(
  () => isAuthenticated.value,
  async (newValue) => {
    if (newValue && user.value) {
      // 認証されたらタスクデータを取得
      await loadTaskData();
    }
  }
);

// 認証初期化完了の監視
watch(
  () => isInitialized.value,
  async (newValue) => {
    if (newValue && isAuthenticated.value && user.value) {
      // 認証初期化が完了し、認証済みの場合にタスクデータを取得
      await loadTaskData();
    }
  }
);

// コンポーネントマウント時に認証状態を初期化
onMounted(async () => {
  isClientMounted.value = true;
  initializeAuth();
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // 認証状態の初期化を待ってからタスクデータを取得
  await nextTick();
  if (isAuthenticated.value && user.value) {
    await loadTaskData();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});

// SEOメタデータの設定
useHead({
  title: "タスク管理モード - Tokiwa Calendar",
  meta: [
    {
      name: "description",
      content:
        "Tokiwa Calendarのタスク管理モード。ログインしてタスクの作成・編集・管理を行えます。",
    },
  ],
});
</script>
