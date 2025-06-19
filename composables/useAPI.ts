import type { TimeSlot } from "@/utils/TimeUtils";

export interface TimeData {
  events: {
    [key: string]: TimeSlot[];
  };
  spaceId: string;
  username: string;
  userColor: string;
}

interface APIResponse {
  message: string;
  spaceId: string;
  savedEvents: { [key: string]: TimeSlot[] };
}

interface APITimeSlot {
  Start: string;
  End: string;
  Order: number;
  Username?: string;
  UserColor?: string;
}

// バックエンドAPIレスポンスの型定義
interface BackendAPIResponse {
  events: {
    [key: string]: APITimeSlot[];
  };
}

// バックエンドAPIリクエストの型定義
interface BackendAPIRequest {
  [key: string]: any;
  spaceId: string;
  startDate?: string;
  endDate?: string;
}

export const useAPI = () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;

  //[id].vue用 スペースデータ取得
  const fetchSpaceData = async (spaceId: string): Promise<TimeData> => {
    try {
      const response = await $fetch<BackendAPIResponse>(
        `${API_BASE_URL}/api/time/${spaceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // APIレスポンスをTimeSlot型に変換
      const convertedEvents: { [key: string]: TimeSlot[] } = {};
      Object.entries(response.events).forEach(([date, slots]) => {
        convertedEvents[date] = slots.map((slot) => ({
          start: slot.Start,
          end: slot.End,
          order: slot.Order,
          username: slot.Username,
          userColor: slot.UserColor,
        }));
      });

      return {
        events: convertedEvents,
        spaceId: spaceId,
        username: "",
        userColor: "",
      };
    } catch (error) {
      console.error("スペースデータの取得に失敗しました:", error);
      throw error;
    }
  };

  //[id].vue用 データ再同期
  const syncTimeData = async (
    timeData: TimeData,
    spaceId: string
  ): Promise<APIResponse> => {
    try {
      // リクエストデータの構造を変更
      const requestData = {
        ...timeData.events, // 直接日付をキーとしたオブジェクト
        spaceId,
      };

      console.log("useAPI: syncTimeData request", requestData);

      const response = await $fetch<APIResponse>(`${API_BASE_URL}/api/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: requestData,
      });
      return response;
    } catch (error) {
      console.error("同期エラー:", error);
      throw error;
    }
  };

  //UploadForm.vue用 新規スペース作成
  const createNewSpace = async (requestData: any): Promise<APIResponse> => {
    try {
      console.log(API_BASE_URL);
      const response = await $fetch<APIResponse>(`${API_BASE_URL}/api/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: requestData,
      });
      return response;
    } catch (error) {
      console.error("同期エラー:", error);
      throw error;
    }
  };

  return {
    fetchSpaceData,
    syncTimeData,
    createNewSpace,
  };
};
