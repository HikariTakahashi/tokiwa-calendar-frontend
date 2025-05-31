import { useTimeUtils } from "@/utils/TimeUtils";

// 表示形式を変更できるよう将来的に変更
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
};

// 年を表示する用
// ${date.getFullYear()}年

export const copyToClipboard = (
  displayData: Record<string, any>
): Promise<void> => {
  // コピーデータがない場合ボタンが押せないものの、一応警告を出す
  if (Object.keys(displayData).length === 0) {
    alert("コピーするデータがありません");
    return Promise.reject("データがありません");
  }
  // コピーデータはTimeUtilsからインポート
  const { formatTimeForCopy } = useTimeUtils();

  // コピーデータ作成
  const text = Object.entries(displayData)
    .map(([date, timeSlots]) => {
      return `${formatDate(date)}:${formatTimeForCopy(timeSlots)}`;
    })
    .join("\n");

  // クリップボードにコピー
  return navigator.clipboard
    .writeText(text)
    .then(() => alert("クリップボードにコピーしました"))
    .catch((err) => {
      console.error("コピーに失敗しました:", err);
      throw err;
    });
};
