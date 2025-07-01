<template>
  <div
    :id="id"
    class="flex flex-col sm:flex-row h-screen px-10 pt-24 sm:pt-0"
    style="scroll-snap-align: start; scroll-snap-stop: always"
  >
    <div class="flex flex-col sm:w-1/2 justify-center gap-y-5 sm:pr-6">
      <h2 class="flex justify-center text-3xl sm:text-2xl font-bold">
        {{ title }}
      </h2>
      <h5 class="sm:text-lg whitespace-pre-wrap">
        {{ description }}
      </h5>
      <div class="flex">
        <buttons-square
          @click="navigateTo(url)"
          color="bg-green-200"
          class="w-36"
        >
          使い方を見る
        </buttons-square>
      </div>
    </div>
    <div class="flex sm:w-1/2 justify-center items-center pt-2">
      <div class="flex-1 border-8 border-gray-300 rounded-lg">
        <img :src="src" :alt="title" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  title: string;
  description: string;
  url: string;
  src: string;
}

defineProps<Props>();
</script>
