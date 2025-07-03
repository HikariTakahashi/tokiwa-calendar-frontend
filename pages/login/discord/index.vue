<!--認証機能実装後に削除-->

<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <WelcomeHeader />
  </div>
  <div
    class="flex h-screen w-full justify-center items-center flex-col gap-y-4"
  >
    <div class="flex flex-row gap-x-2">
      <UIcon name="material-symbols:sad-tab-outline" class="size-10" />
      <h1 class="flex text-4xl font-bold font-mono">Sorry Sir.</h1>
    </div>
    <h2 class="flex text-2xl font-mono">discord認証は現在利用できません</h2>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import WelcomeHeader from "@/components/header/WelcomeHeader.vue";
</script>
