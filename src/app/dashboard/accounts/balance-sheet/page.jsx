'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function FinancialStatementsPage() {
    const [tab, setTab] = useState('balance-sheet');
    const [balanceSheet, setBalanceSheet] = useState(null);
    const [trialBalance, setTrialBalance] = useState(null);
    const [cashFlow, setCashFlow] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bsRes, tbRes, cfRes] = await Promise.all([
                axios.get('/api/accounts-balance-sheet'),
                axios.get('/api/accounts-trial-balance'),
                axios.get('/api/accounts-cash-flow'),
            ]);
            setBalanceSheet(bsRes.data);
            setTrialBalance(tbRes.data);
            setCashFlow(cfRes.data);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load statements', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">FINANCIAL REPORTING</span>
                    <h1>Financial Statements</h1>
                    <p>Audit balance sheet assets, liabilities, trial balance, and real cash flow.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="access-tabs mb-6">
                <button
                    type="button"
                    className={tab === 'balance-sheet' ? 'active' : ''}
                    onClick={() => setTab('balance-sheet')}
                >
                    <i className="ti ti-scale" /> Balance Sheet
                </button>
                <button
                    type="button"
                    className={tab === 'cash-flow' ? 'active' : ''}
                    onClick={() => setTab('cash-flow')}
                >
                    <i className="ti ti-zoom-money" /> Cash Flow Statement
                </button>
                <button
                    type="button"
                    className={tab === 'trial-balance' ? 'active' : ''}
                    onClick={() => setTab('trial-balance')}
                >
                    <i className="ti ti-report-money" /> Trial Balance
                </button>
            </div>

            {loading ? (
                <div className="access-empty">
                    <i className="ti ti-loader-2 animate-spin text-2xl" />
                    <p>Generating financial accounting report...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* TAB 1: BALANCE SHEET */}
                    {tab === 'balance-sheet' && balanceSheet && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assets */}
                            <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                                <span className="access-kicker text-emerald-600">CURRENT ASSETS</span>
                                <h2 className="text-xl font-extrabold text-gray-900 mt-1 mb-4">Total Assets</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Bank & Cash In Hand</span>
                                        <span className="font-bold">৳ {balanceSheet.assets?.bank_and_cash?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Accounts Receivable (Customers Due)</span>
                                        <span className="font-bold">৳ {balanceSheet.assets?.accounts_receivable?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-3 font-extrabold text-emerald-700 text-base border-t-2 border-emerald-500">
                                        <span>Total Assets</span>
                                        <span>৳ {balanceSheet.assets?.total_assets?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Liabilities & Equity */}
                            <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                                <span className="access-kicker text-red-600">OBLIGATIONS & EQUITY</span>
                                <h2 className="text-xl font-extrabold text-gray-900 mt-1 mb-4">Liabilities & Net Worth</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Accounts Payable (Suppliers Due)</span>
                                        <span className="font-bold text-red-600">৳ {balanceSheet.liabilities?.accounts_payable?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Total Liabilities</span>
                                        <span className="font-bold text-red-600">৳ {balanceSheet.liabilities?.total_liabilities?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-3 font-extrabold text-[#f47721] text-base border-t-2 border-[#f47721]">
                                        <span>Owner's Equity (Net Position)</span>
                                        <span>৳ {balanceSheet.equity?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CASH FLOW */}
                    {tab === 'cash-flow' && cashFlow && (
                        <div className="access-panel p-6 bg-white rounded-xl shadow-sm max-w-3xl">
                            <span className="access-kicker text-blue-600">LIQUIDITY MOVEMENT</span>
                            <h2 className="text-xl font-extrabold text-gray-900 mt-1 mb-6">Cash Inflows & Outflows</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-xs font-bold text-green-700 block mb-1">CASH INFLOWS</span>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span>Sales Collections:</span>
                                            <span className="font-bold">৳ {cashFlow.cash_inflow?.sales?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Other Income:</span>
                                            <span className="font-bold">৳ {cashFlow.cash_inflow?.other_income?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-green-300 font-extrabold text-green-800">
                                            <span>Total Inflow:</span>
                                            <span>৳ {cashFlow.cash_inflow?.total_inflow?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <span className="text-xs font-bold text-red-700 block mb-1">CASH OUTFLOWS</span>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span>Purchases Paid:</span>
                                            <span className="font-bold">৳ {cashFlow.cash_outflow?.purchases?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Operating Expenses:</span>
                                            <span className="font-bold">৳ {cashFlow.cash_outflow?.expenses?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-red-300 font-extrabold text-red-800">
                                            <span>Total Outflow:</span>
                                            <span>৳ {cashFlow.cash_outflow?.total_outflow?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                                <div>
                                    <strong className="text-sm text-gray-800 block">Net Cash Flow</strong>
                                    <small className="text-gray-500">Net change in liquidity</small>
                                </div>
                                <span
                                    className={`text-xl font-extrabold ${
                                        cashFlow.net_cash_flow >= 0 ? 'text-green-700' : 'text-red-600'
                                    }`}
                                >
                                    ৳ {cashFlow.net_cash_flow?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: TRIAL BALANCE */}
                    {tab === 'trial-balance' && trialBalance && (
                        <div className="access-panel p-6 bg-white rounded-xl shadow-sm max-w-4xl">
                            <span className="access-kicker text-purple-600">GENERAL LEDGER</span>
                            <h2 className="text-xl font-extrabold text-gray-900 mt-1 mb-4">Trial Balance Summary</h2>

                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Account / Ledger Head</th>
                                        <th className="text-right">Debit (৳)</th>
                                        <th className="text-right">Credit (৳)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-semibold">Cash & Bank Accounts</td>
                                        <td className="text-right font-bold text-green-700">
                                            ৳ {parseFloat(trialBalance.bank_and_cash || 0).toLocaleString()}
                                        </td>
                                        <td className="text-right text-gray-400">—</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">Accounts Receivable (Customers Due)</td>
                                        <td className="text-right font-bold text-green-700">
                                            ৳ {parseFloat(trialBalance.receivables || 0).toLocaleString()}
                                        </td>
                                        <td className="text-right text-gray-400">—</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">Accounts Payable (Suppliers Due)</td>
                                        <td className="text-right text-gray-400">—</td>
                                        <td className="text-right font-bold text-red-600">
                                            ৳ {parseFloat(trialBalance.payables || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">Cumulative Sales Revenue</td>
                                        <td className="text-right text-gray-400">—</td>
                                        <td className="text-right font-bold text-red-600">
                                            ৳ {parseFloat(trialBalance.sales_revenue || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">Operating Expenses</td>
                                        <td className="text-right font-bold text-green-700">
                                            ৳ {parseFloat(trialBalance.expenses || 0).toLocaleString()}
                                        </td>
                                        <td className="text-right text-gray-400">—</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

