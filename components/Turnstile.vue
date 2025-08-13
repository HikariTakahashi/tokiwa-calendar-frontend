<template>
  <div>
    <div ref="turnstileContainer" class="turnstile-container"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  siteKey?: string;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  siteKey: "",
  theme: "light",
  size: "normal",
});

const emit = defineEmits<{
  success: [token: string];
  expired: [];
  error: [];
}>();

const turnstileContainer = ref<HTMLElement>();
const config = useRuntimeConfig();

// Turnstileの読み込み
const loadTurnstile = () => {
  return new Promise<void>((resolve) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    // preload警告を避けるために、crossorigin属性を追加
    script.crossOrigin = "anonymous";
    // preload警告を避けるために、rel属性を設定
    script.setAttribute("data-preload", "false");
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

// Turnstileの初期化
const initTurnstile = async () => {
  await loadTurnstile();

  if (!turnstileContainer.value) return;

  const siteKey = props.siteKey || config.public.turnstileSiteKey;

  window.turnstile.render(turnstileContainer.value, {
    sitekey: siteKey as string,
    theme: props.theme,
    size: props.size,
    callback: (token: string) => {
      emit("success", token);
      if (props.callback) {
        props.callback(token);
      }
    },
    "expired-callback": () => {
      emit("expired");
      if (props["expired-callback"]) {
        props["expired-callback"]();
      }
    },
    "error-callback": () => {
      emit("error");
      if (props["error-callback"]) {
        props["error-callback"]();
      }
    },
  });
};

// コンポーネントのマウント時に初期化
onMounted(() => {
  initTurnstile();
});

// トークンのリセット
const reset = () => {
  if (window.turnstile) {
    window.turnstile.reset();
  }
};

// メソッドを外部に公開
defineExpose({
  reset,
});
</script>

<style scoped>
.turnstile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 65px;
}
</style>

<script lang="ts">
// Turnstileの型定義
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark";
          size?: "normal" | "compact";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => void;
      reset: () => void;
    };
  }
}
</script>
