"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRouter } from "next/navigation";
import { fetcher, API_BASE_URL } from '@/lib/api';

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
    logout(); // 立即更新UI
    try {
      // 调用登出接口，清除后端的 HttpOnly cookie
      await fetcher(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      // 即使后端调用失败（比如因为cookie已过期导致401），我们依然执行前端的登出流程
      console.error("Logout API call failed, but proceeding with client-side logout:", error);
    }
    router.push('/'); // 重定向到首页
  };

  if (!hasMounted) {
    return null; // 或者返回一个骨架屏
  }

  return (
    <header className="sticky top-0 z-50 py-4 backdrop-blur-lg border-b border-black/5 dark:border-white/5 bg-card/60">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Left: Title */}
        <div className="flex-1">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-main">
            <Image src="/logo.ico" alt="技点迷津 Logo" width={28} height={28} className="rounded-md" />
            <span>技点迷津</span>
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