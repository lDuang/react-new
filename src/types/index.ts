import { BackendEntryType } from "@/config/entryTypes";

// ======================================================================================
// Generic API Response Wrapper
// ======================================================================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}

// ======================================================================================
// Core Data Structures
// ======================================================================================

export interface Tag {
  id: string;
  name: string;
}

export interface Entry {
  id: string;
  type: string;
  title: string;
  is_public: number; // assuming 1 for public, 0 for private
  user_id: string;
  created_at: number;
  updated_at: number;
  details: Record<string, any>;
  tags: Tag[];
  mood_content_id?: string | null;
}

// ======================================================================================
// API Payloads for Content Creation & Update
// ======================================================================================

// Payload for creating a new content entry.
// Based on the backend API documentation.
export interface ContentPayload {
  type: BackendEntryType;
  title: string;
  is_public: boolean;
  details: Record<string, any>;
  tags?: string[];
  mood_content_id?: string;
}

// Payload for updating an existing content entry.
// Note: 'type' is typically not updatable. All fields are optional.
export interface UpdateContentPayload {
  title?: string;
  is_public?: boolean;
  details?: Record<string, any>;
  tags?: string[];
  mood_content_id?: string;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface User {
  id: string;
  role: 'admin' | 'user';
}

export interface ContentFormData {
  type: BackendEntryType;
  title: string;
  is_public: boolean;
  details: Record<string, any>;
  tags?: string[];
  mood_content_id?: string;
}

// For PUT requests, most fields are optional
export type ContentUpdatePayload = Partial<Omit<ContentFormData, 'details'>> & {
  details?: Record<string, any>;
};

export interface Paginated<T> {
  success: boolean;
  data: T[];
  // May add pagination metadata later
  // total: number;
  // page: number;
  // limit: number;
}

// Re-export for backward compatibility if needed, or just use Paginated<Entry>
export type PaginatedEntries = Paginated<Entry>;