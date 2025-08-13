<template>
  <div class="relative">
    <input
      :type="showPassword ? 'text' : 'password'"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      class="w-full p-2 pr-10 border border-gray-300 rounded-md"
      :placeholder="placeholder"
    />
    <button
      @click="showPassword = !showPassword"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-800"
      type="button"
    >
      <UIcon
        :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
        class="size-5"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "パスワードを入力",
});

defineEmits<Emits>();

const showPassword = ref(false);
</script>
