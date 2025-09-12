<template>
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
      v-show="show"
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
      v-show="show"
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
            <template #title>
              <h4 class="text-gray-800">日付をインポートする</h4>
            </template>
            <template #content>
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
            </template>
          </buttons-accordion>
          <buttons-accordion :background-image="'/tokiwa-alarm.png'">
            <template #title>
              <h4>
                <span class="font-mono font-bold text-blue-500">Toki</span>
                <span class="font-mono font-bold text-green-500">Wa</span>
                <span class="font-mono font-bold text-white"> Alarm</span>
                <span class="text-white">を接続</span>
              </h4>
            </template>
            <template #content>
              <div class="flex flex-col items-center space-y-2">
                <p class="text-sm text-white whitespace-pre-line">
                  部屋全体をリマインダーに。
                </p>
                <buttons-square
                  @click="handleConnectTokiWaAlarm"
                  color="bg-blue-500"
                  class="w-4/5 text-lg cursor-pointer text-white bg-opacity-80"
                  >TokiWa Alarmを接続</buttons-square
                >
                <button
                  @click.stop="navigateTo('/welcome/getting-started/alarm')"
                  class="flex items-center gap-x-2 text-sm text-blue-400 hover:underline hover:text-blue-600 cursor-pointer"
                >
                  詳しくはこちら
                </button>
              </div>
            </template>
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

                <div v-if="isLoadingProviders" class="flex items-center gap-2">
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"
                  ></div>
                  <p class="text-xs text-gray-500">アカウント情報を確認中...</p>
                </div>

                <buttons-accordion
                  v-if="isGoogleLinked"
                  class="bg-green-50 rounded-md border border-green-200"
                >
                  <template #title>
                    <div class="flex items-center gap-x-2">
                      <UIcon name="logos:google-icon" class="size-6" />
                      <h4 class="text-green-900">Googleアカウントと同期中</h4>
                    </div>
                  </template>
                  <template #content>
                    <div class="flex flex-col items-center space-y-2">
                      <p
                        class="text-sm font-bold text-green-900 whitespace-pre-line"
                      >
                        Googleカレンダーと同期しませんか?
                      </p>
                      <p class="text-sm text-gray-600 whitespace-pre-line">
                        同期して、より便利なタスク管理を。
                      </p>
                      <p class="text-xs text-blue-600 whitespace-pre-line">
                        ※
                        初回同期時は、Googleカレンダーの読み取り権限の許可が必要です。
                      </p>

                      <!-- エラーメッセージ表示 -->
                      <div
                        v-if="syncError"
                        class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md border border-red-200"
                      >
                        {{ syncError }}
                      </div>

                      <!-- 成功メッセージ表示 -->
                      <div
                        v-if="syncSuccess"
                        class="text-green-500 text-sm text-center p-2 bg-green-50 rounded-md border border-green-200"
                      >
                        同期が完了しました！
                      </div>

                      <buttons-square
                        @click="handleConnectGoogleCalendar"
                        color="bg-green-300"
                        class="w-4/5 text-lg cursor-pointer"
                        :disabled="isSyncing"
                        >{{
                          isSyncing ? "同期中..." : "同期する"
                        }}</buttons-square
                      >
                      <button
                        @click.stop="
                          navigateTo('/welcome/getting-started/google-calendar')
                        "
                        class="text-sm text-blue-500 hover:underline cursor-pointer"
                      >
                        詳しくはこちら
                      </button>
                    </div>
                  </template>
                </buttons-accordion>

                <buttons-square
                  @click="navigateTo('/dashboard')"
                  color="bg-green-300"
                  class="w-full text-lg cursor-pointer"
                  >ダッシュボード</buttons-square
                >
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
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  show: boolean;
  importText: string;
  importError: string;
  importSuccess: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: any;
  isClient: boolean;
  isLoadingProviders: boolean;
  isGoogleLinked: boolean;
  syncError: string;
  syncSuccess: boolean;
  isSyncing: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "toggleSideMenu"): void;
  (e: "update:importText", value: string): void;
  (e: "handleImport"): void;
  (e: "handleLogout"): void;
  (e: "handleConnectTokiWaAlarm"): void;
  (e: "handleConnectGoogleCalendar"): void;
  (e: "handleLogout"): void;
  (e: "handleConnectTokiWaAlarm"): void;
  (e: "handleConnectGoogleCalendar"): void;
  (e: "handleLogout"): void;
  (e: "handleConnectTokiWaAlarm"): void;
  (e: "handleConnectGoogleCalendar"): void;
  (e: "handleLogout"): void;
  (e: "handleConnectTokiWaAlarm"): void;
  (e: "handleConnectGoogleCalendar"): void;
  (e: "handleLogout"): void;
}>();

// インポート関連のリアクティブ変数
const importText = computed({
  get: () => props.importText,
  set: (value: string) => emit("update:importText", value),
});

const handleCloseModal = () => {
  emit("toggleSideMenu");
};

// インポート処理
const handleImport = () => {
  emit("handleImport");
};

// ログアウト処理
const handleLogout = () => {
  emit("handleLogout");
};

// TokiWa Alarm接続処理
const handleConnectTokiWaAlarm = () => {
  emit("handleConnectTokiWaAlarm");
};

// Googleアカウント連携処理
const handleConnectGoogleCalendar = () => {
  emit("handleConnectGoogleCalendar");
};
</script>
