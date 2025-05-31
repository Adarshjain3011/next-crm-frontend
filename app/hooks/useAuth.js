// hooks/useAuth.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { fetchUserData,clearUser } from '../store/slice/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: user, loading, error, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const hasToken = document.cookie.includes('token');
        
        if (hasToken && !user) {
          // If token exists but no user data, fetch user data
          await dispatch(fetchUserData()).unwrap();
        } else if (!hasToken && user) {
          // If no token but user data exists, clear user data
          dispatch(clearUser());
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(clearUser());
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [dispatch, user, router]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      dispatch(clearUser());
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
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

