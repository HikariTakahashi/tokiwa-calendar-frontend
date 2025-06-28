<template>
  <div class="flex gap-2 rounded-full bg-gray-700 px-4 p-2">
    <button
      v-for="(_, index) in items"
      :key="`marker-${index}`"
      @click="handleClick(index)"
      class="w-3 h-3 rounded-full transition-all duration-300"
      :class="
        activeIndex === index
          ? 'bg-green-500 w-8 scale-125'
          : 'bg-gray-400 hover:bg-gray-300'
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  items: number;
  currentIndex: number;
}

interface Emits {
  (e: "cardClick", index: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeIndex = ref<number>(0);

// currentIndexの変更を監視してactiveIndexを更新
watch(
  () => props.currentIndex,
  (newIndex) => {
    activeIndex.value = newIndex;
  },
  { immediate: true }
);

const handleClick = (index: number) => {
  activeIndex.value = index;
  emit("cardClick", index);
};
</script>
