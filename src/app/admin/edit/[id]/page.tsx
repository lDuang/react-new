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
import { ArrowLeft, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Entry } from "@/types";
import { ENTRY_TYPES, FrontendEntryType, BackendEntryType, FormField, FIELD_LABELS } from "@/config/entryTypes";
import { TagInput } from '@/components/ui/TagInput';

// Helper function to find the frontend type based on the backend type
// This includes a heuristic for legacy 'BLOG_POST' entries to differentiate them.
const getFrontendTypeFromBackend = (entry: Entry): FrontendEntryType | undefined => {
    const backendType = entry.type as BackendEntryType;

    // Smart routing for legacy BLOG_POST entries, which could be books or movies.
    // This is a temporary measure for data migration.
    if (backendType === 'BLOG_POST') {
        if (entry.title.includes("读《")) return 'BOOK_LOG';
        if (entry.title.includes("《") && entry.title.includes("观后")) return 'MOVIE_LOG';
        // Fallback to the generic blog post type for any other case
        return 'BLOG_POST'; 
    }

    // Standard lookup for all other types. It returns the *first* match.
    return (Object.keys(ENTRY_TYPES) as FrontendEntryType[]).find(key => {
        const entryDef = ENTRY_TYPES[key];
        return entryDef.backendType === backendType;
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

  // Derive frontend type from entry prop using the new smarter helper
  const frontendType = getFrontendTypeFromBackend(entry);

  // Populate form when data is fetched
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setIsPublic(entry.is_public === 1);
      setTags(entry.tags?.map(t => t.name) || []);
      if (entry.details) {
        const initialState = { ...entry.details };

        // Backwards-compatibility mapping from old generic fields to new specific fields.
        // This allows editing old entries without losing data. On save, the new
        // `buildDetails` function will persist the correct new structure.
        if (initialState.full_content) {
            initialState.reading_notes = initialState.reading_notes || initialState.full_content;
            initialState.review = initialState.review || initialState.full_content;
        }
        if (initialState.note_content) {
            initialState.my_solution = initialState.my_solution || initialState.note_content;
        }
        if (initialState.cover_image_url) {
            // For movie logs that might have used the generic cover_image_url
            initialState.poster_image_url = initialState.poster_image_url || initialState.cover_image_url;
        }
        
        dispatch({ type: 'SET_ALL_FIELDS', payload: initialState });
      }
    }
  }, [entry]);
  
  const handleDelete = async () => {
    if (!window.confirm("您确定要永久删除这篇手记吗？此操作无法撤销。")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.content.delete(entry.id);
      router.push("/notes"); // Redirect after successful deletion
    } catch (err: any) {
      const errorMessage = err?.info?.error || err.message || "删除失败。";
      setError(errorMessage);
      setLoading(false); // Only stop loading on error, success will redirect away
    }
  };
  
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
              <Label htmlFor={field} className="text-lg font-medium capitalize">{FIELD_LABELS[field] || field.replace(/_/g, ' ')}</Label>
              <Textarea id={field} value={dynamicState[field] || ''} onChange={(e) => handleDynamicFieldChange(field, e.target.value)} rows={8} />
            </div>
          );
        case 'cover_image_url':
        case 'poster_image_url':
            return (
                <div key={field} className="space-y-2">
                    <Label htmlFor={field} className="text-lg font-medium capitalize">{FIELD_LABELS[field] || field.replace(/_/g, ' ')}</Label>
                    <ImageUploader 
                        initialImage={dynamicState[field]} 
                        onUploadSuccess={(url) => handleDynamicFieldChange(field, url)} 
                    />
                </div>
            )
        default:
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-lg font-medium capitalize">{FIELD_LABELS[field] || field.replace(/_/g, ' ')}</Label>
              <Input id={field} value={dynamicState[field] || ''} onChange={(e) => handleDynamicFieldChange(field, e.target.value)} />
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

          <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除手记
              </Button>
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