// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/icon"],
  app: {
    head: {
      title: "TokiWa | シンプルなカレンダーアプリ",
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
          content: "TokiWa-Calendar | シンプルで使いやすいカレンダーアプリ",
        },
        {
          name: "keywords",
          content: "カレンダー,予定管理,日程調整,ToDo,日本語,TokiWa",
        },
      ],
    },
  },
});
