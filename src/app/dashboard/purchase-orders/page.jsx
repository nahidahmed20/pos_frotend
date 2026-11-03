'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Select2 from '@/components/Select2';

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        discount: 0,
        tax: 0,
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
            const [poRes, supRes, prodRes] = await Promise.all([
                axios.get('/api/purchase-orders'),
                axios.get('/api/suppliers'),
                axios.get('/api/products'),
            ]);
            setOrders(poRes.data.data || []);
            setSuppliers(supRes.data.data || []);
            setProducts(prodRes.data.data || []);
        } catch {
            toast('error', 'Failed to load purchase orders');
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
            toast('error', 'Please select a product for all line items.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                supplier_id: parseInt(form.supplier_id, 10),
                order_date: form.order_date,
                expected_date: form.expected_date || null,
                discount: parseFloat(form.discount) || 0,
                tax: parseFloat(form.tax) || 0,
                notes: form.notes,
                items: form.items.map((i) => ({
                    product_id: parseInt(i.product_id, 10),
                    quantity: parseInt(i.quantity, 10),
                    unit_cost: parseFloat(i.unit_cost) || 0,
                })),
            };

            await axios.post('/api/purchase-orders', payload);
            toast('success', 'Purchase order created successfully');
            setForm({
                supplier_id: '',
                order_date: new Date().toISOString().split('T')[0],
                expected_date: '',
                discount: 0,
                tax: 0,
                notes: '',
                items: [{ product_id: '', quantity: 1, unit_cost: 0 }],
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not save purchase order');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConvertToPurchase = async (orderId) => {
        if (!confirm('Convert this Purchase Order into an actual recorded Purchase inventory?')) return;
        try {
            await axios.post(`/api/purchase-orders/${orderId}/convert-to-purchase`);
            toast('success', 'Purchase order converted to Purchase and stock updated!');
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Conversion failed');
        }
    };

    const filtered = orders.filter((o) =>
        JSON.stringify(o).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">SUPPLY CHAIN</span>
                    <h1>Purchase Orders</h1>
                    <p>Issue formal orders to suppliers and convert to purchases upon receipt.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Create PO Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW PO</span>
                    <h2>Issue Purchase Order</h2>
                    <p>Specify supplier and item quantities.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Supplier *</span>
                        <Select2
                            value={form.supplier_id}
                            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                            required
                            placeholder="Select Supplier"
                            options={[
                                { value: '', label: 'Select Supplier' },
                                ...suppliers.map((s) => ({
                                    value: s.id,
                                    label: s.name,
                                    sublabel: s.phone ? `(${s.phone})` : null,
                                })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Order Date *</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.order_date}
                                onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Expected Date</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.expected_date}
                                onChange={(e) => setForm({ ...form, expected_date: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-700">Order Items</span>
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
                                    <Select2
                                        size="sm"
                                        value={it.product_id}
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
                        <span className="block text-xs font-bold text-gray-700 mb-1">Notes / Instructions</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Delivery instructions..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Generating PO...' : 'Create Purchase Order'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* PO List */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">DIRECTORY</span>
                            <h2>
                                Purchase Orders <small className="resource-total">({orders.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search PO #..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading purchase orders...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>PO Number</th>
                                        <th>Supplier</th>
                                        <th>Order Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((po) => (
                                        <tr key={po.id}>
                                            <td className="font-mono font-bold text-[#f47721]">{po.po_number}</td>
                                            <td className="font-bold text-gray-900">{po.supplier?.name}</td>
                                            <td>{po.order_date}</td>
                                            <td className="font-bold">৳ {parseFloat(po.total).toLocaleString()}</td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        po.status === 'received'
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : po.status === 'cancelled'
                                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    }`}
                                                >
                                                    {po.status}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                {po.status !== 'received' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConvertToPurchase(po.id)}
                                                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-sm inline-flex items-center gap-1"
                                                        title="Convert into received Purchase"
                                                    >
                                                        <i className="ti ti-check" /> Convert
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No purchase orders recorded yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

