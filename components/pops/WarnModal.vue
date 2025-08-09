<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
  >
    <div class="bg-white px-6 py-4 rounded-lg w-full sm:w-96 max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-red-400 flex items-center gap-2">
          <UIcon name="ic:sharp-warning" class="size-6" />
          色の重複警告
        </h3>
        <button @click="handleClose" class="text-gray-500 hover:text-gray-700">
          <UIcon name="ic:sharp-clear" class="size-6" />
        </button>
      </div>

      <div class="mb-4">
        <p class="text-gray-700 mb-3">
          選択された色（<span class="font-bold" :style="{ color: userColor }">{{
            userColor
          }}</span
          >）は、既に他のユーザーが使用している可能性があります。
        </p>
        <p class="text-gray-700 mb-3">
          視認性を向上させるため、異なる色を選択することをお勧めします。
        </p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p class="text-sm text-yellow-800">
            <strong>推奨色例：</strong><br />
            <span class="inline-block w-4 h-4 bg-red-500 rounded mr-1"></span
            >#ef4444 (赤)<br />
            <span class="inline-block w-4 h-4 bg-green-500 rounded mr-1"></span
            >#22c55e (緑)<br />
            <span class="inline-block w-4 h-4 bg-purple-500 rounded mr-1"></span
            >#a855f7 (紫)<br />
            <span class="inline-block w-4 h-4 bg-orange-500 rounded mr-1"></span
            >#f97316 (オレンジ)
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <buttons-square @click="handleClose" color="bg-gray-300" class="w-32">
          色を変更する
        </buttons-square>

        <buttons-square
          @click="handleContinue"
          color="bg-blue-300"
          class="w-32"
        >
          この色で続行
        </buttons-square>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  userColor: {
    type: String,
    default: "#3b82f6",
  },
});

const emit = defineEmits(["close", "continue"]);

const handleClose = () => {
  emit("close");
};

const handleContinue = () => {
  emit("continue");
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
