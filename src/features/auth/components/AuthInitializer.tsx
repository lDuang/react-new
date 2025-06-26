"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';

/**
 * This component is responsible for initializing the auth state when the app loads.
 * It calls the `checkSession` action from the auth store, which handles
 * validating the session with the backend and updating the store accordingly.
 * It runs only once on initial mount.
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkSession } = useAuthStore();
  
  useEffect(() => {
    // On initial load, trigger the session check in the background.
    // The UI is not blocked by this. The store will update when this resolves.
    checkSession();
  }, [checkSession]);

  // This component no longer blocks rendering. It just triggers an effect.
  return <>{children}</>;
}

export default AuthInitializer; 