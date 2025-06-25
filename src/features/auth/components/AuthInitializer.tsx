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
    // On initial load, trigger the session check.
    // The store itself will handle the async logic and state updates.
    checkSession();
  }, [checkSession]);

  // This component doesn't render any UI itself. It's a wrapper to trigger
  // an effect. The actual loading state can be derived from the store
  // in other components if needed, though often it's not necessary as
  // components will just re-render once the user state is populated.
  return <>{children}</>;
}

export default AuthInitializer; 