import type { TimeSlot } from "@/utils/TimeUtils";
import { encryptPassword } from "@/utils/CryptoUtils";

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

// 新しいAPIレスポンス形式に対応
interface APIResponse {
  allowOtherEdit: boolean;
  endDate: string | null;
  events: {
    [key: string]: TimeSlot[];
  };
  startDate: string | null;
}

interface APITimeSlot {
  start: string;
  end: string;
  order: number;
  username?: string;
  userColor?: string;
}

// バックエンドAPIレスポンスの型定義（新しい形式に対応）
interface BackendAPIResponse {
  allowOtherEdit: boolean;
  endDate: string | null;
  events: {
    [key: string]: APITimeSlot[];
  };
  startDate: string | null;
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

// サインアップリクエストの型定義
interface SignupRequest {
  email: string;
  password: string;
}

// サインアップレスポンスの型定義
interface SignupResponse {
  message: string;
  uid?: string;
  error?: string;
}

// ログインリクエストの型定義
interface LoginRequest {
  email: string;
  password: string;
}

// ログインレスポンスの型定義
interface LoginResponse {
  message: string;
  uid?: string;
  email?: string;
  customToken?: string;
  error?: string;
}

export const useAPI = () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;

  //[id].vue用 スペースデータ取得
  const fetchSpaceData = async (spaceId: string): Promise<TimeData> => {
    try {
      const rawResponse = await $fetch(`${API_BASE_URL}/api/time/${spaceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // レスポンスが文字列の場合はJSONとしてパース
      let response: BackendAPIResponse;
      if (typeof rawResponse === "string") {
        response = JSON.parse(rawResponse);
      } else {
        response = rawResponse as BackendAPIResponse;
      }

      // APIレスポンスをTimeSlot型に変換
      const convertedEvents: { [key: string]: TimeSlot[] } = {};
      if (response.events) {
        Object.entries(response.events).forEach(([date, slots]) => {
          convertedEvents[date] = slots.map((slot) => ({
            start: slot.start,
            end: slot.end,
            order: slot.order,
            username: slot.username,
            userColor: slot.userColor,
          }));
        });
      }

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
      // 新しいリクエスト構造に変換
      const events: { [key: string]: APITimeSlot[] } = {};
      Object.entries(requestData).forEach(([key, value]) => {
        if (
          key !== "spaceId" &&
          key !== "startDate" &&
          key !== "endDate" &&
          key !== "allowOtherEdit"
        ) {
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

  // サインアップ機能
  const signup = async (
    email: string,
    password: string
  ): Promise<SignupResponse> => {
    try {
      // パスワードを暗号化
      const encryptedPassword = await encryptPassword(password);

      // セキュリティログ（本番環境では削除）
      console.log("サインアップリクエスト送信:", { email, password: "***" });

      const response = await $fetch<SignupResponse>(
        `${API_BASE_URL}/api/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            email,
            password: encryptedPassword,
          } as SignupRequest,
        }
      );
      return response;
    } catch (error: any) {
      console.error("サインアップエラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as SignupResponse;
      }
      throw error;
    }
  };

  // ログイン機能
  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      // パスワードを暗号化
      const encryptedPassword = await encryptPassword(password);

      // セキュリティログ（本番環境では削除）
      console.log("ログインリクエスト送信:", { email, password: "***" });

      const response = await $fetch<LoginResponse>(
        `${API_BASE_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            email,
            password: encryptedPassword,
          } as LoginRequest,
        }
      );
      return response;
    } catch (error: any) {
      console.error("ログインエラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as LoginResponse;
      }
      throw error;
    }
  };

  return {
    fetchSpaceData,
    syncTimeData,
    createNewSpace,
    signup,
    login,
  };
};
