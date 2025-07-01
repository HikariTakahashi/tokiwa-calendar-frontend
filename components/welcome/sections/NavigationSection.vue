<template>
  <div class="flex flex-col w-1/4 pt-10">
    <button
      @click="navigateTo('/welcome/getting-started')"
      class="flex flex-row items-center w-full gap-x-2 pl-6 py-2 hover:underline hover:text-blue-500"
    >
      <UIcon name="ic:baseline-rocket-launch" class="w-5 h-5 text-gray-500" />
      <p>Introduction</p>
    </button>
    <button
      @click="navigateTo('/welcome/getting-started/entering-events')"
      class="flex flex-row items-center w-5/6 gap-x-2 pl-6 py-2 hover:underline hover:text-blue-500"
    >
      <UIcon name="ic:baseline-edit-calendar" class="w-5 h-5 text-gray-500" />
      <p>予定の入力</p>
    </button>
    <button
      @click="navigateTo('/welcome/getting-started/copy-mode')"
      class="flex flex-row items-center w-5/6 gap-x-2 pl-6 py-2 hover:underline hover:text-blue-500"
    >
      <UIcon name="mdi:calendar-blank-multiple" class="w-5 h-5 text-gray-500" />
      <p>コピーモード</p>
    </button>
    <button
      @click="navigateTo('/welcome/getting-started/data-copy')"
      class="flex flex-row items-center w-5/6 gap-x-2 pl-6 py-2 hover:underline hover:text-blue-500"
    >
      <UIcon name="ic:baseline-content-copy" class="w-5 h-5 text-gray-500" />
      <p>入力した予定のコピー</p>
    </button>
    <button
      @click="navigateTo('/welcome/getting-started/data-share')"
      class="flex flex-row items-center w-3/4 gap-x-2 pl-6 py-2 hover:underline hover:text-blue-500"
    >
      <UIcon name="ic:baseline-share" class="w-5 h-5 text-gray-500" />
      <p>カレンダーの共有</p>
      <h2
        class="font-bold text-xs bg-blue-500 rounded-sm px-1.5 py-0.5 text-white font-mono"
      >
        Beta
      </h2>
    </button>
  </div>
</template>

<script setup lang="ts">
// UIconは親でグローバル登録されている前提
</script>
