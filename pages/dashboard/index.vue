<template>
  <div class="min-h-screen bg-gray-50">
    <div
      v-if="!isInitialized || !isClientMounted"
      class="flex items-center justify-center min-h-[80vh]"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">読み込み中...</p>
      </div>
    </div>

    <div v-else-if="isClientMounted">
      <!-- 非ログイン時の表示 -->
      <div v-if="!isAuthenticated">
        <LoginPrompt
          title="ダッシュボード"
          description="サービスを利用するには、ログインまたは新規登録が必要です。"
          footerText="アカウントをお持ちでない場合は、まず新規登録を行ってください。"
        />
      </div>

      <!-- ログイン時の表示 -->
      <div v-else class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex justify-between">
              <h1 class="w-full text-3xl font-bold text-gray-800 mb-4">
                ダッシュボード
              </h1>
              <buttons-square
                @click="handleLogout"
                color="bg-red-300"
                class="w-28 text-lg"
              >
                ログアウト
              </buttons-square>
            </div>
            <p class="text-gray-600 mb-4">ようこそ、{{ user?.email }} さん</p>
          </div>
          <!-- <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              ユーザー情報
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="border rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  ユーザーUID
                </h3>
                <p class="text-lg font-mono text-gray-800 break-all">
                  {{ user?.uid }}
                </p>
              </div>
              <div class="border rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  メールアドレス
                </h3>
                <p class="text-lg text-gray-800">
                  {{ user?.email }}
                </p>
              </div>
            </div>
          </div> -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <h2 class="text-xl font-semibold text-gray-800">
                  ユーザープロフィール
                </h2>
              </div>
              <div class="flex items-center gap-4">
                <buttons-square
                  v-if="isEditMode"
                  @click="cancelEditMode"
                  color="bg-red-300"
                  class="px-4 py-2 w-32"
                  :isUse="!isSaving"
                >
                  キャンセル
                </buttons-square>
                <buttons-square
                  @click="toggleEditMode"
                  color="bg-blue-300"
                  class="px-4 py-2"
                  :isUse="!isSaving"
                >
                  {{ isEditMode ? "保存" : "編集" }}
                  <div v-if="isSaving" class="flex items-center gap-2">
                    <UIcon name="line-md:loading-loop" class="size-6" />
                  </div>
                </buttons-square>
              </div>
            </div>
            <div v-if="userDataLoading" class="text-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"
              ></div>
              <p class="text-gray-600">ユーザーデータを読み込み中...</p>
            </div>
            <div v-else-if="!isEditMode" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <h3 class="text-sm font-medium text-gray-500">
                    ユーザーネーム
                  </h3>
                  <p class="text-lg text-gray-800 font-semibold">
                    {{ displayUserName }}
                  </p>
                </div>
                <div class="space-y-2">
                  <h3 class="text-sm font-medium text-gray-500">
                    ユーザーカラー
                  </h3>
                  <div class="flex items-center gap-3">
                    <div
                      class="w-6 h-6 rounded-md border-1 border-gray-300"
                      :style="{ backgroundColor: userColor }"
                    ></div>
                    <p class="text-lg text-gray-800 font-mono">
                      {{ userColor }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <h3
                    class="text-sm font-medium text-gray-500 border-b-2 border-gray-200 pb-1"
                  >
                    ユーザーネーム
                  </h3>
                  <div class="space-y-2">
                    <input
                      v-model="editableUserName"
                      type="text"
                      class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': usernameErrors.length > 0 }"
                      placeholder="ユーザーネームを入力"
                      maxlength="40"
                      @input="handleUsernameInput"
                    />
                    <div class="flex justify-between items-start">
                      <div
                        v-if="usernameErrors.length > 0"
                        class="text-red-500 text-sm space-y-1"
                      >
                        <div
                          v-for="error in usernameErrors"
                          :key="error"
                          class="flex items-center gap-1"
                        >
                          <UIcon name="ic:sharp-error" class="size-4" />
                          <span>{{ error }}</span>
                        </div>
                      </div>
                      <div class="text-gray-500 text-xs">
                        {{ editableUserName.length }}/40
                      </div>
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <h3
                    class="text-sm font-medium text-gray-500 border-b-2 border-gray-200 pb-1"
                  >
                    ユーザーカラー
                  </h3>
                  <div class="space-y-4">
                    <ColorPicker v-model="editableUserColor" />
                  </div>
                </div>
              </div>
            </div>
            <div v-if="userDataError || saveSuccess" class="mt-6 space-y-3">
              <div
                v-if="userDataError"
                class="p-4 bg-red-50 border border-red-200 rounded-md"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="ic:sharp-error" class="size-5 text-red-500" />
                  <p class="text-red-700 text-sm font-medium">
                    {{ userDataError }}
                  </p>
                </div>
              </div>
              <div
                v-if="saveSuccess"
                class="p-4 bg-green-50 border border-green-200 rounded-md"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    name="ic:sharp-check-circle"
                    class="size-5 text-green-500"
                  />
                  <p class="text-green-700 text-sm font-medium">
                    ユーザープロフィールを保存しました
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">認証情報</h2>
              <div v-if="providersLoading" class="flex items-center gap-2">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"
                ></div>
                <span class="text-sm text-gray-500">読み込み中...</span>
              </div>
            </div>

            <!-- プロバイダー詳細情報の表示 -->
            <div v-if="providersDetailLoading" class="text-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-500">認証情報を読み込み中...</p>
            </div>

            <div v-else class="space-y-4">
              <!-- メールアドレス認証 -->
              <div
                v-if="getProviderDetail('password')"
                class="grid grid-cols-1 md:grid-cols-2"
              >
                <div class="">
                  <h3 class="text-sm font-medium text-gray-500">
                    メールアドレス
                  </h3>
                  <div class="flex items-center gap-2">
                    <p class="text-lg text-gray-800 font-semibold">
                      {{ getProviderDetail("password")?.email }}
                    </p>
                    <span class="text-green-600 text-sm font-medium">
                      ✓ リンク済み
                    </span>
                  </div>
                </div>
              </div>

              <!-- Google認証 -->
              <div class="grid grid-cols-1 md:grid-cols-2">
                <div class="">
                  <h3 class="text-sm font-medium text-gray-500">Google認証</h3>
                  <div class="flex items-center gap-2">
                    <p
                      v-if="getProviderDetail('google.com')"
                      class="text-lg text-gray-800 font-semibold"
                    >
                      {{ getProviderDetail("google.com")?.email }}
                    </p>
                    <p v-else class="text-lg text-gray-500">未リンク</p>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="isProviderLinked('google.com')"
                        class="text-green-600 text-sm font-medium"
                      >
                        ✓ リンク済み
                      </span>
                      <buttons-square
                        v-else
                        @click="handleGoogleAuth"
                        color="bg-blue-300"
                        class="px-4 py-2 w-32"
                      >
                        リンクする
                      </buttons-square>
                    </div>
                  </div>
                </div>
              </div>

              <!-- GitHub認証 -->
              <div class="grid grid-cols-1 md:grid-cols-2">
                <div class="">
                  <h3 class="text-sm font-medium text-gray-500">GitHub認証</h3>
                  <div class="flex items-center gap-2">
                    <p
                      v-if="getProviderDetail('github.com')"
                      class="text-lg text-gray-800 font-semibold"
                    >
                      {{ getProviderDetail("github.com")?.email }}
                    </p>
                    <p v-else class="text-lg text-gray-500">未リンク</p>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="isProviderLinked('github.com')"
                        class="text-green-600 text-sm font-medium"
                      >
                        ✓ リンク済み
                      </span>
                      <buttons-square
                        v-else
                        @click="handleGithubAuth"
                        color="bg-blue-300"
                        class="px-4 py-2 w-32"
                      >
                        リンクする
                      </buttons-square>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Twitter認証 -->
              <div class="grid grid-cols-1 md:grid-cols-2">
                <div class="">
                  <h3 class="text-sm font-medium text-gray-500">Twitter認証</h3>
                  <div class="flex items-center gap-2">
                    <p
                      v-if="getProviderDetail('twitter.com')"
                      class="text-lg text-gray-800 font-semibold"
                    >
                      {{ getProviderDetail("twitter.com")?.email }}
                    </p>
                    <p v-else class="text-lg text-gray-500">未リンク</p>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="isProviderLinked('twitter.com')"
                        class="text-green-600 text-sm font-medium"
                      >
                        ✓ リンク済み
                      </span>
                      <buttons-square
                        v-else
                        @click="handleTwitterAuth"
                        color="bg-blue-300"
                        class="px-4 py-2 w-32"
                      >
                        リンクする
                      </buttons-square>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- リンク済みプロバイダー一覧 -->
            <div
              v-if="userProviders.length > 0"
              class="mt-6 pt-6 border-t border-gray-200"
            >
              <h3 class="text-sm font-medium text-gray-500 mb-3">
                リンク済み認証方法
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="provider in userProviders"
                  :key="provider"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {{ getProviderDisplayName(provider) }}
                </span>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              機能メニュー
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                @click="navigateTo('/')"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3"
                >
                  <UIcon
                    name="ic:baseline-calendar-month"
                    class="w-5 h-5 text-blue-600"
                  />
                </div>
                <div class="text-left">
                  <h3 class="font-medium text-gray-800">予定調整モード</h3>
                  <p class="text-sm text-gray-500">カレンダーで予定を管理</p>
                </div>
              </button>

              <button
                @click="navigateTo('/task')"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3"
                >
                  <UIcon
                    name="ic:baseline-task-alt"
                    class="w-5 h-5 text-green-600"
                  />
                </div>
                <div class="text-left">
                  <h3 class="font-medium text-gray-800">タスク管理モード</h3>
                  <p class="text-sm text-gray-500">タスクの管理と追跡</p>
                </div>
              </button>

              <button
                @click="openWelcome"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3"
                >
                  <UIcon
                    name="ic:baseline-help"
                    class="w-5 h-5 text-purple-600"
                  />
                </div>
                <div class="text-left">
                  <h3 class="font-medium text-gray-800">はじめに</h3>
                  <p class="text-sm text-gray-500">使い方ガイド</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 初回ログイン誘導ポップアップ -->
    <DirectsUserSetting
      :show="showWelcomePopup"
      @close="closeWelcomePopup"
      @start-setup="startUserSetup"
      @later="closeWelcomePopup"
    />
  </div>
</template>

<script setup lang="ts">
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import ColorPicker from "~/components/buttons/ColorPicker.vue";
import DirectsUserSetting from "~/components/pops/DirectsUserSetting.vue";
import LoginPrompt from "~/components/forms/LoginPrompt.vue";
import {
  validateUsername,
  applyUsernameRestrictions,
} from "@/utils/ArrayString";

// 認証状態の管理
const { user, isAuthenticated, isInitialized, initializeAuth, logout } =
  useAuth();
const { getUserData, updateUserData } = useAPI();

// アカウントリンク機能の管理
const {
  getUserProviders,
  linkGoogleAccount,
  linkGitHubAccount,
  linkTwitterAccount,
  unlinkAccount,
} = useAccountLink();

// ユーザーデータの状態管理
const userDataLoading = ref(true);
const userDataError = ref("");
const userName = ref("");
const userColor = ref("#3b82f6");

// 認証プロバイダー情報の状態管理
const userProviders = ref<string[]>([]);
const providersLoading = ref(false);

// プロバイダー詳細情報の状態管理
const userProvidersDetail = ref<
  Array<{
    provider: string;
    email: string;
    displayName?: string;
    isLinked: boolean;
  }>
>([]);
const providersDetailLoading = ref(false);

// 編集モードの状態管理
const isEditMode = ref(false);
const editableUserName = ref("");
const editableUserColor = ref("");

// 保存状態の管理
const isSaving = ref(false);
const saveSuccess = ref(false);

// クライアントサイドマウント状態
const isClientMounted = ref(false);

// バリデーション状態の管理
const usernameErrors = ref<string[]>([]);

// 初回ログイン誘導ポップアップの状態管理
const showWelcomePopup = ref(false);
const isFirstTimeUser = ref(false);
const hasShownWelcomePopup = ref(false); // 重複表示防止フラグ

// クエリパラメータから編集モード開始フラグを取得
const route = useRoute();
const shouldStartEditMode = ref(route.query.editMode === "true");

// ユーザーネーム入力処理
const handleUsernameInput = () => {
  // 入力制限を適用
  const restrictedUsername = applyUsernameRestrictions(editableUserName.value);
  if (restrictedUsername !== editableUserName.value) {
    editableUserName.value = restrictedUsername;
  }

  // バリデーションを実行
  const validation = validateUsername(editableUserName.value);
  usernameErrors.value = validation.errors;
};

// 表示用のユーザーネーム（デフォルト値対応）
const displayUserName = computed(() => {
  return userName.value || "未設定";
});

// ユーザーデータを取得する関数
const fetchUserData = async () => {
  try {
    userDataLoading.value = true;
    userDataError.value = "";

    const response = await getUserData();

    if (response.error) {
      userDataError.value = response.error;
      // エラーの場合でもデフォルト値を設定
      userName.value = "";
      userColor.value = "#3b82f6";
      // エラーの場合は初回ユーザーとして扱う
      isFirstTimeUser.value = true;
      // 少し遅延してポップアップを表示（UIの初期化完了後）
      // ただし、editModeクエリパラメータがある場合は表示しない
      if (!hasShownWelcomePopup.value && !shouldStartEditMode.value) {
        setTimeout(() => {
          showWelcomePopup.value = true;
          hasShownWelcomePopup.value = true;
        }, 1000);
      }
    } else {
      userName.value = response.userName || "";
      userColor.value = response.userColor || "#3b82f6";

      // ユーザーネームまたはユーザーカラーが未設定の場合は初回ユーザー
      const hasIncompleteData = !response.userName || !response.userColor;
      isFirstTimeUser.value = hasIncompleteData;

      if (
        hasIncompleteData &&
        !hasShownWelcomePopup.value &&
        !shouldStartEditMode.value
      ) {
        // 少し遅延してポップアップを表示（UIの初期化完了後）
        // ただし、editModeクエリパラメータがある場合は表示しない
        setTimeout(() => {
          showWelcomePopup.value = true;
          hasShownWelcomePopup.value = true;
        }, 1000);
      }
    }
  } catch (error) {
    console.error("ユーザーデータ取得エラー:", error);
    userDataError.value = "ユーザーデータの取得に失敗しました";
    // エラーの場合でもデフォルト値を設定
    userName.value = "";
    userColor.value = "#3b82f6";
  } finally {
    userDataLoading.value = false;
  }
};

// プロバイダー情報を取得する関数
const fetchUserProviders = async () => {
  try {
    providersLoading.value = true;
    const providers = await getUserProviders();
    userProviders.value = providers;
  } catch (error) {
    console.error("プロバイダー情報取得エラー:", error);
    userProviders.value = [];
  } finally {
    providersLoading.value = false;
  }
};

// プロバイダー詳細情報を取得する関数
const fetchUserProvidersDetail = async () => {
  try {
    providersDetailLoading.value = true;
    const { getUserProvidersDetail } = useAPI();
    const response = await getUserProvidersDetail();

    console.log("プロバイダー詳細情報APIレスポンス:", response);

    if (response.error) {
      console.error("プロバイダー詳細情報取得エラー:", response.error);
      userProvidersDetail.value = [];
    } else {
      // バックエンドが正しい形式を返さない場合の一時的な修正
      if (response.providers && Array.isArray(response.providers)) {
        // プロバイダー名の配列が返された場合、詳細情報を構築
        const details = response.providers.map((provider: any) => {
          if (typeof provider === "string") {
            switch (provider) {
              case "password":
                return {
                  provider: "password",
                  email: user.value?.email || "",
                  displayName: "メールアドレス",
                  isLinked: true,
                };
              case "google.com":
                return {
                  provider: "google.com",
                  email: user.value?.email || "",
                  displayName: "Google",
                  isLinked: true,
                };
              case "github.com":
                return {
                  provider: "github.com",
                  email: user.value?.email || "",
                  displayName: "GitHub",
                  isLinked: true,
                };
              case "twitter.com":
                return {
                  provider: "twitter.com",
                  email: user.value?.email || "",
                  displayName: "Twitter",
                  isLinked: true,
                };
              default:
                return {
                  provider: provider,
                  email: user.value?.email || "",
                  displayName: provider,
                  isLinked: true,
                };
            }
          } else {
            // 既に詳細情報の形式の場合
            return provider;
          }
        });
        userProvidersDetail.value = details;
      } else {
        userProvidersDetail.value = response.providers || [];
      }
    }
  } catch (error) {
    console.error("プロバイダー詳細情報取得エラー:", error);
    userProvidersDetail.value = [];
  } finally {
    providersDetailLoading.value = false;
  }
};

// 編集モードの切り替え
const toggleEditMode = async () => {
  if (isEditMode.value) {
    // 保存処理
    await saveUserData();
  } else {
    // 編集モードに入る時に現在の値を編集可能な変数にコピー
    editableUserName.value = userName.value;
    editableUserColor.value = userColor.value;
    isEditMode.value = true;
    // 保存成功メッセージとエラーをクリア
    saveSuccess.value = false;
    userDataError.value = "";
    usernameErrors.value = [];
  }
};

// 編集モードをキャンセルする関数
const cancelEditMode = () => {
  isEditMode.value = false;
};

// ウェルカムポップアップの制御関数
const closeWelcomePopup = () => {
  showWelcomePopup.value = false;
};

const startUserSetup = () => {
  showWelcomePopup.value = false;
  isEditMode.value = true;
  // 編集可能な値をデフォルト値で初期化
  editableUserName.value = userName.value || "";
  editableUserColor.value = userColor.value || "#3b82f6";
  // エラーメッセージをクリア
  userDataError.value = "";
  usernameErrors.value = [];
};

// ユーザーデータを保存する関数
const saveUserData = async () => {
  try {
    isSaving.value = true;
    userDataError.value = "";
    saveSuccess.value = false;

    // バリデーション
    const validation = validateUsername(editableUserName.value.trim());
    if (validation.errors.length > 0) {
      userDataError.value = validation.errors[0];
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(editableUserColor.value)) {
      userDataError.value =
        "有効なカラーコードを入力してください（例: #3b82f6）";
      return;
    }

    const response = await updateUserData({
      userName: editableUserName.value.trim(),
      userColor: editableUserColor.value,
    });

    if (response.error) {
      userDataError.value = response.error;
    } else {
      // 保存成功時に表示データを更新
      userName.value = editableUserName.value.trim();
      userColor.value = editableUserColor.value;
      isEditMode.value = false;
      saveSuccess.value = true;

      // 初回ユーザーの場合はフラグをリセット
      if (isFirstTimeUser.value) {
        isFirstTimeUser.value = false;
      }

      // 成功メッセージを3秒後に非表示
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);
    }
  } catch (error) {
    console.error("ユーザーデータ保存エラー:", error);
    userDataError.value = "ユーザーデータの保存に失敗しました";
  } finally {
    isSaving.value = false;
  }
};

