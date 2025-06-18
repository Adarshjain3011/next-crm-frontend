// hooks/useAuth.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { fetchUserData, clearUser } from '../store/slice/userSlice';
import { performLogout, quickLogout } from '@/app/utils/logout';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, loading, error, isAuthenticated } = useSelector((state) => state.user);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       // Check if token exists
  //       const hasToken = document.cookie.includes('token');
        
  //       if (hasToken && !user) {
  //         // If token exists but no user data, fetch user data
  //         await dispatch(fetchUserData()).unwrap();
  //       } else if (!hasToken && user) {
  //         // If no token but user data exists, clear user data
  //         dispatch(clearUser());
  //         router.push('/auth/login');
  //       }
  //     } catch (error) {
  //       console.error('Auth check failed:', error);
  //       dispatch(clearUser());
  //       router.push('/auth/login');
  //     }
  //   };

  //   checkAuth();
  // }, [dispatch, user, router]);

  const logout = async (clearAllData = true) => {
    if (clearAllData) {
      // Comprehensive logout that clears all data
      await performLogout(dispatch, router, true, queryClient);
    } else {
      // Quick logout that only clears user data
      await quickLogout(dispatch, router, queryClient);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    logout
  };
};

