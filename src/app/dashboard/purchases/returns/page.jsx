'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function PurchaseReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        supplier_id: '',
        returned_at: new Date().toISOString().slice(0, 16),
        reason: 'defective',
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_cost: 0 }],
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
            const [retRes, supRes, prodRes] = await Promise.all([
                axios.get('/api/purchase-returns'),
                axios.get('/api/suppliers'),
                axios.get('/api/products'),
            ]);
            setReturns(retRes.data.data || []);
            setSuppliers(supRes.data.data || []);
            setProducts(prodRes.data.data || []);
        } catch {
            toast('error', 'Failed to load purchase returns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const addItemRow = () => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1, unit_cost: 0 }],
        }));
    };

    const removeItemRow = (idx) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== idx),
        }));
    };

    const updateItemRow = (idx, field, val) => {
        setForm((prev) => {
            const copy = [...prev.items];
            copy[idx] = { ...copy[idx], [field]: val };
            if (field === 'product_id') {
                const prod = products.find((p) => p.id === parseInt(val, 10));
                if (prod && prod.purchase_price) copy[idx].unit_cost = prod.purchase_price;
            }
            return { ...prev, items: copy };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.supplier_id) {
            toast('error', 'Please select a supplier.');
            return;
        }
        if (form.items.some((i) => !i.product_id)) {
            toast('error', 'Please select a product for all return items.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                supplier_id: parseInt(form.supplier_id, 10),
                returned_at: form.returned_at,
                reason: form.reason,
                notes: form.notes,
                items: form.items.map((i) => ({
                    product_id: parseInt(i.product_id, 10),
                    quantity: parseInt(i.quantity, 10),
                    unit_cost: parseFloat(i.unit_cost) || 0,
                })),
            };

            await axios.post('/api/purchase-returns', payload);
            toast('success', 'Purchase return created and stock updated!');
            setForm({
                supplier_id: '',
                returned_at: new Date().toISOString().slice(0, 16),
                reason: 'defective',
                notes: '',
                items: [{ product_id: '', quantity: 1, unit_cost: 0 }],
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not process return');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = returns.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">SUPPLIER RETURNS</span>
                    <h1>Purchase Returns</h1>
                    <p>Track goods returned back to suppliers for refund or replacement.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW RETURN</span>
                    <h2>Return to Supplier</h2>
                    <p>Specify returned items and reasons.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Supplier *</span>
                        <select
                            className="access-input"
                            value={form.supplier_id}
                            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                            required
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Return Date *</span>
                            <input
                                type="datetime-local"
                                className="access-input text-xs"
                                value={form.returned_at}
                                onChange={(e) => setForm({ ...form, returned_at: e.target.value })}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Reason</span>
                            <select
                                className="access-input"
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            >
                                <option value="defective">Defective / Damaged</option>
                                <option value="wrong_item">Wrong Item Sent</option>
                                <option value="expired">Near Expiry / Expired</option>
                                <option value="excess">Excess Delivery</option>
                                <option value="other">Other</option>
                            </select>
                        </label>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-700">Returned Items</span>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="text-xs text-[#f47721] font-bold hover:underline"
                            >
                                + Add Item
                            </button>
                        </div>

                        {form.items.map((it, idx) => (
                            <div key={idx} className="p-2.5 mb-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="mb-2">
                                    <select
                                        className="access-input text-xs"
                                        value={it.product_id}
                                        onChange={(e) => updateItemRow(idx, 'product_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (SKU: {p.sku})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            min="1"
                                            className="access-input text-xs"
                                            placeholder="Return Qty"
                                            value={it.quantity}
                                            onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="access-input text-xs"
                                            placeholder="Unit Cost"
                                            value={it.unit_cost}
                                            onChange={(e) => updateItemRow(idx, 'unit_cost', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {form.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItemRow(idx)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <i className="ti ti-trash" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Notes</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Supplier RMA / Credit memo ref..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Processing Return...' : 'Submit Purchase Return'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* Return List */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">DIRECTORY</span>
                            <h2>
                                Purchase Returns <small className="resource-total">({returns.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search Return #..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading returns...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Return #</th>
                                        <th>Supplier</th>
                                        <th>Date</th>
                                        <th>Total Refund</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((ret) => (
                                        <tr key={ret.id}>
                                            <td className="font-mono font-bold text-[#f47721]">
                                                {ret.return_number}
                                            </td>
                                            <td className="font-bold text-gray-900">{ret.supplier?.name}</td>
                                            <td>{ret.returned_at?.slice(0, 10)}</td>
                                            <td className="font-bold">
                                                ৳ {parseFloat(ret.total || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                    {ret.status || 'completed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No purchase returns recorded yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
