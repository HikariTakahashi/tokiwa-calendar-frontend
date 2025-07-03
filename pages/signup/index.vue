<template>
  <div class="bg-white bg-opacity-80 z-10">
    <WelcomeHeader />
  </div>
  <div class="flex flex-col h-screen mb-[-50px]">
    <NightSky class="z-[-10]" />
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto"
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
              <input
                type="password"
                v-model="password"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="8文字以上で入力"
              />
              <p
                v-if="password && !isPasswordValid"
                class="text-red-500 text-xs"
              >
                パスワードは8文字以上で入力してください
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
                利用規約・プライバシーポリシーに同意する
              </h5>
            </div>

            <buttons-square
              color="bg-blue-200"
              :isUse="isFormValid"
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
              <buttons-circle>
                <UIcon name="logos:google-icon" class="size-5" />
              </buttons-circle>
              <buttons-circle>
                <UIcon name="logos:discord-icon" class="size-5" />
              </buttons-circle>
              <buttons-circle>
                <UIcon name="logos:facebook" class="size-5" />
              </buttons-circle>
              <buttons-circle>
                <UIcon name="logos:x" class="size-5" />
              </buttons-circle>
              <buttons-circle>
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

const email = ref("");
const password = ref("");
const isUseTerms = ref(false);

// メールアドレスのバリデーション
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

// パスワードのバリデーション（8文字以上）
const isPasswordValid = computed(() => {
  return password.value.length >= 8;
});

// 利用規約の同意確認
const isTermsValid = computed(() => {
  return isUseTerms.value;
});

// フォーム全体のバリデーション
const isFormValid = computed(() => {
  return isEmailValid.value && isPasswordValid.value && isTermsValid.value;
});
</script>
