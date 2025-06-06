import { ref } from "vue";
import { useWindowSize } from "@vueuse/core";

export interface TimeSlot {
  start: string;
  end: string;
  order?: number;
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

  const validateTime = (timeSlots: TimeSlot[]) => {
    return !timeSlots.some((slot) => !slot.start || !slot.end);
  };

  const validateTimeOrder = (slots: TimeSlot[]) => {
    for (const slot of slots) {
      if (!slot.start || !slot.end) continue;

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
    // 時間スロットを開始時刻でソート
    const sortedSlots = [...slots].sort((a, b) => {
      if (!a.start || !b.start) return 0;
      const dateA = new Date(`2000-01-01T${a.start}`).getTime();
      const dateB = new Date(`2000-01-01T${b.start}`).getTime();
      return dateA - dateB;
    });

    // 隣接する時間スロットの重複をチェック
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];

      if (!current.start || !current.end || !next.start || !next.end) continue;

      const currentEnd = new Date(`2000-01-01T${current.end}`).getTime();
      const nextStart = new Date(`2000-01-01T${next.start}`).getTime();
      // エラー表示
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
  };
};
