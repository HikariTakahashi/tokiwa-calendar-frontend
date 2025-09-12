export const useAccountLink = () => {
  const { user, getAuthToken } = useAuth();

  // 現在のユーザーのプロバイダー情報を取得
  const getUserProviders = async (): Promise<string[]> => {
    if (!user.value?.uid) {
      return [];
    }

    try {
      // バックエンドAPIからプロバイダー情報を取得
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const config = useRuntimeConfig();
      const API_BASE_URL = config.public.apiBaseUrl;

      const response = await $fetch<{ providers: string[] }>(
        `${API_BASE_URL}/api/user-providers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.providers || [];
    } catch (error) {
      console.error("プロバイダー情報取得エラー:", error);
      return [];
    }
  };

  // Googleアカウントを既存アカウントにリンク
  const linkGoogleAccount = async (
    googleCredential: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user.value?.uid) {
      return { success: false, error: "ユーザーがログインしていません" };
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: "認証トークンが見つかりません" };
      }

      const config = useRuntimeConfig();
      const API_BASE_URL = config.public.apiBaseUrl;

      const response = await $fetch<{ success: boolean; error?: string }>(
        `${API_BASE_URL}/api/link-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: {
            provider: "google",
            credential: googleCredential,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("Googleアカウントリンクエラー:", error);
      return { success: false, error: "アカウントのリンクに失敗しました" };
    }
  };

  // GitHubアカウントを既存アカウントにリンク
  const linkGitHubAccount = async (
    githubCredential: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user.value?.uid) {
      return { success: false, error: "ユーザーがログインしていません" };
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: "認証トークンが見つかりません" };
      }

      const config = useRuntimeConfig();
      const API_BASE_URL = config.public.apiBaseUrl;

      const response = await $fetch<{ success: boolean; error?: string }>(
        `${API_BASE_URL}/api/link-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: {
            provider: "github",
            credential: githubCredential,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("GitHubアカウントリンクエラー:", error);
      return { success: false, error: "アカウントのリンクに失敗しました" };
    }
  };

  // Twitterアカウントを既存アカウントにリンク
  const linkTwitterAccount = async (
    twitterCredential: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user.value?.uid) {
      return { success: false, error: "ユーザーがログインしていません" };
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: "認証トークンが見つかりません" };
      }

      const config = useRuntimeConfig();
      const API_BASE_URL = config.public.apiBaseUrl;

      const response = await $fetch<{ success: boolean; error?: string }>(
        `${API_BASE_URL}/api/link-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: {
            provider: "twitter",
            credential: twitterCredential,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("Twitterアカウントリンクエラー:", error);
      return { success: false, error: "アカウントのリンクに失敗しました" };
    }
  };

  // リンクされたアカウントを解除
  const unlinkAccount = async (
    providerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user.value?.uid) {
      return { success: false, error: "ユーザーがログインしていません" };
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: "認証トークンが見つかりません" };
      }

      const config = useRuntimeConfig();
      const API_BASE_URL = config.public.apiBaseUrl;

      const response = await $fetch<{ success: boolean; error?: string }>(
        `${API_BASE_URL}/api/unlink-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: {
            provider: providerId,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("アカウント解除エラー:", error);
      return { success: false, error: "アカウントの解除に失敗しました" };
    }
  };

  return {
    getUserProviders,
    linkGoogleAccount,
    linkGitHubAccount,
    linkTwitterAccount,
    unlinkAccount,
  };
};
