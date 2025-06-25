"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useReducer } from "react";
import useSWR from 'swr';
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Entry } from "@/types";
import { ENTRY_TYPES, FrontendEntryType, BackendEntryType, FormField } from "@/config/entryTypes";
import { TagInput } from '@/components/ui/TagInput';

// Helper function to find the frontend type based on the backend type
// This is necessary because the API returns 'BLOG_POST' or 'NOTE', and we need to map it back
// to a more specific frontend type like 'BOOK_LOG' or 'MOVIE_LOG'.
// This logic assumes a simple mapping. If it gets complex, it should be refined.
const getFrontendTypeFromBackend = (backendType: BackendEntryType): FrontendEntryType | undefined => {
    // This is a simple reverse lookup. 
    // It will return the *first* match. If backend types are not unique, this may need adjustment.
    return (Object.keys(ENTRY_TYPES) as FrontendEntryType[]).find(key => {
        const entry = ENTRY_TYPES[key];
        return entry.backendType === backendType;
    });
};

// Reducer for dynamic form state
function dynamicFormReducer(state: any, action: { type: 'UPDATE_FIELD' | 'SET_ALL_FIELDS', field?: string, value?: any, payload?: any }) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      if (!action.field) return state;
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'SET_ALL_FIELDS':
        return action.payload || {};
    default:
      return state;
  }
}

function EditForm({ entry }: { entry: Entry }) {
  const router = useRouter();
  // --- Static Form States ---
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- Dynamic detail states managed by a reducer ---
  const [dynamicState, dispatch] = useReducer(dynamicFormReducer, {});
  
  const handleDynamicFieldChange = (field: FormField, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  // Derive frontend type from entry prop
  const frontendType = getFrontendTypeFromBackend(entry.type as BackendEntryType);

  // Populate form when data is fetched
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setIsPublic(entry.is_public === 1);
      setTags(entry.tags?.map(t => t.name) || []);
      if (entry.details) {
        // This is a bit of a hack due to the mismatch.
        // We'll need a more robust mapping from backend details to frontend form state.
        const initialState = {
            ...entry.details,
            // Example mapping:
            reading_notes: entry.details.full_content,
            review: entry.details.full_content,
            poster_image_url: entry.details.cover_image_url,
            my_solution: entry.details.note_content,
            note_content: entry.details.note_content,
        };
        dispatch({ type: 'SET_ALL_FIELDS', payload: initialState });
      }
    }
  }, [entry]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let details: Record<string, any> = {};
    if (frontendType) {
      const { buildDetails } = ENTRY_TYPES[frontendType];
      details = buildDetails(dynamicState);
    } else {
        details = { ...dynamicState };
    }

    try {
      await api.content.update(entry.id, {
        title,
        is_public: isPublic,
        details,
        tags,
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
    if (!frontendType) {
        // Render a generic editor if type is unknown
        return null;
    }
    
    const { fields } = ENTRY_TYPES[frontendType];
    
    const renderField = (field: FormField) => {
      // Duplicating the logic from CreateForm. This could be a shared component.
      switch(field) {
        case 'full_content':
        case 'reading_notes':
        case 'review':
        case 'my_solution':
        case 'notes':
        case 'note_content':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-lg font-medium capitalize">{field.replace(/_/g, ' ')}</Label>
              <Textarea id={field} value={dynamicState[field] || ''} onChange={(e) => handleDynamicFieldChange(field, e.target.value)} required rows={8} />
            </div>
          );
        case 'cover_image_url':
        case 'poster_image_url':
            return (
                <div key={field} className="space-y-2">
                    <Label htmlFor={field} className="text-lg font-medium capitalize">{field.replace(/_/g, ' ')}</Label>
                    <ImageUploader 
                        initialImage={dynamicState[field]} 
                        onUploadSuccess={(url) => handleDynamicFieldChange(field, url)} 
                    />
                </div>
            )
        default:
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-lg font-medium capitalize">{field.replace(/_/g, ' ')}</Label>
              <Input id={field} value={dynamicState[field] || ''} onChange={(e) => handleDynamicFieldChange(field, e.target.value)} required />
            </div>
          )
      }
    }
    return fields.map(renderField);
  };

  const typeDetails = frontendType ? ENTRY_TYPES[frontendType] : null;
  const Icon = typeDetails?.icon;

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
              <div className="flex items-center p-3 rounded-md bg-muted text-lg">
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                <span>{typeDetails?.label || entry.type}</span>
              </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">标题</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {renderDynamicFields()}

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
               <TagInput 
                    value={tags} 
                    onChange={setTags}
                    placeholder="输入标签后按空格..."
                />
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
    id && isLoggedIn ? `admin_content_detail_${id}` : null,
    () => api.content.getDetail(id) // 使用后台管理接口
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