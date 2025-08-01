export const useAccountLink = () => {
  const { user } = useAuth();

  // 現在のユーザーのプロバイダー情報を取得
  const getUserProviders = async (): Promise<string[]> => {
    if (!user.value?.customToken) {
      return [];
    }

    try {
      // Firebase Auth SDKを使用してプロバイダー情報を取得
      // 注意: この実装はFirebase Auth SDKが必要です
      const { getAuth, signInWithCustomToken } = await import("firebase/auth");
      const auth = getAuth();

      // カスタムトークンでサインイン
      const userCredential = await signInWithCustomToken(
        auth,
        user.value.customToken
      );
      const firebaseUser = userCredential.user;

      // プロバイダー情報を取得
      const providers = firebaseUser.providerData.map(
        (provider) => provider.providerId
      );
      return providers;
    } catch (error) {
      console.error("プロバイダー情報取得エラー:", error);
      return [];
    }
  };

  // Googleアカウントを既存アカウントにリンク
  const linkGoogleAccount = async (
    googleCredential: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user.value?.customToken) {
      return { success: false, error: "ユーザーがログインしていません" };
    }

    try {
      const { getAuth, signInWithCustomToken, linkWithCredential } =
        await import("firebase/auth");
      const auth = getAuth();

      // カスタムトークンでサインイン
      const userCredential = await signInWithCustomToken(
        auth,
        user.value.customToken
      );
      const firebaseUser = userCredential.user;

      // Googleアカウントをリンク
      const result = await linkWithCredential(firebaseUser, googleCredential);

      console.log(
        "Googleアカウントが正常にリンクされました:",
        result.user.email
      );
      return { success: true };
    } catch (error: any) {
      console.error("Googleアカウントリンクエラー:", error);

      // エラーメッセージを日本語化
      let errorMessage = "アカウントのリンクに失敗しました";
      if (error.code === "auth/provider-already-linked") {
        errorMessage = "このGoogleアカウントは既にリンクされています";
      } else if (error.code === "auth/credential-already-in-use") {
        errorMessage = "このGoogleアカウントは他のアカウントで使用されています";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "このメールアドレスは既に使用されています";
      }

      return { success: false, error: errorMessage };
    }
  };

  // リンクされたアカウントを解除
  const unlinkAccount = async (
    providerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user.value?.customToken) {
      return { success: false, error: "ユーザーがログインしていません" };
    }

    try {
      const { getAuth, signInWithCustomToken, unlink } = await import(
        "firebase/auth"
      );
      const auth = getAuth();

      // カスタムトークンでサインイン
      const userCredential = await signInWithCustomToken(
        auth,
        user.value.customToken
      );
      const firebaseUser = userCredential.user;

      // アカウントを解除
      await unlink(firebaseUser, providerId);

      console.log("アカウントが正常に解除されました:", providerId);
      return { success: true };
    } catch (error: any) {
      console.error("アカウント解除エラー:", error);
      return { success: false, error: "アカウントの解除に失敗しました" };
    }
  };

  return {
    getUserProviders,
    linkGoogleAccount,
    unlinkAccount,
  };
};
