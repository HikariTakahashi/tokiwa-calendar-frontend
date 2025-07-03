<template>
  <div class="relative h-full">
    <!-- デスクトップ用サイドメニュー -->
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
        class="absolute left-0 top-0 w-80 h-full border-r border-t rounded-tr-lg border-gray-300 bg-white z-10 shadow-lg"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">メニュー</h3>
            <button
              @click="$emit('settings')"
              class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
            >
              <UIcon name="ic:baseline-settings" class="size-5" />
            </button>
          </div>
          <div v-if="!isLoggedIn" class="flex flex-col gap-y-4 items-center">
            <h5 class="text-sm text-gray-500">
              メニューの機能にアクセスするためには、ログイン・サインアップが必要です。
            </h5>
            <buttons-square
              @click="navigateTo('/login')"
              color="bg-blue-200"
              class="w-4/5 text-lg"
              >ログイン</buttons-square
            >
            <buttons-square
              @click="navigateTo('/signup')"
              color="bg-blue-200"
              class="w-4/5 text-lg"
              >サインアップ</buttons-square
            >
            <h5 class="text-sm text-gray-500">
              メニューの機能に関しての詳細ついては、<button
                @click="navigateTo('/welcome/getting-started/menu')"
                class="text-blue-500 hover:underline"
              >
                インタロダクション</button
              >をご覧ください。
            </h5>
          </div>
        </div>
      </div>
    </Transition>

    <!-- スマホ用モーダルオーバーレイ -->
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
        class="fixed inset-0 bg-black bg-opacity-50 z-50"
        @click="$emit('close')"
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.stop
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto"
        >
          <div class="p-6">
            <div class="flex flex-row items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-800">メニュー</h3>
              <div class="flex items-center gap-2">
                <button
                  @click="$emit('settings')"
                  class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
                >
                  <UIcon name="ic:baseline-settings" class="size-5" />
                </button>
                <button
                  @click="$emit('close')"
                  class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
                >
                  <UIcon name="ic:baseline-close" class="size-5" />
                </button>
              </div>
            </div>
            <div v-if="!isLoggedIn" class="flex flex-col gap-y-4 items-center">
              <h5 class="text-sm text-gray-500 text-center">
                メニューの機能にアクセスするためには、ログイン・サインアップが必要です。
              </h5>
              <buttons-square
                @click="navigateTo('/login')"
                color="bg-blue-200"
                class="w-full text-lg"
                >ログイン</buttons-square
              >
              <buttons-square
                @click="navigateTo('/signup')"
                color="bg-blue-200"
                class="w-full text-lg"
                >サインアップ</buttons-square
              >
              <h5 class="text-sm text-gray-500 text-center">
                メニューの機能に関しての詳細ついては、<button
                  @click="navigateTo('/welcome/getting-started/menu')"
                  class="text-blue-500 hover:underline"
                >
                  インタロダクション</button
                >をご覧ください。
              </h5>
            </div>
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
        class="absolute left-0 top-0 w-80 h-full z-5"
        @click="$emit('close')"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  show: boolean;
}

const isLoggedIn = ref(false);
const isMobile = ref(false);

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// コンポーネントマウント時とリサイズ時に判定
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

defineProps<Props>();

defineEmits<{
  (e: "close"): void;
  (e: "settings"): void;
  (e: "login"): void;
  (e: "signup"): void;
}>();
</script>
