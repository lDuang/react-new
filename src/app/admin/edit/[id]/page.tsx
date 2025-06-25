"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from 'swr';
import { ArrowLeft, Book, Clapperboard, Code, Feather } from "lucide-react";
import { api } from "@/lib/api"; // Use the new API service
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Entry } from "@/types";

const entryTypeMap: Record<string, { label: string; icon: React.ElementType }> = {
  BOOK_LOG: { label: "读书笔记", icon: Book },
  MOVIE_LOG: { label: "观影记录", icon: Clapperboard },
  LEETCODE_SUBMISSION: { label: "刷题笔记", icon: Code },
  JOURNAL: { label: "记录", icon: Feather },
  THOUGHT: { label: "随笔", icon: Feather },
};

function EditForm({ entry }: { entry: Entry }) {
  const router = useRouter();
  // --- Form States ---
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form when data is fetched
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setIsPublic(entry.is_public === 1);
      setTags(entry.tags?.map(t => t.name).join(', ') || "");
      if (entry.details) {
        setFullContent(entry.details.full_content || "");
        setCoverImageUrl(entry.details.cover_image_url || "");
      }
    }
  }, [entry]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let details: Record<string, any> = {};
    if (entry) {
      switch (entry.type) {
        case 'BOOK_LOG':
        case 'JOURNAL':
        case 'THOUGHT':
          details = { full_content: fullContent };
          break;
        case 'MOVIE_LOG':
          details = { full_content: fullContent, cover_image_url: coverImageUrl };
          break;
      }
    }

    const parsedTags = tags.split(",").map(tag => tag.trim()).filter(Boolean);

    try {
      await api.content.update(entry.id, {
        title,
        is_public: isPublic,
        details,
        tags: parsedTags,
      });
      router.push("/notes");
    } catch (err: any) {
      const errorMessage = err?.info?.error || err.message || "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const renderDynamicFields = () => {
    if (!entry) return null;
    switch(entry.type) {
        case 'BOOK_LOG':
        case 'JOURNAL':
        case 'THOUGHT':
            return (
                <div className="space-y-2">
                    <Label htmlFor="content">内容</Label>
                    <Textarea id="content" value={fullContent} onChange={(e) => setFullContent(e.target.value)} required rows={15} />
                </div>
            );
        case 'MOVIE_LOG':
            return (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="content">影评</Label>
                        <Textarea id="content" value={fullContent} onChange={(e) => setFullContent(e.target.value)} required rows={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cover">电影海报</Label>
                        <ImageUploader initialImage={coverImageUrl} onUploadSuccess={setCoverImageUrl} />
                    </div>
                </>
            );
        default:
            return null;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">编辑手记</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
              <Label htmlFor="type" className="text-lg font-medium">内容类型</Label>
              <Input id="type" value={entryTypeMap[entry.type]?.label || entry.type} readOnly className="bg-muted"/>
          </div>

          <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">标题</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
                {loading ? "正在更新..." : "更新手记"}
              </Button>
          </div>
      </form>
    </div>
  );
}

export default function EditEntryPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuthStore();
  const isLoggedIn = user !== null;

  const { data: response, error: fetchError, isLoading: isFetching } = useSWR(
    id && isLoggedIn ? `content_detail_${id}` : null,
    () => api.public.getContentDetail(id)
  );
  
  const entry = response?.data;

  if (!isLoggedIn) {
    // maybe redirect to login or show a message
    return <p className="text-center py-20">请先登录...</p>;
  }
  if (isFetching) return <p className="text-center py-20">正在加载文章数据...</p>;
  if (fetchError) return <p className="text-center py-20 text-red-500">加载失败：{fetchError.message}</p>;
  if (!entry) return <p className="text-center py-20">找不到该文章或数据格式错误。</p>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EditForm entry={entry} />
    </div>
  );
} 