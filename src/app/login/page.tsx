"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL, fetcher } from '../../lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

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
      await fetcher(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      login();
      router.push('/'); // 登录成功后跳转到首页

    } catch (err: any) {
      setError(err?.info?.error || 'Login failed');
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