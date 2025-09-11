<template>
  <div class="bg-white bg-opacity-0 sm:bg-opacity-80 z-10">
    <WelcomeHeader />
  </div>
  <div class="flex flex-col h-screen mb-[-50px]">
    <NightSky class="z-[-10]" :seed="123" />
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[98vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-gray-800">メールアドレス認証</h3>
          </div>

          <!-- ローディング状態 -->
          <div
            v-if="isLoading"
            class="flex flex-col justify-center items-center"
          >
            <div class="flex justify-center items-center my-2">
              <UIcon
                name="i-heroicons-arrow-path"
                class="size-12 text-blue-500 animate-spin"
              />
            </div>
            <p class="text-sm text-gray-600">認証中...</p>
          </div>

          <!-- 成功状態 -->
          <div
            v-else-if="isSuccess"
            class="flex flex-col justify-center items-center"
          >
            <div class="flex justify-center items-center my-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-12 text-green-500"
              />
            </div>
            <div class="flex flex-col justify-center items-center">
              <p class="text-sm text-green-600 font-medium">
                認証が完了しました！
              </p>
              <p class="text-sm text-gray-600 mt-2">
                ログインしてTokiwa Calendarをお使いください。
              </p>
            </div>
            <div class="flex flex-col justify-center items-center mt-4">
              <p class="text-sm text-gray-600">
                このページは数秒後に自動的にログインページに遷移します。
              </p>
              <button
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                @click="navigateTo('/login')"
              >
                ログインへ
              </button>
            </div>
          </div>

          <!-- エラー状態 -->
          <div
            v-else-if="isError"
            class="flex flex-col justify-center items-center"
          >
            <div class="flex justify-center items-center my-2">
              <UIcon name="i-heroicons-x-circle" class="size-12 text-red-500" />
            </div>
            <div class="flex flex-col justify-center items-center">
              <p class="text-sm text-red-600 font-medium">認証に失敗しました</p>
              <p class="text-sm text-gray-600 mt-2">{{ errorMessage }}</p>
            </div>
            <div class="flex flex-col justify-center items-center mt-4">
              <p class="text-sm text-gray-600 mb-2">
                既に認証済みの場合は、ログインページからお進みください。
              </p>
              <button
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mb-2"
                @click="navigateTo('/login')"
              >
                ログインへ
              </button>
              <button
                class="w-full text-sm text-blue-500 hover:underline"
                @click="navigateTo('/signup')"
              >
                サインアップに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script setup lang="ts">
import NightSky from "~/components/background/NightSky.vue";
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import Footer from "~/components/footer/Footer.vue";

// ページの状態
const isLoading = ref(true);
const isSuccess = ref(false);
const isAlreadyVerified = ref(false);
const isError = ref(false);
const errorMessage = ref("");

// URLパラメータからトークンを取得
const route = useRoute();
const token = route.query.token as string;

// APIクライアントを使用
const { verifyEmailToken } = useAPI();

// 認証処理
const verifyEmail = async () => {
  if (!token) {
    isError.value = true;
    errorMessage.value = "認証トークンが見つかりません";
    isLoading.value = false;
    return;
  }

  try {
    const response = await verifyEmailToken(token);

    if (response.success) {
      if (response.already_verified) {
        isAlreadyVerified.value = true;
      } else {
        isSuccess.value = true;
      }
    } else {
      isError.value = true;
      errorMessage.value = response.message || "認証に失敗しました";
    }
  } catch (error: any) {
    isError.value = true;
    errorMessage.value =
      error.data?.error || "認証処理中にエラーが発生しました";
  } finally {
    isLoading.value = false;
  }
};

// ページのメタデータ
definePageMeta({
  title: "メールアドレス認証 - TokiWa Calendar",
  description: "メールアドレスの認証を行います",
});

// ページ読み込み時に認証処理を実行
onMounted(() => {
  verifyEmail();
});

// ログイン成功時、ログインページに自動で遷移
watch([isSuccess, isAlreadyVerified], ([success, alreadyVerified]) => {
  if (success || alreadyVerified) {
    setTimeout(() => {
      navigateTo("/login");
    }, 5000);
  }
});
</script>
