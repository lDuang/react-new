"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR from 'swr';
import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';
import { Entry, Paginated } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Hand } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function NoteCard({ entry }: { entry: Entry }) {
    return (
        <motion.div 
            className="bg-card p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-80 flex-shrink-0"
            whileHover={{ y: -5 }}
        >
            <h3 className="text-xl font-bold mb-2 truncate">{entry.title}</h3>
            <p className="text-sm text-sub mb-4">
                {new Date(entry.created_at * 1000).toLocaleString()} | {entry.type}
            </p>
            <div className={`text-xs font-semibold inline-block px-2 py-1 rounded-full ${entry.is_public ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {entry.is_public ? '公开' : '私密'}
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="ghost" asChild>
                    <Link href={`/admin/edit/${entry.id}`}>编辑</Link>
                </Button>
            </div>
        </motion.div>
    )
}

export default function NotesPage() {
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const isLoggedIn = user !== null;
    const router = useRouter();

    const constraintsRef = useRef<HTMLDivElement>(null);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            router.replace('/login');
        }
    }, [isAuthLoading, isLoggedIn, router]);

    const { data, error, isLoading: isNotesLoading } = useSWR<Paginated<Entry>>(
        isLoggedIn ? 'admin_content' : null,
        () => api.content.getAll({ limit: 50 })
    );

    useEffect(() => {
        if (data && data.success && constraintsRef.current) {
            const containerWidth = constraintsRef.current.offsetWidth;
            const contentWidth = data.data.length * (320 + 24) - 24;
            const newLeftConstraint = Math.min(0, containerWidth - contentWidth);
            setDragConstraints({ left: newLeftConstraint, right: 0 });
        }
    }, [data]);

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
            
            <div ref={constraintsRef} className="w-full overflow-hidden cursor-grab">
            {data && data.success && (
                    <motion.div 
                        className="flex gap-6"
                        drag="x"
                        dragConstraints={dragConstraints}
                        whileTap={{ cursor: "grabbing" }}
                    >
                    {data.data.map((entry: Entry) => (
                        <NoteCard key={entry.id} entry={entry} />
                    ))}
                    </motion.div>
                )}
            </div>
            
            {data && data.data && data.data.length > 0 && (
                 <div className="flex items-center justify-end text-sm text-sub mt-4">
                    <Hand className="mr-2 h-4 w-4" />
                    <span>按住并拖动以浏览全部手记</span>
                </div>
            )}
        </div>
    )
} 