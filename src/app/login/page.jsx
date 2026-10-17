// src/app/login/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from '@/lib/swal';

export default function Login() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [appInfo, setAppInfo] = useState({
        app_name: 'DreamsPOS',
        company_name: 'DreamsPOS Retail',
        tagline: 'RETAIL INTELLIGENCE',
        logo_url: '/assets/img/logo-white.svg',
        logo_dark: '/assets/img/logo.svg',
        hero_title: 'আপনার পুরো ব্যবসা, এক নিপুণ নিয়ন্ত্রণে।',
        hero_subtitle: 'দ্রুততম চেকআউট, রিয়েল-টাইম স্টক আপডেট এবং সমন্বিত মাল্টি-ব্রাঞ্চ সেলস ম্যানেজমেন্ট সিস্টেম।',
        support_email: 'support@dreamspos.com',
        currency_symbol: '৳',
        version: 'DreamsPOS v2.4 Enterprise',
        copyright: `© ${new Date().getFullYear()} DreamsPOS • সর্বস্বত্ব সংরক্ষিত`,
        live_stats: {
            today_sales: 148450,
            completed_orders: 94,
            connected_branches: 2,
            print_speed: '০.৪ সে.',
        },
        demo_accounts: [
            { role: 'সুপার অ্যাডমিন', email: 'admin@gmail.com', password: 'password123' },
            { role: 'ব্রাঞ্চ অ্যাডমিন', email: 'branchadmin@gmail.com', password: 'password123' }
        ]
    });

    // Check if user is already logged in; if so, redirect directly to dashboard
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('pos_token');
            if (token) {
                axios.get('/api/me')
                    .then(() => {
                        window.location.href = '/dashboard';
                    })
                    .catch((err) => {
                        if (err.response?.status === 401) {
                            localStorage.removeItem('pos_token');
                        }
                        setCheckingAuth(false);
                    });
                return;
            }
        }
        setCheckingAuth(false);
    }, []);

    // Fetch dynamic app branding and live statistics from API
    useEffect(() => {
        axios.get('/api/app-info')
            .then((res) => {
                const data = res.data?.data || res.data;
                if (data) {
                    setAppInfo((prev) => ({ ...prev, ...data }));
                }
            })
            .catch((err) => {
                console.warn('Could not load dynamic app-info, using defaults:', err);
            });
    }, []);

    const toBengaliNumber = (num) => {
        const banglaDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        return String(num).replace(/[0-9]/g, (w) => banglaDigits[w] || w);
    };

    // Load saved email if 'Remember me' was previously checked
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('pos_remembered_email');
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        }
    }, []);

    // Caps Lock state detector
    const checkCapsLock = (e) => {
        if (e.getModifierState) {
            setCapsLock(e.getModifierState('CapsLock'));
        }
    };

    const toastSwal = (icon, title, text) => {
        Swal.fire({
            icon,
            title,
            text,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#f47721',
            timer: 5000,
            timerProgressBar: true,
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('error');
        setLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
            const errText = 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।';
            setMessage(errText);
            setLoading(false);
            toastSwal('warning', 'তথ্য অপূর্ণ', errText);
            return;
        }

        try {
            // Direct token-based REST login
            const response = await axios.post('/api/login', { email: cleanEmail, password: cleanPassword });
            const token = response.data?.token;

            if (!token) {
                throw new Error('No token received');
            }

            window.localStorage.setItem('pos_token', token);

            if (rememberMe) {
                localStorage.setItem('pos_remembered_email', cleanEmail);
            } else {
                localStorage.removeItem('pos_remembered_email');
            }
            
            setMessageType('success');
            setMessage('লগইন সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...');
            toastSwal('success', 'লগইন সফল!', 'ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
            
            setTimeout(() => {
                router.push('/dashboard');
            }, 800);
        } catch (error) {
            console.error('Login error:', error);
            const status = error.response?.status;
            const backendMsg = error.response?.data?.message;
            const backendErrors = error.response?.data?.errors;
            let errorMessage = 'সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি। ব্যাকএন্ড চেক করুন।';

            if (status === 422 || status === 401) {
                if (backendErrors?.email?.[0]) {
                    errorMessage = backendErrors.email[0];
                } else if (backendErrors?.password?.[0]) {
                    errorMessage = backendErrors.password[0];
                } else {
                    errorMessage = backendMsg || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক তথ্য দিন।';
                }
                if (errorMessage.includes('credentials are incorrect')) {
                    errorMessage = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।';
                }
            } else if (status === 419) {
                errorMessage = 'সিকিউরিটি সেশনের মেয়াদ শেষ হয়েছে। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।';
            } else if (error.message?.includes('Network Error') || error.code === 'ECONNABORTED') {
                errorMessage = 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে ব্যাকএন্ড চেক করুন।';
            }

            setMessage(errorMessage);
            setLoading(false);
            toastSwal('error', 'লগইন ব্যর্থ হয়েছে', errorMessage);
        }
    };

    // Quick demo credential autofill for fast testing
    const fillDemo = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setMessage('');
    };

    if (checkingAuth) {
        return (
            <div className="account-page login-page min-h-screen flex flex-col items-center justify-center bg-[#0d1527] text-white">
                <div className="w-12 h-12 border-4 border-[#f47721] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-300">সেশন যাচাই করা হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className="account-page login-page min-h-screen">
            <div className="login-shell">
                {/* Visual Showcase Panel (Left) */}
                <section className="login-visual" aria-label="DreamsPOS Features">
                    <div className="login-visual-ambient-one" aria-hidden="true"></div>
                    <div className="login-visual-ambient-two" aria-hidden="true"></div>
                    <div className="login-visual-grid" aria-hidden="true"></div>

                    {/* Top Branding */}
                    <div className="login-brand">
                        <img src={appInfo.logo_url || "/assets/img/logo-white.svg"} alt={appInfo.company_name} className="login-visual-logo" />
                        <span className="login-brand-tag">{appInfo.tagline}</span>
                    </div>

                    {/* Hero Content */}
                    <div className="login-visual-copy">
                        <div className="login-eyebrow-pill">
                            <span className="login-pulse-dot"></span>
                            <span>NEXT-GEN POS & INVENTORY</span>
                        </div>
                        <h1>
                            {appInfo.hero_title}
                        </h1>
                        <p>
                            {appInfo.hero_subtitle}
                        </p>

                        {/* Interactive Live POS Showcase Card */}
                        <div className="login-showcase-card">
                            <div className="login-showcase-header">
                                <div className="login-showcase-badge">
                                    <i className="ti ti-device-desktop-analytics" aria-hidden="true"></i>
                                    <span>লাইভ পয়েন্ট-অব-সেল</span>
                                </div>
                                <div className="login-live-indicator">
                                    <span className="live-dot"></span>
                                    <span>কাউন্টার ০১ • সক্রিয়</span>
                                </div>
                            </div>

                            <div className="login-showcase-body">
                                <div className="showcase-stat-block">
                                    <span className="stat-label">আজকের মোট বিক্রি</span>
                                    <div className="stat-amount-row">
                                        <span className="stat-currency">{appInfo.currency_symbol || '৳'}</span>
                                        <span className="stat-amount">
                                            {toBengaliNumber(new Intl.NumberFormat('en-IN').format(appInfo.live_stats?.today_sales || 0))}
                                        </span>
                                        <span className="stat-growth-tag">
                                            <i className="ti ti-trending-up" aria-hidden="true"></i> লাইভ
                                        </span>
                                    </div>
                                </div>

                                <div className="showcase-progress-wrap">
                                    <div className="showcase-progress-bar" style={{ width: '74%' }}></div>
                                </div>

                                <div className="showcase-metrics-grid">
                                    <div className="metric-item">
                                        <i className="ti ti-receipt-2" aria-hidden="true"></i>
                                        <div>
                                            <strong>{toBengaliNumber(appInfo.live_stats?.completed_orders || 0)} টি</strong>
                                            <small>কমপ্লিট অর্ডার</small>
                                        </div>
                                    </div>
                                    <div className="metric-item">
                                        <i className="ti ti-bolt" aria-hidden="true"></i>
                                        <div>
                                            <strong>{appInfo.live_stats?.print_speed || '০.৪ সে.'}</strong>
                                            <small>গড় প্রিন্ট গতি</small>
                                        </div>
                                    </div>
                                    <div className="metric-item">
                                        <i className="ti ti-building-store" aria-hidden="true"></i>
                                        <div>
                                            <strong>{toBengaliNumber(appInfo.live_stats?.connected_branches || 1)} টি</strong>
                                            <small>কানেক্টেড ব্রাঞ্চ</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="login-feature-list">
                            <span><i className="ti ti-scan" aria-hidden="true"></i> দ্রুত বারকোড স্ক্যানিং</span>
                            <span><i className="ti ti-package" aria-hidden="true"></i> ইনস্ট্যান্ট স্টক সিঙ্ক</span>
                            <span><i className="ti ti-shield-check" aria-hidden="true"></i> নিরাপদ রোল পারমিশন</span>
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="login-visual-bottom">
                        <div className="login-status-pill">
                            <span className="login-stat-dot"></span>
                            <span>ক্লাউড সার্ভার সক্রিয় (৯৯.৯% আপটাইম)</span>
                        </div>
                        <span className="login-version-tag">{appInfo.version}</span>
                    </div>
                </section>

                {/* Login Form Panel (Right) */}
                <section className="login-panel">
                    <div className="login-content">
                        {/* Mobile Brand */}
                        <div className="login-mobile-brand">
                            <img src={appInfo.logo_dark || "/assets/img/logo.svg"} alt={appInfo.company_name} />
                            <span>{appInfo.tagline}</span>
                        </div>

                        {/* Security Tag */}
                        <div className="login-security-note">
                            <i className="ti ti-shield-lock" aria-hidden="true"></i>
                            <span>SECURE ENTERPRISE SIGN IN</span>
                        </div>

                        {/* Form Header */}
                        <div className="login-userheading">
                            <span className="login-form-kicker">WELCOME BACK</span>
                            <h2>লগইন করুন</h2>
                            <p>আপনার ইউজার অ্যাকাউন্টে প্রবেশ করতে ক্রেডেনশিয়াল দিন।</p>
                        </div>

                        {/* Alert Message */}
                        {message && (
                            <div className={`login-message ${messageType === 'success' ? 'is-success' : 'is-error'}`} role="alert">
                                <i className={messageType === 'success' ? 'ti ti-circle-check' : 'ti ti-alert-triangle'} aria-hidden="true"></i>
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} noValidate>
                            {/* Email Field */}
                            <div className="login-field">
                                <label htmlFor="email">
                                    ইমেইল ঠিকানা <span className="field-required">*</span>
                                </label>
                                <div className="login-input-wrap">
                                    <i className="ti ti-mail" aria-hidden="true"></i>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="login-field">
                                <div className="login-label-row">
                                    <label htmlFor="password">
                                        পাসওয়ার্ড <span className="field-required">*</span>
                                    </label>
                                    <Link href="/forgot-password" className="login-forgot-link">
                                        ভুলে গেছেন?
                                    </Link>
                                </div>
                                <div className="login-input-wrap">
                                    <i className="ti ti-lock" aria-hidden="true"></i>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyUp={checkCapsLock}
                                        onKeyDown={checkCapsLock}
                                        placeholder="আপনার পাসওয়ার্ড লিখুন"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="login-password-toggle"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                                        aria-pressed={showPassword}
                                        tabIndex={-1}
                                    >
                                        <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'} aria-hidden="true"></i>
                                    </button>
                                </div>

                                {/* Caps Lock Active Warning */}
                                {capsLock && (
                                    <div className="login-caps-warning">
                                        <i className="ti ti-alert-circle" aria-hidden="true"></i>
                                        <span>সতর্কতা: <strong>Caps Lock</strong> চালু রয়েছে!</span>
                                    </div>
                                )}
                            </div>

                            {/* Remember Me & Demo Fill Helpers */}
                            <div className="login-actions-row">
                                <label className="login-remember-wrap">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>আমাকে মনে রাখুন</span>
                                </label>

                                <div className="login-demo-helpers">
                                    <span className="demo-label">ডেমো:</span>
                                    {appInfo.demo_accounts?.map((demo, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className="demo-chip"
                                            onClick={() => fillDemo(demo.email, demo.password)}
                                            title={`${demo.role} ডেমো ফিল করুন`}
                                        >
                                            {demo.role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`login-submit ${loading ? 'is-loading' : ''}`}
                            >
                                <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
                                <i className={loading ? 'ti ti-loader-2 login-spinner' : 'ti ti-arrow-right'} aria-hidden="true"></i>
                            </button>

                            {/* Security Assurance */}
                            <div className="login-form-assurance">
                                <i className="ti ti-shield-check" aria-hidden="true"></i>
                                <span>256-Bit SSL এনক্রিপশন ও সিকিউর সেশন প্রটেক্টেড</span>
                            </div>

                            {/* Footer */}
                            <div className="login-footer">
                                <p>{appInfo.copyright}</p>
                                <div className="login-footer-links">
                                    <span>সহায়তা প্রয়োজন?</span>
                                    <a href={`mailto:${appInfo.support_email}`}>{appInfo.support_email}</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}