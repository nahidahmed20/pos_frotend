'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [form, setForm] = useState({
        sale: '',
        amount: '',
        method: 'cash',
        reference: '',
    });

    const toast = (icon, title) =>
        window.Swal?.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            timer: 2600,
            timerProgressBar: true,
        });

    const loadData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, salesRes] = await Promise.all([
                axios.get('/api/payments'),
                axios.get('/api/sales'),
            ]);
            setPayments(paymentsRes.data.data || []);
            setSales(salesRes.data.data?.data || salesRes.data.data || []);
        } catch {
            toast('error', 'Could not load payments history.');
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
            await axios.post(`/api/sales/${form.sale}/payments`, {
                amount: Number(form.amount),
                method: form.method,
                reference: form.reference || null,
            });
            toast('success', 'Payment recorded successfully');
            setForm({ sale: '', amount: '', method: 'cash', reference: '' });
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not record payment.');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter sales that have due amounts
    const dueSales = sales.filter((s) => Number(s.due_amount || 0) > 0);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">POINT OF SALE</span>
                    <h1>Payment Transactions</h1>
                    <p>Collect due balances against sales and inspect all received payment receipts.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Payment Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">COLLECT DUE</span>
                    <h2>Record Due Payment</h2>
                    <p>Select an invoice with an outstanding balance.</p>

                    <label>
                        Sale Invoice *
                        <select
                            className="access-input"
                            value={form.sale}
                            onChange={(e) => {
                                const selected = sales.find((s) => String(s.id) === String(e.target.value));
                                setForm({
                                    ...form,
                                    sale: e.target.value,
                                    amount: selected ? selected.due_amount : '',
                                });
                            }}
                            required
                        >
                            <option value="">Select an invoice</option>
                            {dueSales.length > 0 ? (
                                dueSales.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.invoice_number} — Due: ৳{s.due_amount} ({s.customer?.name || 'Walk-in'})
                                    </option>
                                ))
                            ) : (
                                sales.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.invoice_number} (৳{s.total || s.grand_total})
                                    </option>
                                ))
                            )}
                        </select>
                    </label>

                    <label>
                        Payment Amount (৳) *
                        <input
                            className="access-input"
                            type="number"
                            min="0.01"
                            step="any"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            required
                            placeholder="Amount received"
                        />
                    </label>

                    <label>
                        Payment Method *
                        <select
                            className="access-input"
                            value={form.method}
                            onChange={(e) => setForm({ ...form, method: e.target.value })}
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                        </select>
                    </label>

                    <label>
                        Reference / Transaction ID
                        <input
                            className="access-input"
                            type="text"
                            placeholder="e.g. TrxID / Slip #"
                            value={form.reference}
                            onChange={(e) => setForm({ ...form, reference: e.target.value })}
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Recording...' : 'Collect Payment'}{' '}
                        <i className="ti ti-arrow-up-right" />
                    </button>
                </form>

                {/* Payments Table */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">PAYMENT DIRECTORY</span>
                            <h2>
                                Payment History <small className="resource-total">{payments.length}</small>
                            </h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading payments...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="access-empty">
                            <i className="ti ti-cash-off" />
                            <p>No payments recorded yet.</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Invoice #</th>
                                        <th>Customer</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Received By</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id}>
                                            <td>
                                                <small>
                                                    {p.paid_at
                                                        ? new Date(p.paid_at).toLocaleDateString()
                                                        : p.created_at
                                                        ? new Date(p.created_at).toLocaleDateString()
                                                        : '—'}
                                                </small>
                                            </td>
                                            <td>
                                                <strong>
                                                    {p.sale?.invoice_number ||
                                                        p.purchase?.invoice_number ||
                                                        `#${p.id}`}
                                                </strong>
                                                {p.reference && (
                                                    <span className="block text-[11px] text-slate-400">
                                                        Ref: {p.reference}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{p.customer?.name || 'Walk-in Customer'}</td>
                                            <td>
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-700">
                                                    {p.method}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                                                    ৳{Number(p.amount).toFixed(2)}
                                                </strong>
                                            </td>
                                            <td>{p.receiver?.name || 'System'}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPayment(p)}
                                                    className="px-2 py-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded flex items-center gap-1"
                                                >
                                                    <i className="ti ti-eye" /> Slip
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-bold">Payment Receipt</h3>
                                <p className="text-xs text-slate-500">Receipt #{selectedPayment.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div className="py-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Related Invoice:</span>
                                <span className="font-bold">
                                    {selectedPayment.sale?.invoice_number || selectedPayment.purchase?.invoice_number || '—'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Customer:</span>
                                <span className="font-semibold">{selectedPayment.customer?.name || 'Walk-in'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Method:</span>
                                <span className="uppercase font-semibold">{selectedPayment.method}</span>
                            </div>
                            {selectedPayment.reference && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Reference:</span>
                                    <span className="font-mono">{selectedPayment.reference}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-slate-500 font-bold">Amount Paid:</span>
                                <span className="text-lg font-black text-emerald-600">
                                    ৳{Number(selectedPayment.amount).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                            <button
                                onClick={() => window.print()}
                                className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                            >
                                <i className="ti ti-printer" /> Print
                            </button>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs font-semibold rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
