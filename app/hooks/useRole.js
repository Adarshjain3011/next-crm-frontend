'use client';

import { useSelector } from 'react-redux';
import { user_role } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRole = () => {
  const user = useSelector((state) => state.user?.data);

  console.log("user ka data at userole",user);

  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const isAdmin = user?.role === user_role.admin;
  const isSales = user?.role === user_role.sales;
  const isVendor = user?.role === user_role.vendor;

  return {
    isAdmin,
    isSales,
    isVendor,
    role: user?.role,
    user,
    isAuthenticated: !!user
  };
}; 



