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
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL, fetcher } from "@/lib/api";
import "easymde/dist/easymde.min.css";

const ALLOWED_ENTRY_TYPES = [
  "BOOK_LOG",
  "MOVIE_LOG",
  "LEETCODE_SUBMISSION",
  "JOURNAL",
];

interface CreateEntryResponse {
  success: boolean;
  error?: string;
}

export default function CreateEntryPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // 状态管理
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [meta, setMeta] = useState(""); // 简单起见，meta作为JSON字符串输入
  const [tags, setTags] = useState(""); // 简单起见，tags作为逗号分隔的字符串输入
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setError("");

    try {
      // 数据转换和验证
      let parsedMeta = {};
      if (meta) {
        try {
          parsedMeta = JSON.parse(meta);
        } catch (e) {
          throw new Error("Meta 必须是合法的 JSON 格式。");
        }
      }
      const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

      const data = await fetcher<CreateEntryResponse>(`${API_BASE_URL}/api/admin/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          type, 
          title, 
          content, 
          is_public: isPublic,
          meta: parsedMeta,
          tags: parsedTags,
        }),
      });

      if (!data.success) {
        throw new Error(data.error || "创建失败");
      }

      // 创建成功，跳转到首页
      router.push("/");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("一个未知的错误发生了。");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || !isLoggedIn) {
    return <p>加载中...</p>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
        </Button>

        <h1 className="text-4xl font-extrabold tracking-tight mb-8">创作一篇新手记</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">标题</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required 
                className="py-6 text-lg" placeholder="给你的想法起个名字..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-lg font-medium">类型</Label>
              <Select onValueChange={setType} required>
                <SelectTrigger id="type" className="py-6 text-lg">
                  <SelectValue placeholder="选择一个分类" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_ENTRY_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-lg">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="text-lg font-medium">内容 (支持 Markdown)</Label>
            <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} required 
              rows={15} className="text-base leading-relaxed" placeholder="在这里开始书写..." />
          </div>

          <div className="p-6 bg-muted/50 rounded-lg space-y-6">
            <h3 className="text-xl font-semibold">元信息</h3>
             <div className="space-y-2">
              <Label htmlFor="meta">元数据 (JSON格式)</Label>
              <Textarea id="meta" value={meta} onChange={e => setMeta(e.target.value)} rows={3} placeholder='{ "rating": 5, "author": "..." }' className="font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">标签 (逗号分隔)</Label>
              <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="技术, 读书笔记" />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Checkbox id="is_public" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked === true)} className="w-5 h-5" />
              <Label htmlFor="is_public" className="text-base font-medium">将这篇手记设为公开</Label>
            </div>
          </div>

          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} size="lg" className="px-12 py-6 text-lg">
              {loading ? "正在发布..." : "发布手记"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 