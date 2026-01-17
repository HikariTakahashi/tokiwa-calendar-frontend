<template>
  <div class="absolute top-0 left-0 h-full z-40">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform -translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform -translate-x-full opacity-0"
    >
      <DesktopDisplay
        v-show="show && !isMobile"
        :import-text="importText"
        :import-error="importError"
        :import-success="importSuccess"
        :is-initialized="isInitialized"
        :is-authenticated="isAuthenticated"
        :user="user"
        :is-client="isClient"
        :is-loading-providers="isLoadingProviders"
        :is-google-linked="isGoogleLinked"
        @update:import-text="updateImportText"
        @handle-import="handleImport"
        @handle-connect-toki-wa-alarm="handleConnectTokiWaAlarm"
        @handle-logout="handleLogout"
        @handle-connect-google-calendar="handleConnectGoogleCalendar"
      />
    </Transition>
  </div>

  <MobileDisplay
    :show="show && isMobile"
    :import-text="importText"
    :import-error="importError"
    :import-success="importSuccess"
    :is-initialized="isInitialized"
    :is-authenticated="isAuthenticated"
    :user="user"
    :is-client="isClient"
    :is-loading-providers="isLoadingProviders"
    :is-google-linked="isGoogleLinked"
    :sync-error="syncError"
    :sync-success="syncSuccess"
    :is-syncing="isSyncing"
    @toggle-side-menu="emit('toggleSideMenu')"
    @update:import-text="updateImportText"
    @handle-import="handleImport"
    @handle-logout="handleLogout"
    @handle-connect-toki-wa-alarm="handleConnectTokiWaAlarm"
    @handle-connect-google-calendar="handleConnectGoogleCalendar"
  />

  <!-- デスクトップ用メインコンテンツのオーバーレイ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show && !isMobile"
      class="absolute left-0 top-0 w-80 h-full z-30"
      @click="emit('toggleSideMenu')"
    ></div>
  </Transition>

  <AccessModal :show="showTokiWaAlarmModal" @close="closeTokiWaAlarmModal" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useDateImportUtils } from "~/utils/DateImportUtils";
import AccessModal from "~/components/alarms/AccessModal.vue";
import { useAccountLink } from "~/composables/useAccountLink";
import DesktopDisplay from "~/components/sidemenu/calendar/DesktopDisplay.vue";
import MobileDisplay from "~/components/sidemenu/calendar/MobileDisplay.vue";

interface Props {
  show: boolean;
}

const { user, isAuthenticated, logout, initializeAuth, isInitialized } =
  useAuth();
const { getUserProviders } = useAccountLink();
const isMobile = ref(false);

// Googleアカウントのリンク状態を管理
const linkedProviders = ref<string[]>([]);
const isLoadingProviders = ref(false);

// process.clientをリアクティブ変数として定義
const isClient = ref(process.client);

// ログアウト処理
const handleLogout = () => {
  logout();
  navigateTo("/");
};

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// コンポーネントマウント時とリサイズ時に判定
onMounted(() => {
  // プラグインで初期化されているため、ここでは初期化しない
  checkMobile();
  window.addEventListener("resize", checkMobile);
  window.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("keydown", handleEscapeKey);
});

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "toggleSideMenu"): void;
  (e: "settings"): void;
  (e: "import-complete", data: any[]): void;
  (e: "google-calendar-sync", data: any[]): void;
}>();

const { importDateData } = useDateImportUtils();

const importText = ref("");
const importError = ref("");
const importSuccess = ref(false);
const showTokiWaAlarmModal = ref(false);
const syncError = ref("");
const syncSuccess = ref(false);
const isSyncing = ref(false);

// isLoggedInをisAuthenticatedと連動（初期化完了後のみ）
const isLoggedIn = computed(() => isInitialized.value && isAuthenticated.value);

// Googleアカウントがリンクされているかチェック
const isGoogleLinked = computed(() =>
  linkedProviders.value.includes("google.com")
);

// プロバイダー情報を取得する関数
const loadProviders = async () => {
  if (!isAuthenticated.value || !user.value) {
    linkedProviders.value = [];
    return;
  }

  isLoadingProviders.value = true;
  try {
    const providers = await getUserProviders();
    linkedProviders.value = providers;
  } catch (error) {
    console.error("プロバイダー情報の取得に失敗しました:", error);
    linkedProviders.value = [];
  } finally {
    isLoadingProviders.value = false;
  }
};

const updateImportText = (value: string) => {
  importText.value = value;
};

const handleImport = () => {
  if (!importText.value.trim()) {
    importError.value = "テキストを入力してください";
    importSuccess.value = false;
    return;
  }

  const result = importDateData(importText.value);

  if (result.success && result.data) {
    importError.value = "";
    importSuccess.value = true;
    emit("import-complete", result.data);

    // 3秒後に成功メッセージをクリア
    setTimeout(() => {
      importSuccess.value = false;
    }, 3000);
  } else {
    importError.value = result.error || "インポートに失敗しました";
    importSuccess.value = false;
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Tab") {
    emit("toggleSideMenu");
  }
};

const handleConnectTokiWaAlarm = () => {
  showTokiWaAlarmModal.value = true;
};

const closeTokiWaAlarmModal = () => {
  showTokiWaAlarmModal.value = false;
};

// Google Calendar同期処理
const handleConnectGoogleCalendar = (tasks?: any[]) => {
  if (tasks && tasks.length > 0) {
    // 親コンポーネントに同期データを渡す
    emit("google-calendar-sync", tasks);
  }
};

// 認証状態の変更を監視してプロバイダー情報を更新
watch(
  () => isAuthenticated.value,
  async (newValue) => {
    if (newValue && user.value) {
      await loadProviders();
    } else {
      linkedProviders.value = [];
    }
  },
  { immediate: true }
);

// 認証初期化完了の監視
watch(
  () => isInitialized.value,
  async (newValue) => {
    if (newValue && isAuthenticated.value && user.value) {
      await loadProviders();
    }
  },
  { immediate: true }
);
</script>
