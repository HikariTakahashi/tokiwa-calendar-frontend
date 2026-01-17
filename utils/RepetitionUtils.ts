import type { TimeSlot } from "@/utils/TimeUtils";
import type { TimeData } from "@/composables/useAPI";

export interface RepetitionValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export interface RepetitionSaveData {
  date: string;
  timeSlots: TimeSlot[];
}

export const useRepetitionUtils = () => {
  // 表示用の日付フォーマット関数
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}/${date.getDate()}(${
      weekdays[date.getDay()]
    })`;
  };

  // 繰り返し保存のバリデーション
  const validateRepetitionSave = (
    repetitionStartDate: string,
    repetitionEndDate: string,
    repetitionPattern: string,
    selectedWeekdays: string[],
    selectedRepetitionDates: string[],
    timeSlots: TimeSlot[],
    startDate: string | null,
    endDate: string | null,
    validateTime: (slots: TimeSlot[]) => boolean,
    validateTimeOrder: (slots: TimeSlot[]) => RepetitionValidationResult,
    validateTimeOverlap: (slots: TimeSlot[]) => RepetitionValidationResult
  ): RepetitionValidationResult => {
    // 開始日・終了日が設定されていない場合
    if (!repetitionStartDate || !repetitionEndDate) {
      return {
        isValid: false,
        errorMessage: "開始日と終了日を設定してください",
      };
    }

    // バックエンドの制限をチェック
    if (startDate && repetitionStartDate < startDate) {
      return {
        isValid: false,
        errorMessage: `開始日は${formatDisplayDate(
          startDate
        )}以降に設定してください`,
      };
    }

    if (endDate && repetitionEndDate > endDate) {
      return {
        isValid: false,
        errorMessage: `終了日は${formatDisplayDate(
          endDate
        )}までに設定してください`,
      };
    }

    // 毎週の場合、曜日が選択されていない場合
    if (repetitionPattern === "weekly" && selectedWeekdays.length === 0) {
      return {
        isValid: false,
        errorMessage: "曜日を選択してください",
      };
    }

    // 日付が選択されていない場合
    if (selectedRepetitionDates.length === 0) {
      return {
        isValid: false,
        errorMessage: "対象日付を選択してください",
      };
    }

    // 空のスロットが含まれているかチェック
    const emptySlots = timeSlots.filter(
      (slot) => slot.start === "00:00" && slot.end === "00:00"
    );

    if (emptySlots.length > 0) {
      return {
        isValid: false,
        errorMessage: "空の時間スロットがあります。",
      };
    }

    // 空のスロット（startが00:00かつendが00:00）を除外
    const validTimeSlots = timeSlots.filter(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    // 有効なスロットがない場合は保存しない
    if (validTimeSlots.length === 0) {
      return {
        isValid: false,
        errorMessage: "時間を入力してください",
      };
    }

    // ユーザーデータ（username）が存在しないデータのみを抽出（CopyLogicUtils.tsのコピーロジックを参考）
    const nonUserTimeSlots = validTimeSlots.filter((slot) => !slot.username);

    // ユーザーデータ以外のスロットがない場合は保存しない
    if (nonUserTimeSlots.length === 0) {
      return {
        isValid: false,
        errorMessage:
          "繰り返し保存するデータがありません（ユーザーデータは繰り返し保存できません）",
      };
    }

    // バリデーションを実行（ユーザーデータ以外のスロットのみで）
    if (!validateTime(nonUserTimeSlots)) {
      return {
        isValid: false,
        errorMessage: "開始時刻と終了時刻を入力してください",
      };
    }

    const orderValidation = validateTimeOrder(nonUserTimeSlots);
    if (!orderValidation.isValid) {
      return orderValidation;
    }

    const overlapValidation = validateTimeOverlap(nonUserTimeSlots);
    if (!overlapValidation.isValid) {
      return overlapValidation;
    }

    return {
      isValid: true,
      errorMessage: "",
    };
  };

  // 繰り返し保存データの生成
  const generateRepetitionSaveData = (
    selectedRepetitionDates: string[],
    timeSlots: TimeSlot[],
    timeData: TimeData
  ): RepetitionSaveData[] => {
    // 空のスロット（startが00:00かつendが00:00）を除外
    const validTimeSlots = timeSlots.filter(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    // ユーザーデータ（username）が存在しないデータのみを抽出（CopyLogicUtils.tsのコピーロジックを参考）
    const nonUserTimeSlots = validTimeSlots.filter((slot) => !slot.username);

    // 選択された日付に時間データを保存（各日付の既存ユーザーデータを保持しつつ、ユーザーデータ以外を追加）
    return selectedRepetitionDates.map((date) => {
      // 各日付の既存データを取得
      const existingTimeData = timeData.events[date] || [];
      const existingTimeSlots = Array.isArray(existingTimeData)
        ? existingTimeData
        : [existingTimeData];

      // 既存のユーザーデータを抽出（空のスロットを除外）
      const existingUserTimeSlots = existingTimeSlots.filter(
        (slot) =>
          slot.username && !(slot.start === "00:00" && slot.end === "00:00")
      );

      // CopyLogicUtils.tsのhandlePasteロジックを参考に、既存のユーザーデータを保持して新しいデータを追加
      const finalTimeSlots = [...existingUserTimeSlots, ...nonUserTimeSlots];

      return {
        date: date,
        timeSlots: finalTimeSlots,
      };
    });
  };

  // 繰り返し設定ボタンの表示条件チェック
  const shouldShowRepetitionButton = (
    hasTimeData: boolean,
    hasOnlyUserTimeSlots: boolean,
    timeSlots: TimeSlot[]
  ): boolean => {
    if (!hasTimeData || hasOnlyUserTimeSlots) {
      return false;
    }

    // 空のスロットを除外して判定
    const nonEmptySlots = timeSlots.filter(
      (slot) => slot.start !== "00:00" || slot.end !== "00:00"
    );

    // ユーザーデータ以外のスロットが存在するかチェック
    return nonEmptySlots.some((slot) => !slot.username);
  };

  return {
    formatDisplayDate,
    validateRepetitionSave,
    generateRepetitionSaveData,
    shouldShowRepetitionButton,
  };
};
