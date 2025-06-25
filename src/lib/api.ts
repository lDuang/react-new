import { useAuthStore } from '@/features/auth/store';
import { LoginCredentials, Entry, Paginated, ContentFormData, ContentUpdatePayload, User } from '@/types';

// ======================================================================================
// Constants & Core Fetcher
// ======================================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const IMAGE_UPLOAD_URL = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || '';

/**
 * A generic fetcher function for making API requests.
 * - Automatically includes credentials for protected routes.
 * - Handles 401 Unauthorized errors by logging the user out.
 * - Throws a detailed error for non-ok responses.
 */
export async function fetcher<JSON = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: Record<string, any>
): Promise<JSON> {
  const { logout } = useAuthStore.getState();
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const isProtectedRoute = path.startsWith('/api/admin') || path.startsWith('/api/auth');

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(isProtectedRoute && { credentials: 'include' as const }),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    if (res.status === 401 && isProtectedRoute) {
      logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const error = new Error('API request failed.') as Error & { info: any; status: number };
    try {
      error.info = await res.json();
    } catch {
      error.info = { message: await res.text() };
    }
    error.status = res.status;
    throw error;
  }

  if (res.headers.get('Content-Type')?.includes('application/json')) {
    return res.json();
  }
  // Handle cases like logout which might return no content
  return {} as JSON;
}

// ======================================================================================
// API Service
// ======================================================================================

type PaginatedParams = { page?: number; limit?: number };

export const api = {
  // --- Authentication ---
  auth: {
    login: (credentials: LoginCredentials) =>
      fetcher<{ success: true; message: string }>('POST', '/api/auth/login', credentials),

    logout: () => 
      fetcher('POST', '/api/auth/logout'),

    checkSession: () => 
      fetcher<{ success: true; user: User }>('GET', '/api/admin/auth/session'),
  },

  // --- Admin Content Management ---
  content: {
    getAll: (params: PaginatedParams = {}) =>
      fetcher<Paginated<Entry>>('GET', `/api/admin/content?page=${params.page || 1}&limit=${params.limit || 10}`),
    
    getDetail: (id: string) =>
      fetcher<{ success: true; data: Entry }>('GET', `/api/admin/content/${id}`),

    create: (data: ContentFormData) =>
      fetcher<Entry>('POST', '/api/admin/content', data),

    update: (id: string, payload: ContentUpdatePayload) =>
      fetcher<{ success: true; message: string }>('PUT', `/api/admin/content/${id}`, payload),

    delete: (id: string) =>
      fetcher<{ success: true; message: string }>('DELETE', `/api/admin/content/${id}`),
  },

  // --- Public API ---
  public: {
    getContent: (params: PaginatedParams = {}) =>
      fetcher<Paginated<Entry>>('GET', `/api/content/public?page=${params.page || 1}&limit=${params.limit || 10}`),
      
    getContentDetail: (id: string) =>
      fetcher<{ success: true; data: Entry }>('GET', `/api/content/${id}`),
  },
  
  // --- Moods ---
  moods: {
    get: (params: PaginatedParams = {}) =>
      fetcher<Paginated<any>>('GET', `/api/admin/moods?page=${params.page || 1}&limit=${params.limit || 10}`), // Define Mood type later

    getLinkedContent: (moodId: string) =>
      fetcher<Paginated<Entry>>('GET', `/api/admin/moods/${moodId}/linked-content`),
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