<template>
  <div class="max-w-4xl mx-auto p-8 min-h-screen">
    <!-- 認証状態が初期化されるまでローディング表示 -->
    <div
      v-if="!isInitialized"
      class="flex justify-center items-center min-h-96"
    >
      <p class="text-xl text-gray-600">読み込み中...</p>
    </div>

    <!-- 非ログイン時の表示 -->
    <div v-else-if="!isAuthenticated" class="text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">ダッシュボード</h1>
      <div class="bg-gray-50 rounded-lg p-8 my-8">
        <p class="text-lg text-gray-600 mb-8">
          ダッシュボードにアクセスするにはログインが必要です
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <ButtonsSquare @click="handleLogin" color="bg-blue-300" class="w-32">
            ログイン
          </ButtonsSquare>
          <ButtonsSquare
            @click="handleSignup"
            color="bg-green-300"    
            class="w-32"
          >
            サインアップ
          </ButtonsSquare>
        </div>
      </div>
    </div>

    <!-- ログイン時の表示 -->
    <div v-else>
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">
        ダッシュボード
      </h1>
      <div class="bg-white rounded-lg p-8 shadow-lg">
        <div class="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <label class="font-semibold text-gray-800 min-w-32 mr-4"
            >ユーザーUID:</label
          >
          <div
            class="font-mono bg-gray-200 px-4 py-2 rounded text-gray-700 break-all"
          >
            {{ user?.uid }}
          </div>
        </div>
        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
          <label class="font-semibold text-gray-800 min-w-32 mr-4"
            >メールアドレス:</label
          >
          <div
            class="font-mono bg-gray-200 px-4 py-2 rounded text-gray-700 break-all"
          >
            {{ user?.email }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, isInitialized, initializeAuth } = useAuth();

// ページがマウントされた時に認証状態を初期化
onMounted(() => {
  initializeAuth();
});
const handleLogin = () => {
  navigateTo("/login");
};
const handleSignup = () => {
  navigateTo("/signup");
};
</script>
