<template>
  <div class="flex flex-col h-screen">
    <NightSky class="z-[-10]" :seed="123" />
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[98vh] sm:max-h-[84vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-gray-800">新規登録</h3>
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
                <span v-for="error in passwordStrength.errors" :key="error">
                  {{ error }}<br />
                </span>
              </p>
            </div>
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">パスワードの再入力</h5>
              <PassInput
                v-model="passwordConfirm"
                placeholder="パスワードを再入力"
              />
              <p
                v-if="passwordConfirm && passwordConfirm !== password"
                class="text-red-500 text-xs"
              >
                パスワードが一致しません
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
            <div v-if="signupError" class="flex flex-col gap-y-2">
              <p class="text-red-500 text-xs">
                {{ signupError }}
              </p>
            </div>
            <h5 class="text-sm text-gray-500 text-center">
              <button
                @click="navigateTo('/welcome/getting-started/signup')"
                class="text-blue-500 hover:underline"
              >
                サインアップでお困りの方
              </button>
            </h5>
            <div class="flex flex-row items-center gap-x-2">
              <input type="checkbox" id="terms" v-model="isUseTerms" />
              <h5 class="text-sm text-gray-500">
                <button
                  @click="handleTerms"
                  class="text-blue-500 hover:underline"
                >
                  利用規約・プライバシーポリシー</button
                >に同意する
              </h5>
            </div>
            <buttons-square
              color="bg-blue-200"
              :isUse="isFormValid && !isLoading"
              class="w-full text-lg"
              @click="handleSignup"
            >
              {{ isLoading ? "登録中..." : "新規登録" }}
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
import { checkPasswordStrength } from "~/utils/PasswordUtils";

const { signup } = useAPI();

const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const isUseTerms = ref(false);
const turnstileRef = ref();
const turnstileToken = ref("");
const turnstileError = ref(false);
const signupError = ref("");
const isLoading = ref(false);

// メールアドレスのバリデーション
const isEmailValid = computed(() => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.value) && email.value.length > 0;
});

// パスワードのバリデーション（強度チェック）
const passwordStrength = computed(() => {
  return checkPasswordStrength(password.value);
});

const isPasswordValid = computed(() => {
  return passwordStrength.value.isValid;
});

// 利用規約の同意確認
const isTermsValid = computed(() => {
  return isUseTerms.value;
});

// フォーム全体のバリデーション
const isFormValid = computed(() => {
  return isEmailValid.value && isPasswordValid.value && isTermsValid.value;
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

// サインアップ処理
const handleSignup = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;
  signupError.value = "";

  try {
    // Turnstileトークンの検証（開発中は一時的にスキップ可能）
    if (turnstileToken.value) {
      const verificationResult = await $fetch<{ success: boolean }>(
        "/api/verify-turnstile",
        {
          method: "POST",
          body: {
            token: turnstileToken.value,
          },
        }
      );

      if (!verificationResult?.success) {
        turnstileError.value = true;
        return;
      }
    }

    // メールアドレスの前処理（空白除去、小文字化）
    const cleanEmail = email.value.trim().toLowerCase();

    // バックエンドAPIにサインアップリクエストを送信
    const signupResult = await signup(cleanEmail, password.value);

    if (signupResult.error) {
      signupError.value = signupResult.error;
      return;
    }

    // サインアップ成功後の処理（メール認証ページにリダイレクト）
    await navigateTo("/signup/verification-email");
  } catch (error: any) {
    if (error.data?.error) {
      signupError.value = error.data.error;
    } else {
      signupError.value =
        "サインアップ中にエラーが発生しました。もう一度お試しください。";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = () => {
  const { startGoogleAuth } = useGoogleAuth();
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  startGoogleAuth(redirectUri);
};

const handleDiscordLogin = () => {
  navigateTo("/login/discord");
};

const handleFacebookLogin = () => {
  navigateTo("/login/facebook");
};

const handleTwitterLogin = () => {
  const { startTwitterAuth } = useTwitterAuth();
  const redirectUri = `${window.location.origin}/auth/twitter/callback`;
  startTwitterAuth(redirectUri);
};

const handleGitHubLogin = () => {
  const { startGitHubAuth } = useGitHubAuth();
  const redirectUri = `${window.location.origin}/auth/github/callback`;
  startGitHubAuth(redirectUri);
};

const handleTerms = () => {
  navigateTo("/terms");
};
</script>
