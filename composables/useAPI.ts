import type { TimeSlot } from "@/utils/TimeUtils";

interface TimeData {
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

export const useAPI = () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;

  //[id].vue用 スペースデータ取得
  const fetchSpaceData = async (spaceId: string): Promise<TimeData> => {
    try {
      const response = await $fetch(`${API_BASE_URL}/time/${spaceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response as TimeData;
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
