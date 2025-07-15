<template>
  <div
    class="flex items-center text-2xl font-bold mb-2 sm:mb-0 cursor-pointer"
    @click="navigateToWelcome"
  >
    <h1 class="text-blue-500 font-mono text-lg sm:text-2xl">Toki</h1>
    <h1 class="text-green-500 font-mono text-lg sm:text-2xl">Wa</h1>
    <h1 class="pl-1 font-mono text-lg sm:text-2xl">Calendar</h1>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const navigateToWelcome = () => {
  router.push("/welcome");
};
</script>
