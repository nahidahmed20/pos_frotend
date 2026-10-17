'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function MoneyTransfersPage() {
    const [transfers, setTransfers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        transfer_date: new Date().toISOString().split('T')[0],
        reference: '',
        note: '',
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
            const [trRes, accRes] = await Promise.all([
                axios.get('/api/money-transfers'),
                axios.get('/api/accounts'),
            ]);
            setTransfers(trRes.data.data || []);
            setAccounts(accRes.data.data || []);
        } catch {
            toast('error', 'Failed to load transfer history or accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.from_account_id === form.to_account_id) {
            toast('error', 'From Account and To Account must be different.');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/money-transfers', {
                ...form,
                from_account_id: parseInt(form.from_account_id, 10),
                to_account_id: parseInt(form.to_account_id, 10),
                amount: parseFloat(form.amount) || 0,
            });
            toast('success', 'Money transferred and balances updated successfully!');
            setForm({
                from_account_id: '',
                to_account_id: '',
                amount: '',
                transfer_date: new Date().toISOString().split('T')[0],
                reference: '',
                note: '',
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Transfer failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = transfers.filter((t) =>
        JSON.stringify(t).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">TREASURY TRANSFERS</span>
                    <h1>Money Transfer</h1>
                    <p>Transfer liquidity between bank accounts, branches, and cash registers.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">INTER-ACCOUNT TRANSFER</span>
                    <h2>Execute Transfer</h2>
                    <p>Funds will immediately debit from source and credit to destination.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">From Account (Debit) *</span>
                        <select
                            className="access-input"
                            value={form.from_account_id}
                            onChange={(e) => setForm({ ...form, from_account_id: e.target.value })}
                            required
                        >
                            <option value="">Select Source Account</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} (Balance: ৳{parseFloat(acc.current_balance || 0).toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">To Account (Credit) *</span>
                        <select
                            className="access-input"
                            value={form.to_account_id}
                            onChange={(e) => setForm({ ...form, to_account_id: e.target.value })}
                            required
                        >
                            <option value="">Select Destination Account</option>
                            {accounts
                                .filter((acc) => acc.id !== parseInt(form.from_account_id, 10))
                                .map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} (Balance: ৳{parseFloat(acc.current_balance || 0).toLocaleString()})
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
                                placeholder="0.00"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Date *</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.transfer_date}
                                onChange={(e) => setForm({ ...form, transfer_date: e.target.value })}
                                required
                            />
                        </label>
                    </div>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Reference / Cheque #</span>
                        <input
                            type="text"
                            className="access-input"
                            value={form.reference}
                            onChange={(e) => setForm({ ...form, reference: e.target.value })}
                            placeholder="e.g. TR-89213"
                        />
                    </label>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Transfer Note</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            placeholder="Reason for transfer..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Transferring...' : 'Transfer Funds'}
                        <i className="ti ti-arrows-left-right ml-1" />
                    </button>
                </form>

                {/* Transfer History */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">HISTORY</span>
                            <h2>
                                Transfer Log <small className="resource-total">({transfers.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading transfer history...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>From (Debit)</th>
                                        <th>To (Credit)</th>
                                        <th>Amount</th>
                                        <th>Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((t) => (
                                        <tr key={t.id}>
                                            <td>{t.transfer_date}</td>
                                            <td className="font-bold text-red-700">
                                                {t.from_account?.name || 'Account'}
                                            </td>
                                            <td className="font-bold text-green-700">
                                                {t.to_account?.name || 'Account'}
                                            </td>
                                            <td className="font-bold text-gray-900 text-sm">
                                                ৳ {parseFloat(t.amount).toLocaleString()}
                                            </td>
                                            <td className="font-mono text-xs text-gray-600">
                                                {t.reference || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No money transfers logged yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

