<template>
  <div class="light h-screen">
    <NuxtPage />
  </div>
</template>

<script setup>
// グローバルエラーハンドラーを追加して、ブラウザ拡張機能によるエラーを抑制
onMounted(() => {
  // 既存のエラーハンドラーを保存
  const originalErrorHandler = window.onerror;

  window.onerror = function (message, source, lineno, colno, error) {
    // ブラウザ拡張機能によるgetBoundingClientRectエラーを無視
    if (
      message &&
      typeof message === "string" &&
      (message.includes("getBoundingClientRect") ||
        message.includes("Cannot read properties of null"))
    ) {
      console.warn("Suppressed extension-related error:", message);
      return true; // エラーを抑制
    }

    // その他のエラーは通常通り処理
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };

  // アンマウント時に元のハンドラーを復元
  onBeforeUnmount(() => {
    window.onerror = originalErrorHandler;
  });
});

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
