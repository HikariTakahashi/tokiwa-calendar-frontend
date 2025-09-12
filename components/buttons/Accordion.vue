<template>
  <div
    class="border border-gray-200 rounded-lg mb-4"
    :style="backgroundImageStyle"
  >
    <button
      @click="toggleAccordion"
      class="w-full flex items-center justify-between p-2 text-left hover:bg-gray-300 rounded-t-md transition-colors"
      :class="[
        isOpen ? 'hover:rounded-b-none' : 'hover:rounded-b-md',
        backgroundImageStyle ? 'hover:bg-opacity-50' : '',
      ]"
    >
      <div class="flex items-center">
        <slot name="title" />
      </div>
      <UIcon
        :name="isOpen ? 'ic:baseline-expand-less' : 'ic:baseline-expand-more'"
        class="size-5 text-gray-600 transition-transform"
      />
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isOpen" class="px-4 pb-4">
        <slot name="content" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  defaultOpen?: boolean;
  backgroundImage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  backgroundImage: undefined,
});

const isOpen = ref(props.defaultOpen);

// 背景画像のスタイルを計算
const backgroundImageStyle = computed(() => {
  if (!props.backgroundImage) return {};

  return {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${props.backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
});

const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};

// 外部から開閉状態を制御するためのメソッドを公開
defineExpose({
  toggle: toggleAccordion,
  isOpen: () => isOpen.value,
});
</script>
