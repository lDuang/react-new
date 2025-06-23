"use client";

import React, { useState, useEffect } from "react";
import useSWR from 'swr';
import { useAuthStore } from '../../stores/authStore';
import { fetcher, API_BASE_URL } from '../../lib/api';
import { Entry } from '../../lib/types';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function NoteCard({ entry }: { entry: Entry }) {
    return (
        <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">{entry.title}</h3>
            <p className="text-sm text-sub mb-4">
                {new Date(entry.created_at * 1000).toLocaleString()} | {entry.type} | {entry.is_public ? '公开' : '私密'}
            </p>
            {/* 这里可以放一个内容的简短预览 */}
            <div className="flex justify-end">
                <Button variant="ghost" asChild>
                    <Link href={`/admin/edit/${entry.id}`}>编辑</Link>
                </Button>
            </div>
        </div>
    )
}

export default function NotesPage() {
    const { token, isLoggedIn } = useAuthStore();
    const router = useRouter();

    // 路由保护
    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace('/login');
        }
    }, [isLoggedIn, router]);

    const { data, error, isLoading } = useSWR(
        token ? `${API_BASE_URL}/api/admin/entries` : null,
        (url: string) => fetcher(url, { headers: { 'Authorization': `Bearer ${token}` } })
    );

    if (!isLoggedIn()) {
        return <p className="text-center pt-20">跳转到登录页面...</p>;
    }
    
    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">我的手记</h1>
                <Button asChild>
                    <Link href="/admin/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        创建新记录
                    </Link>
                </Button>
            </header>

            {isLoading && <p className="text-center">加载中...</p>}
            {error && <p className="text-center text-red-500">加载手记失败，请稍后再试。</p>}
            
            {data && data.success && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.data.map((entry: Entry) => (
                        <NoteCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    )
} 