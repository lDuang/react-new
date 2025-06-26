"use client";

import React from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export default function NoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const id = params.id as string;

    const { data, error, isLoading, mutate } = useSWR(
        id && user ? `content/${id}` : null,
        () => api.content.getDetail(id)
    );

    const handleDelete = async () => {
        if (!window.confirm("您确定要永久删除这篇手记吗？此操作无法撤销。")) {
            return;
        }
        try {
            await api.content.delete(id);
            router.push('/notes');
        } catch (err) {
            console.error("Failed to delete entry:", err);
            alert("删除失败，请稍后再试。");
        }
    };

    if (isAuthLoading || isLoading) return <p className="text-center py-20">加载中...</p>;
    if (error) return <p className="text-center py-20 text-red-500">加载失败：{error.message}</p>;
    if (!data || !data.success) return <p className="text-center py-20">找不到内容或内容不存在。</p>;

    const entry = data.data;

    return (
        <div className="container mx-auto p-4 py-12 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回
                </Button>
                <div className="space-x-2">
                    <Button variant="outline" asChild>
                        <Link href={`/admin/edit/${id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                    </Button>
                </div>
            </div>

            <article className="prose prose-invert max-w-none">
                <h1>{entry.title}</h1>
                <div className="text-sm text-sub mb-4">
                    <span>创建于: {new Date(entry.created_at * 1000).toLocaleString()}</span> | 
                    <span>更新于: {new Date(entry.updated_at * 1000).toLocaleString()}</span>
                </div>
                <div className={`text-xs font-semibold inline-block px-2 py-1 rounded-full mb-4 ${entry.is_public ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {entry.is_public ? '公开' : '私密'}
                </div>
                
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                >
                    {entry.details?.full_content || ''}
                </ReactMarkdown>
            </article>
        </div>
    );
} 