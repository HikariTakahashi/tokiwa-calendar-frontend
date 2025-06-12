import type { TimeSlot } from "@/utils/TimeUtils";

export interface TimeData {
  events: {
    [key: string]: TimeSlot | TimeSlot[];
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

export const useAPI = () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;

  //[id].vue用 スペースデータ取得
  const fetchSpaceData = async (spaceId: string): Promise<TimeData> => {
    try {
      const response = await $fetch<{
        [key: string]: APITimeSlot | APITimeSlot[];
      }>(`${API_BASE_URL}/time/${spaceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // APIレスポンスをTimeSlot型に変換
      const convertedEvents: { [key: string]: TimeSlot | TimeSlot[] } = {};
      Object.entries(response).forEach(([date, slots]) => {
        convertedEvents[date] = Array.isArray(slots)
          ? slots.map((slot) => ({
              start: slot.Start,
              end: slot.End,
              order: slot.Order,
              username: slot.Username,
              userColor: slot.UserColor,
            }))
          : {
              start: slots.Start,
              end: slots.End,
              order: slots.Order,
              username: slots.Username,
              userColor: slots.UserColor,
            };
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
      const response = await $fetch<APIResponse>(`${API_BASE_URL}/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: {
          ...timeData,
          spaceId,
        },
      });
      return response;
    } catch (error) {
      console.error("同期エラー:", error);
      throw error;
    }
  };

  //Calendar.vue用 新規スペース作成
  const createNewSpace = async (timeData: TimeData): Promise<APIResponse> => {
    try {
      const response = await $fetch<APIResponse>(`${API_BASE_URL}/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: timeData,
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
