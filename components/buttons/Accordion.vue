<template>
  <div class="border border-gray-200 rounded-lg mb-4">
    <button
      @click="toggleAccordion"
      class="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div class="flex items-center">
        <h4 class="text-gray-800">{{ title }}</h4>
        <h6
          v-if="showBeta"
          class="font-bold ml-2 mr-4 mt-1 bg-blue-500 rounded-sm px-1.5 text-white font-mono"
        >
          Beta
        </h6>
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
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  title: string;
  showBeta?: boolean;
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showBeta: false,
  defaultOpen: false,
});

const isOpen = ref(props.defaultOpen);

const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};

// 外部から開閉状態を制御するためのメソッドを公開
defineExpose({
  toggle: toggleAccordion,
  isOpen: () => isOpen.value,
});
</script>
