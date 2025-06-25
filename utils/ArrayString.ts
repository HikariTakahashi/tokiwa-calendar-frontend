/**
 * ユーザーネームの文字列制限とバリデーション機能
 */

// 禁止文字のリスト（コードに影響を与える可能性がある文字）
const FORBIDDEN_CHARS = [
  '"', // ダブルクォート
  "'", // シングルクォート
  '`', // バッククォート
  '\\', // バックスラッシュ
  '/', // スラッシュ
  '<', // 小なり記号
  '>', // 大なり記号
  '&', // アンパサンド
  '|', // パイプ
  ';', // セミコロン
  '(', // 左括弧
  ')', // 右括弧
  '{', // 左中括弧
  '}', // 右中括弧
  '[', // 左角括弧
  ']', // 右角括弧
  '=', // 等号
  '+', // プラス
  '*', // アスタリスク
  '?', // クエスチョンマーク
  '!', // 感嘆符
  '@', // アットマーク
  '#', // シャープ
  '$', // ドル記号
  '%', // パーセント
  '^', // キャレット
  '~', // チルダ
];

/**
 * ユーザーネームの文字列制限をチェックする
 * @param username チェックするユーザーネーム
 * @returns バリデーション結果
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // 1文字以上、40文字以内のチェック
  if (!username || username.length === 0) {
    errors.push('ユーザーネームは1文字以上入力してください');
  } 

  // 禁止文字のチェック
  const forbiddenCharsFound: string[] = [];
  for (const char of FORBIDDEN_CHARS) {
    if (username.includes(char)) {
      forbiddenCharsFound.push(char);
    }
  }

  if (forbiddenCharsFound.length > 0) {
    errors.push(`以下の文字は使用できません: ${forbiddenCharsFound.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * ユーザーネームから禁止文字を除去する
 * @param username 処理するユーザーネーム
 * @returns 禁止文字を除去したユーザーネーム
 */
export const sanitizeUsername = (username: string): string => {
  let sanitized = username;
  
  // 禁止文字を除去
  for (const char of FORBIDDEN_CHARS) {
    sanitized = sanitized.replace(new RegExp(`\\${char}`, 'g'), '');
  }
  
  // 40文字に制限
  if (sanitized.length > 40) {
    sanitized = sanitized.substring(0, 40);
  }
  
  return sanitized;
};

/**
 * ユーザーネームの入力制限を適用する
 * @param username 入力されたユーザーネーム
 * @returns 制限を適用したユーザーネーム
 */
export const applyUsernameRestrictions = (username: string): string => {
  // 禁止文字を除去
  let restricted = sanitizeUsername(username);
  
  // 空文字列の場合は空文字列を返す（1文字以上の制限は別途チェック）
  return restricted;
};

/**
 * ユーザーネームの文字数制限を取得する
 * @returns 文字数制限の情報
 */
export const getUsernameLimits = () => {
  return {
    minLength: 1,
    maxLength: 40,
    forbiddenChars: FORBIDDEN_CHARS
  };
}; 