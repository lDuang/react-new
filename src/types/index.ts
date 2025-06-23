export type EntryType = "BOOK_LOG" | "LEETCODE_SUBMISSION" | "PROJECT" | "THOUGHT" | "MOVIE_LOG" | "JOURNAL";

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  content?: string; // Content is in the detailed view
  created_at: number;
  is_public: 0 | 1;
  mood?: string;
  meta?: string; // API returns meta as a JSON string
}

export interface PaginatedEntries {
  success: boolean;
  data: Entry[];
} 