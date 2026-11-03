'use client';
 
import { useState, useEffect, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

export default function ReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [form, setForm] = useState({
        sale_id: '',
        return_number: '',
        refund_amount: '',
        refund_method: 'cash',
        note: '',
        items: [{ sale_item_id: '', quantity: 1 }],
    });

    const [availableItems, setAvailableItems] = useState([]);

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
            const [returnsRes, salesRes] = await Promise.all([
                axios.get('/api/sales-returns').catch(() => axios.get('/api/returns')),
                axios.get('/api/sales'),
            ]);
            setReturns(returnsRes.data.data?.data || returnsRes.data.data || []);
            setSales(salesRes.data.data?.data || salesRes.data.data || []);
        } catch {
            toast('error', 'Could not load sales return records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // When sale_id changes, fetch or extract that sale's items
    const handleSaleChange = async (saleId) => {
        setForm((prev) => ({
            ...prev,
            sale_id: saleId,
            return_number: `RET-${Date.now().toString().slice(-6)}`,
            items: [{ sale_item_id: '', quantity: 1 }],
        }));

        if (!saleId) {
            setAvailableItems([]);
            return;
        }

        try {
            const res = await axios.get(`/api/sales/${saleId}`);
            const saleData = res.data.data;
            setAvailableItems(saleData.items || []);
        } catch {
            // fallback to list if already loaded
            const found = sales.find((s) => String(s.id) === String(saleId));
            setAvailableItems(found?.items || []);
        }
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { sale_item_id: '', quantity: 1 }],
        }));
    };

    const removeItem = (idx) => {
        if (form.items.length <= 1) return;
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== idx),
        }));
    };

    const updateItem = (idx, field, val) => {
        setForm((prev) => {
            const items = [...prev.items];
            items[idx] = { ...items[idx], [field]: val };
            return { ...prev, items };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.sale_id) {
            toast('warning', 'Please select an original sale.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                return_number: form.return_number || `RET-${Date.now().toString().slice(-6)}`,
                refund_amount: Number(form.refund_amount || 0),
                refund_method: form.refund_method,
                note: form.note || null,
                items: form.items.map((it) => ({
                    sale_item_id: Number(it.sale_item_id),
                    quantity: Number(it.quantity),
                })),
            };

            await axios.post(`/api/sales/${form.sale_id}/returns`, payload);
            toast('success', 'Sale return recorded successfully');
            setForm({
                sale_id: '',
                return_number: '',
                refund_amount: '',
                refund_method: 'cash',
                note: '',
                items: [{ sale_item_id: '', quantity: 1 }],
            });
            setAvailableItems([]);
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Failed to record return.');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return returns;
        const q = search.toLowerCase();
        return returns.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    }, [returns, search]);

    const paginatedReturns = useMemo(() => {
        if (pageSize === -1 || pageSize >= filtered.length) return filtered;
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const returnColumns = [
        { key: 'return_number', label: 'Return #' },
        { key: 'invoice_number', label: 'Sale Invoice' },
        { key: 'customer', label: 'Customer' },
        { key: 'refund_amount', label: 'Refund' },
        { key: 'items_count', label: 'Items' },
        { key: 'date', label: 'Date' },
    ];

    const renderReturnCell = (r, key) => {
        switch (key) {
            case 'return_number': return r.return_number || '—';
            case 'invoice_number': return r.sale?.invoice_number || `Sale #${r.sale_id}`;
            case 'customer': return r.sale?.customer?.name || 'Walk-in';
            case 'refund_amount': return `৳${Number(r.refund_amount || 0).toFixed(2)}`;
            case 'items_count': return `${r.items?.length || 1} item(s)`;
            case 'date': return r.created_at ? new Date(r.created_at).toLocaleDateString() : '—';
            default: return r[key] ?? '—';
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">CUSTOMER SERVICE</span>
                    <h1>Sales Returns</h1>
                    <p>Process return of sold items back into inventory and refund customers safely.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Return Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW RETURN</span>
                    <h2>Process Sale Return</h2>
                    <p>Select the original sale and items to restock.</p>

                    <label>
                        Original Sale *
                        <Select2
                            value={form.sale_id}
                            onChange={(e) => handleSaleChange(e.target.value)}
                            required
                            placeholder="Select sale invoice"
                            options={[
                                { value: '', label: 'Select sale invoice' },
                                ...sales.map((s) => ({
                                    value: s.id,
                                    label: `${s.invoice_number} — ${s.customer?.name || 'Walk-in'}`,
                                    sublabel: `(৳${s.total || s.grand_total})`,
                                })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <label>
                        Return Reference # *
                        <input
                            className="access-input"
                            type="text"
                            value={form.return_number}
                            onChange={(e) => setForm({ ...form, return_number: e.target.value })}
                            required
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            Refund Amount (৳)
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                step="any"
                                value={form.refund_amount}
                                onChange={(e) => setForm({ ...form, refund_amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </label>
                        <label>
                            Refund Method
                            <Select2
                                value={form.refund_method}
                                onChange={(e) => setForm({ ...form, refund_method: e.target.value })}
                                options={[
                                    { value: 'cash', label: 'Cash' },
                                    { value: 'card', label: 'Card' },
                                    { value: 'mobile_banking', label: 'Mobile Banking' },
                                ]}
                                className="mt-1"
                            />
                        </label>
                    </div>

                    <label>
                        Return Reason / Notes
                        <input
                            className="access-input"
                            type="text"
                            placeholder="e.g. Defective item, customer changed mind"
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                        />
                    </label>

                    {/* Items Section */}
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Return Items ({form.items.length})
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
                            {form.items.map((it, idx) => (
                                <div
                                    key={idx}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Item #{idx + 1}
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

                                    {availableItems.length > 0 ? (
                                        <Select2
                                            size="sm"
                                            value={it.sale_item_id}
                                            onChange={(e) => updateItem(idx, 'sale_item_id', e.target.value)}
                                            required
                                            placeholder="Choose item from this sale"
                                            options={[
                                                { value: '', label: 'Choose item from this sale' },
                                                ...availableItems.map((ai) => ({
                                                    value: ai.id,
                                                    label: ai.product?.name || `Item #${ai.id}`,
                                                    sublabel: `(Sold: ${ai.quantity})`,
                                                })),
                                            ]}
                                        />
                                    ) : (
                                        <input
                                            className="access-input text-xs"
                                            type="number"
                                            placeholder="Enter Sale Item ID"
                                            value={it.sale_item_id}
                                            onChange={(e) => updateItem(idx, 'sale_item_id', e.target.value)}
                                            required
                                        />
                                    )}

                                    <input
                                        className="access-input text-xs"
                                        type="number"
                                        min="1"
                                        placeholder="Quantity to return"
                                        value={it.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="access-submit mt-4" type="submit" disabled={submitting}>
                        {submitting ? 'Processing Return...' : 'Record Return'}{' '}
                        <i className="ti ti-arrow-right" />
                    </button>
                </form>

                {/* Returns History */}
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">RETURN LOG</span>
                                <h2>
                                    Completed Returns <small className="resource-total">({filtered.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Sales Returns"
                                columns={returnColumns}
                                data={filtered}
                                renderCell={renderReturnCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search returns..."
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
                                <p>Loading return records...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="access-empty">
                                <i className="ti ti-receipt-refund" />
                                <p>No returns recorded yet.</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th>Return #</th>
                                            <th>Sale Invoice</th>
                                            <th>Customer</th>
                                            <th>Refund</th>
                                            <th>Items</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedReturns.map((r) => (
                                            <tr key={r.id}>
                                                <td>
                                                    <strong className="text-rose-600 font-mono">
                                                        {r.return_number}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong className="text-slate-800 dark:text-slate-200">
                                                        {r.sale?.invoice_number || `Sale #${r.sale_id}`}
                                                    </strong>
                                                </td>
                                                <td>{r.sale?.customer?.name || 'Walk-in'}</td>
                                                <td>
                                                    <span className="font-bold text-slate-800 dark:text-slate-100">
                                                        ৳{Number(r.refund_amount || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-700">
                                                        {r.items?.length || 1} item(s)
                                                    </span>
                                                </td>
                                                <td>
                                                    <small>
                                                        {r.created_at
                                                            ? new Date(r.created_at).toLocaleDateString()
                                                            : '—'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedReturn(r)}
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
                    </div>

                    {!loading && filtered.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </section>
            </div>

            {/* Return Details Modal */}
            {selectedReturn && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-bold">Return {selectedReturn.return_number}</h3>
                                <p className="text-xs text-slate-500">
                                    Original Sale: {selectedReturn.sale?.invoice_number || `#${selectedReturn.sale_id}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReturn(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div className="py-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Refund Amount:</span>
                                <span className="font-bold text-rose-600">
                                    ৳{Number(selectedReturn.refund_amount || 0).toFixed(2)} ({selectedReturn.refund_method || 'cash'})
                                </span>
                            </div>
                            {selectedReturn.note && (
                                <div className="text-sm">
                                    <span className="text-slate-500 block mb-1">Reason:</span>
                                    <p className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded text-slate-700 dark:text-slate-300">
                                        {selectedReturn.note}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Returned Items
                                </h4>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    {selectedReturn.items?.map((item, idx) => (
                                        <div key={idx} className="p-3 flex items-center justify-between text-sm">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {item.sale_item?.product?.name || item.saleItem?.product?.name || `Item #${item.sale_item_id}`}
                                                </p>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                                Qty Returned: {item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedReturn(null)}
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
