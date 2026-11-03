'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Select2 from '@/components/Select2';

export default function StockTransfersPage() {
    const [transfers, setTransfers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    const [form, setForm] = useState({
        from_branch_id: '',
        to_branch_id: '',
        note: '',
        items: [{ product_id: '', quantity: 1 }],
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
            const [transfersRes, branchesRes, productsRes] = await Promise.all([
                axios.get('/api/stock-transfers'),
                axios.get('/api/branches'),
                axios.get('/api/products'),
            ]);
            setTransfers(transfersRes.data?.data?.data || transfersRes.data?.data || []);
            setBranches(branchesRes.data?.data || []);
            setProducts(productsRes.data?.data || []);
        } catch {
            toast('error', 'Failed to load stock transfers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1 }],
        }));
    };

    const removeItem = (index) => {
        if (form.items.length <= 1) return;
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const updateItem = (index, field, value) => {
        setForm((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, items };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.from_branch_id === form.to_branch_id) {
            toast('error', 'Destination branch must be different from source branch');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                from_branch_id: Number(form.from_branch_id),
                to_branch_id: Number(form.to_branch_id),
                note: form.note || null,
                items: form.items.map((it) => ({
                    product_id: Number(it.product_id),
                    quantity: Number(it.quantity),
                })),
            };

            await axios.post('/api/stock-transfers', payload);
            toast('success', 'Stock transfer completed successfully');
            setForm({
                from_branch_id: '',
                to_branch_id: '',
                note: '',
                items: [{ product_id: '', quantity: 1 }],
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Stock transfer failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">INVENTORY MANAGEMENT</span>
                    <h1>Stock Transfers</h1>
                    <p>Transfer product quantities securely between warehouse and branch locations.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Create Transfer Panel */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW TRANSFER</span>
                    <h2>Transfer Stock</h2>
                    <p>Select source and destination branches, then list items to move.</p>

                    <label>
                        From Branch *
                        <Select2
                            value={form.from_branch_id}
                            onChange={(e) => setForm({ ...form, from_branch_id: e.target.value })}
                            required
                            placeholder="Select source branch"
                            options={[
                                { value: '', label: 'Select source branch' },
                                ...branches.map((b) => ({ value: b.id, label: b.name })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <label>
                        To Branch *
                        <Select2
                            value={form.to_branch_id}
                            onChange={(e) => setForm({ ...form, to_branch_id: e.target.value })}
                            required
                            placeholder="Select destination branch"
                            options={[
                                { value: '', label: 'Select destination branch' },
                                ...branches
                                    .filter((b) => String(b.id) !== String(form.from_branch_id))
                                    .map((b) => ({ value: b.id, label: b.name })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <label>
                        Notes
                        <input
                            className="access-input"
                            type="text"
                            placeholder="Optional transfer note..."
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                        />
                    </label>

                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Transfer Items ({form.items.length})
                            </span>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded font-semibold hover:bg-emerald-100 flex items-center gap-1"
                            >
                                <i className="ti ti-plus" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {form.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            #{idx + 1}
                                        </span>
                                        {form.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                <i className="ti ti-trash" />
                                            </button>
                                        )}
                                    </div>
                                    <Select2
                                        size="sm"
                                        value={item.product_id}
                                        onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                                        required
                                        placeholder="Select product"
                                        options={[
                                            { value: '', label: 'Select product' },
                                            ...products.map((p) => ({
                                                value: p.id,
                                                label: p.name,
                                                sublabel: p.sku ? `(SKU: ${p.sku})` : null,
                                            })),
                                        ]}
                                    />
                                    <input
                                        className="access-input text-xs"
                                        type="number"
                                        min="1"
                                        placeholder="Quantity"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="access-submit mt-4" type="submit" disabled={submitting}>
                        {submitting ? 'Transferring...' : 'Execute Transfer'}{' '}
                        <i className="ti ti-arrow-right" />
                    </button>
                </form>

                {/* Transfer History Panel */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">HISTORY</span>
                            <h2>
                                Stock Transfers{' '}
                                <small className="resource-total">{transfers.length}</small>
                            </h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading transfer history...</p>
                        </div>
                    ) : transfers.length === 0 ? (
                        <div className="access-empty">
                            <i className="ti ti-truck-delivery" />
                            <p>No stock transfers found.</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>From Branch</th>
                                        <th>To Branch</th>
                                        <th>Items</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((t) => (
                                        <tr key={t.id}>
                                            <td>
                                                <strong>#{t.id}</strong>
                                                <small>
                                                    {t.created_at
                                                        ? new Date(t.created_at).toLocaleDateString()
                                                        : '—'}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {t.from_branch?.name || t.fromBranch?.name || `Branch #${t.from_branch_id}`}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {t.to_branch?.name || t.toBranch?.name || `Branch #${t.to_branch_id}`}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                    {t.items?.length || 0} product(s)
                                                </span>
                                            </td>
                                            <td>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                                    {t.status || 'Completed'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTransfer(t)}
                                                    className="px-2 py-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded flex items-center gap-1"
                                                >
                                                    <i className="ti ti-eye" /> View
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

            {/* Modal for Details */}
            {selectedTransfer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold">Transfer #{selectedTransfer.id} Details</h3>
                            <button
                                onClick={() => setSelectedTransfer(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div className="py-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">From:</span>
                                <span className="font-semibold">
                                    {selectedTransfer.from_branch?.name || selectedTransfer.fromBranch?.name || `Branch #${selectedTransfer.from_branch_id}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">To:</span>
                                <span className="font-semibold text-emerald-600">
                                    {selectedTransfer.to_branch?.name || selectedTransfer.toBranch?.name || `Branch #${selectedTransfer.to_branch_id}`}
                                </span>
                            </div>
                            {selectedTransfer.note && (
                                <div className="text-sm">
                                    <span className="text-slate-500 block mb-1">Note:</span>
                                    <p className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded text-slate-700 dark:text-slate-300">
                                        {selectedTransfer.note}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Transferred Items
                                </h4>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    {selectedTransfer.items?.map((item, idx) => (
                                        <div key={idx} className="p-3 flex items-center justify-between text-sm">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {item.product?.name || `Product #${item.product_id}`}
                                                </p>
                                                {item.product?.sku && (
                                                    <span className="text-xs text-slate-500">SKU: {item.product.sku}</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                                Qty: {item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedTransfer(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm font-semibold rounded-lg"
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
