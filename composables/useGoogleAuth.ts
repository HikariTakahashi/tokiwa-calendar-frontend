import { useAPI } from "./useAPI";
import { useAuth } from "./useAuth";

export const useGoogleAuth = () => {
  const config = useRuntimeConfig();
  const { googleAuth } = useAPI();
  const { login: authLogin } = useAuth();

  // Google OAuth2.0認証URLを生成
  const getGoogleAuthUrl = (redirectUri: string, state?: string): string => {
    const clientId = config.public.googleClientId;
    if (!clientId) {
      throw new Error("Google Client IDが設定されていません");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile", // 基本情報のみ（カレンダー読み取り権限は除外）
      access_type: "offline",
      prompt: "consent",
    });

    // stateパラメータがある場合は追加
    if (state) {
      params.set("state", state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  // URLから認証コードを抽出
  const extractCodeFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("code");
    } catch (error) {
      console.error("URL解析エラー:", error);
      return null;
    }
  };

  // Google認証を実行
  const authenticateWithGoogle = async (
    code: string,
    redirectUri: string,
    linkUID?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await googleAuth(code, redirectUri, linkUID);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // アカウントリンクの場合（linkUIDが指定されている場合）は、emailフィールドをチェックしない
      if (linkUID) {
        if (response.sessionToken && response.uid) {
          // アカウントリンクの場合は、既存のユーザー情報を使用
          return { success: true };
        } else {
          return { success: false, error: "認証レスポンスが不完全です" };
        }
      } else {
        // 通常のログインの場合は、emailフィールドもチェック
        if (response.sessionToken && response.uid && response.email) {
          // useAuthでログイン状態を管理
          authLogin({
            uid: response.uid,
            email: response.email,
            sessionToken: response.sessionToken,
          });

          return { success: true };
        } else {
          return { success: false, error: "認証レスポンスが不完全です" };
        }
      }
    } catch (error: any) {
      console.error("Google認証エラー:", error);
      return {
        success: false,
        error: error.message || "Google認証中にエラーが発生しました",
      };
    }
  };

  // Google認証フローを開始
  const startGoogleAuth = (redirectUri: string, state?: string): void => {
    try {
      const authUrl = getGoogleAuthUrl(redirectUri, state);
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("Google認証開始エラー:", error);
      throw error;
    }
  };

  return {
    getGoogleAuthUrl,
    extractCodeFromUrl,
    authenticateWithGoogle,
    startGoogleAuth,
  };
};
