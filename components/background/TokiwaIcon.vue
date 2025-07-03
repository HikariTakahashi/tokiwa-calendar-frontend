<template>
  <div
    v-show="isLoaded"
    class="fade-in absolute left-[-80vh] sm:left-[-50vh] z-9 w-[120vh] h-[120vh] rounded-full border-4 sm:border-8 border-gray-800"
  />
  <div
    v-show="isLoaded"
    class="fade-in absolute left-[30vh] top-[20vh] sm:left-[57vh] sm:top-[15vh] z-8 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-red-500 bg-opacity-60"
  />
  <div
    v-show="isLoaded"
    class="fade-in absolute left-[-80vh] sm:left-[-50vh] z-9 w-[110vh] h-[110vh] rounded-full border-4 sm:border-8 border-gray-800"
  />
  <div
    v-show="isLoaded"
    class="fade-in absolute left-[26vh] sm:left-[47vh] sm:top-[75vh] z-8 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-green-500 bg-opacity-60"
  />
  <div
    v-show="isLoaded"
    class="fade-in absolute left-[-80vh] sm:left-[-50vh] z-9 w-[100vh] h-[100vh] rounded-full border-4 sm:border-8 border-gray-800"
  />
  <div
    v-show="isLoaded"
    class="fade-in absolute left-[11vh] top-[70vh] sm:left-[45vh] sm:top-[50vh] z-8 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-blue-500 bg-opacity-60"
  />
</template>

<script setup lang="ts">
interface Props {
  isLoaded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoaded: false,
});
</script>

<style scoped>
.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
