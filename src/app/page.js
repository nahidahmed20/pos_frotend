// src/app/page.js
'use client';

import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('pos_token');
            if (token) {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/login';
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1527] text-white">
            <div className="w-12 h-12 border-4 border-[#f47721] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-300">DreamsPOS লোড হচ্ছে...</p>
        </div>
    );
}
