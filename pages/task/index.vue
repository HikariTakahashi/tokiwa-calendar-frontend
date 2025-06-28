<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <WelcomeHeader />
  </div>
  <div
    class="flex h-screen w-full justify-center items-center flex-col gap-y-4"
  >
    <h1 class="flex text-4xl font-bold font-mono">Coming Soon...</h1>
    <h2 class="flex text-2xl font-mono">2025.08.28 Page Release</h2>
  </div>
</template>

<script setup lang="ts">
import WelcomeHeader from "@/components/header/WelcomeHeader.vue";
</script>
