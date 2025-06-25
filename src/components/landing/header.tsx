"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRouter } from "next/navigation";
import { api } from '@/lib/api';

export function Header() {
  const { user, logout } = useAuthStore();
  const isLoggedIn = user !== null;
  const router = useRouter();

  // 解决 Zustand 在 Next.js App Router 中的水合问题
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogout = async () => {
    // The logout logic is now fully encapsulated in the zustand store.
    // This makes the component cleaner and the logic centralized.
    await logout();
    router.push('/');
  };

  if (!hasMounted) {
    return null; // 或者返回一个骨架屏
  }

  return (
    <header className="sticky top-0 z-50 py-4 backdrop-blur-lg border-b border-black/5 dark:border-white/5 bg-card/60">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Left: Title */}
        <div className="flex-1">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.ico" alt="Logo" width={32} height={32} className="rounded-lg" />
            <div>
              <div className="text-base font-bold text-main tracking-wide">技点迷津</div>
            </div>
          </Link>
        </div>
        {/* Center: Nav */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8 text-sub">
            <Link href="/" className="hover:text-main transition-colors">首页</Link>
            {isLoggedIn && (
              <Link href="/notes" className="hover:text-main transition-colors">手记</Link>
            )}
            <Link href="/projects" className="hover:text-main transition-colors">项目</Link>
        </nav>
        {/* Right: Theme Toggle & Auth */}
        <div className="flex-1 flex justify-end items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn && (
              <button onClick={handleLogout} className="text-sm text-sub hover:text-main transition-colors">
                注销
              </button>
            )}
        </div>
      </div>
    </header>
  );
} 