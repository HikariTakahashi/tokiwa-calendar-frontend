<template>
  <div class="callback-container">
    <div class="callback-content">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Twitter認証を処理中...</p>
      </div>

      <div v-else-if="error" class="error">
        <h2>認証エラー</h2>
        <p>{{ error }}</p>
        <button @click="goToLogin" class="retry-button">
          ログインページに戻る
        </button>
      </div>

      <div v-else-if="success" class="success">
        <h2>認証成功</h2>
        <p>Twitterアカウントでのログインが完了しました</p>
        <p>リダイレクト中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoading = ref(true);
const error = ref("");
const success = ref(false);

const goToLogin = () => {
  router.push("/login");
};

onMounted(async () => {
  try {
    const { extractCodeFromUrl, authenticateWithTwitter } = useTwitterAuth();

    // URLから認証コードを抽出
    const code = extractCodeFromUrl(window.location.href);

    if (!code) {
      error.value = "認証コードが見つかりませんでした";
      isLoading.value = false;
      return;
    }

    // リダイレクトURIを構築
    const redirectUri = `${window.location.origin}/auth/twitter/callback`;

    // Twitter認証を実行
    const result = await authenticateWithTwitter(code, redirectUri);

    if (result.success) {
      success.value = true;
      // 成功時は少し待ってからリダイレクト
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      error.value = result.error || "認証に失敗しました";
    }
  } catch (err: any) {
    console.error("Twitter認証コールバックエラー:", err);
    error.value = err.message || "予期しないエラーが発生しました";
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1da1f2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #e74c3c;
}

.success {
  color: #27ae60;
}

.retry-button {
  background: #1da1f2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background: #1991db;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

p {
  margin-bottom: 0.5rem;
  color: #666;
}
</style>
