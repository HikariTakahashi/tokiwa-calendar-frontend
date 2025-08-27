<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show"
      class="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      @click="handleCloseModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-800">リマインド時間まで</h3>
            <button
              @click="handleCloseModal"
              class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <UIcon name="ic:baseline-close" class="size-5" />
            </button>
          </div>

          <div class="text-center">
            <div v-if="countdown > 0" class="mb-6">
              <div class="text-6xl font-bold text-blue-600 mb-4">
                {{ countdown }}
              </div>
              <p class="text-lg text-gray-600">秒後にリマインドします</p>
            </div>

            <div v-else class="mb-6">
              <div class="text-4xl font-bold text-green-600 mb-4">
                時間になりました
              </div>
              <p class="text-lg text-gray-600">TokiWa Alarmが起動しました</p>
            </div>
          </div>

          <div class="flex justify-end">
            <buttons-square
              @click="handleCloseModal"
              color="bg-gray-200"
              class="w-24 cursor-pointer"
            >
              閉じる
            </buttons-square>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

interface Props {
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const countdown = ref(5);
let countdownInterval: NodeJS.Timeout | null = null;

const handleCloseModal = () => {
  emit("close");
};

const startCountdown = () => {
  countdown.value = 5;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      startCountdown();
    } else {
      stopCountdown();
    }
  }
);

onUnmounted(() => {
  stopCountdown();
});
</script>
