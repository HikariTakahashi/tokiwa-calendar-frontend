<template>
  <div
    class="flex flex-col p-5 flex-shrink-0 transition-all duration-300 shadow-md bg-gray-900 rounded-3xl"
    :class="isActive ? ' w-96 h-full' : 'w-80 h-[95%] '"
  >
    <h4 class="text-4xl font-bold text-white pb-5">{{ title }}</h4>
    <div class="text-2xl text-white whitespace-pre-wrap flex-1">
      {{ description }}
    </div>
    <div class="flex justify-end">
      <buttons-circle @click="handlePageTransition">
        <UIcon name="ic:baseline-arrow-forward-ios" class="size-6 text-white" />
      </buttons-circle>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  isActive?: boolean;
  pageTransition: string;
}

const props = defineProps<Props>();

const handlePageTransition = () => {
  navigateTo(props.pageTransition);
};
</script>
