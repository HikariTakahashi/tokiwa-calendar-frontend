import { ref } from "vue";
import { useWindowSize } from "@vueuse/core";

export interface TimeSlot {
  start: string;
  end: string;
  order?: number;
  username?: string;
  userColor?: string;
}

export const useTimeUtils = () => {
  const { width } = useWindowSize();
  const timeSlots = ref<TimeSlot[]>([
    {
      start: "",
      end: "",
      order: 1,
    },
  ]);

  // userColorに基づいてテキストカラーを決定する関数
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

  const assignOrder = (slots: TimeSlot[]) => {
    return slots.map((slot, index) => ({
      ...slot,
      order: index + 1,
    }));
  };

  const addTimeSlot = () => {
    timeSlots.value.push({
      start: "",
      end: "",
      order: timeSlots.value.length + 1,
    });
  };

  const removeTimeSlot = (index: number) => {
    timeSlots.value.splice(index, 1);
    timeSlots.value = assignOrder(timeSlots.value);
  };

  // 時刻の妥当性をチェックする関数
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

  const validateTime = (timeSlots: TimeSlot[]) => {
    return !timeSlots.some((slot) => {
      // startまたはendが空の場合
      if (!slot.start || !slot.end) return true;
      // startが00:00かつendが00:00の場合（空のスロット）
      if (slot.start === "00:00" && slot.end === "00:00") return false;

      // 時刻形式の妥当性チェック
      if (!isValidTimeFormat(slot.start) || !isValidTimeFormat(slot.end)) {
        return true;
      }

      return false;
    });
  };

  const validateTimeOrder = (slots: TimeSlot[]) => {
    for (const slot of slots) {
      if (!slot.start || !slot.end) continue;
      // startが00:00かつendが00:00の場合は空のスロットとしてスキップ
      if (slot.start === "00:00" && slot.end === "00:00") continue;

      // 時刻形式の妥当性チェック
      if (!isValidTimeFormat(slot.start) || !isValidTimeFormat(slot.end)) {
        return {
          isValid: false,
          errorMessage:
            "無効な時刻形式です。HH:MM形式で入力してください（例: 09:30）",
        };
      }

      // 24:00の場合は特別処理
      if (slot.end === "24:00") {
        // 開始時刻が24:00以上の場合のみエラー
        if (slot.start === "24:00") {
          return {
            isValid: false,
            errorMessage: "開始時刻は終了時刻より若い時刻を入力してください",
          };
        }
        continue; // 24:00の場合は比較をスキップ
      }

      const startTime = new Date(`2000-01-01T${slot.start}`);
      const endTime = new Date(`2000-01-01T${slot.end}`);
      // エラー表示
      if (startTime >= endTime) {
        return {
          isValid: false,
          errorMessage: "開始時刻は終了時刻より若い時刻を入力してください",
        };
      }
    }
    return {
      isValid: true,
      errorMessage: "",
    };
  };

  const validateTimeOverlap = (slots: TimeSlot[]) => {
    // 空のスロット（startが00:00かつendが00:00）を除外
    const validSlots = slots.filter(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    // 時刻形式の妥当性チェック
    for (const slot of validSlots) {
      if (!isValidTimeFormat(slot.start) || !isValidTimeFormat(slot.end)) {
        return {
          isValid: false,
          errorMessage:
            "無効な時刻形式です。HH:MM形式で入力してください（例: 09:30）",
        };
      }
    }

    // 時間スロットを開始時刻でソート
    const sortedSlots = [...validSlots].sort((a, b) => {
      if (!a.start || !b.start) return 0;

      // 24:00の場合は特別処理
      if (a.start === "24:00") return 1; // 24:00は最後に配置
      if (b.start === "24:00") return -1;

      const dateA = new Date(`2000-01-01T${a.start}`).getTime();
      const dateB = new Date(`2000-01-01T${b.start}`).getTime();
      return dateA - dateB;
    });

    // ユーザー名ごとにグループ化
    const userGroups = new Map<string, TimeSlot[]>();
    const nonUserSlots = sortedSlots.filter((slot) => !slot.username);

    // ユーザー名が存在するスロットをグループ化
    sortedSlots.forEach((slot) => {
      if (slot.username) {
        if (!userGroups.has(slot.username)) {
          userGroups.set(slot.username, []);
        }
        userGroups.get(slot.username)?.push(slot);
      }
    });

    // 各ユーザーグループ内での重複チェック
    for (const [username, userSlots] of userGroups) {
      for (let i = 0; i < userSlots.length - 1; i++) {
        const current = userSlots[i];
        const next = userSlots[i + 1];

        if (!current.start || !current.end || !next.start || !next.end)
          continue;

        const currentEnd = new Date(`2000-01-01T${current.end}`).getTime();
        const nextStart = new Date(`2000-01-01T${next.start}`).getTime();

        if (currentEnd > nextStart) {
          return {
            isValid: false,
            errorMessage: `${username}の時間が重複しています`,
          };
        }
      }
    }

    // ユーザー名が存在しない時間スロット同士の重複チェック
    for (let i = 0; i < nonUserSlots.length - 1; i++) {
      const current = nonUserSlots[i];
      const next = nonUserSlots[i + 1];

      if (!current.start || !current.end || !next.start || !next.end) continue;

      const currentEnd = new Date(`2000-01-01T${current.end}`).getTime();
      const nextStart = new Date(`2000-01-01T${next.start}`).getTime();

      if (currentEnd > nextStart) {
        return {
          isValid: false,
          errorMessage: "重複する時間が存在します",
        };
      }
    }

    return {
      isValid: true,
      errorMessage: "",
    };
  };

  // 時間の表示テキストを変更(表示用)
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

  // 時間の表示テキストを変更(コピー用)
  const formatTimeForCopy = (timeSlots: TimeSlot[]) => {
    return timeSlots
      .map((time) => {
        if (time.start === "00:00" && time.end === "24:00") {
          return "終日";
        } else if (time.end === "00:00") {
          return `${time.start}~終日`;
        } else if (time.start === "00:00") {
          return `~${time.end}`;
        }
        return `${time.start}~${time.end}`;
      })
      .join(", ");
  };

  return {
    timeSlots,
    addTimeSlot,
    removeTimeSlot,
    validateTime,
    validateTimeOrder,
    validateTimeOverlap,
    formatTimeForDisplay,
    formatTimeForCopy,
    assignOrder,
    getTextColorClass,
    isValidTimeFormat,
  };
};
