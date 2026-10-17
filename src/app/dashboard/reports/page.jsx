'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function ReportsPage() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await axios.get('/api/reports/dashboard');
            setReport(res.data?.data || null);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const salesTotal = Number(report?.sales_total || 0);
    const purchaseTotal = Number(report?.purchase_total || 0);
    const expenseTotal = Number(report?.expense_total || 0);
    const grossMargin = salesTotal - purchaseTotal;
    const netProfit = grossMargin - expenseTotal;

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">BUSINESS INTELLIGENCE</span>
                    <h1>Financial & Sales Reports</h1>
                    <p>Live revenue performance, gross margin, operating expenses, and financial health.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh Metrics
                </button>
            </div>

            {loading ? (
                <div className="access-empty">
                    <i className="ti ti-loader-2 animate-spin text-3xl text-emerald-600" />
                    <p>Calculating financial metrics...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
                    <i className="ti ti-alert-triangle text-3xl text-rose-600 mb-2 inline-block" />
                    <p className="font-bold text-rose-800 dark:text-rose-300">Could not load report data</p>
                    <p className="text-xs text-rose-600 mt-1">
                        Please check if your account has 'view reports' permission or try again.
                    </p>
                    <button
                        type="button"
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Key Metric KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Sales Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                                <i className="ti ti-chart-arrows" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                                    ৳{salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                    {report.sales_count || 0} completed orders
                                </p>
                            </div>
                        </div>

                        {/* Purchases Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-2xl font-bold">
                                <i className="ti ti-shopping-bag" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Purchases</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                                    ৳{purchaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                                    {report.purchase_count || 0} procurement orders
                                </p>
                            </div>
                        </div>

                        {/* Expenses Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-2xl font-bold">
                                <i className="ti ti-receipt-2" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating Expenses</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                                    ৳{expenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-xs text-amber-600 font-semibold mt-0.5">Disbursed costs</p>
                            </div>
                        </div>

                        {/* Net Estimated Profit */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                                    netProfit >= 0
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                                }`}
                            >
                                <i className={netProfit >= 0 ? 'ti ti-trending-up' : 'ti ti-trending-down'} />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Estimated Profit</span>
                                <h3
                                    className={`text-xl font-black mt-0.5 ${
                                        netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                >
                                    ৳{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Sales - Cost - Expenses</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Reports Quick Navigation Hub */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                            Financial Statements & Analytics Breakdown
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Link
                                href="/dashboard/accounts/balance-sheet"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                                        <i className="ti ti-scale" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-600">
                                            Balance Sheet
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Assets, liabilities, and equity</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/accounts/balance-sheet"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                                        <i className="ti ti-cash-banknote" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600">
                                            Cash Flow Statement
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Cash inflows and disbursements</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/invoices"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                                        <i className="ti ti-file-invoice" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-purple-600">
                                            Invoices & Receipts
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Customer billing archive</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/inventory/low-stocks"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                                        <i className="ti ti-trending-down" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-rose-600">
                                            Low Stocks Alert
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Critical reorder quantities</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/inventory/expired-products"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                                        <i className="ti ti-alert-triangle" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                                            Expired Batches
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Batch expiration audit</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/purchases/returns"
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                                        <i className="ti ti-receipt-refund" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-slate-900">
                                            Purchase Returns
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Vendor returns & credit notes</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
