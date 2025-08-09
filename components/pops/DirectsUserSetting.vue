<template>
  <!-- 初回ログイン誘導ポップアップ -->
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click.self="handleBackdropClick"
    >
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-if="show"
          class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 transform"
        >
          <button
            @click="handleClose"
            class="py-1.5 px-1.5 flex justify-center items-center absolute top-2 right-2"
          >
            <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
          </button>
          <!-- ヘッダー -->
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <UIcon name="ic:sharp-person-add" class="w-8 h-8 text-white" />
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">ようこそ！</h2>
            <p class="text-gray-600">
              Tokiwa Calendarへのご登録ありがとうございます
            </p>
          </div>

          <!-- メッセージ -->
          <div class="space-y-4 mb-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <UIcon
                  name="ic:sharp-info"
                  class="w-5 h-5 text-blue-600 mt-0.5"
                />
                <div>
                  <h3 class="font-semibold text-blue-800 mb-1">
                    ユーザープロフィールを設定しましょう
                  </h3>
                  <p class="text-sm text-blue-700">
                    ユーザーネームとお好みのカラーを設定することで、カレンダー共有時に他のユーザーと区別できるようになります。
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <UIcon
                  name="ic:sharp-check-circle"
                  class="w-4 h-4 text-green-600"
                />
                <span class="text-sm text-gray-700"
                  >カレンダーの共有が簡単</span
                >
              </div>
              <div class="flex items-center gap-2">
                <UIcon
                  name="ic:sharp-check-circle"
                  class="w-4 h-4 text-green-600"
                />
                <span class="text-sm text-gray-700"
                  >他のユーザーとの識別が容易</span
                >
              </div>
              <div class="flex items-center gap-2">
                <UIcon
                  name="ic:sharp-check-circle"
                  class="w-4 h-4 text-green-600"
                />
                <span class="text-sm text-gray-700">あとから変更も可能</span>
              </div>
            </div>
          </div>

          <!-- ボタン -->
          <div class="flex flex-col gap-3">
            <buttons-square
              @click="handleStartSetup"
              color="bg-blue-300"
              class="w-full text-lg font-semibold"
            >
              <div class="flex items-center justify-center gap-2">
                <UIcon name="ic:sharp-edit" class="w-5 h-5" />
                今すぐ設定する
              </div>
            </buttons-square>

            <button
              @click="handleLater"
              class="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              あとで設定する
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
// Props
interface Props {
  show: boolean;
  allowBackdropClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  allowBackdropClose: true,
});

// Emits
interface Emits {
  (e: "close"): void;
  (e: "start-setup"): void;
  (e: "later"): void;
}

const emit = defineEmits<Emits>();

// Methods
const handleStartSetup = () => {
  emit("start-setup");
};

const handleLater = () => {
  emit("later");
};

const handleClose = () => {
  emit("close");
};

const handleBackdropClick = () => {
  if (props.allowBackdropClose) {
    handleClose();
  }
};

// ESCキーでポップアップを閉じる
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.show) {
    handleClose();
  }
};

// ライフサイクル
onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
});
</script>

<style scoped>
/* 追加のスタイルがあればここに記述 */
</style>
