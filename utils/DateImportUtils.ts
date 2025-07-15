import { ref } from "vue";
import type { TimeSlot } from "./TimeUtils";

export interface ImportedDateData {
  date: string;
  timeSlots: TimeSlot[];
}

export interface ImportResult {
  success: boolean;
  data?: ImportedDateData[];
  error?: string;
}

export const useDateImportUtils = () => {
  const importedData = ref<ImportedDateData[]>([]);

  // 日付文字列を解析して日付オブジェクトに変換
  const parseDateString = (dateStr: string): Date | null => {
    // "7/21(月)" のような形式を解析
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\([月火水木金土日]\)$/);
    if (!match) return null;

    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const currentYear = new Date().getFullYear();

    // 日付の妥当性をチェック
    const date = new Date(currentYear, month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  };

  // 時間文字列を解析してTimeSlotに変換
  const parseTimeString = (timeStr: string): TimeSlot | null => {
    // "09:45~22:00" のような形式を解析
    const match = timeStr.match(/^(\d{1,2}):(\d{2})~(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const startHour = parseInt(match[1], 10);
    const startMinute = parseInt(match[2], 10);
    const endHour = parseInt(match[3], 10);
    const endMinute = parseInt(match[4], 10);

    // 時間の妥当性をチェック
    if (
      startHour < 0 ||
      startHour > 23 ||
      endHour < 0 ||
      endHour > 23 ||
      startMinute < 0 ||
      startMinute > 59 ||
      endMinute < 0 ||
      endMinute > 59
    ) {
      return null;
    }

    const start = `${String(startHour).padStart(2, "0")}:${String(
      startMinute
    ).padStart(2, "0")}`;
    const end = `${String(endHour).padStart(2, "0")}:${String(
      endMinute
    ).padStart(2, "0")}`;

    return {
      start,
      end,
      order: 1,
    };
  };

  // テキストを解析して日付データに変換
  const parseImportText = (text: string): ImportResult => {
    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const result: ImportedDateData[] = [];

    for (const line of lines) {
      // "7/21(月):09:45~22:00" のような形式を解析
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        return {
          success: false,
          error: `無効な形式です: ${line}`,
        };
      }

      const datePart = line.substring(0, colonIndex);
      const timePart = line.substring(colonIndex + 1);

      const date = parseDateString(datePart);
      if (!date) {
        return {
          success: false,
          error: `無効な日付形式です: ${datePart}`,
        };
      }

      const timeSlot = parseTimeString(timePart);
      if (!timeSlot) {
        return {
          success: false,
          error: `無効な時間形式です: ${timePart}`,
        };
      }

      // 日付をYYYY-MM-DD形式に変換
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      result.push({
        date: formattedDate,
        timeSlots: [timeSlot],
      });
    }

    return {
      success: true,
      data: result,
    };
  };

  // インポート処理を実行
  const importDateData = (text: string): ImportResult => {
    const parseResult = parseImportText(text);

    if (parseResult.success && parseResult.data) {
      importedData.value = parseResult.data;
    }

    return parseResult;
  };

  // インポートされたデータをクリア
  const clearImportedData = () => {
    importedData.value = [];
  };

  // 特定の日付のデータを取得
  const getDataForDate = (date: string): TimeSlot[] | null => {
    const data = importedData.value.find((item) => item.date === date);
    return data ? data.timeSlots : null;
  };

  // すべてのインポートされた日付を取得
  const getAllImportedDates = (): string[] => {
    return importedData.value.map((item) => item.date);
  };

  return {
    importedData,
    importDateData,
    clearImportedData,
    getDataForDate,
    getAllImportedDates,
    parseImportText,
  };
};
