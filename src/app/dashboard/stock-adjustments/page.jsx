'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

export default function StockAdjustmentsPage() {
    const [adjustments, setAdjustments] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [form, setForm] = useState({
        adjustment_date: new Date().toISOString().split('T')[0],
        reason: 'audit',
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_cost: 0, type: 'subtraction' }],
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
            const [adjRes, prodRes] = await Promise.all([
                axios.get('/api/stock-adjustments'),
                axios.get('/api/products'),
            ]);
            setAdjustments(adjRes.data.data || []);
            setProducts(prodRes.data.data || []);
        } catch {
            toast('error', 'Failed to load stock adjustments or product catalog.');
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
            items: [...prev.items, { product_id: '', quantity: 1, unit_cost: 0, type: 'subtraction' }],
        }));
    };

    const removeItemRow = (index) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const updateItemRow = (index, field, value) => {
        setForm((prev) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.items.some((i) => !i.product_id)) {
            toast('error', 'Please select a valid product for each row.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                adjustment_date: form.adjustment_date,
                reason: form.reason,
                notes: form.notes,
                items: form.items.map((i) => ({
                    product_id: parseInt(i.product_id, 10),
                    quantity: parseInt(i.quantity, 10),
                    unit_cost: parseFloat(i.unit_cost) || 0,
                    type: i.type,
                })),
            };

            await axios.post('/api/stock-adjustments', payload);
            toast('success', 'Stock adjustment created and applied successfully');
            setForm({
                adjustment_date: new Date().toISOString().split('T')[0],
                reason: 'audit',
                notes: '',
                items: [{ product_id: '', quantity: 1, unit_cost: 0, type: 'subtraction' }],
            });
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not save stock adjustment';
            toast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return adjustments;
        const q = search.toLowerCase();
        return adjustments.filter((a) => JSON.stringify(a).toLowerCase().includes(q));
    }, [adjustments, search]);

    const paginated = useMemo(() => {
        if (pageSize === -1 || pageSize >= filtered.length) return filtered;
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const adjustmentColumns = [
        { key: 'sl', label: 'SL' },
        { key: 'reference_number', label: 'Ref #' },
        { key: 'adjustment_date', label: 'Date' },
        { key: 'reason', label: 'Reason' },
        { key: 'items', label: 'Items Adjusted' },
        { key: 'total_amount', label: 'Total Value' },
        { key: 'status', label: 'Status' },
    ];

    const renderAdjustmentCell = (adj, key, idx) => {
        switch (key) {
            case 'sl':
                return idx !== undefined ? idx + 1 : (adj.id ?? '—');
            case 'reference_number':
                return adj.reference_number || '—';
            case 'adjustment_date':
                return adj.adjustment_date || '—';
            case 'reason':
                return adj.reason || '—';
            case 'items':
                return (adj.items || []).map((it) => `${it.product?.name || 'Product'} (${it.type === 'addition' ? '+' : '-'}${it.quantity})`).join(', ') || '—';
            case 'total_amount':
                return `৳${parseFloat(adj.total_amount || 0).toLocaleString()}`;
            case 'status':
                return adj.status || 'completed';
            default:
                return adj[key] ?? '—';
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">INVENTORY CONTROL</span>
                    <h1>Stock Adjustments</h1>
                    <p>Reconcile discrepancies, damage, expirations, and audit write-offs.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Create Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW ADJUSTMENT</span>
                    <h2>Record Stock Change</h2>
                    <p>Select products and adjust physical counts.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Adjustment Date</span>
                        <input
                            type="date"
                            className="access-input"
                            value={form.adjustment_date}
                            onChange={(e) => setForm({ ...form, adjustment_date: e.target.value })}
                            required
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Reason</span>
                        <Select2
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            required
                            placeholder="Select reason"
                            options={[
                                { value: 'audit', label: 'Inventory Audit Discrepancy' },
                                { value: 'damaged', label: 'Damaged Goods' },
                                { value: 'lost', label: 'Lost / Stolen' },
                                { value: 'expired', label: 'Expired Stock' },
                                { value: 'other', label: 'Other' },
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-700">Adjusted Products</span>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="text-xs text-[#f47721] font-bold hover:underline"
                            >
                                + Add Product
                            </button>
                        </div>

                        {form.items.map((item, idx) => (
                            <div key={idx} className="p-2.5 mb-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <Select2
                                            size="sm"
                                            value={item.product_id}
                                            onChange={(e) => updateItemRow(idx, 'product_id', e.target.value)}
                                            required
                                            placeholder="Select Product"
                                            options={[
                                                { value: '', label: 'Select Product' },
                                                ...products.map((p) => ({
                                                    value: p.id,
                                                    label: p.name,
                                                    sublabel: p.sku ? `(SKU: ${p.sku})` : null,
                                                })),
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <Select2
                                            size="sm"
                                            value={item.type}
                                            onChange={(e) => updateItemRow(idx, 'type', e.target.value)}
                                            options={[
                                                { value: 'subtraction', label: '➖ Deduct (Stock Out)' },
                                                { value: 'addition', label: '➕ Add (Stock In)' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            min="1"
                                            className="access-input text-xs"
                                            placeholder="Qty"
                                            value={item.quantity}
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
                                            value={item.unit_cost}
                                            onChange={(e) => updateItemRow(idx, 'unit_cost', e.target.value)}
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
                        <span className="block text-xs font-bold text-gray-700 mb-1">Audit Notes</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Optional notes or authorization details..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Applying Adjustment...' : 'Apply Stock Adjustment'}
                        <i className="ti ti-check ml-1" />
                    </button>
                </form>

                {/* Adjustments Directory */}
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">HISTORY</span>
                                <h2>
                                    Adjustment Records <small className="resource-total">({filtered.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Stock Adjustments"
                                columns={adjustmentColumns}
                                data={filtered}
                                renderCell={renderAdjustmentCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search adjustments..."
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                                currentPage={currentPage}
                                totalItems={filtered.length}
                                onPageChange={setCurrentPage}
                            />
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading adjustments...</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th className="w-12 text-center">SL</th>
                                            <th>Ref #</th>
                                            <th>Date</th>
                                            <th>Reason</th>
                                            <th>Items Adjusted</th>
                                            <th>Total Value</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((adj, idx) => {
                                            const sl = (pageSize === -1 ? 0 : (currentPage - 1) * pageSize) + idx + 1;
                                            return (
                                                <tr key={adj.id}>
                                                    <td className="text-center font-bold text-slate-500">{sl}</td>
                                                    <td className="font-mono font-bold text-[#f47721]">
                                                        {adj.reference_number}
                                                    </td>
                                                    <td>{adj.adjustment_date}</td>
                                                    <td className="capitalize font-semibold">{adj.reason}</td>
                                                    <td>
                                                        <div className="text-xs">
                                                            {adj.items?.map((it, itemIdx) => (
                                                                <div key={itemIdx} className="text-gray-700">
                                                                    • {it.product?.name || 'Product'} (
                                                                    {it.type === 'addition' ? '+' : '-'}
                                                                    {it.quantity} pcs)
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td>৳ {parseFloat(adj.total_amount || 0).toLocaleString()}</td>
                                                    <td>
                                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                            {adj.status || 'completed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {filtered.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-inbox" />
                                        <p>No adjustments recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {!loading && filtered.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={(p) => setCurrentPage(p)}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </section>
            </div>
        </div>
    );
}

