<template>
  <div class="relative h-full">
    <!-- サイドメニュー -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform -translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform -translate-x-full opacity-0"
    >
      <div
        v-show="show"
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
              @click="$emit('login')"
              color="bg-blue-200"
              class="w-4/5 text-lg"
              >ログイン</buttons-square
            >
            <buttons-square
              @click="$emit('signup')"
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
        class="absolute left-0 top-0 w-80 h-full z-5"
        @click="$emit('close')"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
}

const isLoggedIn = ref(false);

defineProps<Props>();

defineEmits<{
  (e: "close"): void;
  (e: "settings"): void;
  (e: "login"): void;
  (e: "signup"): void;
}>();
</script>
