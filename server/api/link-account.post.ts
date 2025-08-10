import { defineEventHandler, readBody, getHeaders } from "h3";

// バックエンドAPIのベースURL（環境に応じて設定）
const getBackendBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    // 本番環境のAPIゲートウェイURL
    return (
      process.env.BACKEND_API_URL ||
      "https://your-api-gateway-url.amazonaws.com"
    );
  } else {
    // ローカル開発環境
    return "http://localhost:8080";
  }
};

export default defineEventHandler(async (event) => {
  try {
    // リクエストボディを取得
    const body = await readBody(event);

    // リクエストヘッダーを取得（特にAuthorizationヘッダー）
    const headers = getHeaders(event);
    const authHeader = headers.authorization || headers.Authorization;

    if (!authHeader) {
      return { error: "認証が必要です" };
    }

    // バックエンドAPIにリクエストを転送
    const backendUrl = `${getBackendBaseUrl()}/api/link-account`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader as string,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "バックエンドAPIエラー");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    };
  }
});
