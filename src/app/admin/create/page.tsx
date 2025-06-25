"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/ui/ImageUploader";
import "easymde/dist/easymde.min.css";
import { ALLOWED_ENTRY_TYPES, FrontendEntryType, getEntryTypeDetails } from "@/config/entryTypes";

// --- UI Components ---

const TypeCard = ({ type, onSelect }: { type: FrontendEntryType; onSelect: (type: FrontendEntryType) => void }) => {
  const { label, icon: Icon } = getEntryTypeDetails(type);
  return (
    <motion.div
      onClick={() => onSelect(type)}
      className="bg-card p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-accent flex flex-col items-center justify-center text-center space-y-3"
      whileHover={{ y: -5, scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="w-10 h-10 text-accent" />
      <h3 className="text-lg font-semibold text-main">{label}</h3>
    </motion.div>
  );
};

// --- Main Form Logic ---

function CreateForm() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<FrontendEntryType | null>(null);
  
  // --- Core form states ---
  const [title, setTitle] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [tags, setTags] = useState<string>(""); 
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // --- Dynamic detail states ---
  const [fullContent, setFullContent] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      setError("请先选择一个内容类型。");
      return;
    }
    setLoading(true);
    setError("");

    const { backendType, buildDetails } = getEntryTypeDetails(selectedType);
    
    const details = buildDetails({ fullContent, coverImageUrl });
    
    const parsedTags = tags.split(",").map((tagItem: string) => tagItem.trim()).filter(Boolean);

    try {
      await api.content.create({
        type: backendType as any,
        title,
        is_public: isPublic,
        details,
        tags: parsedTags,
      });

      router.push("/notes");
      
    } catch (err: any) {
      const backendError = err?.info?.error || err.message;
      if (backendError && backendError.includes("Invalid content type")) {
        setError("创建失败：无效的内容类型。请联系管理员。");
      } else {
        setError("创建失败，请检查所有字段并重试。");
      }
      console.error("创建内容失败:", backendError);
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicFields = () => {
    if (!selectedType) return null;
    
    const { fields } = getEntryTypeDetails(selectedType);

    return (
      <>
        {fields.includes('fullContent') && (
           <div className="space-y-2">
                <Label htmlFor="content">内容 (支持 Markdown)</Label>
                <Textarea id="content" value={fullContent} onChange={(e) => setFullContent(e.target.value)} required rows={10} />
            </div>
        )}
        {(fields as readonly string[]).includes('coverImageUrl') && (
            <>
                <div className="space-y-2">
                    <Label htmlFor="cover" className="text-lg font-medium">电影海报</Label>
                    <ImageUploader onUploadSuccess={setCoverImageUrl} />
                    {coverImageUrl && <img src={coverImageUrl} alt="海报预览" className="mt-4 rounded-md max-h-60" />}
                </div>
            </>
        )}
      </>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Button variant="ghost" onClick={() => selectedType ? setSelectedType(null) : router.back()} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {selectedType ? "重新选择类型" : "返回"}
      </Button>

      {!selectedType ? (
        <>
          <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center">要创作点什么？</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {ALLOWED_ENTRY_TYPES.map(type => (
              <TypeCard key={type} type={type} onSelect={setSelectedType} />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-8">
            创作一篇新的 - {getEntryTypeDetails(selectedType).label}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-medium">标题</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="给你的想法起个名字..." />
              </div>

              {renderDynamicFields()}

              <div className="space-y-6">
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
          </form>
        </motion.div>
      )}
    </div>
  );
}

// The main page component remains simple, handling auth and mounting.
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