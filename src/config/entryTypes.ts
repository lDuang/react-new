import { Book, Clapperboard, Code, Feather, FileText } from "lucide-react";
import React from "react";
import { BookCard } from "@/components/cards/BookCard";
import { MovieCard } from "@/components/cards/MovieCard";
import { LeetcodeCard } from "@/components/cards/LeetcodeCard";
import { DefaultCard } from "@/components/cards/DefaultCard";

// 动态表单字段的类型定义 (包含所有类型的所有字段)
export type FormField = 
  // BLOG_POST
  | 'full_content' 
  // NOTE
  | 'note_content'
  // BOOK_LOG
  | 'book_title'
  | 'author'
  | 'reading_notes'
  | 'cover_image_url' 
  | 'isbn'
  // MOVIE_LOG
  | 'movie_title'
  | 'release_year'
  | 'director'
  | 'review'
  | 'poster_image_url'
  // CODE_CHALLENGE
  | 'problem_name'
  | 'problem_link'
  | 'my_solution'
  | 'notes';

// buildDetails 函数接收的状态类型
export interface DetailBuilderState {
  [key: string]: any; 
}

/**
 * Helper to construct details object, only including non-empty values.
 * This makes handling optional fields straightforward.
 */
const pick = (state: DetailBuilderState, fields: Readonly<Array<FormField>>) => {
  const result: DetailBuilderState = {};
  for (const field of fields) {
    // Only include the field if it has a meaningful value
    if (state[field] !== undefined && state[field] !== null && state[field] !== '') {
      result[field] = state[field];
    }
  }
  return result;
};

// 为每个字段提供更友好的中文标签
export const FIELD_LABELS: Record<FormField, string> = {
    full_content: '完整内容',
    note_content: '笔记内容',
    book_title: '书籍名称',
    author: '作者',
    reading_notes: '读书笔记',
    cover_image_url: '封面图片',
    isbn: 'ISBN',
    movie_title: '电影名称',
    release_year: '上映年份',
    director: '导演',
    review: '观后感',
    poster_image_url: '海报图片',
    problem_name: '题目名称',
    problem_link: '题目链接',
    my_solution: '我的题解',
    notes: '备注',
};

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
    backendType: "BOOK_LOG",
    cardComponent: BookCard,
    fields: ['book_title', 'author', 'reading_notes', 'cover_image_url', 'isbn'] as const,
    buildDetails: (state: DetailBuilderState) => pick(state, ['book_title', 'author', 'reading_notes', 'cover_image_url', 'isbn']),
  },
  MOVIE_LOG: { 
    label: "观影记录", 
    icon: Clapperboard,
    backendType: "MOVIE_LOG",
    cardComponent: MovieCard,
    fields: ['movie_title', 'release_year', 'director', 'review', 'poster_image_url'] as const,
    buildDetails: (state: DetailBuilderState) => pick(state, ['movie_title', 'release_year', 'director', 'review', 'poster_image_url']),
  },
  LEETCODE_SUBMISSION: { 
    label: "刷题笔记", 
    icon: Code,
    backendType: "CODE_CHALLENGE",
    cardComponent: LeetcodeCard,
    fields: ['problem_name', 'problem_link', 'my_solution', 'notes'] as const,
    buildDetails: (state: DetailBuilderState) => pick(state, ['problem_name', 'problem_link', 'my_solution', 'notes']),
  },
  BLOG_POST: {
    label: "博客文章",
    icon: FileText,
    backendType: "BLOG_POST",
    cardComponent: DefaultCard,
    fields: ['full_content', 'cover_image_url'] as const,
    buildDetails: (state: DetailBuilderState) => pick(state, ['full_content', 'cover_image_url']),
  },
  JOURNAL: { 
    label: "日志", 
    icon: Feather,
    backendType: "NOTE",
    cardComponent: DefaultCard,
    fields: ['note_content'] as const,
    buildDetails: (state: DetailBuilderState) => pick(state, ['note_content']),
  },
  // 'THOUGHT' (随笔)与'JOURNAL' (日志)功能上完全重合，因此合并为一个以减少冗余。
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