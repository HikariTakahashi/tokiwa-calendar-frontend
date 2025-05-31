import { ref } from "vue";
import { useWindowSize } from "@vueuse/core";

export interface TimeSlot {
  start: string;
  end: string;
}

export const useTimeUtils = () => {
  const { width } = useWindowSize();
  const timeSlots = ref<TimeSlot[]>([
    {
      start: "",
      end: "",
    },
  ]);

  const addTimeSlot = () => {
    timeSlots.value.push({
      start: "",
      end: "",
    });
  };

  const removeTimeSlot = (index: number) => {
    timeSlots.value.splice(index, 1);
  };

  const validateTime = (timeSlots: TimeSlot[]) => {
    return !timeSlots.some((slot) => !slot.start || !slot.end);
  };

  // 時間の表示テキストを変更(表示用)
  const formatTimeForDisplay = (timeSlots: TimeSlot[]) => {
    const isMobile = width.value < 640; // sm: 640px未満をモバイルと判定

    return timeSlots
      .map((time) => {
        // 開始時刻が00:00かつ終了時刻が00:00の場合
        if (time.start === "00:00" && time.end === "00:00") {
          return "終日";
        }
        // 終了時刻が00:00の場合
        else if (time.end === "00:00") {
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
        if (time.start === "00:00" && time.end === "00:00") {
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
    formatTimeForDisplay,
    formatTimeForCopy,
  };
};
