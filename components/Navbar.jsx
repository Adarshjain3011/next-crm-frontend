'use client';

import { useSelector } from 'react-redux';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const user = useSelector((state) => state.user.data);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(true); // Clear all data
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-xl font-semibold">CRM Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.name || user.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 


