// src/components/NavigationProgress.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import '@/lib/swal';

function closeAlertPopup(popup) {
    window.Swal?.close();
    window.setTimeout(() => {
        if (popup?.isConnected) popup.closest('.swal2-container')?.remove();
        if (!document.querySelector('.swal2-container')) {
            document.body.classList.remove('swal2-shown', 'swal2-height-auto', 'swal2-no-backdrop');
            document.documentElement.classList.remove('swal2-shown');
        }
    }, 300);
}

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [navigating, setNavigating] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigationTimers = useRef([]);
    const finishTimer = useRef(null);
    const isNavigating = useRef(false);
    const currentRoute = `${pathname}?${searchParams.toString()}`;
    const previousRoute = useRef(currentRoute);

    const clearNavigationTimers = () => {
        navigationTimers.current.forEach(clearTimeout);
        navigationTimers.current = [];
        if (finishTimer.current) clearTimeout(finishTimer.current);
    };

    const finishNavigation = () => {
        if (!isNavigating.current) return;
        clearNavigationTimers();
        setProgress(100);
        finishTimer.current = setTimeout(() => {
            isNavigating.current = false;
            setNavigating(false);
            setProgress(0);
            finishTimer.current = null;
        }, 650);
    };

    // Complete the bar when the URL changes, and clear its state after animation.
    useEffect(() => {
        if (previousRoute.current !== currentRoute) {
            previousRoute.current = currentRoute;
            finishNavigation();
        }
    }, [currentRoute]);

    // Listen for link clicks to provide instant visual feedback
    useEffect(() => {
        const handleLinkClick = (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button != null && e.button !== 0)) return;
            const anchor = e.target.closest?.('a');
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
                    clearNavigationTimers();
                    isNavigating.current = true;
                    setNavigating(true);
                    setProgress(20);
                    navigationTimers.current = [
                        setTimeout(() => setProgress(65), 180),
                        setTimeout(() => setProgress(85), 700),
                    ];
                    // Keep the indicator from getting stuck if navigation is cancelled
                    // or the router never reports a URL change.
                    finishTimer.current = setTimeout(finishNavigation, 5000);
                }
            }
        };

        document.addEventListener('click', handleLinkClick);
        return () => {
            document.removeEventListener('click', handleLinkClick);
            clearNavigationTimers();
        };
    }, []);

    // Global SweetAlert Toast Safeguard: Ensures error/info toasts ALWAYS auto-close within 4.5 seconds and have a close button & click-to-dismiss
    useEffect(() => {
        const patchSwal = () => {
            if (typeof window !== 'undefined' && window.Swal && window.Swal.__toastGuarded !== 'fixed-dismiss-v2') {
                window.Swal.__toastGuarded = 'fixed-dismiss-v2';
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
                            const dismissAfter = opts.timer;

                            const userDidOpen = opts.didOpen;
                            opts.didOpen = (toast) => {
                                toast.style.cursor = 'pointer';
                                toast.title = 'Click to close';
                                toast.onclick = () => {
                                    closeAlertPopup(toast);
                                };
                                if (userDidOpen) userDidOpen(toast);
                                // SweetAlert pauses its timer while hovered/focused. Use an
                                // independent timeout so an error toast cannot get stuck.
                                window.setTimeout(() => {
                                    if (toast.isConnected) closeAlertPopup(toast);
                                }, dismissAfter);
                            };
                        } else {
                            opts.showCloseButton = opts.showCloseButton ?? true;
                            opts.allowOutsideClick = opts.allowOutsideClick ?? true;
                            opts.allowEscapeKey = opts.allowEscapeKey ?? true;
                            if (opts.icon === 'error' && !opts.timer) {
                                opts.timer = 5000;
                                opts.timerProgressBar = true;
                            }
                            if (opts.icon === 'error' && opts.timer) {
                                const dismissAfter = opts.timer;
                                const userDidOpen = opts.didOpen;
                                opts.didOpen = (popup) => {
                                    if (userDidOpen) userDidOpen(popup);
                                    window.setTimeout(() => {
                                        if (popup.isConnected) closeAlertPopup(popup);
                                    }, dismissAfter);
                                };
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

    // Also guard the rendered popup itself. This still works if a page or a
    // legacy script calls its own SweetAlert instance and bypasses the wrapper.
    useEffect(() => {
        const dismissiblePopups = new WeakSet();
        const scanPopups = () => {
            document.querySelectorAll('.swal2-popup').forEach((popup) => {
                const shouldDismiss = popup.classList.contains('swal2-toast') ||
                    Boolean(popup.querySelector('.swal2-icon.swal2-error, .swal2-icon-error'));
                if (!shouldDismiss || dismissiblePopups.has(popup)) return;
                dismissiblePopups.add(popup);
                window.setTimeout(() => {
                    if (popup.isConnected) closeAlertPopup(popup);
                }, popup.classList.contains('swal2-toast') ? 4500 : 5000);
            });
        };

        const handlePopupClick = (event) => {
            const popup = event.target.closest?.('.swal2-popup');
            if (!popup) return;
            if (event.target.closest?.('.swal2-close') || popup.classList.contains('swal2-toast')) {
                event.preventDefault();
                event.stopPropagation();
                closeAlertPopup(popup);
            }
        };

        const observer = new MutationObserver(scanPopups);
        observer.observe(document.body, { childList: true, subtree: true });
        document.addEventListener('click', handlePopupClick, true);
        scanPopups();

        return () => {
            observer.disconnect();
            document.removeEventListener('click', handlePopupClick, true);
        };
    }, []);

    if (!navigating && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-all duration-300 ease-out"
            style={{
                width: '100%',
                right: 'auto',
                transform: `scaleX(${progress / 100})`,
                transformOrigin: 'left center',
                transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                background: 'linear-gradient(90deg, #f47721, #092c4c)',
                boxShadow: '0 0 10px rgba(244, 119, 33, 0.7)',
                opacity: 1,
            }}
        />
    );
}

