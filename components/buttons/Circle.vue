<template>
  <button
    @click="$emit('click')"
    class="flex items-center justify-center w-12 h-12 border rounded-full hover:bg-gray-200"
  >
    <slot />
  </button>
</template>

<script setup>
defineEmits(["click"]);
</script>
