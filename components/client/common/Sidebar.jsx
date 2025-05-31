'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ClipboardList,
    FileText,
    Users,
    PlusCircle,
} from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();

    const menuItems = [
        { name: 'Customer Enquiry Dashboard', icon: <ClipboardList size={20} />, path: '/client-dashboard' },
        { name: 'Order Dashboard', icon: <FileText size={20} />, path: '/order-dashboard' },
        { name: 'Invoice Form', icon: <FileText size={20} />, path: '/invoice-form' },
        { name: 'User Management', icon: <Users size={20} />, path: '/team-management' },
        { name: 'Create New Enquiry', icon: <PlusCircle size={20} />, path: '/create-new-enquery' },
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col shadow-xl">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-center tracking-wide">CRM Dashboard</h1>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => router.push(item.path)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-all duration-200 group"
                    >
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400 group-hover:text-white transition duration-200">
                            {item.icon}
                        </span>
                        <p className="text-sm pt-2 font-medium flex justify-center items-center group-hover:text-white">
                            {item.name}
                        </p>
                    </div>

                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
                <p>&copy; 2025 CRM System</p>
            </div>
        </div>
    );
}


