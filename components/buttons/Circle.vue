<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex items-center justify-center w-12 h-12 border rounded-full',
      !isUse
        ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white'
        : 'hover:bg-gray-200',
    ]"
    :disabled="!isUse"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  isUse: {
    type: Boolean,
    default: true,
  },
});
defineEmits(["click"]);
</script>
