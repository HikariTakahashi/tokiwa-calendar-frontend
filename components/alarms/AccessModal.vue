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
          <h3 class="text-2xl font-bold text-gray-800">
            TokiWa Alarmを接続します
          </h3>
          <p class="text-sm text-gray-600">
            デバイスがペアリングモードになっていることを確認し<br />確認後表示されたパスキーを入力してください
          </p>
        </div>

        <div class="flex justify-center gap-x-2">
          <div class="border-2 border-blue-500 rounded-md p-0.5">
            <input
              ref="input1"
              v-model="passkey[0]"
              type="text"
              class="w-12 text-6xl text-center"
              maxlength="1"
              @input="handleInput(0, $event)"
              @keydown="handleKeydown(0, $event)"
            />
          </div>
          <div class="border-2 border-blue-500 rounded-md p-0.5">
            <input
              ref="input2"
              v-model="passkey[1]"
              type="text"
              class="w-12 text-6xl text-center"
              maxlength="1"
              @input="handleInput(1, $event)"
              @keydown="handleKeydown(1, $event)"
            />
          </div>
          <div class="border-2 border-blue-500 rounded-md p-0.5">
            <input
              ref="input3"
              v-model="passkey[2]"
              type="text"
              class="w-12 text-6xl text-center"
              maxlength="1"
              @input="handleInput(2, $event)"
              @keydown="handleKeydown(2, $event)"
            />
          </div>
          <div class="border-2 border-blue-500 rounded-md p-0.5">
            <input
              ref="input4"
              v-model="passkey[3]"
              type="text"
              class="w-12 text-6xl text-center"
              maxlength="1"
              @input="handleInput(3, $event)"
              @keydown="handleKeydown(3, $event)"
            />
          </div>
          <div class="border-2 border-blue-500 rounded-md p-0.5">
            <input
              ref="input5"
              v-model="passkey[4]"
              type="text"
              class="w-12 text-6xl text-center"
              maxlength="1"
              @input="handleInput(4, $event)"
              @keydown="handleKeydown(4, $event)"
            />
          </div>
          <div class="border-2 border-blue-500 rounded-md p-0.5">
            <input
              ref="input6"
              v-model="passkey[5]"
              type="text"
              class="w-12 text-6xl text-center"
              maxlength="1"
              @input="handleInput(5, $event)"
              @keydown="handleKeydown(5, $event)"
            />
          </div>
        </div>

        <div class="flex justify-end gap-x-2 p-2">
          <buttons-square
            @click="handleCloseModal"
            color="bg-gray-300"
            class="text-lg cursor-pointer"
          >
            戻る
          </buttons-square>
          <buttons-square
            @click="handleSubmit"
            color="bg-green-300"
            class="text-lg cursor-pointer"
          >
            続ける
          </buttons-square>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from "vue";

interface Props {
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", passkey: string): void;
}>();

const countdown = ref(5);
let countdownInterval: NodeJS.Timeout | null = null;

// パスキー入力用の配列
const passkey = ref<string[]>(["", "", "", "", "", ""]);

// input要素の参照
const input1 = ref<HTMLInputElement>();
const input2 = ref<HTMLInputElement>();
const input3 = ref<HTMLInputElement>();
const input4 = ref<HTMLInputElement>();
const input5 = ref<HTMLInputElement>();
const input6 = ref<HTMLInputElement>();

const inputRefs = [input1, input2, input3, input4, input5, input6];

const handleCloseModal = () => {
  emit("close");
};

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // 数字以外の文字を除去
  const numericValue = value.replace(/[^0-9]/g, "");

  if (numericValue !== value) {
    // 数字以外が入力された場合、値を更新
    passkey.value[index] = numericValue;
    target.value = numericValue;
  } else {
    // 数字が入力された場合
    passkey.value[index] = numericValue;

    // 次のinputにフォーカスを移動
    if (numericValue && index < 5) {
      nextTick(() => {
        inputRefs[index + 1]?.value?.focus();
      });
    }
  }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  // Backspaceキーが押された場合
  if (event.key === "Backspace") {
    if (passkey.value[index] === "") {
      // 現在のinputが空の場合、前のinputに移動
      if (index > 0) {
        passkey.value[index - 1] = "";
        nextTick(() => {
          inputRefs[index - 1]?.value?.focus();
        });
      }
    } else {
      // 現在のinputをクリア
      passkey.value[index] = "";
    }
  }
};

const handleSubmit = () => {
  const fullPasskey = passkey.value.join("");
  if (fullPasskey.length === 6) {
    emit("submit", fullPasskey);
  }
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
      // モーダルが開いた時にパスキーをリセット
      passkey.value = ["", "", "", "", "", ""];
      // 最初のinputにフォーカス
      nextTick(() => {
        inputRefs[0]?.value?.focus();
      });
    } else {
      stopCountdown();
    }
  }
);

onUnmounted(() => {
  stopCountdown();
});
</script>
