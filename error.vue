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
      <h1 class="flex text-4xl font-bold font-mono">404 Not Found</h1>
      <h2 class="flex text-2xl font-mono">
        このページは存在しない、もしくは削除されました。
      </h2>
      <ButtonsSquare @click="handleError" color="bg-gray-300" class="w-36">
        ホームに戻る
      </ButtonsSquare>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import WelcomeHeader from "@/components/header/WelcomeHeader.vue";
import Footer from "@/components/footer/Footer.vue";

const handleError = () => {
  clearError({ redirect: "/welcome" });
};
</script>
