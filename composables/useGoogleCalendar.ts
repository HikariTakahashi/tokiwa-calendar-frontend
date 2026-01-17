import { useAuth } from "./useAuth";

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  colorId?: string; // Googleカレンダーの色ID
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface GoogleCalendarList {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
}

export interface SyncConfig {
  isEnabled: boolean;
  calendarId: string;
  syncDirection: "import" | "export" | "bidirectional";
  lastSyncTime?: Date;
  autoSync: boolean;
}

// Googleカレンダーの色定義
export const GOOGLE_CALENDAR_COLORS = {
  "1": "#7986CB", // ラベンダー
  "2": "#33B679", // セージ
  "3": "#8E24AA", // ブドウ
  "4": "#E67C73", // フラミンゴ
  "5": "#F6BF26", // バナナ
  "6": "#F4511E", // ミカン
  "7": "#039BE5", // ピーコック
  "8": "#616161", // グラファイト
  "9": "#3F51B5", // ブルーベリー
  "10": "#0B8043", // バジル
  "11": "#D50000", // トマト
} as const;

export interface GoogleCalendarColors {
  calendar: {
    [key: string]: {
      background: string;
      foreground: string;
    };
  };
  event: {
    [key: string]: {
      background: string;
      foreground: string;
    };
  };
}

