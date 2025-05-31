<template>
  <button
    @click="$emit('click')"
    :class="[
      baseClass,
      isUse && isHovered ? color : '',
      !isUse ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white' : '',
    ]"
    @mouseover="isUse && (isHovered = true)"
    @mouseleave="isUse && (isHovered = false)"
    :disabled="!isUse"
  >
    {{ label }}
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
  },
  isUse: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["click"]);

const isHovered = ref(false);
const baseClass = "w-20 h-12 border rounded-full transition duration-200";
</script>
