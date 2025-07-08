import type { TimeSlot } from "./TimeUtils";

export interface OverlapTimeSlot {
  start: string;
  end: string;
  usernames: string[];
  userColors: string[];
}

export interface OverlapDisplayData {
  [date: string]: {
    original: TimeSlot[];
    overlaps: OverlapTimeSlot[];
  };
}

export const useOverlapTimeUtils = () => {
  /**
   * 時刻文字列を分単位の数値に変換
   */
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  /**
   * 分単位の数値を時刻文字列に変換
   */
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  /**
   * 2つの時間スロットが重複しているかチェック
   */
  const isTimeOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
    if (!slot1.start || !slot1.end || !slot2.start || !slot2.end) return false;

    const start1 = timeToMinutes(slot1.start);
    const end1 = timeToMinutes(slot1.end);
    const start2 = timeToMinutes(slot2.start);
    const end2 = timeToMinutes(slot2.end);

    // 終日の場合の特別処理
    if (slot1.end === "24:00" && slot2.end === "24:00") return true;
    if (slot1.end === "24:00") return start1 <= end2;
    if (slot2.end === "24:00") return start2 <= end1;

    return start1 < end2 && start2 < end1;
  };

  /**
   * 重複する時間範囲を取得
   */
  const getOverlapRange = (
    slot1: TimeSlot,
    slot2: TimeSlot
  ): { start: string; end: string } | null => {
    if (!isTimeOverlap(slot1, slot2)) return null;

    const start1 = timeToMinutes(slot1.start);
    const end1 = slot1.end === "24:00" ? 24 * 60 : timeToMinutes(slot1.end);
    const start2 = timeToMinutes(slot2.start);
    const end2 = slot2.end === "24:00" ? 24 * 60 : timeToMinutes(slot2.end);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    return {
      start: minutesToTime(overlapStart),
      end: overlapEnd === 24 * 60 ? "24:00" : minutesToTime(overlapEnd),
    };
  };

  /**
   * 複数の時間スロットから重複する時刻を検出
   */
  const findOverlappingTimes = (timeSlots: TimeSlot[]): OverlapTimeSlot[] => {
    const overlaps: OverlapTimeSlot[] = [];
    const validSlots = timeSlots.filter(
      (slot) =>
        slot.username &&
        slot.start &&
        slot.end &&
        !(slot.start === "00:00" && slot.end === "00:00")
    );

    if (validSlots.length < 2) return overlaps;

    // ユーザー名ごとにグループ化
    const userGroups = new Map<string, TimeSlot[]>();
    validSlots.forEach((slot) => {
      if (!userGroups.has(slot.username!)) {
        userGroups.set(slot.username!, []);
      }
      userGroups.get(slot.username!)!.push(slot);
    });

    const usernames = Array.from(userGroups.keys());
    if (usernames.length < 2) return overlaps;

    // 全てのユーザーの組み合わせで重複をチェック
    for (let i = 0; i < usernames.length; i++) {
      for (let j = i + 1; j < usernames.length; j++) {
        const user1 = usernames[i];
        const user2 = usernames[j];
        const slots1 = userGroups.get(user1)!;
        const slots2 = userGroups.get(user2)!;

        // 各スロットの組み合わせで重複をチェック
        for (const slot1 of slots1) {
          for (const slot2 of slots2) {
            const overlapRange = getOverlapRange(slot1, slot2);
            if (overlapRange) {
              overlaps.push({
                start: overlapRange.start,
                end: overlapRange.end,
                usernames: [user1, user2],
                userColors: [
                  slot1.userColor || "#3b82f6",
                  slot2.userColor || "#3b82f6",
                ],
              });
            }
          }
        }
      }
    }

    // 重複する時間範囲をマージ
    return mergeOverlappingRanges(overlaps);
  };

  /**
   * 重複する時間範囲をマージ
   */
  const mergeOverlappingRanges = (
    overlaps: OverlapTimeSlot[]
  ): OverlapTimeSlot[] => {
    if (overlaps.length === 0) return overlaps;

    // 開始時刻でソート
    const sorted = overlaps.sort((a, b) => {
      const startA = timeToMinutes(a.start);
      const startB = timeToMinutes(b.start);
      return startA - startB;
    });

    const merged: OverlapTimeSlot[] = [];
    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];

      // 現在の範囲と次の範囲が重複しているかチェック
      if (
        isTimeOverlap(
          { start: current.start, end: current.end },
          { start: next.start, end: next.end }
        )
      ) {
        // 重複している場合、範囲をマージ
        const startA = timeToMinutes(current.start);
        const endA =
          current.end === "24:00" ? 24 * 60 : timeToMinutes(current.end);
        const startB = timeToMinutes(next.start);
        const endB = next.end === "24:00" ? 24 * 60 : timeToMinutes(next.end);

        const mergedStart = Math.min(startA, startB);
        const mergedEnd = Math.max(endA, endB);

        current = {
          start: minutesToTime(mergedStart),
          end: mergedEnd === 24 * 60 ? "24:00" : minutesToTime(mergedEnd),
          usernames: [...new Set([...current.usernames, ...next.usernames])],
          userColors: [...new Set([...current.userColors, ...next.userColors])],
        };
      } else {
        // 重複していない場合、現在の範囲を保存して次の範囲に移行
        merged.push(current);
        current = { ...next };
      }
    }

    merged.push(current);
    return merged;
  };

  /**
   * 日付ごとのデータから重複時刻を検出して表示用データを生成
   */
  const generateOverlapDisplayData = (timeData: {
    [date: string]: TimeSlot[];
  }): OverlapDisplayData => {
    const result: OverlapDisplayData = {};

    for (const [date, timeSlots] of Object.entries(timeData)) {
      if (!Array.isArray(timeSlots) || timeSlots.length === 0) continue;

      // ユーザー名が存在するスロットのみを対象とする
      const slotsWithUsername = timeSlots.filter((slot) => slot.username);

      if (slotsWithUsername.length < 2) {
        // 複数のユーザーがいない場合は元のデータをそのまま使用
        result[date] = {
          original: timeSlots,
          overlaps: [],
        };
        continue;
      }

      const overlaps = findOverlappingTimes(slotsWithUsername);

      result[date] = {
        original: timeSlots,
        overlaps: overlaps,
      };
    }

    return result;
  };

  /**
   * 重複時刻の表示用テキストを生成
   */
  const formatOverlapTimeForDisplay = (
    overlapSlot: OverlapTimeSlot,
    isMobile: boolean = false
  ): string => {
    const timeText = (() => {
      if (overlapSlot.start === "00:00" && overlapSlot.end === "24:00") {
        return "終日";
      } else if (overlapSlot.end === "24:00") {
        return isMobile
          ? `(${overlapSlot.start}\n終日)`
          : `${overlapSlot.start}~終日`;
      } else if (overlapSlot.start === "00:00") {
        return isMobile ? `(開始\n${overlapSlot.end})` : `~${overlapSlot.end}`;
      } else {
        return isMobile
          ? `(${overlapSlot.start}\n${overlapSlot.end})`
          : `${overlapSlot.start}~${overlapSlot.end}`;
      }
    })();

    return timeText;
  };

  return {
    findOverlappingTimes,
    generateOverlapDisplayData,
    formatOverlapTimeForDisplay,
    isTimeOverlap,
    getOverlapRange,
  };
};
