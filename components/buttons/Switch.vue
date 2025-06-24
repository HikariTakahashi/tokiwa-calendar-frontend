<template>
  <div class="flex items-center gap-x-2">
    <label class="relative inline-flex items-center cursor-pointer">
      <input
        :checked="modelValue"
        @input="handleInput"
        type="checkbox"
        class="sr-only peer"
      />
      <div
        :class="[
          'w-11 h-6 rounded-full after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
          modelValue
            ? 'bg-green-500 after:translate-x-full after:border-white'
            : 'bg-gray-200 after:left-[2px]',
        ]"
      ></div>
    </label>
    <span class="text-sm font-medium text-gray-900">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (event) => {
  emit("update:modelValue", event.target.checked);
};
</script>
