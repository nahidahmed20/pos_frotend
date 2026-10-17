'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function PurchaseTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        company_id: '',
        amount: '',
        payment_method: 'card',
        transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'completed',
    });

    const toast = (icon, text) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title: text,
                showConfirmButton: false,
                timer: 2600,
            });
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [txRes, comRes] = await Promise.all([
                axios.get('/api/purchase-transactions'),
                axios.get('/api/companies'),
            ]);
            setTransactions(txRes.data.data || []);
            setCompanies(comRes.data.data || []);
        } catch {
            toast('error', 'Failed to load purchase transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/purchase-transactions', {
                ...form,
                company_id: parseInt(form.company_id, 10),
                amount: parseFloat(form.amount) || 0,
            });
            toast('success', 'Transaction payment recorded successfully');
            setForm({
                company_id: '',
                amount: '',
                payment_method: 'card',
                transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                status: 'completed',
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not record transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = transactions.filter((t) =>
        JSON.stringify(t).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">SAAS BILLING AUDIT</span>
                    <h1>Subscription Transactions</h1>
                    <p>Track merchant subscription invoice payments, merchant checkouts, and gateway logs.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">RECORD PAYMENT</span>
                    <h2>Log Subscription Payment</h2>
                    <p>Enter collected SaaS subscription fee.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Company *</span>
                        <select
                            className="access-input"
                            value={form.company_id}
                            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                            required
                        >
                            <option value="">Select Tenant Company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Amount (৳) *</span>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                className="access-input font-bold"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="2500"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Method</span>
                            <select
                                className="access-input"
                                value={form.payment_method}
                                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                            >
                                <option value="card">Credit / Debit Card</option>
                                <option value="bank">Bank Wire</option>
                                <option value="bkash">bKash / Nagad</option>
                                <option value="cash">Direct Cash</option>
                            </select>
                        </label>
                    </div>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Gateway Txn ID *</span>
                        <input
                            type="text"
                            className="access-input font-mono"
                            value={form.transaction_id}
                            onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                            required
                        />
                    </label>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Payment Status</span>
                        <select
                            className="access-input"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="completed">Completed / Settled</option>
                            <option value="pending">Pending Settlement</option>
                            <option value="failed">Failed / Refunded</option>
                        </select>
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Recording...' : 'Record Payment'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* List */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">LEDGER</span>
                            <h2>
                                Transaction Logs <small className="resource-total">({transactions.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search Txn ID..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading transactions...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Txn #</th>
                                        <th>Company</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="font-mono font-bold text-gray-800">{tx.transaction_id}</td>
                                            <td className="font-bold text-gray-900">{tx.company?.name || 'Company'}</td>
                                            <td className="font-bold text-emerald-700">৳ {parseFloat(tx.amount).toLocaleString()}</td>
                                            <td className="capitalize">{tx.payment_method}</td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        tx.status === 'completed'
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {tx.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-xs text-gray-500">{tx.created_at?.slice(0, 10)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No subscription transactions recorded yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

