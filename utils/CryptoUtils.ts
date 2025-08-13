/**
 * パスワード暗号化ユーティリティ
 */

// 暗号化に使用するキー（環境変数から取得、フォールバック用のデフォルト値）
const getEncryptionKey = (): string => {
  const config = useRuntimeConfig();
  const key =
    config.public.encryptionKey || "your-secret-encryption-key-32-chars-long!";
  return key;
};

/**
 * 文字列をBase64エンコードする
 */
const base64Encode = (str: string): string => {
  if (typeof window !== "undefined") {
    return btoa(str);
  }
  // Node.js環境用
  return Buffer.from(str).toString("base64");
};

/**
 * Base64デコードする
 */
const base64Decode = (str: string): string => {
  if (typeof window !== "undefined") {
    return atob(str);
  }
  // Node.js環境用
  return Buffer.from(str, "base64").toString();
};

/**
 * パスワードを暗号化する（簡易版）
 * @param password 平文のパスワード
 * @returns 暗号化されたパスワード（Base64エンコード）
 */
export const encryptPassword = async (password: string): Promise<string> => {
  try {
    const encryptionKey = getEncryptionKey();

    // 簡易暗号化: パスワードとキーを組み合わせてBase64エンコード
    const combined = password + ":" + encryptionKey;
    const result = base64Encode(combined);
    return result;
  } catch (error) {
    console.error("パスワード暗号化エラー:", error);
    if (error instanceof Error) {
      throw new Error(`パスワードの暗号化に失敗しました: ${error.message}`);
    }
    throw new Error("パスワードの暗号化に失敗しました");
  }
};

/**
 * 暗号化されたパスワードを復号化する（簡易版）
 * @param encryptedPassword 暗号化されたパスワード
 * @returns 復号化されたパスワード
 */
export const decryptPassword = async (
  encryptedPassword: string
): Promise<string> => {
  try {
    // Base64デコード
    const decoded = base64Decode(encryptedPassword);

    // パスワードとキーを分離
    const parts = decoded.split(":");
    if (parts.length !== 2) {
      throw new Error("暗号化データの形式が不正です");
    }

    return parts[0]; // パスワード部分を返す
  } catch (error) {
    console.error("パスワード復号化エラー:", error);
    throw new Error("パスワードの復号化に失敗しました");
  }
};
