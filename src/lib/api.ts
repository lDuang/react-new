// path: src/lib/api.ts
import { useAuthStore } from '@/features/auth/store';
import { PaginatedEntries } from '../types';

// 优先使用服务器端环境变量，如果不存在（例如在浏览器中），则回退到 NEXT_PUBLIC_ 变量
// 这样在服务器端渲染和 API 路由中会使用更安全的服务器端变量
export const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetcher<JSON>(url: string, options: RequestInit = {}): Promise<JSON> {
  const { logout } = useAuthStore.getState();
  const urlPath = new URL(url).pathname;

  // 仅对 admin 和 auth 路由启用凭据
  const isProtectedRoute = urlPath.startsWith('/api/admin') || urlPath.startsWith('/api/auth');

  const fetchOptions = {
    ...options,
    ...(isProtectedRoute && { credentials: 'include' as const })
  };

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    // 仅对受保护的路由进行 401 拦截
    if (res.status === 401 && isProtectedRoute) {
      logout();
      if (typeof window !== 'undefined') {
         if (window.location.pathname !== '/login') {
            window.location.href = '/login';
         }
      }
    }

    const customError = new Error('An error occurred while fetching the data.') as Error & {
        info: Record<string, unknown>,
        status: number
    };
    try {
        customError.info = await res.json();
    } catch { // 将 catch 块的参数改为 _e
        // 这里的 _e 是捕获到的错误，我们不直接使用它来设置 customError.info
        // 使用 _e 告诉 ESLint 这是有意未使用的变量
        customError.info = { message: await res.text() };
    }
    customError.status = res.status;
    throw customError; // 抛出我们自定义的错误对象
  }

  return res.json();
}

export const getPublicEntries = (page = 1, limit = 5): Promise<PaginatedEntries> => {
    return fetcher(`${API_BASE_URL}/api/entries/public?page=${page}&limit=${limit}`);
}