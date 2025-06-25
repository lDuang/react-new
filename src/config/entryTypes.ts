import { Book, Clapperboard, Code, Feather } from "lucide-react";
import React from "react";
import { BookCard } from "@/components/cards/BookCard";
import { MovieCard } from "@/components/cards/MovieCard";
import { LeetcodeCard } from "@/components/cards/LeetcodeCard";
import { DefaultCard } from "@/components/cards/DefaultCard";

interface DetailBuilderState {
  fullContent: string;
  coverImageUrl: string;
  // Add other potential detail fields here in the future
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
    buildDetails: (state: DetailBuilderState) => ({ full_content: state.fullContent }),
    fields: ['fullContent'] as const,
  },
  MOVIE_LOG: { 
    label: "观影记录", 
    icon: Clapperboard,
    backendType: "BLOG_POST",
    cardComponent: MovieCard,
    buildDetails: (state: DetailBuilderState) => ({ full_content: state.fullContent, cover_image_url: state.coverImageUrl }),
    fields: ['fullContent', 'coverImageUrl'] as const,
  },
  LEETCODE_SUBMISSION: { 
    label: "刷题笔记", 
    icon: Code,
    backendType: "NOTE",
    cardComponent: LeetcodeCard,
    buildDetails: (state: DetailBuilderState) => ({ full_content: state.fullContent }),
    fields: ['fullContent'] as const,
  },
  JOURNAL: { 
    label: "日志", 
    icon: Feather,
    backendType: "NOTE",
    cardComponent: DefaultCard, // 复用默认卡片
    buildDetails: (state: DetailBuilderState) => ({ full_content: state.fullContent }),
    fields: ['fullContent'] as const,
  },
  THOUGHT: { 
    label: "随笔", 
    icon: Feather,
    backendType: "NOTE",
    cardComponent: DefaultCard, // 复用默认卡片
    buildDetails: (state: DetailBuilderState) => ({ full_content: state.fullContent }),
    fields: ['fullContent'] as const,
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