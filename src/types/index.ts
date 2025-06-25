import { FrontendEntryType, BackendEntryType } from "@/config/entryTypes";

export type EntryType = FrontendEntryType | BackendEntryType;

export interface Entry {
  id: string;
  user_id: string;
  type: EntryType;
  title: string;
  created_at: number;
  updated_at: number;
  is_public: 0 | 1;
  mood_content_id?: string;
  details?: any; // Can be different for each type
  tags?: { id: string; name: string }[];
  mood?: any; // Define mood type later
}

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

export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface User {
  id: string;
  role: 'admin' | 'user';
}

export interface ContentFormData {
  type: EntryType;
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

export interface Tag {
  // ... existing code ...
} 