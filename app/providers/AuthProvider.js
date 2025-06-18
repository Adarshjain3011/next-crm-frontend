// components/providers/AuthProvider.jsx
'use client';
import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '@/components/ui/loader';

export function AuthProvider({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader text="Initializing application..." />;
  }

  return <>{children}</>;
}

