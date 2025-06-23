"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL, fetcher } from '@/lib/api';

const ALLOWED_ENTRY_TYPES = ['BOOK_LOG', 'MOVIE_LOG', 'LEETCODE_SUBMISSION', 'JOURNAL'];

export default function NewRecordPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  // --- Client-side Auth Guard ---
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  const [type, setType] = useState(ALLOWED_ENTRY_TYPES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [meta, setMeta] = useState('{}'); // JSON string
  const [tags, setTags] = useState(''); // Comma-separated string
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    let parsedMeta, parsedTags;
    try {
      parsedMeta = JSON.parse(meta);
    } catch (err) {
      setError('Meta 字段必须是合法的 JSON 对象。');
      setIsLoading(false);
      return;
    }
    parsedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);

    const newEntry = {
      type,
      title,
      content,
      is_public: isPublic,
      meta: parsedMeta,
      tags: parsedTags,
    };

    try {
      await fetcher(`${API_BASE_URL}/api/admin/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      
      router.push('/records'); // 创建成功后跳转到手记列表页

    } catch (err: any) {
      setError(err?.info?.error || '创建失败，请检查输入。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>;
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-main mb-8">创建新手记</h1>
      <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-card rounded-2xl shadow-xl border-t-2 border-accent">
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-sub mb-1">类型</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 bg-transparent border border-gray-600 rounded-md">
            {ALLOWED_ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-sub mb-1">标题</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 bg-transparent border border-gray-600 rounded-md" />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-sub mb-1">内容 (支持 Markdown)</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={10} className="w-full p-2 bg-transparent border border-gray-600 rounded-md"></textarea>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="is_public" className="text-sm font-medium text-sub">设为公开</label>
          <input id="is_public" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded accent-accent"/>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-sub mb-1">标签 (用逗号分隔)</label>
          <input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 bg-transparent border border-gray-600 rounded-md" />
        </div>

        <div>
          <label htmlFor="meta" className="block text-sm font-medium text-sub mb-1">元数据 (JSON 格式)</label>
          <textarea id="meta" value={meta} onChange={(e) => setMeta(e.target.value)} rows={3} className="w-full p-2 font-mono bg-transparent border border-gray-600 rounded-md"></textarea>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <button type="submit" disabled={isLoading} className="w-full px-4 py-3 font-semibold text-white bg-accent rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
          {isLoading ? '发布中...' : '发布'}
        </button>
      </form>
    </div>
  );
} 