<template>
  <div>
    <div
      class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
    >
      <WelcomeHeader />
    </div>
    <div
      class="flex h-screen w-full justify-center items-center flex-col gap-y-4"
    >
      <h1 class="flex text-4xl font-bold font-mono">
        {{
          error?.statusCode === 404 ? "404 Not Found" : "エラーが発生しました"
        }}
      </h1>
      <h2 class="flex text-2xl font-mono text-center px-4">
        {{
          error?.statusCode === 404
            ? "このページは存在しない、もしくは削除されました。"
            : "予期しないエラーが発生しました。ブラウザの拡張機能を無効にしてから再試行してください。"
        }}
      </h2>
      <div class="flex flex-col gap-y-2">
        <ButtonsSquare @click="handleError" color="bg-gray-300" class="w-36">
          ホームに戻る
        </ButtonsSquare>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import WelcomeHeader from "@/components/header/WelcomeHeader.vue";
import Footer from "@/components/footer/Footer.vue";

// Nuxt.jsのエラーオブジェクトを取得
const error = useError();

const handleError = () => {
  clearError({ redirect: "/welcome" });
};
</script>
