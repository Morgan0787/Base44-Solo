import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * Wrap a page component with this to require login. Redirects to /Login
 * (preserving the current URL as ?redirect_to=) if the user isn't
 * authenticated. Used for Profile and Recommendations — Search and Home
 * stay open to everyone.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isAuthenticated, navigateToLogin]);

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}
