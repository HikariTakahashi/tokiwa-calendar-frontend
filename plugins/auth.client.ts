// plugins/auth.client.ts - クライアントサイド認証初期化

export default defineNuxtPlugin(() => {
  const { initializeAuth } = useAuth();

  // アプリケーション起動時に認証状態を初期化
  onMounted(() => {
    initializeAuth();
  });
});
