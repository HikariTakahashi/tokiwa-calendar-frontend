// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/icon"],
  css: ["~/assets/css/light-mode-only.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
      encryptionKey: process.env.NUXT_PUBLIC_ENCRYPTION_KEY,
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
      githubClientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID,
      twitterClientId: process.env.NUXT_PUBLIC_TWITTER_CLIENT_ID,
    },
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  },
  app: {
    head: {
      title: "TokiWa | タスク管理カレンダー",
      htmlAttrs: {
        lang: "ja",
      },
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
      meta: [
        {
          name: "description",
          content: "TokiWa-Calendar | タスク管理に特化したカレンダーアプリ",
        },
        {
          name: "keywords",
          content: "カレンダー,予定管理,日程調整,ToDo,日本語,TokiWa",
        },
      ],
    },
  },
  // エラーハンドリングの設定
  experimental: {
    payloadExtraction: false,
  },
  // 開発時のエラー表示を改善
  devServer: {
    port: 3000,
  },
  // 外部スクリプトのpreloadを無効化（Cloudflare警告対策）
  nitro: {
    experimental: {
      wasm: true,
    },
  },
});
