export interface User {
  uid: string;
  email: string;
  customToken: string;
}

export const useAuth = () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // 初期化時にローカルストレージから認証情報を読み込み
  const initializeAuth = () => {
    if (process.client) {
      const token = localStorage.getItem("authToken");
      const uid = localStorage.getItem("userUID");
      const email = localStorage.getItem("userEmail");

      if (token && uid && email) {
        user.value = {
          uid,
          email,
          customToken: token,
        };
        isAuthenticated.value = true;
      }
    }
  };

  // ログイン処理
  const login = (userData: User) => {
    if (process.client) {
      localStorage.setItem("authToken", userData.customToken);
      localStorage.setItem("userUID", userData.uid);
      localStorage.setItem("userEmail", userData.email);

      user.value = userData;
      isAuthenticated.value = true;
    }
  };

  // ログアウト処理
  const logout = () => {
    if (process.client) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userUID");
      localStorage.removeItem("userEmail");

      user.value = null;
      isAuthenticated.value = false;
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
    return user.value;
  };

  // 認証状態をチェック
  const checkAuth = (): boolean => {
    return isAuthenticated.value;
  };

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    initializeAuth,
    login,
    logout,
    getAuthToken,
    getCurrentUser,
    checkAuth,
  };
};
