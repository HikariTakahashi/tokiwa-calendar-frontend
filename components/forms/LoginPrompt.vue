<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">
          {{ title }}
        </h1>
        <p class="text-gray-600">
          {{ description }}
        </p>
      </div>

      <div class="space-y-4">
        <buttons-square
          @click="navigateTo('/login')"
          color="bg-blue-300"
          class="w-full text-lg"
        >
          ログイン
        </buttons-square>

        <buttons-square
          @click="navigateTo('/signup')"
          color="bg-green-300"
          class="w-full text-lg"
        >
          新規登録
        </buttons-square>
      </div>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          {{ footerText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  footerText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "ログインが必要です",
  description: "この機能を利用するには、ログインまたは新規登録が必要です。",
  footerText: "アカウントをお持ちでない場合は、まず新規登録を行ってください。",
});
</script>
