"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';

// This will be the page to show all records for a logged in user.
// For now it's a placeholder.
export default function RecordsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.replace('/login');
    }
  }, [token, isMounted, router]);

  if (!isMounted || !token) {
    // Render nothing or a loading spinner while checking auth state
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">我的手记</h1>
      <p className="mt-4">这里将显示您的所有记录。此功能正在建设中。</p>
    </div>
  );
} 