<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    @click="closePopup"
  >
    <button
      @click="closePopup"
      class="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
    >
      <svg
        class="w-6 h-6 text-gray-800"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <div class="max-w-4xl max-h-full p-4">
      <img
        :src="imageSrc"
        :alt="imageAlt"
        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean;
  imageSrc: string;
  imageAlt: string;
}

interface Emits {
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const closePopup = () => {
  emit("close");
};

// ESCキーでポップアップを閉じる
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && props.isVisible) {
      closePopup();
    }
  };

  document.addEventListener("keydown", handleKeydown);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
});
</script>
