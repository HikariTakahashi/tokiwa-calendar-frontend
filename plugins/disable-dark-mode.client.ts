export default defineNuxtPlugin(() => {
  // クライアントサイドでのみ実行
  if (process.client) {
    // ダークモードを無効化する関数
    const disableDarkMode = () => {
      // HTML要素からダーククラスを削除
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");

      // color-schemeを強制的にライトに設定
      document.documentElement.style.colorScheme = "light";

      // メタタグでカラーモードを強制設定
      let meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "color-scheme");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", "light");
    };

    // 初期実行
    disableDarkMode();

    // MutationObserverでDOMの変更を監視
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains("dark")) {
            disableDarkMode();
          }
        }
      });
    });

    // HTML要素の変更を監視
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // ページの読み込み完了後にも実行
    window.addEventListener("load", disableDarkMode);

    // 定期的にチェック（念のため）
    setInterval(disableDarkMode, 1000);
  }
});
