export interface User {
  uid: string;
  email: string;
  sessionToken: string;
}

// グローバルな状態管理
const globalUser = ref<User | null>(null);
const globalIsAuthenticated = ref(false);
// SSRでは即座に初期化済みとする
const isInitialized = ref(process.server);

export const useAuth = () => {
  // 初期化時にローカルストレージから認証情報を読み込み
  const initializeAuth = () => {
    if (process.client && !isInitialized.value) {
      try {
        const sessionToken = localStorage.getItem("sessionToken");
        const uid = localStorage.getItem("userUID");
        const email = localStorage.getItem("userEmail");

        if (sessionToken && uid && email) {
          globalUser.value = {
            uid,
            email,
            sessionToken,
          };
          globalIsAuthenticated.value = true;
        } else {
        }
      } catch (error) {
        console.error("認証状態の初期化中にエラーが発生しました:", error);
      } finally {
        // エラーが発生しても初期化完了とマークする
        isInitialized.value = true;
      }
    } else if (!process.client) {
      // SSR時は初期化済みとしてマークし、認証状態はfalseのまま
      isInitialized.value = true;
    }
  };

  // ログイン処理
  const login = (userData: User) => {
    if (process.client) {
      localStorage.setItem("sessionToken", userData.sessionToken);
      localStorage.setItem("userUID", userData.uid);
      localStorage.setItem("userEmail", userData.email);

      globalUser.value = userData;
      globalIsAuthenticated.value = true;
    }
  };

  // ログアウト処理
  const logout = () => {
    if (process.client) {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userUID");
      localStorage.removeItem("userEmail");

      globalUser.value = null;
      globalIsAuthenticated.value = false;
    }
  };

  // 認証トークンを取得（セッショントークン）
  const getAuthToken = (): string | null => {
    if (process.client) {
      const sessionToken = localStorage.getItem("sessionToken");

      return sessionToken;
    }
    return null;
  };

  // ユーザー情報を取得
  const getCurrentUser = (): User | null => {
    return globalUser.value;
  };

  // 認証状態をチェック
  const checkAuth = (): boolean => {
    return globalIsAuthenticated.value;
  };

  // 初期化完了状態を取得
  const getIsInitialized = (): boolean => {
    return isInitialized.value;
  };

  return {
    user: readonly(globalUser),
    isAuthenticated: readonly(globalIsAuthenticated),
    isInitialized: readonly(isInitialized),
    initializeAuth,
    login,
    logout,
    getAuthToken,
    getCurrentUser,
    checkAuth,
    getIsInitialized,
  };
};