// ESCキーハンドリングは DirectsUserSetting コンポーネント内で実装

// コンポーネントマウント時に認証状態を初期化してユーザーデータを取得
onMounted(async () => {
  // クライアントサイドマウント完了を明示
  isClientMounted.value = true;

  initializeAuth();

  // 認証が完了してからユーザーデータを取得
  watch(
    isAuthenticated,
    async (newValue) => {
      if (newValue && isClientMounted.value) {
        await fetchUserData();
        await fetchUserProviders(); // プロバイダー情報も取得
        await fetchUserProvidersDetail(); // プロバイダー詳細情報も取得

        // UploadFormからの遷移で編集モードを開始
        if (shouldStartEditMode.value) {
          // データ取得完了後に編集モードを開始
          nextTick(() => {
            startUserSetup();
          });
        }
      }
    },
    { immediate: true }
  );
});

// ウェルカムページを開く
const openWelcome = () => {
  navigateTo("/welcome");
};

// ログアウトする関数
const handleLogout = () => {
  logout();
};

// 認証ハンドラー関数を追加
const handleEmailAuth = () => {
  // メールアドレス認証は既に完了しているため、情報を表示
  alert("メールアドレス認証は既に完了しています。");
};

const handleGoogleAuth = async () => {
  try {
    // 既にリンクされているかチェック
    if (userProviders.value.includes("google.com")) {
      alert("Googleアカウントは既にリンクされています。");
      return;
    }

    console.log("Google認証開始 - 現在のユーザーUID:", user.value?.uid);
    const { startGoogleAuth } = useGoogleAuth();
    // アカウントリンク時は通常のコールバックURIを使用し、linkUIDはstateパラメータで渡す
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = `linkUID=${user.value?.uid}`;
    console.log("Google認証リダイレクトURI:", redirectUri);
    console.log("Google認証state:", state);
    startGoogleAuth(redirectUri, state);
  } catch (error) {
    console.error("Google認証エラー:", error);
    alert("Google認証の開始に失敗しました。");
  }
};

