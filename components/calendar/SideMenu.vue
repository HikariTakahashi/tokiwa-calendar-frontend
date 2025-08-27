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
      <div
        v-show="show && !isMobile"
        class="absolute left-0 top-0 w-80 h-full border-r border-t rounded-tr-lg border-gray-300 bg-white z-[60] shadow-lg overflow-y-auto"
      >
        <div class="p-2">
          <div class="flex flex-row items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">メニュー</h3>
            <button
              @click.stop="navigateTo('/settings')"
              class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <UIcon name="ic:baseline-settings" class="size-5" />
            </button>
          </div>

          <!-- ClientOnlyで認証状態に依存する部分をラップ -->
          <ClientOnly :key="`desktop-auth-${isInitialized}-${isAuthenticated}`">
            <!-- プロセスクライアントでのみレンダリング -->
            <div v-if="isClient">
              <!-- 認証状態初期化中はローディング表示 -->
              <div
                v-if="!isInitialized"
                class="flex flex-col gap-y-4 items-center"
              >
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                ></div>
                <p class="text-sm text-gray-500">認証状態を確認中...</p>
              </div>
              <!-- 初期化完了後、未認証の場合 -->
              <div
                v-else-if="!isAuthenticated"
                class="flex flex-col items-center gap-y-4 px-4"
              >
                <h5 class="text-sm text-gray-500">
                  メニューの機能にアクセスするためには、ログイン・サインアップが必要です。
                </h5>
                <buttons-square
                  @click="navigateTo('/login')"
                  color="bg-blue-200"
                  class="w-4/5 text-lg cursor-pointer"
                  >ログイン</buttons-square
                >
                <buttons-square
                  @click="navigateTo('/signup')"
                  color="bg-blue-200"
                  class="w-4/5 text-lg cursor-pointer"
                  >サインアップ</buttons-square
                >
                <h5 class="text-sm text-gray-500">
                  メニューの機能に関しての詳細ついては、<button
                    @click.stop="navigateTo('/welcome/getting-started/menu')"
                    class="text-blue-500 hover:underline cursor-pointer"
                  >
                    インタロダクション</button
                  >をご覧ください。
                </h5>
              </div>
              <!-- 認証済みの場合 -->
              <div v-else class="flex flex-col gap-y-4">
                <div class="flex flex-col gap-y-2">
                  <h5 class="text-sm text-gray-500">ログイン中</h5>
                  <p class="text-sm font-medium text-gray-800">
                    {{ user?.email }}
                  </p>
                </div>
                <div class="flex flex-col gap-y-2">
                  <h5 class="text-sm text-gray-500">ユーザーID</h5>
                  <p class="text-xs text-gray-600 font-mono">{{ user?.uid }}</p>
                </div>
                <buttons-square
                  @click="handleLogout"
                  color="bg-red-200"
                  class="w-full text-lg cursor-pointer"
                  >ログアウト</buttons-square
                >
              </div>
            </div>

            <!-- SSR時のフォールバック表示 -->
            <template #fallback>
              <div class="flex flex-col gap-y-4 items-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                ></div>
                <p class="text-sm text-gray-500">読み込み中...</p>
              </div>
            </template>
          </ClientOnly>

          <!-- アコーディオンメニュー: 日付をインポートする -->
          <buttons-accordion title="日付をインポートする" :show-beta="true">
            <textarea
              v-model="importText"
              placeholder="例:&#10;7/21(月):09:45~22:00&#10;7/23(水):09:00~22:00&#10;7/24(木):09:45~22:00&#10;7/25(金):09:45~18:00"
              class="flex w-full h-48 border justify-start items-start border-gray-300 rounded-md p-2 resize-none cursor-text"
            />
            <div v-if="importError" class="text-red-500 text-sm mt-2">
              {{ importError }}
            </div>
            <div v-if="importSuccess" class="text-green-500 text-sm mt-2">
              インポートが完了しました
            </div>
            <div class="flex justify-end">
              <buttons-square
                @click="handleImport"
                color="bg-blue-300"
                class="w-32 mt-4 cursor-pointer"
              >
                インポート
              </buttons-square>
            </div>
          </buttons-accordion>

          <!-- アコーディオンメニュー: TokiWa Alarmを接続 -->
          <buttons-accordion title="TokiWa Alarmを接続">
            <div class="flex flex-col">
              <p class="text-sm text-gray-600 whitespace-pre-line">
                TokiWa Alarmを接続し、部屋全体をリマインダーに。
              </p>
              <buttons-square
                @click="handleConnectTokiWaAlarm"
                color="bg-blue-200"
                class="w-4/5 text-lg cursor-pointer"
                >TokiWa Alarmを接続</buttons-square
              >
            </div>
          </buttons-accordion>
        </div>
      </div>
    </Transition>
  </div>

  <!-- メインコンテンツのオーバーレイ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
      @click="emit('toggleSideMenu')"
    ></div>
  </Transition>

  <!-- スマホ用モーダル -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-show="show && isMobile"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div
            class="flex flex-row items-center justify-between mb-4 relative z-10"
          >
            <h3 class="text-xl font-bold text-gray-800">メニュー</h3>
            <div class="flex items-center gap-2">
              <button
                @click.stop="navigateTo('/settings')"
                class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 cursor-pointer relative z-10"
              >
                <UIcon name="ic:baseline-settings" class="size-5" />
              </button>
              <button
                @click.stop="handleCloseModal"
                class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 cursor-pointer relative z-10"
              >
                <UIcon name="ic:baseline-close" class="size-5" />
              </button>
            </div>
          </div>

          <!-- アコーディオンメニュー: 日付をインポートする -->
          <buttons-accordion title="日付をインポートする" :show-beta="true">
            <textarea
              v-model="importText"
              placeholder="例:&#10;7/21(月):09:45~22:00&#10;7/23(水):09:00~22:00&#10;7/24(木):09:45~22:00&#10;7/25(金):09:45~18:00"
              class="flex w-full h-48 border justify-start items-start border-gray-300 rounded-md p-2 resize-none cursor-text"
            />
            <div v-if="importError" class="text-red-500 text-sm mt-2">
              {{ importError }}
            </div>
            <div v-if="importSuccess" class="text-green-500 text-sm mt-2">
              インポートが完了しました
            </div>
            <div class="flex justify-end">
              <buttons-square
                @click="handleImport"
                color="bg-blue-300"
                class="w-24 mt-4 cursor-pointer"
              >
                インポート
              </buttons-square>
            </div>
          </buttons-accordion>

          <!-- ClientOnlyで認証状態に依存する部分をラップ（モバイル版） -->
          <ClientOnly :key="`mobile-auth-${isInitialized}-${isAuthenticated}`">
            <!-- プロセスクライアントでのみレンダリング（モバイル版） -->
            <div v-if="isClient">
              <!-- 認証状態初期化中はローディング表示（モバイル版） -->
              <div
                v-if="!isInitialized"
                class="flex flex-col gap-y-4 items-center"
              >
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                ></div>
                <p class="text-sm text-gray-500 text-center">
                  認証状態を確認中...
                </p>
              </div>
              <!-- 初期化完了後、未認証の場合（モバイル版） -->
              <div
                v-else-if="!isAuthenticated"
                class="flex flex-col gap-y-4 items-center"
              >
                <h5 class="text-sm text-gray-500 text-center">
                  メニューの機能にアクセスするためには、ログイン・サインアップが必要です。
                </h5>
                <buttons-square
                  @click="navigateTo('/login')"
                  color="bg-blue-200"
                  class="w-full text-lg cursor-pointer"
                  >ログイン</buttons-square
                >
                <buttons-square
                  @click="navigateTo('/signup')"
                  color="bg-blue-200"
                  class="w-full text-lg cursor-pointer"
                  >サインアップ</buttons-square
                >
                <h5 class="text-sm text-gray-500 text-center">
                  メニューの機能に関しての詳細ついては、<button
                    @click.stop="navigateTo('/welcome/getting-started/menu')"
                    class="text-blue-500 hover:underline cursor-pointer"
                  >
                    インタロダクション</button
                  >をご覧ください。
                </h5>
              </div>
              <!-- 認証済みの場合（モバイル版） -->
              <div v-else class="flex flex-col gap-y-4">
                <div class="flex flex-col gap-y-2">
                  <h5 class="text-sm text-gray-500">ログイン中</h5>
                  <p class="text-sm font-medium text-gray-800">
                    {{ user?.email }}
                  </p>
                </div>
                <div class="flex flex-col gap-y-2">
                  <h5 class="text-sm text-gray-500">ユーザーID</h5>
                  <p class="text-xs text-gray-600 font-mono">{{ user?.uid }}</p>
                </div>
                <buttons-square
                  @click="handleLogout"
                  color="bg-red-200"
                  class="w-full text-lg cursor-pointer"
                  >ログアウト</buttons-square
                >
              </div>
            </div>

            <!-- SSR時のフォールバック表示（モバイル版） -->
            <template #fallback>
              <div class="flex flex-col gap-y-4 items-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                ></div>
                <p class="text-sm text-gray-500 text-center">読み込み中...</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </Transition>

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

  <!-- TokiWa Alarm Modal -->
  <buttons-toki-wa-alarm-modal
    :show="showTokiWaAlarmModal"
    @close="closeTokiWaAlarmModal"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useDateImportUtils } from "~/utils/DateImportUtils";

interface Props {
  show: boolean;
}

const { user, isAuthenticated, logout, initializeAuth, isInitialized } =
  useAuth();
const isMobile = ref(false);

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
}>();

const { importDateData } = useDateImportUtils();

const importText = ref("");
const importError = ref("");
const importSuccess = ref(false);
const showTokiWaAlarmModal = ref(false);

// isLoggedInをisAuthenticatedと連動（初期化完了後のみ）
const isLoggedIn = computed(() => isInitialized.value && isAuthenticated.value);

const handleCloseModal = () => {
  emit("toggleSideMenu");
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
</script>
