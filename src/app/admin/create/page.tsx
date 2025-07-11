"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useReducer } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { ImageUploader } from "@/components/ui/ImageUploader";
import "easymde/dist/easymde.min.css";
import { ALLOWED_ENTRY_TYPES, FrontendEntryType, getEntryTypeDetails, FormField, FIELD_LABELS } from "@/config/entryTypes";
import { TagInput } from '@/components/ui/TagInput';

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

// Reducer for dynamic form state
function dynamicFormReducer(state: any, action: { type: 'UPDATE_FIELD', field: string, value: any }) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
}

function CreateForm() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<FrontendEntryType | null>(null);
  
  // --- Static form states ---
  const [title, setTitle] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // --- Dynamic detail states managed by a reducer ---
  const [dynamicState, dispatch] = useReducer(dynamicFormReducer, {});

  const handleDynamicFieldChange = (field: FormField, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      setError("请先选择一个内容类型。");
      return;
    }
    setLoading(true);
    setError("");

    const { backendType, buildDetails } = getEntryTypeDetails(selectedType);
    
    // Pass the entire dynamic state to buildDetails
    const details = buildDetails(dynamicState);
    
    try {
      await api.content.create({
        type: backendType as any,
        title,
        is_public: isPublic,
        details,
        tags,
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

    const renderField = (field: FormField) => {
      // Basic component mapping, can be expanded
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
                    <ImageUploader onUploadSuccess={(url) => handleDynamicFieldChange(field, url)} />
                    {dynamicState[field] && <img src={dynamicState[field]} alt="预览" className="mt-4 rounded-md max-h-60" />}
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
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Button variant="ghost" onClick={() => selectedType ? setSelectedType(null) : router.back()} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {selectedType ? "重新选择类型" : "返回"}
      </Button>

      {!selectedType ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">要创作点什么？</h1>
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
          <h1 className="text-3xl font-bold tracking-tight mb-8">
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
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect if auth check is complete and user is not logged in.
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>正在验证身份...</p>
      </div>
    );
  }

  // If auth check is done and user is not logged in, this part may briefly render before redirect.
  // Returning null or a minimal loader is safer.
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CreateForm />
    </div>
  );
}