<template>
  <button
    class="w-6 h-6 rounded border"
    :style="{ backgroundColor: color }"
    @click="emit('update:modelValue', color)"
  ></button>
</template>

<script setup lang="ts">
defineProps<{
  color: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>
