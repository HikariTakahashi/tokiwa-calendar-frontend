import { useWindowSize } from "@vueuse/core";
import type { TimeSlot } from "./TimeUtils";
import type { TaskSlot } from "./TaskUtils";

export type DisplayMode = "time" | "task";

export const useDisplayUtils = () => {
  const { width } = useWindowSize();

  // userColorに基づいてテキストカラーを決定する関数（共通）
  const getTextColorClass = (userColor?: string): string => {
    if (!userColor) return "text-white"; // デフォルトは白

    // カラーコードをRGB値に変換
    const hex = userColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 輝度を計算（YIQ式）
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 輝度が128以上なら黒、未満なら白
    return brightness >= 128 ? "text-black" : "text-white";
  };

  // 時刻の妥当性をチェックする関数（共通）
  const isValidTimeFormat = (timeString: string): boolean => {
    if (!timeString) return false;

    // 24:00の場合は特別に許可
    if (timeString === "24:00") return true;

    // HH:MM形式のチェック
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeString)) return false;

    const [hours, minutes] = timeString.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  // 時間スロットの表示テキストを変更(表示用)
  const formatTimeForDisplay = (timeSlots: TimeSlot[]) => {
    const isMobile = width.value < 640; // sm: 640px未満をモバイルと判定

    return timeSlots
      .map((time) => {
        // 開始時刻が00:00かつ終了時刻が24:00の場合
        if (time.start === "00:00" && time.end === "24:00") {
          return "終日";
        }
        // 終了時刻が00:00の場合
        else if (time.end === "24:00") {
          return isMobile ? `(${time.start}\n終日)` : `${time.start}~終日`;
        }
        // 開始時刻が00:00の場合
        else if (time.start === "00:00") {
          return isMobile ? `(開始\n${time.end})` : `~${time.end}`;
        }
        // 通常の時間表示
        return isMobile
          ? `(${time.start}\n${time.end})`
          : `${time.start}~${time.end}`;
      })
      .join("\n");
  };

  // タスクスロットの表示テキストを変更(表示用)
  const formatTaskForDisplay = (taskSlots: TaskSlot[]) => {
    const isMobile = width.value < 640; // sm: 640px未満をモバイルと判定

    return taskSlots
      .map((task) => {
        // 開始時刻が00:00かつ終了時刻が24:00の場合
        if (task.start === "00:00" && task.end === "24:00") {
          return `${task.taskName}\n終日`;
        }
        // 終了時刻が00:00の場合
        else if (task.end === "24:00") {
          return isMobile
            ? `${task.taskName}\n(${task.start}\n終日)`
            : `${task.taskName}\n${task.start}~終日`;
        }
        // 開始時刻が00:00の場合
        else if (task.start === "00:00") {
          return isMobile
            ? `${task.taskName}\n(開始\n${task.end})`
            : `${task.taskName}\n~${task.end}`;
        }
        // 通常の時間表示
        return isMobile
          ? `${task.taskName}\n(${task.start}\n${task.end})`
          : `${task.taskName}\n${task.start}~${task.end}`;
      })
      .join("\n");
  };

  // モードに応じて適切な表示関数を選択
  const formatForDisplay = (
    slots: TimeSlot[] | TaskSlot[],
    mode: DisplayMode
  ) => {
    if (mode === "task") {
      return formatTaskForDisplay(slots as TaskSlot[]);
    } else {
      return formatTimeForDisplay(slots as TimeSlot[]);
    }
  };

  // 優先度の表示用テキストを取得
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case "low":
        return "低";
      case "medium":
        return "中";
      case "high":
        return "高";
      default:
        return "中";
    }
  };

  // ステータスの表示用テキストを取得
  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending":
        return "未着手";
      case "in-progress":
        return "進行中";
      case "completed":
        return "完了";
      default:
        return "未着手";
    }
  };

  // 優先度の色クラスを取得
  const getPriorityColorClass = (priority: string): string => {
    switch (priority) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  // ステータスの色クラスを取得
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case "pending":
        return "text-gray-600";
      case "in-progress":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return {
    getTextColorClass,
    isValidTimeFormat,
    formatTimeForDisplay,
    formatTaskForDisplay,
    formatForDisplay,
    getPriorityText,
    getStatusText,
    getPriorityColorClass,
    getStatusColorClass,
  };
};
