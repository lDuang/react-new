"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Book, Clapperboard, Code, Feather } from "lucide-react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/ui/ImageUploader";
import "easymde/dist/easymde.min.css";

// 定义类型映射：后端值 -> 前端显示信息
const entryTypeMap = {
  BOOK_LOG: { label: "读书笔记", icon: Book },
  MOVIE_LOG: { label: "观影记录", icon: Clapperboard },
  LEETCODE_SUBMISSION: { label: "刷题笔记", icon: Code },
  JOURNAL: { label: "记录", icon: Feather },
  THOUGHT: { label: "随笔", icon: Feather },
};

// 定义允许的类型数组，用于Select组件
const ALLOWED_ENTRY_TYPES = Object.keys(entryTypeMap);

interface CreateEntryResponse {
  success: boolean;
  error?: string;
}

function CreateForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isLoggedIn = user !== null;
  const [isMounted, setIsMounted] = useState(false);
  
  // --- 核心状态 ---
  const [type, setType] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [tags, setTags] = useState<string>(""); 
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // --- 动态详情状态 ---
  const [fullContent, setFullContent] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isMounted, isLoggedIn, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      setError("请先选择一个内容类型。");
      return;
    }
    setLoading(true);
    setError("");

    // 1. 构造特定类型的 details 对象
    let details: Record<string, any> = {};
    switch (type) {
        case 'BOOK_LOG':
        case 'JOURNAL':
        case 'THOUGHT':
            details = { full_content: fullContent };
            break;
        case 'MOVIE_LOG':
            details = { full_content: fullContent, cover_image_url: coverImageUrl };
            break;
        // 在这里为其他类型添加 case...
        default:
            break;
    }
    
    const parsedTags = tags.split(",").map((tagItem: string) => tagItem.trim()).filter(Boolean);

    try {
      // Use the new API service to create content
      await api.content.create({
        type: type as any, // The select ensures this is a valid EntryType
        title,
        is_public: isPublic,
        details,
        tags: parsedTags,
      });

      // On success, redirect to the notes page to see the new entry
      router.push("/notes");
      
    } catch (err: any) {
      // The fetcher in our api service now standardizes the error format
      const errorMessage = err?.info?.error || err.message || "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || !isLoggedIn) {
    return <p>加载中...</p>;
  }

  // --- 渲染动态表单字段 ---
  const renderDynamicFields = () => {
    switch(type) {
        case 'BOOK_LOG':
        case 'JOURNAL':
        case 'THOUGHT':
            return (
                <div className="space-y-2">
                    <Label htmlFor="content" className="text-lg font-medium">内容 (支持 Markdown)</Label>
                    <Textarea id="content" value={fullContent} onChange={(e) => setFullContent(e.target.value)} required rows={15} />
                </div>
            );
        case 'MOVIE_LOG':
            return (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-lg font-medium">影评 (支持 Markdown)</Label>
                        <Textarea id="content" value={fullContent} onChange={(e) => setFullContent(e.target.value)} required rows={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cover" className="text-lg font-medium">电影海报</Label>
                        <ImageUploader onUploadSuccess={setCoverImageUrl} />
                        {coverImageUrl && <img src={coverImageUrl} alt="海报预览" className="mt-4 rounded-md max-h-60" />}
                    </div>
                </>
            );
        // 在这里为其他类型添加 case...
        default:
            return <p className="text-sub">请选择一个类型以开始创作。</p>;
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
      </Button>

      <h1 className="text-4xl font-extrabold tracking-tight mb-8">创作一篇新手记</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-lg font-medium">内容类型</Label>
          <Select onValueChange={(value: string) => setType(value)} required>
            <SelectTrigger id="type" className="py-6 text-lg">
              <SelectValue placeholder="选择一个分类开始..." />
            </SelectTrigger>
            <SelectContent>
              {ALLOWED_ENTRY_TYPES.map((itemType: string) => {
                const Icon = entryTypeMap[itemType as keyof typeof entryTypeMap].icon;
                return (
                  <SelectItem key={itemType} value={itemType} className="text-lg">
                    <div className="flex items-center">
                      <Icon className="mr-2 h-5 w-5" />
                      {entryTypeMap[itemType as keyof typeof entryTypeMap].label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {type && (
          <>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">标题</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="给你的想法起个名字..." />
            </div>

            {renderDynamicFields()}

            <div className="p-6 bg-muted/50 rounded-lg space-y-6">
              <h3 className="text-xl font-semibold">元信息</h3>
              <div className="space-y-2">
                <Label htmlFor="tags">标签 (逗号分隔)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="技术, 读书笔记" />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox id="is_public" checked={isPublic} onCheckedChange={(checked) => setIsPublic(Boolean(checked))} />
                <Label htmlFor="is_public" className="text-base font-medium">将这篇手记设为公开</Label>
              </div>
            </div>

            {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? "正在发布..." : "发布手记"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default function CreateEntryPage() {
  const { user } = useAuthStore();
  const isLoggedIn = user !== null;
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isMounted, isLoggedIn, router]);
  
  if (!isMounted || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CreateForm />
    </div>
  );
} 