/**
 * パスワードをSHA-256でハッシュ化する
 * @param password 平文のパスワード
 * @returns ハッシュ化されたパスワード
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

/**
 * パスワードの強度をチェックする
 * @param password パスワード
 * @returns 強度チェック結果
 */
export const checkPasswordStrength = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("パスワードは8文字以上で入力してください");
  }

  if (password.length > 16) {
    errors.push("パスワードは16文字以内で入力してください");
  }

  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    errors.push("パスワードは大文字、小文字、数字を含めてください");
  }

  // アルファベットと数字以外の文字を禁止
  if (!/^[A-Za-z0-9]+$/.test(password)) {
    errors.push("パスワードは英数字のみ使用可能です");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
