
'use client'

import React from "react";

import Sidebar from "../client/common/Sidebar";

export default function Layout({ children }) {

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 bg-gray-100 overflow-y-auto">
                <div className="p-6">{children}</div>
            </div>
        </div>

    )
}
