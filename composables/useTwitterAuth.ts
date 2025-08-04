export const useTwitterAuth = () => {
  const config = useRuntimeConfig();
  const { twitterAuth } = useAPI();
  const { login: authLogin } = useAuth();

  // Twitter OAuth2.0認証URLを生成
  const getTwitterAuthUrl = (redirectUri: string): string => {
    const clientId = config.public.twitterClientId;
    if (!clientId) {
      throw new Error("Twitter Client IDが設定されていません");
    }

    const params = new URLSearchParams({
      client_id: clientId as string,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "tweet.read users.read offline.access",
      state: "state", // CSRF対策
      code_challenge: "challenge", // PKCEの実装が必要
      code_challenge_method: "plain",
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
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

  // Twitter認証を実行
  const authenticateWithTwitter = async (
    code: string,
    redirectUri: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await twitterAuth(code, redirectUri);

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
      console.error("Twitter認証エラー:", error);
      return {
        success: false,
        error: error.message || "Twitter認証中にエラーが発生しました",
      };
    }
  };

  // Twitter認証フローを開始
  const startTwitterAuth = (redirectUri: string): void => {
    try {
      const authUrl = getTwitterAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("Twitter認証URL生成エラー:", error);
      throw error;
    }
  };

  return {
    getTwitterAuthUrl,
    extractCodeFromUrl,
    authenticateWithTwitter,
    startTwitterAuth,
  };
};
