<template>
  <div class="bg-white bg-opacity-0 sm:bg-opacity-80">
    <WelcomeHeader />
  </div>
  <div class="flex flex-col h-screen mb-[-50px]">
    <NightSky class="z-[-10]" :seed="456" />
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[98vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-gray-800">ログイン</h3>
          </div>
          <div class="flex flex-col gap-y-4">
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">メールアドレス</h5>
              <input
                type="email"
                v-model="email"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="example@email.com"
              />
              <p v-if="email && !isEmailValid" class="text-red-500 text-xs">
                正しいメールアドレスの形式で入力してください
              </p>
            </div>
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">パスワード</h5>
              <PassInput v-model="password" placeholder="パスワードを入力" />
              <p
                v-if="password && !isPasswordValid"
                class="text-red-500 text-xs"
              >
                パスワードを入力してください
              </p>
            </div>
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">セキュリティ確認</h5>
              <Turnstile
                ref="turnstileRef"
                @success="onTurnstileSuccess"
                @expired="onTurnstileExpired"
                @error="onTurnstileError"
              />
              <p v-if="turnstileError" class="text-red-500 text-xs">
                セキュリティ確認に失敗しました。もう一度お試しください。
              </p>
            </div>
            <h5 class="text-sm text-gray-500 text-center">
              <button
                @click="navigateTo('/login/password-reset')"
                class="text-blue-500 hover:underline"
              >
                パスワードを忘れた方
              </button>
              /
              <button
                @click="navigateTo('/welcome/getting-started/login')"
                class="text-blue-500 hover:underline"
              >
                ログインでお困りの方
              </button>
            </h5>
            <buttons-square
              color="bg-blue-200"
              :isUse="isFormValid"
              class="w-full text-lg mb-2"
            >
              ログイン
            </buttons-square>
            <buttons-square
              @click="navigateTo('/signup')"
              color="bg-blue-200"
              class="w-full text-lg"
            >
              新規登録
            </buttons-square>
            <div class="h-0.5 w-full bg-gray-200" />
            <div class="flex flex-row items-center justify-between">
              <h3 class="text-lg font-bold text-gray-800">
                SSO(シングルサインオン)
              </h3>
            </div>
            <div class="flex flex-row items-center gap-x-2">
              <buttons-circle @click="handleGoogleLogin">
                <UIcon name="logos:google-icon" class="size-5" />
              </buttons-circle>
              <buttons-circle @click="handleDiscordLogin">
                <UIcon name="logos:discord-icon" class="size-5" />
              </buttons-circle>
              <buttons-circle @click="handleFacebookLogin">
                <UIcon name="logos:facebook" class="size-5" />
              </buttons-circle>
              <buttons-circle @click="handleTwitterLogin">
                <UIcon name="logos:x" class="size-5" />
              </buttons-circle>
              <buttons-circle @click="handleGitHubLogin">
                <UIcon name="logos:github-icon" class="size-5" />
              </buttons-circle>
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
import Turnstile from "~/components/Turnstile.vue";
import PassInput from "~/components/buttons/PassInput.vue";

const turnstileRef = ref();
const turnstileToken = ref("");
const turnstileError = ref(false);

const email = ref("");
const password = ref("");

// メールアドレスのバリデーション
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

// パスワードのバリデーション（1文字以上）
const isPasswordValid = computed(() => {
  return password.value.length > 0;
});

// フォーム全体のバリデーション
const isFormValid = computed(() => {
  return isEmailValid.value && isPasswordValid.value;
});

// Turnstileのコールバック関数
const onTurnstileSuccess = (token: string) => {
  turnstileToken.value = token;
  turnstileError.value = false;
};

const onTurnstileExpired = () => {
  turnstileToken.value = "";
  turnstileError.value = true;
};

const onTurnstileError = () => {
  turnstileToken.value = "";
  turnstileError.value = true;
};

const handleGoogleLogin = () => {
  navigateTo("/login/google");
};

const handleDiscordLogin = () => {
  navigateTo("/login/discord");
};

const handleFacebookLogin = () => {
  navigateTo("/login/facebook");
};

const handleTwitterLogin = () => {
  navigateTo("/login/x");
};

const handleGitHubLogin = () => {
  navigateTo("/login/github");
};
</script>
