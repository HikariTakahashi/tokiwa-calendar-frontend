export const useGoogleAuth = () => {
  const config = useRuntimeConfig();
  const { googleAuth } = useAPI();
  const { login: authLogin } = useAuth();

  // Google OAuth2.0認証URLを生成
  const getGoogleAuthUrl = (redirectUri: string): string => {
    const clientId = config.public.googleClientId;
    if (!clientId) {
      throw new Error("Google Client IDが設定されていません");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

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
    redirectUri: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await googleAuth(code, redirectUri);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.customToken && response.uid && response.email) {
        // useAuthでログイン状態を管理
        authLogin({
          uid: response.uid,
          email: response.email,
          customToken: response.customToken,
        });

        return { success: true };
      } else {
        return { success: false, error: "認証レスポンスが不完全です" };
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
  const startGoogleAuth = (redirectUri: string): void => {
    try {
      const authUrl = getGoogleAuthUrl(redirectUri);
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
