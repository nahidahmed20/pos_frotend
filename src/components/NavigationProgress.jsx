// src/components/NavigationProgress.jsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [navigating, setNavigating] = useState(false);
    const [progress, setProgress] = useState(0);

    // Reset when pathname or searchParams change (navigation finished)
    useEffect(() => {
        if (navigating) {
            setProgress(100);
            const timer = setTimeout(() => {
                setNavigating(false);
                setProgress(0);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [pathname, searchParams]);

    // Listen for link clicks to provide instant visual feedback
    useEffect(() => {
        const handleLinkClick = (e) => {
            const anchor = e.target.closest('a');
            if (
                anchor &&
                anchor.href &&
                anchor.target !== '_blank' &&
                !anchor.hasAttribute('download') &&
                !anchor.href.startsWith('mailto:') &&
                !anchor.href.startsWith('tel:') &&
                anchor.origin === window.location.origin
            ) {
                const targetUrl = new URL(anchor.href);
                if (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search) {
                    setNavigating(true);
                    setProgress(25);
                    const t1 = setTimeout(() => setProgress(65), 150);
                    const t2 = setTimeout(() => setProgress(85), 400);
                    return () => {
                        clearTimeout(t1);
                        clearTimeout(t2);
                    };
                }
            }
        };

        document.addEventListener('click', handleLinkClick);
        return () => document.removeEventListener('click', handleLinkClick);
    }, []);

    // Global SweetAlert Toast Safeguard: Ensures error/info toasts ALWAYS auto-close within 4.5 seconds and have a close button & click-to-dismiss
    useEffect(() => {
        const patchSwal = () => {
            if (typeof window !== 'undefined' && window.Swal && !window.Swal.__toastGuarded) {
                window.Swal.__toastGuarded = true;
                const originalFire = window.Swal.fire.bind(window.Swal);
                window.Swal.fire = function (...args) {
                    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
                        const opts = { ...args[0] };
                        const isToast = Boolean(opts.toast || opts.position === 'top-end' || opts.position === 'top-right');

                        if (isToast) {
                            opts.toast = true;
                            opts.position = opts.position || 'top-end';
                            opts.showConfirmButton = opts.showConfirmButton ?? false;
                            opts.showCloseButton = true;
                            opts.timer = opts.timer ?? 4500;
                            opts.timerProgressBar = opts.timerProgressBar ?? true;

                            const userDidOpen = opts.didOpen;
                            opts.didOpen = (toast) => {
                                toast.style.cursor = 'pointer';
                                toast.title = 'Click to close';
                                toast.onclick = () => {
                                    window.Swal.close();
                                };
                                if (userDidOpen) userDidOpen(toast);
                            };
                        } else {
                            opts.showCloseButton = opts.showCloseButton ?? true;
                            opts.allowOutsideClick = opts.allowOutsideClick ?? true;
                            opts.allowEscapeKey = opts.allowEscapeKey ?? true;
                            if (opts.icon === 'error' && !opts.timer) {
                                opts.timer = 5000;
                                opts.timerProgressBar = true;
                            }
                        }
                        return originalFire(opts);
                    }
                    return originalFire(...args);
                };
            }
        };

        patchSwal();
        const interval = setInterval(patchSwal, 400);
        return () => clearInterval(interval);
    }, []);

    if (!navigating && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-all duration-300 ease-out"
            style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #f47721, #092c4c)',
                boxShadow: '0 0 10px rgba(244, 119, 33, 0.7)',
                opacity: progress === 100 ? 0 : 1,
            }}
        />
    );
}