export const useGoogleCalendar = () => {
  const config = useRuntimeConfig();
  const { user, getAuthToken } = useAuth();

  // Googleカレンダー読み取り権限を要求するOAuth URLを生成
  const getCalendarAuthUrl = (redirectUri: string): string => {
    console.log("getCalendarAuthUrl が呼び出されました");

    const clientId = config.public.googleClientId;
    console.log("Google Client ID:", clientId ? "設定済み" : "未設定");

    if (!clientId) {
      throw new Error("Google Client IDが設定されていません");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar", // すべてのカレンダーの予定の表示と編集
      access_type: "offline",
      prompt: "consent",
      state: "calendar_sync", // カレンダー同期用のstate
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log("生成されたOAuth URL:", authUrl);

    return authUrl;
  };

  // カレンダー読み取り権限の認証を開始
  const requestCalendarPermission = (): void => {
    try {
      console.log("requestCalendarPermission が呼び出されました");

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      console.log("リダイレクトURI:", redirectUri);

      const authUrl = getCalendarAuthUrl(redirectUri);
      console.log("生成された認証URL:", authUrl);

      console.log("OAuth画面に遷移します...");
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("カレンダー権限要求エラー:", error);
      throw error;
    }
  };

  // Google Calendar APIのベースURL
  const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
  const API_BASE_URL = config.public.apiBaseUrl;

  // アクセストークンを取得（Google OAuth認証から）
  const getGoogleAccessToken = async (): Promise<string | null> => {
    try {
      // 既存のGoogle認証からアクセストークンを取得
      // 実際の実装では、Google OAuth認証時に取得したトークンを使用
      const token = getAuthToken();
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      // バックエンドからGoogleアクセストークンを取得
      const response = await $fetch<{ accessToken: string; error?: string }>(
        `${API_BASE_URL}/api/google-access-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.accessToken;
    } catch (error: any) {
      console.error("Googleアクセストークンの取得に失敗:", error);

      // エラーメッセージをユーザーフレンドリーに変換
      if (error.status === 404) {
        throw new Error(
          "Googleカレンダーの読み取り権限がありません。カレンダー同期を有効にするには、権限の許可が必要です。"
        );
      } else if (error.status === 500) {
        throw new Error(
          "Googleアカウントの連携に問題があります。再度Googleアカウントでログインしてください。"
        );
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Googleカレンダーとの連携に失敗しました。");
      }
    }
  };

  // カレンダー一覧を取得
  const getCalendarList = async (): Promise<GoogleCalendarList[]> => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      throw new Error("アクセストークンが取得できません");
    }

    try {
      const response = await $fetch<{ items: GoogleCalendarList[] }>(
        `${CALENDAR_API_BASE}/users/me/calendarList`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.items || [];
    } catch (error) {
      console.error("カレンダー一覧の取得に失敗:", error);
      throw error;
    }
  };

  // Googleカレンダーの色情報を取得
  const getCalendarColors = async (): Promise<GoogleCalendarColors> => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      throw new Error("アクセストークンが取得できません");
    }

    try {
      const response = await $fetch<GoogleCalendarColors>(
        `${CALENDAR_API_BASE}/colors`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("カレンダー色情報の取得に失敗:", error);

      // 403エラーの場合は権限不足の可能性
      if (error.status === 403) {
        throw new Error(
          "Googleカレンダーの色情報にアクセスする権限がありません。Googleアカウントの権限設定を確認してください。"
        );
      }

      throw error;
    }
  };

  // Googleカレンダーの色IDをTokiwaカレンダーの色に変換
  const convertGoogleColorToTokiwa = (colorId?: string): string => {
    if (!colorId) return "#3b82f6"; // デフォルト色

    // Googleカレンダーの色IDから色を取得
    const googleColor =
      GOOGLE_CALENDAR_COLORS[colorId as keyof typeof GOOGLE_CALENDAR_COLORS];
    return googleColor || "#3b82f6"; // 見つからない場合はデフォルト色
  };

  // Tokiwaカレンダーの色をGoogleカレンダーの色IDに変換
  const convertTokiwaColorToGoogle = (color: string): string | undefined => {
    // 色のマッピングを逆引き
    const colorEntry = Object.entries(GOOGLE_CALENDAR_COLORS).find(
      ([_, value]) => value.toLowerCase() === color.toLowerCase()
    );
    return colorEntry ? colorEntry[0] : undefined;
  };

  // イベント一覧を取得
  const getEvents = async (
    calendarId: string = "primary",
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 100
  ): Promise<GoogleCalendarEvent[]> => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      throw new Error("アクセストークンが取得できません");
    }

    try {
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        singleEvents: "true",
        orderBy: "startTime",
      });

      if (timeMin) {
        // 終日イベントも含めるために、日付の開始時刻（00:00:00）を使用
        const timeMinDate = new Date(timeMin);
        timeMinDate.setHours(0, 0, 0, 0);
        params.set("timeMin", timeMinDate.toISOString());
      }
      if (timeMax) {
        // 終日イベントも含めるために、日付の終了時刻（23:59:59）を使用
        const timeMaxDate = new Date(timeMax);
        timeMaxDate.setHours(23, 59, 59, 999);
        params.set("timeMax", timeMaxDate.toISOString());
      }

      const response = await $fetch<{ items: GoogleCalendarEvent[] }>(
        `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          calendarId
        )}/events?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.items || [];
    } catch (error) {
      console.error("イベントの取得に失敗:", error);
      throw error;
    }
  };

  // イベントを作成
  const createEvent = async (
    calendarId: string = "primary",
    event: Omit<GoogleCalendarEvent, "id">
  ): Promise<GoogleCalendarEvent> => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      throw new Error("アクセストークンが取得できません");
    }

    try {
      const response = await $fetch<GoogleCalendarEvent>(
        `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          calendarId
        )}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: event,
        }
      );

      return response;
    } catch (error) {
      console.error("イベントの作成に失敗:", error);
      throw error;
    }
  };

  // イベントを更新
  const updateEvent = async (
    calendarId: string = "primary",
    eventId: string,
    event: Partial<GoogleCalendarEvent>
  ): Promise<GoogleCalendarEvent> => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      throw new Error("アクセストークンが取得できません");
    }

    try {
      const response = await $fetch<GoogleCalendarEvent>(
        `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          calendarId
        )}/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: event,
        }
      );

      return response;
    } catch (error) {
      console.error("イベントの更新に失敗:", error);
      throw error;
    }
  };

  // イベントを削除
  const deleteEvent = async (
    calendarId: string = "primary",
    eventId: string
  ): Promise<void> => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      throw new Error("アクセストークンが取得できません");
    }

    try {
      await $fetch(
        `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          calendarId
        )}/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error("イベントの削除に失敗:", error);
      throw error;
    }
  };

  // Tokiwaのタスク形式に変換
  const convertToTokiwaTask = (event: GoogleCalendarEvent) => {
    const startTime = event.start.dateTime || event.start.date;
    const endTime = event.end.dateTime || event.end.date;

    // デバッグ: イベントの色情報を確認
    if (event.colorId) {
      console.log(`イベント "${event.summary}" の色ID: ${event.colorId}`);
    }

    // 終日イベントかどうかを判定
    const isAllDay = !event.start.dateTime && !event.end.dateTime;

    // 日付を取得（YYYY-MM-DD形式）
    const eventDate = startTime
      ? new Date(startTime).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // 時間を取得（HH:MM形式）
    let startTimeStr: string;
    let endTimeStr: string;

    if (isAllDay) {
      // 終日イベントの場合
      startTimeStr = "00:00";
      endTimeStr = "24:00";
    } else {
      // 通常のイベントの場合
      startTimeStr = startTime
        ? new Date(startTime).toTimeString().slice(0, 5)
        : "00:00";
      endTimeStr = endTime
        ? new Date(endTime).toTimeString().slice(0, 5)
        : "24:00";
    }

    return {
      taskName: event.summary || "無題のイベント",
      description: event.description || "",
      start: startTimeStr,
      end: endTimeStr,
      userColor: convertGoogleColorToTokiwa(event.colorId), // Googleカレンダーの色を反映
      order: 1,
      googleEventId: event.id,
      location: event.location || "",
      eventDate: eventDate, // イベントの日付を追加
      isAllDay: isAllDay, // 終日フラグを追加
    };
  };

  // TokiwaのタスクをGoogle Calendarイベント形式に変換
  const convertToGoogleEvent = (
    task: any,
    date: string
  ): Omit<GoogleCalendarEvent, "id"> => {
    // 終日イベントかどうかを判定
    const isAllDay =
      task.isAllDay || (task.start === "00:00" && task.end === "24:00");

    // 色情報を取得
    const colorId = convertTokiwaColorToGoogle(task.userColor);

    if (isAllDay) {
      // 終日イベントの場合
      return {
        summary: task.taskName,
        description: task.description,
        start: {
          date: date, // 終日イベントはdateフィールドを使用
        },
        end: {
          date: date, // 終日イベントはdateフィールドを使用
        },
        location: task.location || "",
        colorId: colorId, // 色情報を追加
      };
    } else {
      // 通常のイベントの場合
      const startDateTime = new Date(`${date}T${task.start}:00`);
      const endDateTime = new Date(`${date}T${task.end}:00`);

      return {
        summary: task.taskName,
        description: task.description,
        start: {
          dateTime: startDateTime.toISOString(),
        },
        end: {
          dateTime: endDateTime.toISOString(),
        },
        location: task.location || "",
        colorId: colorId, // 色情報を追加
      };
    }
  };

  return {
    getCalendarList,
    getCalendarColors,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    convertToTokiwaTask,
    convertToGoogleEvent,
    convertGoogleColorToTokiwa,
    convertTokiwaColorToGoogle,
    requestCalendarPermission,
  };
};
