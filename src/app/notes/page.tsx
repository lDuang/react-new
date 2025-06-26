"use client";

import React, { useEffect, useState } from "react";
import useSWR from 'swr';
import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';
import { Entry, Paginated } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function NoteCard({ entry, onDelete }: { entry: Entry, onDelete: (id: string) => void }) {
    return (
        <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold mb-2 truncate">{entry.title}</h3>
                <p className="text-sm text-sub mb-4">
                    {new Date(entry.created_at * 1000).toLocaleString()} | {entry.type}
                </p>
                <div className={`text-xs font-semibold inline-block px-2 py-1 rounded-full ${entry.is_public ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {entry.is_public ? '公开' : '私密'}
                </div>
            </div>
            <div className="flex justify-end items-center mt-4 space-x-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/edit/${entry.id}`}>
                        <Edit className="h-4 w-4" />
                    </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default function NotesPage() {
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const isLoggedIn = user !== null;
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            router.replace('/login');
        }
    }, [isAuthLoading, isLoggedIn, router]);

    const { data, error, isLoading: isNotesLoading, mutate } = useSWR<Paginated<Entry>>(
        isLoggedIn ? 'admin_content' : null,
        () => api.content.getAll({ limit: 50 })
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm("您确定要永久删除这篇手记吗？此操作无法撤销。")) {
            return;
        }

        try {
            // Optimistic UI update: remove the item from the local cache immediately.
            mutate(
                (currentData) => {
                    if (!currentData) return currentData;
                    return {
                        ...currentData,
                        data: currentData.data.filter((entry) => entry.id !== id),
                    };
                },
                false // `false` means don't revalidate yet
            );
            
            // Make the API call to delete the item from the backend.
            await api.content.delete(id);

        } catch (err) {
            console.error("Failed to delete entry:", err);
            // If the API call fails, revert the optimistic update by re-fetching the data.
            mutate(); 
            // You might want to show an error toast to the user here.
        }
    };

    if (isAuthLoading) {
        return <p className="text-center pt-20">正在验证身份...</p>;
    }
    
    if (!isLoggedIn) {
        return <p className="text-center pt-20">即将跳转到登录页面...</p>;
    }
    
    return (
        <div className="container mx-auto p-4 py-12">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">我的手记</h1>
                <Button asChild>
                    <Link href="/admin/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        创建新记录
                    </Link>
                </Button>
            </header>

            {isNotesLoading && <p className="text-center">加载中...</p>}
            {error && <p className="text-center text-red-500">加载手记失败，请稍后再试。</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data && data.success && data.data.map((entry: Entry) => (
                    <NoteCard key={entry.id} entry={entry} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    )
} 