<template>
  <div class="light">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// ダークモードを強制的に無効化
useHead({
  htmlAttrs: {
    class: "light",
  },
});

// ページがマウントされた時にダークモードを無効化
onMounted(() => {
  // HTML要素からダーククラスを削除
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.add("light");

  // システムのカラーモードを強制的にライトに設定
  if (typeof window !== "undefined") {
    document.documentElement.style.colorScheme = "light";
  }
});
</script>

<style>
/* ダークモードを完全に無効化 */
:root {
  color-scheme: light;
}

html.dark {
  color-scheme: light !important;
}

html.light {
  color-scheme: light;
}

/* ダークモードのスタイルを上書き */
.dark {
  color-scheme: light !important;
}

/* 強制的にライトモードのスタイルを適用 */
* {
  color-scheme: light !important;
}
</style>
