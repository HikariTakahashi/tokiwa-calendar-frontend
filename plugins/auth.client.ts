// plugins/auth.client.ts - クライアントサイド認証初期化

export default defineNuxtPlugin(() => {
  const { initializeAuth } = useAuth();

  // アプリケーション起動時に認証状態を初期化
  if (process.client) {
    // 即座に初期化を実行
    initializeAuth();

    // DOMContentLoaded後にも初期化を実行（念のため）
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initializeAuth();
      });
    }

    // onMountedでも初期化を実行
    onMounted(() => {
      initializeAuth();
    });
  }
});
