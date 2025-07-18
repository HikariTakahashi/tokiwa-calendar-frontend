import { useTimeUtils } from "@/utils/TimeUtils";
import { useOverlapTimeUtils } from "@/utils/OverlapTimeUtils";

// 表示形式を変更できるよう将来的に変更
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
};

// 年を表示する用
// ${date.getFullYear()}年

export const copyToClipboard = (
  displayData: Record<string, any>,
  showOverlappingTime: boolean = false
): Promise<void> => {
  console.log("copyToClipboard called with:", {
    displayData,
    showOverlappingTime,
  });

  // コピーデータがない場合ボタンが押せないものの、一応警告を出す
  if (Object.keys(displayData).length === 0) {
    alert("コピーするデータがありません");
    return Promise.reject("データがありません");
  }

  const { formatTimeForCopy } = useTimeUtils();
  const { formatOverlapTimeForDisplay, generateOverlapDisplayData } =
    useOverlapTimeUtils();

  let text: string;

  if (showOverlappingTime) {
    // 重複時刻表示モードの場合、重複している時刻のみをコピー
    console.log("Processing overlap mode");

    const overlapEntries = Object.entries(displayData)
      .filter(([date, timeSlots]) => {
        if (!Array.isArray(timeSlots) || timeSlots.length === 0) return false;

        // ユーザーネームが存在するスロットがあるかチェック
        const hasUsername = timeSlots.some((slot) => slot && slot.username);
        console.log(`Date ${date}: hasUsername = ${hasUsername}`);
        return hasUsername;
      })
      .map(([date, timeSlots]) => {
        console.log(`Processing date ${date} with slots:`, timeSlots);
        const overlapData = generateOverlapDisplayData({ [date]: timeSlots });
        const overlaps = overlapData[date]?.overlaps || [];
        console.log(`Overlaps for ${date}:`, overlaps);

        if (overlaps.length > 0) {
          const overlapText = overlaps
            .map((overlap) => {
              const usernames = overlap.usernames.join(", ");
              const timeText = formatOverlapTimeForDisplay(overlap);
              return `${usernames}: ${timeText}`;
            })
            .join("\n");
          const result = `${formatDate(date)}:\n${overlapText}`;
          console.log(`Generated text for ${date}:`, result);
          return result;
        }
        console.log(`No overlaps for ${date}`);
        return null;
      })
      .filter((entry) => entry !== null);

    text = overlapEntries.join("\n\n");
    console.log("Final overlap text:", text);
  } else {
    // 通常モードの場合、ユーザーネームが存在しないスロットのみをコピー
    console.log("Processing normal mode");

    const normalEntries = Object.entries(displayData)
      .filter(([date, timeSlots]) => {
        if (!Array.isArray(timeSlots) || timeSlots.length === 0) return false;

        // ユーザーネームが存在しないスロットがあるかチェック
        const hasNoUsername = timeSlots.some(
          (slot: any) => slot && !slot.username
        );
        console.log(`Date ${date}: hasNoUsername = ${hasNoUsername}`);
        return hasNoUsername;
      })
      .map(([date, timeSlots]) => {
        // ユーザーネームが存在しないスロットのみを抽出
        const noUsernameSlots = timeSlots.filter(
          (slot: any) => slot && !slot.username
        );
        const result = `${formatDate(date)}:${formatTimeForCopy(
          noUsernameSlots
        )}`;
        console.log(`Generated text for ${date}:`, result);
        return result;
      });

    text = normalEntries.join("\n");
    console.log("Final normal text:", text);
  }

  console.log("Final text to copy:", text);

  if (!text || text.trim() === "") {
    alert("コピーするデータがありません");
    return Promise.reject("データがありません");
  }

  // クリップボードにコピー
  return navigator.clipboard
    .writeText(text)
    .then(() => alert("クリップボードにコピーしました"))
    .catch((err) => {
      console.error("コピーに失敗しました:", err);
      throw err;
    });
};

export const copySingleDateToClipboard = (
  date: string,
  timeSlots: any[],
  showOverlappingTime: boolean = false
): Promise<void> => {
  console.log("copySingleDateToClipboard called with:", {
    date,
    timeSlots,
    showOverlappingTime,
  });

  if (!timeSlots || timeSlots.length === 0) {
    alert("コピーするデータがありません");
    return Promise.reject("データがありません");
  }

  const { formatTimeForCopy } = useTimeUtils();
  const { formatOverlapTimeForDisplay, generateOverlapDisplayData } =
    useOverlapTimeUtils();

  let text: string;

  if (showOverlappingTime) {
    // 重複時刻表示モードの場合、重複している時刻のみをコピー
    console.log("Processing single date overlap mode");
    const overlapData = generateOverlapDisplayData({ [date]: timeSlots });
    const overlaps = overlapData[date]?.overlaps || [];
    console.log(`Overlaps for ${date}:`, overlaps);

    if (overlaps.length > 0) {
      const overlapText = overlaps
        .map((overlap) => {
          const usernames = overlap.usernames.join(", ");
          const timeText = formatOverlapTimeForDisplay(overlap);
          return `${usernames}: ${timeText}`;
        })
        .join("\n");
      text = `${formatDate(date)}:\n${overlapText}`;
      console.log("Generated overlap text:", text);
    } else {
      alert("重複する時刻がありません");
      return Promise.reject("重複する時刻がありません");
    }
  } else {
    // 通常モードの場合、ユーザーネームが存在しないスロットのみをコピー
    console.log("Processing single date normal mode");
    const noUsernameSlots = timeSlots.filter(
      (slot: any) => slot && !slot.username
    );

    if (noUsernameSlots.length > 0) {
      text = `${formatDate(date)}:${formatTimeForCopy(noUsernameSlots)}`;
      console.log("Generated normal text:", text);
    } else {
      alert("ユーザーネームが存在しないデータがありません");
      return Promise.reject("ユーザーネームが存在しないデータがありません");
    }
  }

  console.log("Final text to copy:", text);

  return navigator.clipboard
    .writeText(text)
    .then(() => alert("クリップボードにコピーしました"))
    .catch((err) => {
      console.error("コピーに失敗しました:", err);
      throw err;
    });
};
