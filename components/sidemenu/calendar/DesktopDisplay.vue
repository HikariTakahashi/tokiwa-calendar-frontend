<template>
  <div
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

      <!-- アコーディオンメニュー: 日付をインポートする -->
      <buttons-accordion>
        <template #title>
          <div class="flex items-center">
            <h4 class="text-gray-800">日付をインポートする</h4>
            <h6
              class="font-bold ml-2 mr-4 mt-1 bg-blue-500 rounded-sm px-1.5 text-white font-mono"
            >
              Beta
            </h6>
          </div>
        </template>
        <template #content>
          <textarea
            v-model="importText"
            placeholder="例:&#10;7/21(月):09:45~22:00&#10;7/23(水):09:00~22:00&#10;7/24(木):09:45~22:00&#10;7/25(金):09:45~18:00"
            class="flex w-full h-48 border justify-start items-start border-gray-300 rounded-md p-2 mt-2 resize-none cursor-text"
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

      <!-- ClientOnlyで認証状態に依存する部分をラップ -->
      <ClientOnly :key="`desktop-auth-${isInitialized}-${isAuthenticated}`">
        <!-- プロセスクライアントでのみレンダリング -->
        <div v-if="isClient">
          <!-- 認証状態初期化中はローディング表示 -->
          <div v-if="!isInitialized" class="flex flex-col gap-y-4 items-center">
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
          <div v-else class="flex flex-col gap-y-4 mb-2">
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">ログイン中</h5>
              <p class="text-sm font-medium text-gray-800">
                {{ user?.email }}
              </p>
            </div>

            <!-- Googleアカウントのリンク状態表示 -->
            <div v-if="isLoadingProviders" class="flex items-center gap-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"
              ></div>
              <p class="text-xs text-gray-500">アカウント情報を確認中...</p>
            </div>
            <!-- Googleアカウントが連携されている場合 -->
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
                    >{{ isSyncing ? "同期中..." : "同期する" }}</buttons-square
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDateImportUtils } from "~/utils/DateImportUtils";
import { useAccountLink } from "~/composables/useAccountLink";
import { useGoogleCalendar } from "~/composables/useGoogleCalendar";
import { useAuth } from "~/composables/useAuth";
import { useGoogleAuth } from "~/composables/useGoogleAuth";

interface Props {
  importText: string;
  importError: string;
  importSuccess: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: any;
  isClient: boolean;
  isLoadingProviders: boolean;
  isGoogleLinked: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:importText", value: string): void;
  (e: "handleImport"): void;
  (e: "handleConnectTokiWaAlarm"): void;
  (e: "handleLogout"): void;
  (e: "handleConnectGoogleCalendar", tasks?: any[]): void;
}>();

const { user, isAuthenticated, logout, initializeAuth, isInitialized } =
  useAuth();
const { getUserProviders } = useAccountLink();
const {
  getEvents,
  convertToTokiwaTask,
  getCalendarColors,
  requestCalendarPermission,
} = useGoogleCalendar();
const { startGoogleAuth } = useGoogleAuth();

// 同期状態の管理
const isSyncing = ref(false);
const syncError = ref("");
const syncSuccess = ref(false);

// 今年分の全データを取得する設定
const getCurrentYearData = () => {
  const now = new Date();
  const year = now.getFullYear();

  // 今年の1月1日
  const startOfYear = new Date(year, 0, 1);
  // 今年の12月31日
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  return { startOfYear, endOfYear };
};

// インポート関連のリアクティブ変数
const importText = computed({
  get: () => props.importText,
  set: (value: string) => emit("update:importText", value),
});

// ログアウト処理
const handleLogout = () => {
  logout();
  navigateTo("/");
};

// インポート処理
const handleImport = () => {
  emit("handleImport");
};

// TokiWa Alarm接続処理
const handleConnectTokiWaAlarm = () => {
  emit("handleConnectTokiWaAlarm");
};

// Googleアカウント連携処理
const handleConnectGoogleAccount = () => {
  try {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    startGoogleAuth(redirectUri);
  } catch (error) {
    console.error("Googleアカウント連携エラー:", error);
  }
};

// Googleカレンダーと同期処理
const handleConnectGoogleCalendar = async () => {
  console.log("handleConnectGoogleCalendar が呼び出されました");

  if (isSyncing.value) {
    console.log("既に同期中です");
    return;
  }

  isSyncing.value = true;
  syncError.value = "";
  syncSuccess.value = false;

  try {
    // 今年分の全データを取得
    const { startOfYear, endOfYear } = getCurrentYearData();
    console.log(
      "同期期間:",
      startOfYear.toISOString(),
      "〜",
      endOfYear.toISOString()
    );

    // Googleカレンダーの色情報を取得（イベント取得前に試行）
    try {
      const colors = await getCalendarColors();
      console.log("Googleカレンダー色情報:", colors);
    } catch (colorError) {
      console.warn("色情報の取得に失敗（イベント同期は継続）:", colorError);
      // 色情報の取得に失敗しても同期処理は継続
    }

    const events = await getEvents("primary", startOfYear, endOfYear, 2500); // 今年分の全データを取得するため最大件数を増加

    // Tokiwaのタスク形式に変換（色情報も含む）
    const tokiwaTasks = events.map((event) => convertToTokiwaTask(event));

    // 親コンポーネントに同期完了を通知
    emit("handleConnectGoogleCalendar", tokiwaTasks);

    syncSuccess.value = true;
    console.log(
      "Google Calendar同期完了（今年分全データ・色情報含む）:",
      tokiwaTasks
    );

    // 3秒後に成功メッセージをクリア
    setTimeout(() => {
      syncSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    console.error("Google Calendar同期エラー:", error);

    // カレンダー権限がない場合の特別な処理
    console.log("エラーメッセージ:", error.message);
    console.log("エラーステータス:", error.status);

    // 403エラーまたは権限関連のエラーメッセージを検出
    if (
      error.status === 403 ||
      (error.message &&
        (error.message.includes("読み取り権限がありません") ||
          error.message.includes("連携されていません") ||
          error.message.includes("403") ||
          error.message.includes("Forbidden")))
    ) {
      console.log("カレンダー権限がないエラーを検出");
      syncError.value = "Googleカレンダーの読み取り権限が必要です。";

      // 直接権限要求を実行
      console.log("権限要求を開始します");
      try {
        requestCalendarPermission();
      } catch (permissionError) {
        console.error("権限要求エラー:", permissionError);
        syncError.value = "権限要求に失敗しました。再度お試しください。";
      }
    } else {
      console.log("その他のエラー:", error.message);
      syncError.value = error.message || "同期に失敗しました";
    }

    // 5秒後にエラーメッセージをクリア
    setTimeout(() => {
      syncError.value = "";
    }, 5000);
  } finally {
    isSyncing.value = false;
  }
};
</script>
