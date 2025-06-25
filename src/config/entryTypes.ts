import { Book, Clapperboard, Code, Feather } from "lucide-react";
import React from "react";
import { BookCard } from "@/components/cards/BookCard";
import { MovieCard } from "@/components/cards/MovieCard";
import { LeetcodeCard } from "@/components/cards/LeetcodeCard";
import { DefaultCard } from "@/components/cards/DefaultCard";

// 动态表单字段的类型定义
export type FormField = 
  | 'full_content' 
  | 'cover_image_url' 
  | 'note_content'
  | 'book_title'
  | 'author'
  | 'reading_notes'
  | 'movie_title'
  | 'release_year'
  | 'director'
  | 'review'
  | 'poster_image_url'
  | 'problem_name'
  | 'problem_link'
  | 'my_solution'
  | 'notes';

// buildDetails 函数接收的状态类型
// 它应该包含所有可能的动态字段
export interface DetailBuilderState {
  [key: string]: any; 
}

/**
 * 前端使用的内容类型定义
 * 这是整个应用中内容类型的"唯一可信来源"。
 * - key: 在前端代码中使用的标识符 (例如 'BOOK_LOG')。
 * - label: 显示给用户的中文标签 (例如 '读书笔记')。
 * - icon: 与类型关联的 Lucide 图标。
 * - backendType: 提交给后端API时需要使用的真实类型 (例如 'BLOG_POST')。
 * - cardComponent: 在Grid中渲染时使用的卡片组件。
 * - buildDetails: 一个根据表单状态构建 details 对象的函数。
 * - fields: 一个字符串数组，定义了该类型在表单中需要哪些动态字段。
 */
export const ENTRY_TYPES = {
  BOOK_LOG: { 
    label: "读书笔记", 
    icon: Book,
    backendType: "BLOG_POST",
    cardComponent: BookCard,
    buildDetails: (state: DetailBuilderState) => ({ 
      full_content: state.reading_notes, 
      cover_image_url: state.cover_image_url,
      // 以后可以扩展，从state中取出 book_title, author 等
    }),
    fields: ['full_content', 'cover_image_url'] as FormField[],
  },
  MOVIE_LOG: { 
    label: "观影记录", 
    icon: Clapperboard,
    backendType: "BLOG_POST",
    cardComponent: MovieCard,
    buildDetails: (state: DetailBuilderState) => ({ 
        full_content: state.review, 
        cover_image_url: state.poster_image_url 
    }),
    fields: ['review', 'poster_image_url'] as FormField[],
  },
  LEETCODE_SUBMISSION: { 
    label: "刷题笔记", 
    icon: Code,
    backendType: "NOTE",
    cardComponent: LeetcodeCard,
    buildDetails: (state: DetailBuilderState) => ({ 
        note_content: state.my_solution 
    }),
    fields: ['problem_name', 'my_solution', 'notes'] as FormField[],
  },
  JOURNAL: { 
    label: "日志", 
    icon: Feather,
    backendType: "NOTE",
    cardComponent: DefaultCard,
    buildDetails: (state: DetailBuilderState) => ({ note_content: state.note_content }),
    fields: ['note_content'] as FormField[],
  },
  THOUGHT: { 
    label: "随笔", 
    icon: Feather,
    backendType: "NOTE",
    cardComponent: DefaultCard,
    buildDetails: (state: DetailBuilderState) => ({ note_content: state.note_content }),
    fields: ['note_content'] as FormField[],
  },
} as const; // 使用 as const 来获得更严格的类型推断

// 提取所有前端类型的联合类型，用于类型检查
export type FrontendEntryType = keyof typeof ENTRY_TYPES;

// 从 ENTRY_TYPES 的值中提取所有 backendType 的联合类型
export type BackendEntryType = typeof ENTRY_TYPES[FrontendEntryType]['backendType'];

// 动态生成允许在下拉框中选择的类型数组
export const ALLOWED_ENTRY_TYPES: FrontendEntryType[] = Object.keys(ENTRY_TYPES) as FrontendEntryType[];

// 获取特定类型的定义
export const getEntryTypeDetails = (type: FrontendEntryType) => {
  return ENTRY_TYPES[type];
};