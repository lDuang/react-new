// path: src/app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api'; // Use our new API service

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Call the login endpoint. The backend sets the HttpOnly cookie.
      await api.auth.login({ username, password });

      // Step 2: After successful login, immediately fetch session data to get user info.
      const sessionData = await api.auth.checkSession();

      if (!sessionData || !sessionData.success) {
        throw new Error("登录成功，但无法获取会话信息。");
      }

      // Step 3: Update frontend state with the fetched user info.
      login(sessionData.user);
      router.push('/notes'); // Redirect to the notes page after login

    } catch (err) {
      const error = err as Error & { info?: { error?: string } };
      setError(error?.info?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border-t-2 border-accent">
        <h1 className="text-3xl font-bold text-center text-main">登录</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-sub">
              用户名
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 text-main bg-transparent border border-gray-600 rounded-md focus:border-accent focus:ring-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-sub">
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 text-main bg-transparent border border-gray-600 rounded-md focus:border-accent focus:ring-accent focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white bg-accent rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}