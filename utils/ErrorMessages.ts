export interface LoginErrorInfo {
  message: string;
  type: "auth" | "network" | "server" | "rate-limit" | "unknown";
}

/**
 * ログインエラーメッセージを処理する関数
 * @param error - エラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getLoginErrorMessage(error: any): LoginErrorInfo {
  // バックエンドからのエラーレスポンスがある場合
  if (error.data?.error) {
    const backendError = error.data.error;

    // backendErrorが文字列であることを確認
    if (typeof backendError === "string") {
      if (
        backendError.includes(
          "メールアドレスまたはパスワードが正しくありません"
        )
      ) {
        return {
          message:
            "メールアドレス・パスワードのどちらか、もしくは両方が誤っています",
          type: "auth",
        };
      }

      if (backendError.includes("ログイン試行回数が多すぎます")) {
        return {
          message:
            "ログイン試行回数が多すぎます。しばらく時間をおいてから再試行してください",
          type: "rate-limit",
        };
      }

      if (backendError.includes("アカウントが無効化されています")) {
        return {
          message:
            "アカウントが無効化されています。管理者にお問い合わせください",
          type: "auth",
        };
      }
    } else {
      // backendErrorが文字列でない場合（オブジェクトなど）は、デフォルトの認証エラーとして扱う
      console.warn("Backend error is not a string:", backendError);
      return {
        message:
          "メールアドレス・パスワードのどちらか、もしくは両方が誤っています",
        type: "auth",
      };
    }
  }

  // HTTPステータスコードに基づくエラー処理
  const status = error.status || error.statusCode;

  switch (status) {
    case 401:
      return {
        message:
          "メールアドレス・パスワードのどちらか、もしくは両方が誤っています",
        type: "auth",
      };

    case 429:
      return {
        message:
          "ログイン試行回数が多すぎます。しばらく時間をおいてから再試行してください",
        type: "rate-limit",
      };

    case 500:
      return {
        message:
          "サーバーエラーが発生しました。しばらく時間をおいてから再試行してください",
        type: "server",
      };

    case 0:
    case undefined:
      return {
        message:
          "ネットワークエラーが発生しました。インターネット接続を確認してください",
        type: "network",
      };

    default:
      return {
        message: "ログイン中にエラーが発生しました。もう一度お試しください。",
        type: "unknown",
      };
  }
}

/**
 * エラータイプに基づいてアイコン名を取得
 * @param type - エラータイプ
 * @returns アイコン名
 */
export function getErrorIcon(type: string): string {
  switch (type) {
    case "auth":
      return "ic:baseline-lock";
    case "network":
      return "ic:baseline-wifi-off";
    case "server":
      return "ic:baseline-error";
    case "rate-limit":
      return "ic:baseline-timer";
    default:
      return "ic:baseline-error";
  }
}

/**
 * エラータイプに基づいてCSSクラスを取得
 * @param type - エラータイプ
 * @returns CSSクラス
 */
export function getErrorClasses(type: string): string {
  switch (type) {
    case "auth":
      return "bg-red-50 border-red-200 text-red-700";
    case "network":
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    case "server":
      return "bg-orange-50 border-orange-200 text-orange-700";
    case "rate-limit":
      return "bg-blue-50 border-blue-200 text-blue-700";
    default:
      return "bg-red-50 border-red-200 text-red-700";
  }
}
