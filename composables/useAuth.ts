export interface User {
  uid: string;
  email: string;
  customToken: string;
}

// グローバルな状態管理
const globalUser = ref<User | null>(null);
const globalIsAuthenticated = ref(false);
const isInitialized = ref(false);

export const useAuth = () => {
  // 初期化時にローカルストレージから認証情報を読み込み
  const initializeAuth = () => {
    if (process.client && !isInitialized.value) {
      const token = localStorage.getItem("authToken");
      const uid = localStorage.getItem("userUID");
      const email = localStorage.getItem("userEmail");

      if (token && uid && email) {
        globalUser.value = {
          uid,
          email,
          customToken: token,
        };
        globalIsAuthenticated.value = true;
        console.log("認証状態を初期化しました:", { uid, email });
      } else {
        console.log("ローカルストレージに認証情報が見つかりません");
      }

      isInitialized.value = true;
    }
  };

  // ログイン処理
  const login = (userData: User) => {
    if (process.client) {
      localStorage.setItem("authToken", userData.customToken);
      localStorage.setItem("userUID", userData.uid);
      localStorage.setItem("userEmail", userData.email);

      globalUser.value = userData;
      globalIsAuthenticated.value = true;
    }
  };

  // ログアウト処理
  const logout = () => {
    if (process.client) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userUID");
      localStorage.removeItem("userEmail");

      globalUser.value = null;
      globalIsAuthenticated.value = false;
    }
  };

  // 認証トークンを取得
  const getAuthToken = (): string | null => {
    if (process.client) {
      return localStorage.getItem("authToken");
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
