"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';

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
        // Try to call the session validation endpoint using our new API service
        const sessionData = await api.auth.checkSession();
        
        if (sessionData && sessionData.success) {
          // If successful, update the frontend state with user info from the backend
          login(sessionData.user); 
        }
      } catch (error) {
        // 捕获到错误（比如 401），说明未登录或会话已过期，保持未登录状态。
        // console.error('Session check failed:', error);
      } finally {
        // Regardless of success or failure, the initialization process is complete
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