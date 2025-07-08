<template>
  <!-- デスクトップ表示 -->
  <div class="hidden md:flex flex-col w-1/4 pt-10">
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

  <!-- モバイルハンバーガーメニュー -->
  <div class="md:hidden">
    <!-- ハンバーガーボタン -->
    <button
      @click="toggleMenu"
      class="fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
    >
      <svg
        class="w-6 h-6 text-gray-800"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          v-if="!isMenuOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- オーバーレイ -->
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="closeMenu"
    ></div>

    <!-- サイドメニュー -->
    <div
      :class="[
        'fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
        isMenuOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex flex-col pt-16 px-4">
        <button
          @click="handleNavigation('/welcome/getting-started')"
          class="flex flex-row items-center gap-x-3 py-3 px-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon
            name="ic:baseline-rocket-launch"
            class="w-5 h-5 text-gray-500"
          />
          <p class="text-gray-800">Introduction</p>
        </button>
        <button
          @click="handleNavigation('/welcome/getting-started/entering-events')"
          class="flex flex-row items-center gap-x-3 py-3 px-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon
            name="ic:baseline-edit-calendar"
            class="w-5 h-5 text-gray-500"
          />
          <p class="text-gray-800">予定の入力</p>
        </button>
        <button
          @click="handleNavigation('/welcome/getting-started/copy-mode')"
          class="flex flex-row items-center gap-x-3 py-3 px-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon
            name="mdi:calendar-blank-multiple"
            class="w-5 h-5 text-gray-500"
          />
          <p class="text-gray-800">コピーモード</p>
        </button>
        <button
          @click="handleNavigation('/welcome/getting-started/data-copy')"
          class="flex flex-row items-center gap-x-3 py-3 px-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon
            name="ic:baseline-content-copy"
            class="w-5 h-5 text-gray-500"
          />
          <p class="text-gray-800">入力した予定のコピー</p>
        </button>
        <button
          @click="handleNavigation('/welcome/getting-started/data-share')"
          class="flex flex-row items-center gap-x-3 py-3 px-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon name="ic:baseline-share" class="w-5 h-5 text-gray-500" />
          <p class="text-gray-800">カレンダーの共有</p>
          <h2
            class="font-bold text-xs bg-blue-500 rounded-sm px-1.5 py-0.5 text-white font-mono"
          >
            Beta
          </h2>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// ページ遷移時にメニューを閉じる
const handleNavigation = (path: string) => {
  closeMenu();
  // NuxtのnavigateToを使用
  return navigateTo(path);
};
</script>
