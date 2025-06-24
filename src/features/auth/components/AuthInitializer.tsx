"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { fetcher } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // 如果 store 中已经有用户信息，说明已登录或刚完成登录，无需重复检查。
      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        // 尝试调用会话验证接口
        const sessionData = await fetcher<any>(`${API_BASE_URL}/api/admin/auth/session`);
        
        if (sessionData && sessionData.success) {
          // 如果成功，用后端返回的用户信息更新前端状态
          login(sessionData.user); 
        }
      } catch (error) {
        // 捕获到错误（比如 401），说明未登录或会话已过期，保持未登录状态。
        // console.error('Session check failed:', error);
      } finally {
        // 无论成功与否，初始化过程都结束了
        setIsLoading(false);
      }
    };

    checkSession();
  }, [user, login]);

  // 在检查会话期间，显示一个加载界面，防止页面内容闪烁
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-main">Loading Session...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthInitializer; 