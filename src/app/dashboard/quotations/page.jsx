'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [form, setForm] = useState({
        customer_id: '',
        quotation_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        discount: 0,
        tax: 0,
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_price: 0 }],
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

    const extractArray = (res) => {
        if (!res || !res.data) return [];
        if (Array.isArray(res.data.data?.data)) return res.data.data.data;
        if (Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res.data)) return res.data;
        return [];
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [qRes, cRes, pRes] = await Promise.all([
                axios.get('/api/quotations').catch(() => ({ data: { data: [] } })),
                axios.get('/api/customers?all=true').catch(() => ({ data: { data: [] } })),
                axios.get('/api/products').catch(() => ({ data: { data: [] } })),
            ]);
            setQuotations(extractArray(qRes));
            setCustomers(extractArray(cRes));
            setProducts(extractArray(pRes));
        } catch {
            toast('error', 'Failed to load quotations');
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
            items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }],
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
                if (prod && prod.selling_price) copy[idx].unit_price = prod.selling_price;
            }
            return { ...prev, items: copy };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.items.some((i) => !i.product_id)) {
            toast('error', 'Please select a product for all quote items.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                customer_id: form.customer_id ? parseInt(form.customer_id, 10) : null,
                quotation_date: form.quotation_date,
                valid_until: form.valid_until || null,
                discount: parseFloat(form.discount) || 0,
                tax: parseFloat(form.tax) || 0,
                notes: form.notes,
                items: form.items.map((i) => ({
                    product_id: parseInt(i.product_id, 10),
                    quantity: parseInt(i.quantity, 10),
                    unit_price: parseFloat(i.unit_price) || 0,
                })),
            };

            await axios.post('/api/quotations', payload);
            toast('success', 'Quotation created successfully');
            setForm({
                customer_id: '',
                quotation_date: new Date().toISOString().split('T')[0],
                valid_until: '',
                discount: 0,
                tax: 0,
                notes: '',
                items: [{ product_id: '', quantity: 1, unit_price: 0 }],
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not save quotation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConvertToSale = async (quoteId) => {
        if (!confirm('Convert this Quotation directly into a completed Sale and generate Invoice?')) return;
        try {
            await axios.post(`/api/quotations/${quoteId}/convert-to-sale`);
            toast('success', 'Quotation converted to Sale!');
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Conversion failed');
        }
    };

    const handleDelete = async (quoteId) => {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: 'Delete this quotation?',
                text: 'This quotation will be permanently removed.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
            });
            if (!res.isConfirmed) return;
        } else if (!confirm('Are you sure you want to delete this quotation?')) {
            return;
        }

        try {
            await axios.delete(`/api/quotations/${quoteId}`);
            toast('success', 'Quotation deleted successfully');
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not delete quotation');
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return quotations;
        const q = search.toLowerCase();
        return quotations.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    }, [quotations, search]);

    const paginatedQuotes = useMemo(() => {
        if (pageSize === -1 || pageSize >= filtered.length) return filtered;
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const quoteColumns = [
        { key: 'sl', label: 'SL' },
        { key: 'reference_number', label: 'Ref #' },
        { key: 'customer', label: 'Customer' },
        { key: 'quotation_date', label: 'Date' },
        { key: 'valid_until', label: 'Valid Until' },
        { key: 'total', label: 'Total' },
        { key: 'status', label: 'Status' },
    ];

    const renderQuoteCell = (q, key, idx) => {
        switch (key) {
            case 'sl': return idx !== undefined ? idx + 1 : (q.id ?? '—');
            case 'reference_number': return q.reference_number || '—';
            case 'customer': return q.customer?.name || 'Walk-in';
            case 'quotation_date': return q.quotation_date ? String(q.quotation_date).split('T')[0] : '—';
            case 'valid_until': return q.valid_until ? String(q.valid_until).split('T')[0] : '—';
            case 'total': return `৳ ${parseFloat(q.total || 0).toLocaleString()}`;
            case 'status': return q.status || '—';
            default: return q[key] ?? '—';
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">COMMERCIAL</span>
                    <h1>Quotations</h1>
                    <p>Create pro-forma price estimates and convert directly to sales orders.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW ESTIMATE</span>
                    <h2>Issue Quotation</h2>
                    <p>Quote price and items for customer approval.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Customer</span>
                        <select
                            className="access-input"
                            value={form.customer_id}
                            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                        >
                            <option value="">Walk-in / Unknown Customer</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.phone || 'No phone'})
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Date *</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.quotation_date}
                                onChange={(e) => setForm({ ...form, quotation_date: e.target.value })}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Valid Until</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.valid_until}
                                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-700">Quoted Items</span>
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
                                            placeholder="Qty"
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
                                            placeholder="Unit Price"
                                            value={it.unit_price}
                                            onChange={(e) => updateItemRow(idx, 'unit_price', e.target.value)}
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
                        <span className="block text-xs font-bold text-gray-700 mb-1">Notes / Terms</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Payment terms, delivery timeline..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Generating Quotation...' : 'Create Quotation'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* List */}
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">DIRECTORY</span>
                                <h2>
                                    Quotations <small className="resource-total">({filtered.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Quotations"
                                columns={quoteColumns}
                                data={filtered}
                                renderCell={renderQuoteCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search Ref #..."
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
                                <p>Loading quotations...</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th className="w-12 text-center">SL</th>
                                            <th>Ref #</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Valid Until</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedQuotes.map((q, idx) => {
                                            const sl = (pageSize === -1 ? 0 : (currentPage - 1) * pageSize) + idx + 1;
                                            return (
                                                <tr key={q.id}>
                                                    <td className="text-center font-bold text-slate-500">{sl}</td>
                                                    <td className="font-mono font-bold text-[#f47721]">
                                                        {q.reference_number}
                                                    </td>
                                                    <td className="font-bold text-gray-900">
                                                        {q.customer?.name || 'Walk-in'}
                                                    </td>
                                                    <td>{q.quotation_date ? String(q.quotation_date).split('T')[0] : '—'}</td>
                                                    <td>{q.valid_until ? String(q.valid_until).split('T')[0] : '—'}</td>
                                                    <td className="font-bold">
                                                        ৳ {parseFloat(q.total || 0).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                                q.status === 'converted'
                                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            }`}
                                                        >
                                                            {q.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-right whitespace-nowrap">
                                                        {q.status !== 'converted' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleConvertToSale(q.id)}
                                                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-sm inline-flex items-center gap-1 mr-1.5"
                                                                title="Convert to Sale"
                                                            >
                                                                <i className="ti ti-shopping-cart-check" /> Convert
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(q.id)}
                                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors inline-flex items-center"
                                                            title="Delete quotation"
                                                        >
                                                            <i className="ti ti-trash text-base" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {filtered.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-inbox" />
                                        <p>No quotations created yet.</p>
                                    </div>
                                )}
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
        </div>
    );
}

