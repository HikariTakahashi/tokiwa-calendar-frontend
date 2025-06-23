import type { TimeSlot } from "@/utils/TimeUtils";

export interface TimeData {
  events: {
    [key: string]: TimeSlot[];
  };
  spaceId: string;
  username: string;
  userColor: string;
  startDate?: string | null;
  endDate?: string | null;
  allowOtherEdit?: boolean;
}

interface APIResponse {
  message: string;
  spaceId: string;
  savedEvents: { [key: string]: TimeSlot[] };
}

interface APITimeSlot {
  start: string;
  end: string;
  order: number;
  username?: string;
  userColor?: string;
}

// バックエンドAPIレスポンスの型定義
interface BackendAPIResponse {
  events: {
    [key: string]: APITimeSlot[];
  };
  startDate?: string | null;
  endDate?: string | null;
  allowOtherEdit?: boolean;
}

// バックエンドAPIリクエストの型定義
interface BackendAPIRequest {
  events: {
    [key: string]: APITimeSlot[];
  };
  endDate: string | null;
  startDate: string | null;
  allowOtherEdit: boolean;
  spaceId: string;
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
          start: slot.start,
          end: slot.end,
          order: slot.order,
          username: slot.username,
          userColor: slot.userColor,
        }));
      });

      return {
        events: convertedEvents,
        spaceId: spaceId,
        username: "",
        userColor: "",
        startDate: response.startDate || null,
        endDate: response.endDate || null,
        allowOtherEdit: response.allowOtherEdit || false,
      };
    } catch (error) {
      console.error("スペースデータの取得に失敗しました:", error);
      throw error;
    }
  };

  //[id].vue用 データ再同期
  const syncTimeData = async (
    timeData: TimeData,
    spaceId: string,
    allowOtherEdit: boolean = false
  ): Promise<APIResponse> => {
    try {
      // 新しいリクエスト構造に変換
      const events: { [key: string]: APITimeSlot[] } = {};
      Object.entries(timeData.events).forEach(([date, slots]) => {
        events[date] = slots.map((slot, index) => ({
          start: slot.start,
          end: slot.end,
          order: index + 1,
          username: slot.username,
          userColor: slot.userColor,
        }));
      });

      const backendRequest: BackendAPIRequest = {
        events: events,
        endDate: timeData.endDate || null,
        startDate: timeData.startDate || null,
        allowOtherEdit: allowOtherEdit,
        spaceId,
      };

      console.log("useAPI: syncTimeData request", backendRequest);

      const response = await $fetch<APIResponse>(`${API_BASE_URL}/api/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: backendRequest,
      });
      return response;
    } catch (error) {
      console.error("同期エラー:", error);
      throw error;
    }
  };

  //UploadForm.vue用 新規スペース作成
  const createNewSpace = async (
    requestData: any,
    allowOtherEdit: boolean = false
  ): Promise<APIResponse> => {
    try {
      console.log(API_BASE_URL);

      // 新しいリクエスト構造に変換
      const events: { [key: string]: APITimeSlot[] } = {};
      Object.entries(requestData).forEach(([key, value]) => {
        if (key !== "spaceId" && key !== "startDate" && key !== "endDate") {
          const slots = Array.isArray(value) ? value : [value];
          events[key] = slots.map((slot: any, index: number) => ({
            start: slot.start,
            end: slot.end,
            order: index + 1,
            username: slot.username,
            userColor: slot.userColor,
          }));
        }
      });

      const backendRequest: BackendAPIRequest = {
        events: events,
        endDate: requestData.endDate || null,
        startDate: requestData.startDate || null,
        allowOtherEdit: allowOtherEdit,
        spaceId: requestData.spaceId,
      };

      console.log("useAPI: createNewSpace request", backendRequest);

      const response = await $fetch<APIResponse>(`${API_BASE_URL}/api/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: backendRequest,
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
