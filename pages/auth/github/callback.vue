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
              <h3 class="text-lg font-bold text-gray-800">GitHub認証中...</h3>
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

            <div v-else-if="success" class="flex flex-col items-center gap-y-4">
              <UIcon
                name="material-symbols:check-circle-outline"
                class="size-12 text-green-500"
              />
              <h3 class="text-lg font-bold text-gray-800">認証成功</h3>
              <p class="text-sm text-gray-500 text-center">
                GitHubアカウントでのログインが完了しました。
              </p>
              <p class="text-xs text-gray-400 text-center">
                自動的にメインページにリダイレクトされます...
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
import { useGitHubAuth } from "~/composables/useGitHubAuth";

const { authenticateWithGitHub, extractCodeFromUrl } = useGitHubAuth();

const isLoading = ref(true);
const error = ref("");
const success = ref(false);

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
    const redirectUri = `${window.location.origin}/auth/github/callback`;

    // GitHub認証を実行
    const result = await authenticateWithGitHub(code, redirectUri);

    if (result.success) {
      success.value = true;
      // 3秒後にメインページにリダイレクト
      setTimeout(() => {
        navigateTo("/");
      }, 3000);
    } else {
      error.value = result.error || "認証に失敗しました。";
    }
  } catch (err: any) {
    console.error("GitHub認証コールバックエラー:", err);
    error.value = err.message || "認証処理中にエラーが発生しました。";
  } finally {
    isLoading.value = false;
  }
});
</script>
