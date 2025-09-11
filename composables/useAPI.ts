import type { TimeSlot } from "@/utils/TimeUtils";
import { encryptPassword } from "@/utils/CryptoUtils";

export interface TimeData {
  events: {
    [key: string]: TimeSlot[];
  };
  notifications?: {
    [key: string]: NotificationSlot[];
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
  spaceId?: string; // バックエンドから返されるspaceId
  message?: string; // バックエンドから返されるメッセージ
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
  spaceId?: string; // オプショナルに変更（バックエンドで自動生成されるため）
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
  lambdaMode?: boolean; // Lambda環境でのメール認証スキップフラグ
  debug?: {
    emailSendError?: string;
    emailConfig?: any;
    targetEmail?: string;
    lambdaEnvironment?: boolean;
  };
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
  sessionToken?: string;
  error?: string;
}

// 認証リクエストの型定義
interface VerifyRequest {
  token: string;
}

// 認証レスポンスの型定義
interface VerifyResponse {
  message: string;
  success: boolean;
  already_verified?: boolean;
  error?: string;
}

// Google OAuth2.0認証リクエストの型定義
interface GoogleAuthRequest {
  code: string;
  redirect_uri: string;
  linkUID?: string;
}

// Google OAuth2.0認証レスポンスの型定義
interface GoogleAuthResponse {
  message: string;
  uid?: string;
  email?: string;
  sessionToken?: string;
  error?: string;
}

// GitHub OAuth2.0認証リクエストの型定義
interface GitHubAuthRequest {
  code: string;
  redirect_uri: string;
  linkUID?: string;
}

// GitHub OAuth2.0認証レスポンスの型定義
interface GitHubAuthResponse {
  message: string;
  uid?: string;
  email?: string;
  sessionToken?: string;
  error?: string;
}

// Twitter OAuth2.0認証リクエストの型定義
interface TwitterAuthRequest {
  code: string;
  redirect_uri: string;
  linkUID?: string;
}

// Twitter OAuth2.0認証レスポンスの型定義
interface TwitterAuthResponse {
  message: string;
  uid?: string;
  email?: string;
  sessionToken?: string;
  error?: string;
}

// ユーザーデータの型定義
interface UserData {
  userName: string;
  userColor: string;
}

// ユーザーデータリクエストの型定義
interface UserDataRequest {
  userName: string;
  userColor: string;
}

// ユーザーデータレスポンスの型定義
interface UserDataResponse {
  userName?: string;
  userColor?: string;
  message?: string;
  error?: string;
}

// プロバイダー詳細情報の型定義
interface ProviderDetail {
  provider: string;
  email: string;
  displayName?: string;
  isLinked: boolean;
}

// プロバイダー詳細情報レスポンスの型定義
interface UserProvidersDetailResponse {
  providers?: ProviderDetail[];
  error?: string;
}

// 統合されたユーザープロフィール情報レスポンスの型定義
interface UserProfileResponse {
  userName?: string;
  userColor?: string;
  providers?: string[];
  providerDetails?: ProviderDetail[];
  message?: string;
  error?: string;
}

// タスクデータの型定義
interface TaskSlot {
  description: string;
  start: string;
  end: string;
  title: string;
  userColor: string;
  order: number;
}

// 通知データの型定義
interface NotificationSlot {
  time: string;
  order: number;
}

// タスク保存リクエストの型定義
interface TaskSaveRequest {
  useruid: string;
  events: {
    [key: string]: TaskSlot[];
  };
  notifications: {
    [key: string]: NotificationSlot[];
  };
}

// タスク保存レスポンスの型定義
interface TaskSaveResponse {
  message: string;
  success: boolean;
  error?: string;
}

// タスク取得レスポンスの型定義
interface TaskGetResponse {
  events: {
    [key: string]: TaskSlot[];
  };
  notifications: {
    [key: string]: NotificationSlot[];
  };
  message: string;
  success: boolean;
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
        // slotsが配列でない場合は配列に変換
        const slotsArray = Array.isArray(slots) ? slots : [slots];
        events[date] = slotsArray.map((slot, index) => ({
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
      };

      const response = await $fetch<APIResponse>(`${API_BASE_URL}/api/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: backendRequest,
      });

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: APIResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as APIResponse;
      }

      return parsedResponse;
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
      const encryptedPassword = await encryptPassword(password);

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

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: SignupResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as SignupResponse;
      }

      return parsedResponse;
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

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: LoginResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as LoginResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as LoginResponse;
      }
      throw error;
    }
  };

  // 認証機能
  const verifyEmailToken = async (token: string): Promise<VerifyResponse> => {
    try {
      const response = await $fetch<VerifyResponse>(
        `${API_BASE_URL}/api/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            token: token,
          } as VerifyRequest,
        }
      );

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: VerifyResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as VerifyResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("認証エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as VerifyResponse;
      }
      throw error;
    }
  };

  // Google OAuth2.0認証機能
  const googleAuth = async (
    code: string,
    redirectUri: string,
    linkUID?: string
  ): Promise<GoogleAuthResponse> => {
    try {
      const response = await $fetch<GoogleAuthResponse>(
        `${API_BASE_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            code: code,
            redirect_uri: redirectUri,
            linkUID: linkUID,
          } as GoogleAuthRequest,
        }
      );

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: GoogleAuthResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as GoogleAuthResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("Google認証エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as GoogleAuthResponse;
      }
      throw error;
    }
  };

  // GitHub OAuth2.0認証機能
  const githubAuth = async (
    code: string,
    redirectUri: string,
    linkUID?: string
  ): Promise<GitHubAuthResponse> => {
    try {
      const response = await $fetch<GitHubAuthResponse>(
        `${API_BASE_URL}/api/auth/github`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            code: code,
            redirect_uri: redirectUri,
            linkUID: linkUID,
          } as GitHubAuthRequest,
        }
      );

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: GitHubAuthResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as GitHubAuthResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("GitHub認証エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as GitHubAuthResponse;
      }
      throw error;
    }
  };

  // Twitter OAuth2.0認証機能
  const twitterAuth = async (
    code: string,
    redirectUri: string,
    linkUID?: string
  ): Promise<TwitterAuthResponse> => {
    try {
      const response = await $fetch<TwitterAuthResponse>(
        `${API_BASE_URL}/api/auth/twitter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            code: code,
            redirect_uri: redirectUri,
            linkUID: linkUID,
          } as TwitterAuthRequest,
        }
      );

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: TwitterAuthResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as TwitterAuthResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("Twitter認証エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as TwitterAuthResponse;
      }
      throw error;
    }
  };

  // ユーザーデータ取得機能
  const getUserData = async (): Promise<UserDataResponse> => {
    try {
      const { getAuthToken } = useAuth();
      const token = getAuthToken();

      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await $fetch<UserDataResponse>(
        `${API_BASE_URL}/api/user-data`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: UserDataResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as UserDataResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("ユーザーデータ取得エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as UserDataResponse;
      }
      throw error;
    }
  };

  // ユーザーデータ更新機能
  const updateUserData = async (
    userData: UserDataRequest
  ): Promise<UserDataResponse> => {
    try {
      const { getAuthToken } = useAuth();
      const token = getAuthToken();

      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await $fetch<UserDataResponse>(
        `${API_BASE_URL}/api/user-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: userData,
        }
      );

      console.log("ユーザーデータ更新APIレスポンス:", response);
      console.log("レスポンスの型:", typeof response);

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: UserDataResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
          console.log("パース後のレスポンス:", parsedResponse);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as UserDataResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("ユーザーデータ更新エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as UserDataResponse;
      }
      throw error;
    }
  };

  // プロバイダー詳細情報取得機能
  const getUserProvidersDetail =
    async (): Promise<UserProvidersDetailResponse> => {
      try {
        const { getAuthToken } = useAuth();
        const token = getAuthToken();

        if (!token) {
          throw new Error("認証トークンが見つかりません");
        }

        console.log("プロバイダー詳細情報API呼び出し:", {
          url: `${API_BASE_URL}/api/user-providers-detail`,
          tokenLength: token.length,
        });

        const response = await $fetch<UserProvidersDetailResponse>(
          `${API_BASE_URL}/api/user-providers-detail`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("プロバイダー詳細情報APIレスポンス:", response);
        console.log("レスポンスの型:", typeof response);

        // レスポンスが文字列の場合はJSONとしてパース
        let parsedResponse: UserProvidersDetailResponse;
        if (typeof response === "string") {
          try {
            parsedResponse = JSON.parse(response);
            console.log("パース後のレスポンス:", parsedResponse);
          } catch (error) {
            console.error("JSONパースエラー:", error);
            throw new Error("レスポンスの解析に失敗しました");
          }
        } else {
          parsedResponse = response as UserProvidersDetailResponse;
        }

        return parsedResponse;
      } catch (error: any) {
        console.error("プロバイダー詳細情報取得エラー:", error);
        // エラーレスポンスを適切に処理
        if (error.data) {
          return error.data as UserProvidersDetailResponse;
        }
        throw error;
      }
    };

  // 統合されたユーザープロフィール情報取得機能
  const getUserProfile = async (): Promise<UserProfileResponse> => {
    try {
      const { getAuthToken } = useAuth();
      const token = getAuthToken();

      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      console.log("統合ユーザープロフィール情報API呼び出し:", {
        url: `${API_BASE_URL}/api/user-profile`,
        tokenLength: token.length,
      });

      const response = await $fetch<UserProfileResponse>(
        `${API_BASE_URL}/api/user-profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("統合ユーザープロフィール情報APIレスポンス:", response);
      console.log("レスポンスの型:", typeof response);

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: UserProfileResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
          console.log("パース後のレスポンス:", parsedResponse);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as UserProfileResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("統合ユーザープロフィール情報取得エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as UserProfileResponse;
      }
      throw error;
    }
  };

  // タスク保存機能
  const saveTaskData = async (
    taskData: TaskSaveRequest
  ): Promise<TaskSaveResponse> => {
    try {
      const { getAuthToken } = useAuth();
      const token = getAuthToken();

      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      console.log("タスク保存API呼び出し:", {
        url: `${API_BASE_URL}/api/task`,
        tokenLength: token.length,
        taskData,
      });

      const response = await $fetch<TaskSaveResponse>(
        `${API_BASE_URL}/api/task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: taskData,
        }
      );

      console.log("タスク保存APIレスポンス:", response);
      console.log("レスポンスの型:", typeof response);

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: TaskSaveResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
          console.log("パース後のレスポンス:", parsedResponse);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as TaskSaveResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("タスク保存エラー:", error);
      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as TaskSaveResponse;
      }
      throw error;
    }
  };

  // タスク取得機能
  const getTaskData = async (): Promise<TaskGetResponse> => {
    try {
      const { getAuthToken } = useAuth();
      const token = getAuthToken();

      if (!token) {
        console.error("認証トークンが見つかりません");
        throw new Error("認証トークンが見つかりません");
      }

      const response = await $fetch<TaskGetResponse>(
        `${API_BASE_URL}/api/task`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // レスポンスが文字列の場合はJSONとしてパース
      let parsedResponse: TaskGetResponse;
      if (typeof response === "string") {
        try {
          parsedResponse = JSON.parse(response);
        } catch (error) {
          console.error("JSONパースエラー:", error);
          throw new Error("レスポンスの解析に失敗しました");
        }
      } else {
        parsedResponse = response as TaskGetResponse;
      }

      return parsedResponse;
    } catch (error: any) {
      console.error("タスク取得エラー:", error);
      console.error("エラーの詳細:", {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      });

      // エラーレスポンスを適切に処理
      if (error.data) {
        return error.data as TaskGetResponse;
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
    verifyEmailToken,
    googleAuth,
    githubAuth,
    twitterAuth,
    getUserData,
    updateUserData,
    getUserProvidersDetail,
    getUserProfile,
    saveTaskData,
    getTaskData,
  };
};
