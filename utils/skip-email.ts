// メール認証スキップ機能のユーティリティ

// 環境変数からメール認証スキップの設定を取得
const getSkipEmailVerification = (): boolean => {
  // Nuxt.jsの環境変数から取得
  const skipEmail = useRuntimeConfig().public.skipEmailVerification;
  return skipEmail === "true";
};

// Lambda環境でのメール認証スキップが有効かどうかを判定
export const shouldSkipEmailVerification = (): boolean => {
  return getSkipEmailVerification();
};

// サインアップレスポンスからLambda環境でのメール認証スキップかどうかを判定
export const isLambdaEmailSkip = (response: any): boolean => {
  return response?.lambdaMode === true;
};

// メール認証スキップ時の遷移先を決定
export const getEmailVerificationRedirectPath = (response: any): string => {
  // Lambda環境でメール認証がスキップされた場合、ログインページに直接遷移
  if (isLambdaEmailSkip(response)) {
    return "/login";
  }

  // 通常の場合はメール認証ページに遷移
  return "/signup/verification-email";
};

// メール認証スキップ時のメッセージを取得
export const getEmailSkipMessage = (): string => {
  return "Lambda環境のためメール認証をスキップしました。ログインページからお進みください。";
};
