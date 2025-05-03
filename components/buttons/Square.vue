<template>
  <button
    @click="$emit('click')"
    :class="[baseClass, isHovered ? color : '']"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
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
});

const emit = defineEmits(["click"]);

const isHovered = ref(false);
const baseClass = "w-20 h-12 border rounded-full transition duration-200";
</script>
