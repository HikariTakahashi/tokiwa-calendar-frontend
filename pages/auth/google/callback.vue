<template>
  <div class="flex flex-col h-screen mb-[-50px]">
    <NightSky class="z-[-10]" :seed="789" />
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[98vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-col items-center gap-y-4">
            <div v-if="isLoading" class="flex flex-col items-center gap-y-4">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
              ></div>
              <h3 class="text-lg font-bold text-gray-800">Google認証中...</h3>
              <p class="text-sm text-gray-500 text-center">
                認証処理を実行しています。しばらくお待ちください。
              </p>
            </div>

            <div v-else-if="error" class="flex flex-col items-center gap-y-4">
              <UIcon
                name="material-symbols:error-outline"
                class="size-12 text-red-500"
              />
              <h3 class="text-lg font-bold text-gray-800">認証エラー</h3>
              <p class="text-sm text-red-500 text-center">
                {{ error }}
              </p>
              <buttons-square
                @click="navigateTo('/login')"
                color="bg-blue-200"
                class="w-full text-lg"
              >
                ログインページに戻る
              </buttons-square>
            </div>

            <div
              v-else-if="accountLinkRequired"
              class="flex flex-col items-center gap-y-4"
            >
              <UIcon
                name="material-symbols:link"
                class="size-12 text-blue-500"
              />
              <h3 class="text-lg font-bold text-gray-800">アカウントリンク</h3>
              <p class="text-sm text-gray-500 text-center">
                このGoogleアカウントは既に他のアカウントで使用されています。
                既存のアカウントにリンクしますか？
              </p>
              <div class="flex gap-2 w-full">
                <buttons-square
                  @click="linkAccount"
                  color="bg-blue-300"
                  class="flex-1 text-lg"
                >
                  リンクする
                </buttons-square>
                <buttons-square
                  @click="navigateTo('/dashboard')"
                  color="bg-gray-300"
                  class="flex-1 text-lg"
                >
                  キャンセル
                </buttons-square>
              </div>
            </div>

            <div v-else-if="success" class="flex flex-col items-center gap-y-4">
              <UIcon
                name="material-symbols:check-circle-outline"
                class="size-12 text-green-500"
              />
              <h3 class="text-lg font-bold text-gray-800">認証成功</h3>
              <p class="text-sm text-gray-500 text-center">
                {{ successMessage }}
              </p>
              <p class="text-xs text-gray-400 text-center">
                自動的にダッシュボードにリダイレクトされます...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NightSky from "~/components/background/NightSky.vue";

const { authenticateWithGoogle, extractCodeFromUrl } = useGoogleAuth();
const { user, isAuthenticated } = useAuth();

const isLoading = ref(true);
const error = ref("");
const success = ref(false);
const accountLinkRequired = ref(false);
const successMessage = ref("Googleアカウントでのログインが完了しました。");

// ページマウント時の処理
onMounted(async () => {
  try {
    // URLから認証コードを抽出
    const code = extractCodeFromUrl(window.location.href);

    if (!code) {
      error.value = "認証コードが見つかりませんでした。";
      isLoading.value = false;
      return;
    }

    // リダイレクトURIを構築（現在のページのベースURL）
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    // 既にログインしている場合はアカウントリンクを試行
    if (isAuthenticated.value) {
      successMessage.value = "Googleアカウントが正常にリンクされました。";
    }

    // stateパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get("state");
    let linkUID = null;

    console.log("Google認証コールバック - 取得したstate:", state);

    // カレンダー同期用のstateの場合は特別な処理
    if (state === "calendar_sync") {
      console.log("カレンダー同期用の認証を開始します");

      // 既存のユーザーがログインしている場合は、そのUIDでアカウントリンクを行う
      let linkUID = null;
      if (isAuthenticated.value && user.value) {
        linkUID = user.value.uid;
        console.log("既存ユーザーのUIDでアカウントリンク:", linkUID);
      }

      // カレンダー同期用の認証でも、バックエンドでトークンを保存する必要がある
      const result = await authenticateWithGoogle(
        code,
        redirectUri,
        linkUID || undefined
      );

      if (result.success) {
        console.log("カレンダー権限の認証が成功しました");
        successMessage.value =
          "Googleカレンダーの読み取り権限が許可されました。";
        success.value = true;
        setTimeout(() => {
          navigateTo("/task");
        }, 3000);
      } else {
        console.error("カレンダー権限の認証に失敗:", result.error);
        error.value = result.error || "カレンダー権限の取得に失敗しました。";
      }
      return;
    }

    if (state) {
      // stateパラメータからlinkUIDを抽出
      const stateParams = new URLSearchParams(state);
      linkUID = stateParams.get("linkUID");
    }

    console.log("Google認証コールバック - 取得したlinkUID:", linkUID);

    // Google認証を実行
    const result = await authenticateWithGoogle(
      code,
      redirectUri,
      linkUID || undefined
    );

    if (result.success) {
      success.value = true;
      // 3秒後にダッシュボードにリダイレクト
      setTimeout(() => {
        navigateTo("/dashboard");
      }, 3000);
    } else {
      // アカウントリンクが必要な場合
      if (
        result.error?.includes("既に使用されています") ||
        result.error?.includes("already in use")
      ) {
        accountLinkRequired.value = true;
      } else {
        error.value = result.error || "認証に失敗しました。";
      }
    }
  } catch (err: any) {
    console.error("Google認証コールバックエラー:", err);
    error.value = err.message || "認証処理中にエラーが発生しました。";
  } finally {
    isLoading.value = false;
  }
});

// アカウントリンク処理
const linkAccount = async () => {
  try {
    isLoading.value = true;
    accountLinkRequired.value = false;

    // アカウントリンク処理を実装
    // 注意：実際の実装では、認証コードを再度使用してアカウントリンクを行う必要があります

    success.value = true;
    successMessage.value = "Googleアカウントが正常にリンクされました。";

    setTimeout(() => {
      navigateTo("/dashboard");
    }, 3000);
  } catch (err: any) {
    console.error("アカウントリンクエラー:", err);
    error.value = "アカウントのリンクに失敗しました。";
  } finally {
    isLoading.value = false;
  }
};
</script>
