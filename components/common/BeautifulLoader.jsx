
'use client';
import React from 'react';

export default function BeautifulLoader() {
    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-white animate-spin-slow" />
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full shadow-md animate-bounce-slow transform -translate-x-1/2" />
            </div>
        </div>
    );
}


