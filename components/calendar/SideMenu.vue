<template>
  <div class="relative h-full">
    <!-- <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform -translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform -translate-x-full opacity-0"
    > -->
    <div
      v-show="show"
      class="absolute left-0 top-0 w-80 h-full border-r border-t rounded-tr-lg border-gray-300 bg-white z-10 shadow-lg"
    >
      <div class="p-6">
        <div class="flex flex-row items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">メニュー</h3>
          <button
            @click="$emit('settings')"
            class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
          >
            <UIcon name="ic:baseline-settings" class="size-5" />
          </button>
        </div>
        <div
          v-if="!isAuthenticated"
          class="flex flex-col gap-y-4 items-center"
        ></div>
        <div class="flex items-center flex-row pb-2">
          <h4 class="text-lg text-gray-800">日付をインポートする</h4>
          <h6
            class="font-bold ml-2 mr-4 mt-1 bg-blue-500 rounded-sm px-1.5 text-white font-mono"
          >
            Beta
          </h6>
        </div>
        <textarea
          v-model="importText"
          placeholder="例:&#10;7/21(月):09:45~22:00&#10;7/23(水):09:00~22:00&#10;7/24(木):09:45~22:00&#10;7/25(金):09:45~18:00"
          class="flex w-full h-72 border justify-start items-start border-gray-300 rounded-md p-2 resize-none"
        />
        <div v-if="importError" class="text-red-500 text-sm mt-2">
          {{ importError }}
        </div>
        <div v-if="importSuccess" class="text-green-500 text-sm mt-2">
          インポートが完了しました
        </div>
        <div class="flex justify-end">
          <buttons-square
            @click="handleImport"
            color="bg-blue-300"
            class="w-24 mt-4"
          >
            インポート
          </buttons-square>
        </div>
        <div v-if="!isLoggedIn" class="flex flex-col gap-y-4 items-center">
          <h5 class="text-sm text-gray-500">
            メニューの機能にアクセスするためには、ログイン・サインアップが必要です。
          </h5>
          <buttons-square
            @click="navigateTo('/login')"
            color="bg-blue-200"
            class="w-4/5 text-lg"
            >ログイン</buttons-square
          >
          <buttons-square
            @click="navigateTo('/signup')"
            color="bg-blue-200"
            class="w-4/5 text-lg"
            >サインアップ</buttons-square
          >
          <h5 class="text-sm text-gray-500">
            メニューの機能に関しての詳細ついては、<button
              @click="navigateTo('/welcome/getting-started/menu')"
              class="text-blue-500 hover:underline"
            >
              インタロダクション</button
            >をご覧ください。
          </h5>
        </div>
        <div v-else class="flex flex-col gap-y-4">
          <div class="flex flex-col gap-y-2">
            <h5 class="text-sm text-gray-500">ログイン中</h5>
            <p class="text-sm font-medium text-gray-800">{{ user?.email }}</p>
          </div>
          <div class="flex flex-col gap-y-2">
            <h5 class="text-sm text-gray-500">ユーザーID</h5>
            <p class="text-xs text-gray-600 font-mono">{{ user?.uid }}</p>
          </div>
          <buttons-square
            @click="handleLogout"
            color="bg-red-200"
            class="w-full text-lg"
            >ログアウト</buttons-square
          >
        </div>
      </div>
    </div>
  </div>
  <!-- </Transition> -->
  <!-- メインコンテンツのオーバーレイ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="$emit('close')"
    ></div>
  </Transition>

  <!-- スマホ用モーダル -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-show="show && isMobile"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.stop
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">メニュー</h3>
            <div class="flex items-center gap-2">
              <button
                @click="$emit('settings')"
                class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
              >
                <UIcon name="ic:baseline-settings" class="size-5" />
              </button>
              <button
                @click="$emit('close')"
                class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
              >
                <UIcon name="ic:baseline-close" class="size-5" />
              </button>
            </div>
          </div>
          <div
            v-if="!isAuthenticated"
            class="flex flex-col gap-y-4 items-center"
          >
            <h5 class="text-sm text-gray-500 text-center">
              メニューの機能にアクセスするためには、ログイン・サインアップが必要です。
            </h5>
            <buttons-square
              @click="navigateTo('/login')"
              color="bg-blue-200"
              class="w-full text-lg"
              >ログイン</buttons-square
            >
            <buttons-square
              @click="navigateTo('/signup')"
              color="bg-blue-200"
              class="w-full text-lg"
              >サインアップ</buttons-square
            >
            <h5 class="text-sm text-gray-500 text-center">
              メニューの機能に関しての詳細ついては、<button
                @click="navigateTo('/welcome/getting-started/menu')"
                class="text-blue-500 hover:underline"
              >
                インタロダクション</button
              >をご覧ください。
            </h5>
          </div>
          <div v-else class="flex flex-col gap-y-4">
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">ログイン中</h5>
              <p class="text-sm font-medium text-gray-800">
                {{ user?.email }}
              </p>
            </div>
            <div class="flex flex-col gap-y-2">
              <h5 class="text-sm text-gray-500">ユーザーID</h5>
              <p class="text-xs text-gray-600 font-mono">{{ user?.uid }}</p>
            </div>
            <buttons-square
              @click="handleLogout"
              color="bg-red-200"
              class="w-full text-lg"
              >ログアウト</buttons-square
            >
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- デスクトップ用メインコンテンツのオーバーレイ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="show"
      class="absolute left-0 top-0 w-80 h-full z-5"
      @click="$emit('close')"
    ></div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from "vue";
import { useDateImportUtils } from "~/utils/DateImportUtils";

interface Props {
  show: boolean;
}

const { user, isAuthenticated, logout } = useAuth();
const isMobile = ref(false);

// デバッグ用：認証状態の監視
watchEffect(() => {
  console.log("SideMenu - 認証状態:", {
    isAuthenticated: isAuthenticated.value,
    user: user.value,
  });
});

// ログアウト処理
const handleLogout = () => {
  logout();
  navigateTo("/");
};

// レスポンシブ判定
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

// コンポーネントマウント時とリサイズ時に判定
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

defineProps<Props>();

const { importDateData } = useDateImportUtils();

const importText = ref("");
const importError = ref("");
const importSuccess = ref(false);
const isLoggedIn = ref(false);

const handleImport = () => {
  if (!importText.value.trim()) {
    importError.value = "テキストを入力してください";
    importSuccess.value = false;
    return;
  }

  const result = importDateData(importText.value);

  if (result.success && result.data) {
    importError.value = "";
    importSuccess.value = true;
    // emit("import-complete", result.data);

    // 3秒後に成功メッセージをクリア
    setTimeout(() => {
      importSuccess.value = false;
    }, 3000);
  } else {
    importError.value = result.error || "インポートに失敗しました";
    importSuccess.value = false;
  }
};
</script>
