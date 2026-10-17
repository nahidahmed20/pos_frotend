// src/app/dashboard/page.jsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [report, setReport] = useState(null);
    const [lowStocks, setLowStocks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Live Clock
    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load Dashboard Data with optional branch filter
    const loadDashboard = async (branchId = '') => {
        if (loading) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const params = branchId ? { branch_id: branchId } : {};
            const [meRes, reportRes, lowStockRes, branchRes] = await Promise.all([
                axios.get('/api/me').catch(() => axios.get('/api/profile')),
                axios.get('/api/reports/dashboard', { params }).catch(() => ({ data: { data: {} } })),
                axios.get('/api/inventory/low-stocks', { params }).catch(() => ({ data: { data: [] } })),
                axios.get('/api/branches').catch(() => ({ data: { data: [] } })),
            ]);

            setUser(meRes.data?.user || meRes.data?.data || meRes.data);
            setReport(reportRes.data?.data || {});
            setLowStocks(lowStockRes.data?.data || []);
            setBranches(Array.isArray(branchRes.data?.data) ? branchRes.data.data : []);
        } catch (err) {
            console.error('Dashboard load error', err);
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard(selectedBranchId);
    }, [selectedBranchId]);

    const handleBranchChange = (e) => {
        setSelectedBranchId(e.target.value);
    };

    // Financial Metrics
    const salesTotal = Number(report?.sales_total || 0);
    const purchaseTotal = Number(report?.purchase_total || 0);
    const expenseTotal = Number(report?.expense_total || 0);
    const netProfit = salesTotal - purchaseTotal - expenseTotal;
    const todaySales = Number(report?.today_sales || 0);
    const todayOrders = Number(report?.today_orders || 0);
    const totalCustomers = Number(report?.total_customers || 0);
    const totalProducts = Number(report?.total_products || 0);

    // Weekly Trends calculation for graph
    const weeklyTrend = report?.weekly_trend || [];
    const maxGraphValue = useMemo(() => {
        if (!weeklyTrend || weeklyTrend.length === 0) return 1000;
        const maxVal = Math.max(
            ...weeklyTrend.map((d) => Math.max(Number(d.sales || 0), Number(d.purchases || 0))),
            500
        );
        return maxVal * 1.15; // 15% headroom
    }, [weeklyTrend]);

    // Payment methods calculation
    const paymentBreakdown = report?.payment_breakdown || {};
    const totalPaymentAmount = useMemo(() => {
        return Object.values(paymentBreakdown).reduce((sum, item) => sum + Number(item.total || 0), 0) || 1;
    }, [paymentBreakdown]);

    if (loading) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl animate-bounce mb-4">
                    <i className="ti ti-chart-pie-2" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">ড্যাশবোর্ড এনালাইটিক্স লোড হচ্ছে...</h3>
                <p className="text-xs text-slate-400 mt-1">রিয়েল-টাইম সেলস, স্টক ও রিপোর্ট ডাটা প্রসেস করা হচ্ছে।</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Top Greeting & Action Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                {/* Decorative background glows */}
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-48 -bottom-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-emerald-400 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                RETAIL INTELLIGENCE LIVE
                            </span>

                            {user?.role && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                                    {user.role}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                            স্বাগতম, {user?.name || 'অ্যাডমিনিস্ট্রেটর'}! <span className="inline-block animate-wave">👋</span>
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                            <span>অপারেটিং ব্রাঞ্চ: <strong className="text-white font-bold">{user?.branch?.name || 'মেইন ব্রাঞ্চ (হেড অফিস)'}</strong></span>
                            <span>•</span>
                            <span suppressHydrationWarning className="font-mono text-emerald-300 font-semibold flex items-center gap-1">
                                <i className="ti ti-clock" />
                                {mounted ? (currentTime || '00:00:00') : '00:00:00'}
                            </span>
                        </p>
                    </div>

                    {/* Right Action Buttons & Branch Selector */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Branch Filter for Super Admin */}
                        {user?.is_super_admin !== false && branches.length > 0 && (
                            <div className="relative">
                                <select
                                    value={selectedBranchId}
                                    onChange={handleBranchChange}
                                    className="bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-semibold px-3 py-2.5 outline-none cursor-pointer backdrop-blur-md transition-all"
                                >
                                    <option value="" className="text-slate-900">সবগুলো ব্রাঞ্চ (All Branches)</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id} className="text-slate-900">
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => loadDashboard(selectedBranchId)}
                            disabled={refreshing}
                            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                            title="Refresh Dashboard"
                        >
                            <i className={`ti ti-refresh text-base ${refreshing ? 'animate-spin' : ''}`} />
                        </button>

                        <Link
                            href="/pos"
                            className="px-5 py-2.5 bg-gradient-to-r from-primary to-orange-600 hover:from-primary-hover hover:to-orange-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                        >
                            <i className="ti ti-device-laptop text-lg" />
                            <span>Open POS Terminal</span>
                            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-white/20 rounded text-[10px] uppercase font-bold">F1</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Low Stock Warning Banner */}
            {lowStocks.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 flex-wrap shadow-xs animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm shadow-amber-500/30">
                            <i className="ti ti-alert-triangle" />
                        </span>
                        <div>
                            <p className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
                                স্টক অ্যালার্ট: {lowStocks.length}টি পণ্যের স্টক লিমিট শেষ বা প্রায় শেষ পর্যায়ে!
                            </p>
                            <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                                অতিসত্বর রিস্টক করতে সাপ্লায়ার পারচেজ অর্ডার তৈরি করুন।
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/inventory/low-stocks"
                        className="text-xs font-black text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>স্টক লিস্ট দেখুন</span>
                        <i className="ti ti-arrow-right" />
                    </Link>
                </div>
            )}

            {/* 4 PRIMARY FINANCIAL KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Sales */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">মোট বিক্রয় (Total Sales)</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            ৳{salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                            <i className="ti ti-receipt" /> {report?.sales_count || 0}টি সফল ইনভয়েস
                        </p>
                    </div>
                    <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform shadow-xs">
                        <i className="ti ti-shopping-cart" />
                    </div>
                </div>

                {/* 2. Total Purchases */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">মোট ক্রয় (Procurement)</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            ৳{purchaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-blue-600 font-bold mt-1.5 flex items-center gap-1">
                            <i className="ti ti-truck-delivery" /> {report?.purchase_count || 0}টি পারচেজ চালান
                        </p>
                    </div>
                    <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform shadow-xs">
                        <i className="ti ti-shopping-bag" />
                    </div>
                </div>

                {/* 3. Operating Expenses */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">পরিচালন ব্যয় (Expenses)</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            ৳{expenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-amber-600 font-bold mt-1.5 flex items-center gap-1">
                            <i className="ti ti-wallet" /> অফিস ও স্টাফ ব্যয়
                        </p>
                    </div>
                    <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform shadow-xs">
                        <i className="ti ti-receipt-2" />
                    </div>
                </div>

                {/* 4. Net Estimated Profit */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">আনুমানিক লাভ (Net Profit)</span>
                        <h3 className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            ৳{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1.5">বিক্রয় − ক্রয় − খরচ</p>
                    </div>
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform shadow-xs ${
                        netProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                    }`}>
                        <i className={netProfit >= 0 ? 'ti ti-trending-up' : 'ti ti-trending-down'} />
                    </div>
                </div>
            </div>

            {/* 4 SECONDARY METRIC COUNTER BADGES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center text-lg">
                        <i className="ti ti-calendar-event" />
                    </span>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">আজকের মোট বিক্রি</span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">
                            ৳{todaySales.toFixed(2)}
                        </h4>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-lg">
                        <i className="ti ti-checkup-list" />
                    </span>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">আজকের মোট অর্ডার</span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">
                            {todayOrders} টি
                        </h4>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-lg">
                        <i className="ti ti-packages" />
                    </span>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ক্যাটালগে সক্রিয় পণ্য</span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">
                            {totalProducts} টি আইটেম
                        </h4>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center text-lg">
                        <i className="ti ti-users-group" />
                    </span>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">রেজিস্টার্ড কাস্টমার</span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">
                            {totalCustomers} জন
                        </h4>
                    </div>
                </div>
            </div>

            {/* VISUAL ANALYTICS & PAYMENT BREAKDOWN (2 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. 7-Day Sales vs Purchases Flow Bar Chart (8 Cols) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <i className="ti ti-chart-bar text-primary text-base" />
                                সাপ্তাহিক লেনদেন বিশ্লেষণ (৭ দিনের সেলস ও পারচেজ)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">দৈনিক বিক্রি বনাম ক্রয়ের তুলনামূলক চার্ট</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-emerald-600">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> বিক্রি (Sales)
                            </span>
                            <span className="flex items-center gap-1.5 text-blue-600">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ক্রয় (Purchases)
                            </span>
                        </div>
                    </div>

                    {/* Interactive Responsive Bar Chart */}
                    <div className="pt-4 pb-2">
                        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
                            {weeklyTrend.map((day, idx) => {
                                const salesPct = Math.min(100, Math.round((Number(day.sales || 0) / maxGraphValue) * 100));
                                const purchPct = Math.min(100, Math.round((Number(day.purchases || 0) / maxGraphValue) * 100));

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                        {/* Hover Tooltip */}
                                        <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl pointer-events-none z-20 whitespace-nowrap">
                                            <p className="font-bold">{day.date} ({day.day})</p>
                                            <p className="text-emerald-400">বিক্রি: ৳{Number(day.sales || 0).toFixed(2)}</p>
                                            <p className="text-blue-400">ক্রয়: ৳{Number(day.purchases || 0).toFixed(2)}</p>
                                        </div>

                                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                                            {/* Sales Bar */}
                                            <div
                                                style={{ height: `${Math.max(6, salesPct)}%` }}
                                                className="w-1/2 max-w-[18px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all group-hover:brightness-110 shadow-2xs"
                                                title={`বিক্রি: ৳${day.sales}`}
                                            />
                                            {/* Purchase Bar */}
                                            <div
                                                style={{ height: `${Math.max(6, purchPct)}%` }}
                                                className="w-1/2 max-w-[18px] bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md transition-all group-hover:brightness-110 shadow-2xs"
                                                title={`ক্রয়: ৳${day.purchases}`}
                                            />
                                        </div>

                                        <div className="text-center">
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                                                {day.day}
                                            </span>
                                            <span className="text-[9px] text-slate-400 block font-medium">
                                                {day.date}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Payment Method Breakdown (4 Cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-700/60">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <i className="ti ti-wallet text-amber-500 text-base" />
                                পেমেন্ট মাধ্যম বণ্টন (Channels)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">কাস্টমারদের পেমেন্ট করার অনুপাত</p>
                        </div>

                        <div className="space-y-3.5 mt-4">
                            {[
                                { key: 'cash', label: 'নগদ (Cash)', icon: 'ti ti-cash', color: 'emerald', barColor: 'bg-emerald-500' },
                                { key: 'card', label: 'কার্ড (Card)', icon: 'ti ti-credit-card', color: 'blue', barColor: 'bg-blue-500' },
                                { key: 'mobile_banking', label: 'মোবাইল (bKash/Nagad)', icon: 'ti ti-device-mobile', color: 'purple', barColor: 'bg-purple-500' },
                                { key: 'due', label: 'বাকি (Due / Credit)', icon: 'ti ti-clock-pause', color: 'amber', barColor: 'bg-amber-500' },
                            ].map((channel) => {
                                const data = paymentBreakdown[channel.key] || { count: 0, total: 0 };
                                const pct = Math.round((Number(data.total || 0) / totalPaymentAmount) * 100);

                                return (
                                    <div key={channel.key} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <i className={`${channel.icon} text-slate-400`} />
                                                {channel.label}
                                            </span>
                                            <span className="font-black text-slate-900 dark:text-white">
                                                ৳{Number(data.total || 0).toFixed(2)} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                            <div
                                                style={{ width: `${Math.max(2, pct)}%` }}
                                                className={`h-full ${channel.barColor} transition-all duration-500 rounded-full`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                        <Link
                            href="/dashboard/reports/sales"
                            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            <span>বিস্তারিত সেলস রিপোর্ট দেখুন</span>
                            <i className="ti ti-arrow-right" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* RECENT SALES TABLE & TOP PRODUCTS (2 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Recent 5 Sales Invoices (8 Cols) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <i className="ti ti-receipt-2 text-primary text-base" />
                                সর্বশেষ বিক্রয় চালান (Recent Orders)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">কাউন্টার ও পিওএস থেকে সম্পন্ন হওয়া সাম্প্রতিক অর্ডার</p>
                        </div>
                        <Link
                            href="/dashboard/sales"
                            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            সবগুলো চালান <i className="ti ti-arrow-right" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        {(!report?.recent_sales || report.recent_sales.length === 0) ? (
                            <div className="py-12 text-center text-slate-400">
                                <i className="ti ti-inbox text-4xl mb-1 text-slate-300 dark:text-slate-600" />
                                <p className="text-xs font-semibold">কোনো সাম্প্রতিক বিক্রয় পাওয়া যায়নি।</p>
                                <Link href="/pos" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">
                                    পিওএস থেকে প্রথম বিক্রয় শুরু করুন →
                                </Link>
                            </div>
                        ) : (
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase tracking-wider font-bold">
                                        <th className="pb-2">ইনভয়েস #</th>
                                        <th className="pb-2">কাস্টমার</th>
                                        <th className="pb-2">তারিখ ও সময়</th>
                                        <th className="pb-2 text-right">টোটাল</th>
                                        <th className="pb-2 text-center">মাধ্যম</th>
                                        <th className="pb-2 text-center">স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                    {report.recent_sales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                                                {sale.invoice_number}
                                            </td>
                                            <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                                                {sale.customer_name}
                                                {sale.customer_phone !== '—' && (
                                                    <span className="block text-[10px] text-slate-400 font-normal">
                                                        {sale.customer_phone}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-slate-500">
                                                {sale.sold_at}
                                            </td>
                                            <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                                                ৳{sale.total.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                    {sale.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    sale.payment_status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                        : sale.payment_status === 'partial'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                                }`}>
                                                    {sale.payment_status === 'paid' ? 'পরিশোধিত' : sale.payment_status === 'partial' ? 'আংশিক' : 'বাকি'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right: Top Selling Products (4 Cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <i className="ti ti-flame text-orange-500 text-base" />
                                সর্বাধিক বিক্রিত পণ্য (Top Products)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">সবচেয়ে বেশি চাহিদাসম্পন্ন আইটেম</p>
                        </div>
                        <Link
                            href="/dashboard/products"
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            ক্যাটালগ →
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {(!report?.top_products || report.top_products.length === 0) ? (
                            <div className="py-12 text-center text-slate-400">
                                <i className="ti ti-box text-3xl mb-1 text-slate-300 dark:text-slate-600" />
                                <p className="text-xs font-semibold">এখনো বিক্রির ডাটা জমা হয়নি।</p>
                            </div>
                        ) : (
                            report.top_products.map((prod, idx) => (
                                <div key={prod.id} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                            idx === 0
                                                ? 'bg-amber-400 text-slate-900 shadow-2xs'
                                                : idx === 1
                                                ? 'bg-slate-300 text-slate-800'
                                                : idx === 2
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <div className="truncate">
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {prod.name}
                                            </h5>
                                            <span className="text-[10px] text-slate-400">
                                                {prod.category} · ৳{prod.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                                            {prod.quantity_sold} পিস
                                        </span>
                                        <span className="text-[10px] text-emerald-600 font-bold block">
                                            ৳{prod.revenue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* QUICK MODULE NAVIGATION GRID (8 Core Modules) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                            কোর বিজনেস অপারেশন মডিউল (Quick Access)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">দৈনন্দিন কাজের প্রধান টুলসসমূহ এক ক্লিকে এক্সেস করুন</p>
                    </div>
                    <Link
                        href="/dashboard/reports"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <span>সম্পূর্ণ এনালাইটিক্স</span>
                        <i className="ti ti-arrow-right" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                        { title: 'POS কাউন্টার', subtitle: 'বিলিং টার্মিনাল', icon: 'ti ti-device-laptop', href: '/pos', gradient: 'from-orange-500 to-amber-500' },
                        { title: 'বিক্রয় অর্ডার', subtitle: 'চালান তালিকা', icon: 'ti ti-receipt', href: '/dashboard/sales', gradient: 'from-emerald-500 to-teal-500' },
                        { title: 'পণ্য ক্যাটালগ', subtitle: 'নতুন পণ্য যোগ', icon: 'ti ti-box', href: '/dashboard/products', gradient: 'from-blue-500 to-indigo-500' },
                        { title: 'ক্রয় চালান', subtitle: 'সাপ্লায়ার পারচেজ', icon: 'ti ti-truck-delivery', href: '/dashboard/purchases', gradient: 'from-purple-500 to-pink-500' },
                        { title: 'কাস্টমার', subtitle: 'ক্রেতার তালিকা', icon: 'ti ti-users', href: '/dashboard/customers', gradient: 'from-cyan-500 to-blue-500' },
                        { title: 'সাপ্লায়ার', subtitle: 'পাইকারি মহাজন', icon: 'ti ti-building-store', href: '/dashboard/suppliers', gradient: 'from-rose-500 to-red-500' },
                        { title: 'ক্যাশ রেজিস্টার', subtitle: 'ড্রয়ার শিফট', icon: 'ti ti-cash', href: '/dashboard/cash-registers', gradient: 'from-teal-500 to-emerald-600' },
                        { title: 'রিপোর্টস', subtitle: 'লাভ-ক্ষতি ও স্টক', icon: 'ti ti-chart-pie', href: '/dashboard/reports', gradient: 'from-indigo-600 to-purple-600' },
                    ].map((mod, idx) => (
                        <Link
                            key={idx}
                            href={mod.href}
                            className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-primary hover:shadow-md transition-all text-center group bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer"
                        >
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${mod.gradient} text-white flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                                <i className={mod.icon} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors leading-tight">
                                {mod.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mod.subtitle}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}