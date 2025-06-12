import { ref } from "vue";
import type { TimeSlot } from "@/utils/TimeUtils";

export const useCopyLogic = () => {
  const copiedTimeData = ref<TimeSlot | TimeSlot[] | null>(null);
  const isCopyMode = ref(false);
  const pastedDates = ref<Set<string>>(new Set());
  const originalData = ref<Record<string, any>>({});

  const handleCopy = (selectedDate: string, timeData: Record<string, any>) => {
    if (selectedDate) {
      const timeSlot = timeData[selectedDate];

      if (Array.isArray(timeSlot)) {
        // 配列の場合、Usernameが存在しないデータのみをコピー
        const nonUserTimeSlots = timeSlot.filter((slot) => !slot.username);
        if (nonUserTimeSlots.length > 0) {
          copiedTimeData.value = nonUserTimeSlots;
          isCopyMode.value = true;
          pastedDates.value.clear();
          originalData.value = {};
          return {
            isCopyMode: true,
            copiedTimeData: nonUserTimeSlots,
          };
        }
      } else if (timeSlot && !timeSlot.username) {
        // 単一のデータでUsernameが存在しない場合
        copiedTimeData.value = timeSlot;
        isCopyMode.value = true;
        pastedDates.value.clear();
        originalData.value = {};
        return {
          isCopyMode: true,
          copiedTimeData: timeSlot,
        };
      }

      // Usernameが存在するデータのみの場合はコピーを無効化
      copiedTimeData.value = null;
      isCopyMode.value = false;
      return {
        isCopyMode: false,
        copiedTimeData: null,
      };
    }
    return {
      isCopyMode: false,
      copiedTimeData: null,
    };
  };

  const handlePaste = (date: string, timeData: Record<string, any>) => {
    if (isCopyMode.value && copiedTimeData.value) {
      const targetTimeSlot = timeData[date];

      if (pastedDates.value.has(date)) {
        // 貼り付けの取り消し
        if (originalData.value[date]) {
          timeData[date] = originalData.value[date];
        } else {
          delete timeData[date];
        }
        pastedDates.value.delete(date);
        return {
          timeData: { ...timeData },
          isPasted: false,
          isCancelled: true,
        };
      }

      // 現在のデータを保存
      if (timeData[date]) {
        originalData.value[date] = timeData[date];
      }

      if (Array.isArray(targetTimeSlot)) {
        // 配列の場合
        const userTimeSlots = targetTimeSlot.filter((slot) => slot.username);
        const nonUserTimeSlots = targetTimeSlot.filter(
          (slot) => !slot.username
        );

        if (userTimeSlots.length > 0) {
          // Usernameが存在するデータがある場合は、それらを保持して新しいデータを追加
          timeData[date] = [
            ...userTimeSlots,
            ...(Array.isArray(copiedTimeData.value)
              ? copiedTimeData.value
              : [copiedTimeData.value]),
          ];
        } else {
          // Usernameが存在しないデータのみの場合は、新しいデータで置き換え
          timeData[date] = Array.isArray(copiedTimeData.value)
            ? copiedTimeData.value
            : [copiedTimeData.value];
        }
      } else if (targetTimeSlot?.username) {
        // 単一のデータでUsernameが存在する場合は、新しいデータを追加
        timeData[date] = [
          targetTimeSlot,
          ...(Array.isArray(copiedTimeData.value)
            ? copiedTimeData.value
            : [copiedTimeData.value]),
        ];
      } else {
        // その他の場合は新しいデータで置き換え
        timeData[date] = copiedTimeData.value;
      }

      pastedDates.value.add(date);
      return {
        timeData: { ...timeData },
        isPasted: true,
        isCancelled: false,
      };
    }
    return {
      timeData,
      isPasted: false,
      isCancelled: false,
    };
  };

  const handleCancelCopyMode = (timeData: Record<string, any>) => {
    if (copiedTimeData.value) {
      Object.keys(timeData).forEach((date) => {
        if (pastedDates.value.has(date)) {
          if (originalData.value[date]) {
            timeData[date] = originalData.value[date];
          } else {
            delete timeData[date];
          }
        }
      });
    }
    copiedTimeData.value = null;
    isCopyMode.value = false;
    pastedDates.value.clear();
    originalData.value = {};
    return {
      timeData: { ...timeData },
      isCopyMode: false,
    };
  };

  const closeCopyMode = () => {
    isCopyMode.value = false;
    pastedDates.value.clear();
    originalData.value = {};
    return {
      isCopyMode: false,
    };
  };

  return {
    copiedTimeData,
    isCopyMode,
    pastedDates,
    originalData,
    handleCopy,
    handlePaste,
    handleCancelCopyMode,
    closeCopyMode,
  };
};