const handleGithubAuth = async () => {
  try {
    // 既にリンクされているかチェック
    if (userProviders.value.includes("github.com")) {
      alert("GitHubアカウントは既にリンクされています。");
      return;
    }

    console.log("GitHub認証開始 - 現在のユーザーUID:", user.value?.uid);
    const { startGitHubAuth } = useGitHubAuth();
    // アカウントリンク時は通常のコールバックURIを使用し、linkUIDはstateパラメータで渡す
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const state = `linkUID=${user.value?.uid}`;
    console.log("GitHub認証リダイレクトURI:", redirectUri);
    console.log("GitHub認証state:", state);
    startGitHubAuth(redirectUri, state);
  } catch (error) {
    console.error("GitHub認証エラー:", error);
    alert("GitHub認証の開始に失敗しました。");
  }
};

const handleTwitterAuth = async () => {
  try {
    // 既にリンクされているかチェック
    if (userProviders.value.includes("twitter.com")) {
      alert("Twitterアカウントは既にリンクされています。");
      return;
    }

    navigateTo("/login/twitter");

    //   console.log("Twitter認証開始 - 現在のユーザーUID:", user.value?.uid);
    //   const { startTwitterAuth } = useTwitterAuth();
    //   // アカウントリンク時は通常のコールバックURIを使用し、linkUIDはstateパラメータで渡す
    //   const redirectUri = `${window.location.origin}/auth/twitter/callback`;
    //   const state = `linkUID=${user.value?.uid}`;
    //   console.log("Twitter認証リダイレクトURI:", redirectUri);
    //   console.log("Twitter認証state:", state);
    //   startTwitterAuth(redirectUri, state);
  } catch (error) {
    console.error("Twitter認証エラー:", error);
    alert("Twitter認証の開始に失敗しました。");
  }
};

// プロバイダー名を日本語で表示する関数
const getProviderDisplayName = (provider: string) => {
  switch (provider) {
    case "password":
      return "メールアドレス";
    case "google.com":
      return "Google";
    case "github.com":
      return "GitHub";
    case "twitter.com":
      return "Twitter";
    default:
      return provider;
  }
};

// プロバイダーがリンクされているかチェックする関数
const isProviderLinked = (provider: string) => {
  return userProviders.value.includes(provider);
};

// プロバイダー詳細情報を取得する関数
const getProviderDetail = (provider: string) => {
  return userProvidersDetail.value.find(
    (detail) => detail.provider === provider
  );
};

// SEOメタデータの設定
useHead({
  title: "ダッシュボード - Tokiwa Calendar",
  meta: [
    {
      name: "description",
      content:
        "Tokiwa Calendarのダッシュボード。予定調整やタスク管理機能にアクセスできます。",
    },
  ],
});
</script>
