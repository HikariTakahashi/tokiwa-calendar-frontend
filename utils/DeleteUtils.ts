import type { TimeSlot } from "./TimeUtils";

export interface DeleteResult {
  shouldDelete: boolean;
  keepUserData: boolean;
  userTimeSlots: TimeSlot[];
  deletedSlots: TimeSlot[];
  message?: string;
}

export interface DeleteOptions {
  allowUserDataDeletion?: boolean;
  confirmUserDataDeletion?: boolean;
}

export const useDeleteUtils = () => {
  /**
   * 時間スロットの削除可否を判定する
   * @param timeSlots 削除対象の時間スロット配列
   * @param options 削除オプション
   * @returns 削除結果
   */
  const analyzeTimeSlotsForDeletion = (
    timeSlots: TimeSlot[],
    options: DeleteOptions = {}
  ): DeleteResult => {
    const { allowUserDataDeletion = false, confirmUserDataDeletion = false } =
      options;

    // 空のスロットを除外
    const validSlots = timeSlots.filter(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    if (validSlots.length === 0) {
      return {
        shouldDelete: false,
        keepUserData: false,
        userTimeSlots: [],
        deletedSlots: [],
        message: "削除するデータがありません",
      };
    }

    // ユーザーデータと非ユーザーデータを分離
    const userSlots = validSlots.filter((slot) => slot.username);
    const nonUserSlots = validSlots.filter((slot) => !slot.username);

    // 削除可能なスロットを判定
    const deletableSlots: TimeSlot[] = [];
    const keepSlots: TimeSlot[] = [];

    // 非ユーザーデータは削除可能
    deletableSlots.push(...nonUserSlots);

    // ユーザーデータの処理
    if (userSlots.length > 0) {
      if (allowUserDataDeletion && confirmUserDataDeletion) {
        // ユーザーデータの削除が許可されている場合
        deletableSlots.push(...userSlots);
      } else {
        // ユーザーデータは保持
        keepSlots.push(...userSlots);
      }
    }

    const result = {
      shouldDelete: deletableSlots.length > 0,
      keepUserData: keepSlots.length > 0,
      userTimeSlots: keepSlots,
      deletedSlots: deletableSlots,
      message:
        keepSlots.length > 0
          ? `${deletableSlots.length}件のデータを削除し、${keepSlots.length}件のユーザーデータを保持します`
          : `${deletableSlots.length}件のデータを削除します`,
    };

    return result;
  };

  /**
   * 個別の時間スロットを削除する
   * @param timeSlots 現在の時間スロット配列
   * @param indexToRemove 削除するインデックス
   * @returns 更新された時間スロット配列
   */
  const removeTimeSlotAtIndex = (
    timeSlots: TimeSlot[],
    indexToRemove: number
  ): TimeSlot[] => {
    if (indexToRemove < 0 || indexToRemove >= timeSlots.length) {
      return [...timeSlots];
    }

    const updatedSlots = [...timeSlots];
    updatedSlots.splice(indexToRemove, 1);

    // orderを再割り当て
    return updatedSlots.map((slot, index) => ({
      ...slot,
      order: index + 1,
    }));
  };

  /**
   * 特定の条件に一致する時間スロットを削除する
   * @param timeSlots 現在の時間スロット配列
   * @param predicate 削除条件を判定する関数
   * @returns 更新された時間スロット配列
   */
  const removeTimeSlotsByCondition = (
    timeSlots: TimeSlot[],
    predicate: (slot: TimeSlot, index: number) => boolean
  ): TimeSlot[] => {
    const updatedSlots = timeSlots.filter(
      (slot, index) => !predicate(slot, index)
    );

    // orderを再割り当て
    return updatedSlots.map((slot, index) => ({
      ...slot,
      order: index + 1,
    }));
  };

  /**
   * ユーザーデータを除くすべての時間スロットを削除する
   * @param timeSlots 現在の時間スロット配列
   * @returns 更新された時間スロット配列（ユーザーデータのみ）
   */
  const removeAllNonUserTimeSlots = (timeSlots: TimeSlot[]): TimeSlot[] => {
    const userSlots = timeSlots.filter((slot) => slot.username);

    // orderを再割り当て
    return userSlots.map((slot, index) => ({
      ...slot,
      order: index + 1,
    }));
  };

  /**
   * 空の時間スロットを削除する
   * @param timeSlots 現在の時間スロット配列
   * @returns 更新された時間スロット配列
   */
  const removeEmptyTimeSlots = (timeSlots: TimeSlot[]): TimeSlot[] => {
    const nonEmptySlots = timeSlots.filter(
      (slot) => !(slot.start === "00:00" && slot.end === "00:00")
    );

    // orderを再割り当て
    return nonEmptySlots.map((slot, index) => ({
      ...slot,
      order: index + 1,
    }));
  };

  /**
   * デバッグ用: スロットの詳細情報を出力
   * @param slot 時間スロット
   * @returns デバッグ情報
   */
  const debugSlotInfo = (slot: TimeSlot) => {
    return {
      start: slot.start,
      end: slot.end,
      username: slot.username,
      userColor: slot.userColor,
      hasUsername: !!slot.username,
      hasUserColor: !!slot.userColor,
      isUserData: !!(slot.username || slot.userColor),
      isEmpty: slot.start === "00:00" && slot.end === "00:00",
    };
  };

  return {
    analyzeTimeSlotsForDeletion,
    removeTimeSlotAtIndex,
    removeTimeSlotsByCondition,
    removeAllNonUserTimeSlots,
    removeEmptyTimeSlots,
    debugSlotInfo,
  };
};
