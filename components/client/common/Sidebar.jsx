'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    FileText,
    Users,
    PlusCircle,
    LogOut,
    Receipt,
    ChevronLeft,
    UserCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch } from 'react-redux';
import { clearUser } from '@/app/store/slice/userSlice';
import { cn } from "@/lib/utils";

import { useRole } from '@/app/hooks/useRole';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { isAdmin, isSales, isAuthenticated } = useRole();

    // Hide sidebar on login page or when user is not authenticated
    if (!isAuthenticated || pathname === '/auth/login') {
        return null;
    }

    const menuItems = [
        {
            name: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            path: '/dashboard',
            roles: ['admin', 'sales'],
        },
        {
            name: 'Customer Enquiry',
            icon: <LayoutDashboard size={20} />,
            path: '/client-dashboard',
            roles: ['admin', 'sales'],
        },
        {
            name: 'Orders',
            icon: <ClipboardList size={20} />,
            path: '/order-dashboard',
            roles: ['admin', 'sales'],
        },
        {
            name: 'Invoices',
            icon: <Receipt size={20} />,
            path: '/all-invoices',
            roles: ['admin'],
        },
        {
            name: 'Create Invoice',
            icon: <FileText size={20} />,
            path: '/invoice-form',
            roles: ['admin'],
        },
        {
            name: 'Team',
            icon: <Users size={20} />,
            path: '/team-management',
            roles: ['admin'],
        },
        {
            name: 'New Enquiry',
            icon: <PlusCircle size={20} />,
            path: '/create-new-enquery',
            roles: ['admin', 'sales'],
        },
        {
            name: 'My Profile',
            icon: <UserCircle size={20} />,
            path: '/profile',
            roles: ['admin', 'sales'],
        },
    ];

    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter(item => {
        if (isAdmin) return true;
        if (isSales) return item.roles.includes('sales');
        return false;
    });

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(clearUser());
            router.push('/auth/login');
        }
    };

    return (
        <div className={cn(
            "relative h-screen bg-gray-900 text-white flex flex-col shadow-xl transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-gray-800 rounded-full p-1 hover:bg-gray-700 transition-colors"
            >
                <ChevronLeft className={cn(
                    "h-4 w-4 transition-transform",
                    isCollapsed && "rotate-180"
                )} />
            </button>

            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    {/* <Avatar className="h-8 w-8">
                        <AvatarImage src="/logo.png" alt="Logo" />
                        <AvatarFallback>MI</AvatarFallback>
                    </Avatar> */}
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-sm font-semibold">Mayuri International</h1>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4">
                <div className="px-2">
                    {filteredMenuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <div
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 mb-1",
                                    "hover:bg-gray-800/50",
                                    isActive ? "bg-gray-800 text-white" : "text-gray-400"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center transition-colors",
                                    isActive && "text-white"
                                )}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && (
                                    <span className="text-sm font-medium">{item.name}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Logout Button */}
            <div className="p-2 border-t border-gray-800">
                <Button
                    variant="destructive"
                    className={cn(
                        "w-full bg-red-600 hover:bg-red-700",
                        isCollapsed ? "p-2" : "px-4 py-2"
                    )}
                    onClick={handleLogout}
                >
                    <LogOut size={16} className={cn(isCollapsed ? "" : "mr-2")} />
                    {!isCollapsed && "Logout"}
                </Button>
            </div>
        </div>
    );
}




