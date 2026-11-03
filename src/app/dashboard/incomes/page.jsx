'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Select2 from '@/components/Select2';

export default function IncomesPage() {
    const [incomes, setIncomes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        amount: '',
        income_category_id: '',
        payment_method: 'cash',
        income_date: new Date().toISOString().split('T')[0],
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
            const [incRes, catRes] = await Promise.all([
                axios.get('/api/incomes'),
                axios.get('/api/income-categories'),
            ]);
            setIncomes(incRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch {
            toast('error', 'Failed to load incomes data');
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
            await axios.post('/api/incomes', {
                ...form,
                amount: parseFloat(form.amount) || 0,
                income_category_id: form.income_category_id ? parseInt(form.income_category_id, 10) : null,
            });
            toast('success', 'Income record added successfully');
            setForm({
                amount: '',
                income_category_id: '',
                payment_method: 'cash',
                income_date: new Date().toISOString().split('T')[0],
                reference: '',
                note: '',
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not record income');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this income record?')) return;
        try {
            await axios.delete(`/api/incomes/${id}`);
            toast('success', 'Income deleted');
            loadData();
        } catch (err) {
            toast('error', 'Could not delete income');
        }
    };

    const filtered = incomes.filter((i) =>
        JSON.stringify(i).toLowerCase().includes(search.toLowerCase())
    );

    const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">FINANCE & ACCOUNTS</span>
                    <h1>Other Income</h1>
                    <p>Track non-sales income streams, service revenues, and external deposits.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800 text-xs font-bold">
                        Total Recorded: ৳ {totalIncome.toLocaleString()}
                    </div>
                    <button type="button" className="access-refresh" onClick={loadData}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">RECORD ENTRY</span>
                    <h2>Add New Income</h2>
                    <p>Enter payment amount, source, and deposit method.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Amount (৳) *</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="access-input text-sm font-bold"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Income Category</span>
                        <Select2
                            value={form.income_category_id}
                            onChange={(e) => setForm({ ...form, income_category_id: e.target.value })}
                            placeholder="General Income"
                            options={[
                                { value: '', label: 'General Income' },
                                ...categories.map((c) => ({ value: c.id, label: c.name })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Date *</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.income_date}
                                onChange={(e) => setForm({ ...form, income_date: e.target.value })}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Payment Method</span>
                            <Select2
                                value={form.payment_method}
                                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                options={[
                                    { value: 'cash', label: 'Cash In Hand' },
                                    { value: 'bank', label: 'Bank Transfer' },
                                    { value: 'card', label: 'Card / POS' },
                                    { value: 'bkash', label: 'bKash / Nagad' },
                                ]}
                                className="mt-1"
                            />
                        </label>
                    </div>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Reference / Voucher #</span>
                        <input
                            type="text"
                            className="access-input"
                            value={form.reference}
                            onChange={(e) => setForm({ ...form, reference: e.target.value })}
                            placeholder="e.g. TXN-92831"
                        />
                    </label>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Note / Description</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            placeholder="Received from..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Recording...' : 'Save Income Entry'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* Directory */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">DIRECTORY</span>
                            <h2>
                                Income Records <small className="resource-total">({incomes.length})</small>
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
                            <p>Loading income records...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Reference</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.income_date}</td>
                                            <td className="font-bold text-gray-900">
                                                {item.category?.name || item.income_category?.name || 'General'}
                                            </td>
                                            <td className="font-bold text-emerald-700">
                                                ৳ {parseFloat(item.amount).toLocaleString()}
                                            </td>
                                            <td className="capitalize">{item.payment_method}</td>
                                            <td className="font-mono text-xs text-gray-600">
                                                {item.reference || '—'}
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <i className="ti ti-trash text-sm" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No income records logged yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

