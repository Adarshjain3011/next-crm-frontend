// components/providers/AuthProvider.jsx
'use client';
import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';
export function AuthProvider({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return <>{children}</>;
}

