import ky from "ky";
import { AuthCredentials } from "@/features/auth/store";
import { ApiResponse, ContentPayload, Entry, UpdateContentPayload, User } from "@/types";

// ======================================================================================
// Constants & Core Fetcher
// ======================================================================================

// --- Type Definitions for API Service ---
interface GetUploadUrlResponse {
  uploadURL: string;
}

// A specific response type for the session endpoint, which doesn't use the standard `data` wrapper.
export interface SessionApiResponse {
  success: boolean;
  user: User;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const IMAGE_UPLOAD_URL = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || '';

// --- Base API Instance ---

// A single, configured ky instance for all API calls.
// - It automatically prefixes requests with '/api' or the env variable.
// - It explicitly includes credentials (cookies) on all requests.
// - It sets the expected JSON headers.
const apiInstance = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL, // ONLY the base URL
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Crucial for sending cookies on cross-origin requests
  timeout: 2000, // 10-second timeout for all requests
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response && response.body) {
          try {
            const errorBody = await response.json();
            // Attach more detailed error info to the error object
            (error as any).info = errorBody;
          } catch (e) {
            // The body wasn't JSON, just let the original error proceed
          }
        }
        return error;
      },
    ],
  },
});

// ======================================================================================
// API Service
// ======================================================================================

type PaginatedParams = { page?: number; limit?: number };

export const api = {
  /**
   * Authentication-related endpoints.
   */
  auth: {
    login: (credentials: AuthCredentials): Promise<ApiResponse<{ success: boolean; message: string }>> => {
      return apiInstance.post("api/auth/login", { json: credentials }).json();
    },
    getSession: (): Promise<SessionApiResponse> => {
      return apiInstance.get("api/admin/auth/session").json();
    },
    logout: (): Promise<ApiResponse<null>> => {
      return apiInstance.post("api/auth/logout").json();
    }
  },

  /**
   * Content management endpoints.
   */
  content: {
    getAll: (params: PaginatedParams = {}): Promise<ApiResponse<Entry[]>> => {
      const searchParams = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 20),
      });
      return apiInstance.get(`api/admin/content?${searchParams}`).json();
    },
    getDetail: (id: string): Promise<ApiResponse<Entry>> => {
      return apiInstance.get(`api/content/${id}`).json();
    },
    create: (payload: ContentPayload): Promise<ApiResponse<Entry>> => {
      return apiInstance.post("api/admin/content", { json: payload }).json();
    },
    update: (id: string, payload: UpdateContentPayload): Promise<ApiResponse<Entry>> => {
      return apiInstance.put(`api/admin/content/${id}`, { json: payload }).json();
    },
    delete: (id: string): Promise<ApiResponse<null>> => {
      return apiInstance.delete(`api/admin/content/${id}`).json();
    },
  },
  
  /**
   * Image-related endpoints.
   */
  image: {
    getUploadUrl: (filename: string, contentType: string): Promise<ApiResponse<GetUploadUrlResponse>> => {
      return apiInstance.post('api/admin/images/upload-url', { json: { filename, contentType } }).json();
    },
  },

  // --- Public API ---
  public: {
    getContent: (params: PaginatedParams = {}) =>
      apiInstance.get(`api/content/public?page=${params.page || 1}&limit=${params.limit || 10}`).json<ApiResponse<Entry[]>>(),
      
    getContentDetail: (id: string) =>
      apiInstance.get(`api/content/${id}`).json<ApiResponse<Entry>>(),
  },
  
  // --- Moods ---
  moods: {
    get: (params: PaginatedParams = {}) =>
      apiInstance.get(`api/admin/moods?page=${params.page || 1}&limit=${params.limit || 10}`).json<ApiResponse<any[]>>(),

    getLinkedContent: (moodId: string) =>
      apiInstance.get(`api/admin/moods/${moodId}/linked-content`).json<ApiResponse<Entry[]>>(),
  },

  // --- Image Upload ---
  uploadImage: async (imageFile: File): Promise<{ success: boolean; id: string; url: string }> => {
    if (!IMAGE_UPLOAD_URL) {
      throw new Error("Image upload URL is not configured. Please set NEXT_PUBLIC_IMAGE_UPLOAD_URL.");
    }
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch(IMAGE_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = new Error('Image upload failed.') as Error & { info: any; status: number };
      try {
        error.info = await res.json();
      } catch {
        error.info = { message: await res.text() };
      }
      error.status = res.status;
      throw error;
    }
    return res.json();
  }
}; 