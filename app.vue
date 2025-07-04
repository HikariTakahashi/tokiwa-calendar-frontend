<template>
  <NuxtPage />
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
</script>
