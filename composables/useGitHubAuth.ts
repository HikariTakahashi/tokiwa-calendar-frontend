export const useGitHubAuth = () => {
  const config = useRuntimeConfig();
  const { githubAuth } = useAPI();
  const { login: authLogin } = useAuth();

  // GitHub OAuth2.0認証URLを生成
  const getGitHubAuthUrl = (redirectUri: string, state?: string): string => {
    const clientId = config.public.githubClientId;
    if (!clientId) {
      throw new Error("GitHub Client IDが設定されていません");
    }

    const params = new URLSearchParams({
      client_id: clientId as string,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
    });

    // stateパラメータがある場合は追加
    if (state) {
      params.set("state", state);
    }

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
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

  // GitHub認証を実行
  const authenticateWithGitHub = async (
    code: string,
    redirectUri: string,
    linkUID?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await githubAuth(code, redirectUri, linkUID);

      if (response.error) {
        return { success: false, error: response.error };
      }

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
    } catch (error: any) {
      console.error("GitHub認証エラー:", error);
      return {
        success: false,
        error: error.message || "GitHub認証中にエラーが発生しました",
      };
    }
  };

  // GitHub認証フローを開始
  const startGitHubAuth = (redirectUri: string, state?: string): void => {
    try {
      const authUrl = getGitHubAuthUrl(redirectUri, state);
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("GitHub認証開始エラー:", error);
      throw error;
    }
  };

  return {
    getGitHubAuthUrl,
    extractCodeFromUrl,
    authenticateWithGitHub,
    startGitHubAuth,
  };
};
