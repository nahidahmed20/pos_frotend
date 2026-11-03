'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

const initialForm = {
    name: '',
    color: '',
    size: '',
    sku: '',
    barcode: '',
    purchase_price: '0',
    wholesale_price: '0',
    selling_price: '',
    min_selling_price: '0',
    image_path: '',
    is_active: true,
};

export default function ProductVariantsPage() {
    const [productId, setProductId] = useState('');
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [availableAttributes, setAvailableAttributes] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [customAttrs, setCustomAttrs] = useState([]);
    const [editingVariant, setEditingVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const toast = (icon, title) =>
        window.Swal?.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            showCloseButton: true,
            timer: 4000,
            timerProgressBar: true,
        });

    const loadAllVariants = async () => {
        setLoading(true);
        try {
            const [prodRes, varRes, attrRes] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/product-variants').catch(() => ({ data: { data: [] } })),
                axios.get('/api/variant-attributes').catch(() => ({ data: { data: [] } })),
            ]);
            setProducts(prodRes.data.data || []);
            setVariants(varRes.data.data || []);
            setAvailableAttributes(attrRes.data.data || []);
        } catch {
            toast('error', 'Could not load variants data.');
        } finally {
            setLoading(false);
        }
    };

    const loadVariantsForProduct = async (id) => {
        if (!id) {
            loadAllVariants();
            return;
        }
        setLoading(true);
        try {
            const [prodRes, varRes] = await Promise.all([
                axios.get('/api/products'),
                axios.get(`/api/products/${id}/variants`),
            ]);
            setProducts(prodRes.data.data || []);
            setVariants(varRes.data.data || []);
        } catch {
            toast('error', 'Could not load variants for selected product.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pid = params.get('product_id');
            if (pid) {
                setProductId(pid);
                loadVariantsForProduct(pid);
                return;
            }
        }
        loadAllVariants();
    }, []);

    // Check if URL has ?edit=ID
    useEffect(() => {
        if (typeof window !== 'undefined' && variants.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const editId = params.get('edit');
            if (editId) {
                const target = variants.find((v) => String(v.id) === String(editId));
                if (target) startEdit(target);
            }
        }
    }, [variants]);

    const handleProductChange = (id) => {
        setProductId(id);
        if (id) {
            loadVariantsForProduct(id);
        } else {
            loadAllVariants();
        }
    };

    const startEdit = (variant) => {
        setEditingVariant(variant);
        setProductId(variant.product_id ? String(variant.product_id) : '');
        const attrs = variant.attributes || {};
        const { color, size, ...restAttrs } = attrs;
        setForm({
            name: variant.name || '',
            color: color || '',
            size: size || '',
            sku: variant.sku || '',
            barcode: variant.barcode || '',
            purchase_price: variant.purchase_price !== null && variant.purchase_price !== undefined ? String(variant.purchase_price) : '0',
            wholesale_price: variant.wholesale_price !== null && variant.wholesale_price !== undefined ? String(variant.wholesale_price) : '0',
            selling_price: variant.selling_price !== null && variant.selling_price !== undefined ? String(variant.selling_price) : '',
            min_selling_price: variant.min_selling_price !== null && variant.min_selling_price !== undefined ? String(variant.min_selling_price) : '0',
            image_path: variant.image_path || '',
            is_active: Boolean(variant.is_active),
        });

        // Convert any custom remaining attributes to key-value pairs
        const customList = Object.entries(restAttrs).map(([k, v]) => ({
            key: k,
            value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        }));
        setCustomAttrs(customList);

        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const cancelEdit = () => {
        setEditingVariant(null);
        setForm(initialForm);
        setCustomAttrs([]);
    };

    const addCustomAttr = () => {
        setCustomAttrs((prev) => [...prev, { key: '', value: '' }]);
    };

    const updateCustomAttr = (idx, field, val) => {
        setCustomAttrs((prev) => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: val };
            return updated;
        });
    };

    const removeCustomAttr = (idx) => {
        setCustomAttrs((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productId) {
            toast('warning', 'Please select a parent product first.');
            return;
        }

        try {
            // Build attributes object cleanly without raw JSON input
            const attributesObj = {};
            if (form.color?.trim()) {
                attributesObj.color = form.color.trim();
            }
            if (form.size?.trim()) {
                attributesObj.size = form.size.trim();
            }
            customAttrs.forEach((item) => {
                if (item.key?.trim() && item.value?.trim()) {
                    attributesObj[item.key.trim()] = item.value.trim();
                }
            });

            const payload = {
                name: form.name,
                sku: form.sku,
                barcode: form.barcode || null,
                attributes: attributesObj,
                purchase_price: Number(form.purchase_price || 0),
                wholesale_price: Number(form.wholesale_price || 0),
                selling_price: Number(form.selling_price),
                min_selling_price: Number(form.min_selling_price || 0),
                image_path: form.image_path || null,
                is_active: Boolean(form.is_active),
            };

            setSaving(true);
            if (editingVariant) {
                await axios.put(`/api/product-variants/${editingVariant.id}`, payload);
                toast('success', 'Variant updated successfully');
                setEditingVariant(null);
            } else {
                await axios.post(`/api/products/${productId}/variants`, payload);
                toast('success', 'Variant created successfully');
            }
            setForm(initialForm);
            setCustomAttrs([]);
            if (productId) {
                loadVariantsForProduct(productId);
            } else {
                loadAllVariants();
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            toast('error', errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || 'Could not save variant.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (variant) => {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: 'Delete this variant?',
                text: `Are you sure you want to delete variant "${variant.name}"? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
            });
            if (!res.isConfirmed) return;
        } else if (!confirm(`Delete variant "${variant.name}"?`)) {
            return;
        }

        try {
            await axios.delete(`/api/product-variants/${variant.id}`);
            toast('success', 'Variant deleted successfully');
            if (editingVariant?.id === variant.id) {
                cancelEdit();
            }
            if (productId) {
                loadVariantsForProduct(productId);
            } else {
                loadAllVariants();
            }
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not delete variant.');
        }
    };

    // Filter variants
    const filteredVariants = useMemo(() => {
        if (!search.trim()) return variants;
        const q = search.toLowerCase();
        return variants.filter((v) => {
            const prodName = v.product?.name || products.find((p) => p.id === v.product_id)?.name || '';
            return (
                v.name?.toLowerCase().includes(q) ||
                v.sku?.toLowerCase().includes(q) ||
                v.barcode?.toLowerCase().includes(q) ||
                prodName.toLowerCase().includes(q)
            );
        });
    }, [variants, search, products]);

    // Paginated slice
    const paginatedVariants = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredVariants.length) return filteredVariants;
        const start = (currentPage - 1) * pageSize;
        return filteredVariants.slice(start, start + pageSize);
    }, [filteredVariants, currentPage, pageSize]);

    const variantColumns = [
        { key: 'name', label: 'Variant' },
        { key: 'product', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        { key: 'price', label: 'Price' },
        { key: 'stock', label: 'Stock' },
        { key: 'status', label: 'Status' },
    ];

    const renderVariantCell = (v, key) => {
        switch (key) {
            case 'name':
                return v.name || '—';
            case 'product':
                return v.product?.name || products.find((p) => p.id === v.product_id)?.name || '—';
            case 'sku':
                return v.sku || '—';
            case 'price':
                return `৳${Number(v.selling_price || 0).toFixed(2)}`;
            case 'stock':
                return v.stock?.quantity ?? '—';
            case 'status':
                return v.is_active ? 'Active' : 'Inactive';
            default:
                return v[key] ?? '—';
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">PRODUCT CATALOG</span>
                    <h1>Product Variants</h1>
                    <p>Build color, size, and custom attribute combinations for items in your catalog.</p>
                </div>
                <button type="button" className="access-refresh" onClick={() => (productId ? loadVariantsForProduct(productId) : loadAllVariants())}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form to Add or Edit Variant */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">{editingVariant ? 'EDIT VARIANT' : 'NEW VARIANT'}</span>
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="mb-0">{editingVariant ? `Edit Variant #${editingVariant.id}` : 'Add Combination'}</h2>
                        {editingVariant && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-[11px] font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center"
                            >
                                <i className="ti ti-x mr-1 text-xs" /> Cancel Edit
                            </button>
                        )}
                    </div>
                    <p>{editingVariant ? `Editing variant #${editingVariant.id}. Modify attributes and click update.` : 'Select product and define SKU, color, size, and custom pricing.'}</p>

                    <label>
                        Parent Product *
                        <Select2
                            value={productId}
                            onChange={(e) => handleProductChange(e.target.value)}
                            required
                            placeholder="Choose parent product"
                            options={[
                                { value: '', label: 'Choose parent product' },
                                ...products.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                    sublabel: p.sku ? `(SKU: ${p.sku})` : null,
                                })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <label>
                        Variant Name *
                        <input
                            className="access-input"
                            type="text"
                            placeholder="e.g. Red / XL or 8GB / 128GB"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            Color
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. Red, Blue, Black"
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                            />
                        </label>
                        <label>
                            Size
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. S, M, L, XL"
                                value={form.size}
                                onChange={(e) => setForm({ ...form, size: e.target.value })}
                            />
                        </label>
                    </div>

                    {/* Additional Custom Attributes (No raw JSON!) */}
                    <div className="mt-2 mb-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Additional Attributes
                            </span>
                            <button
                                type="button"
                                onClick={addCustomAttr}
                                className="text-xs font-bold text-[#f47721] hover:text-[#ea580c] flex items-center gap-1 transition-colors"
                            >
                                <i className="ti ti-plus" /> Add Attribute
                            </button>
                        </div>

                        {customAttrs.length === 0 ? (
                            <p className="text-[11px] text-slate-400 m-0">
                                Need custom attributes like Storage, RAM, Weight or Material? Click &ldquo;+ Add Attribute&rdquo;.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {customAttrs.map((attr, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="access-input text-xs py-1.5 flex-1"
                                            placeholder="Attribute (e.g. Storage, RAM)"
                                            value={attr.key}
                                            onChange={(e) => updateCustomAttr(idx, 'key', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="access-input text-xs py-1.5 flex-1"
                                            placeholder="Value (e.g. 128GB, 8GB)"
                                            value={attr.value}
                                            onChange={(e) => updateCustomAttr(idx, 'value', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCustomAttr(idx)}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors"
                                            title="Remove attribute"
                                        >
                                            <i className="ti ti-trash text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            SKU *
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. SHIRT-RED-XL"
                                value={form.sku}
                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                required
                            />
                        </label>
                        <label>
                            Barcode
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. 890123456"
                                value={form.barcode}
                                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <label>
                            Selling Price (৳) *
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.selling_price}
                                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                                required
                            />
                        </label>
                        <label>
                            Purchase Price (৳)
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.purchase_price}
                                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Active Variant
                        </span>
                    </label>

                    <button className="access-submit mt-3" type="submit" disabled={!productId || saving}>
                        {saving ? 'Saving...' : editingVariant ? 'Update Variant' : 'Create Variant'} <i className="ti ti-arrow-right ml-1" />
                    </button>
                </form>

                {/* Variants List Table */}
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">INVENTORY DIRECTORY</span>
                                <h2>
                                    {productId ? 'Product Variants' : 'All Catalog Variants'}{' '}
                                    <small className="resource-total">({filteredVariants.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Product Variants"
                                columns={variantColumns}
                                data={filteredVariants}
                                renderCell={renderVariantCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search variants..."
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                                currentPage={currentPage}
                                totalItems={filteredVariants.length}
                                onPageChange={setCurrentPage}
                            />
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading variants...</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th>Variant</th>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedVariants.map((v) => (
                                            <tr key={v.id}>
                                                <td>
                                                    <strong>{v.name}</strong>
                                                    <small>
                                                        {Object.entries(v.attributes || {})
                                                            .map(([k, val]) => `${k}: ${val}`)
                                                            .join(' · ') || '—'}
                                                    </small>
                                                </td>
                                                <td>{v.product?.name || (products.find((p) => p.id === v.product_id)?.name) || '—'}</td>
                                                <td>
                                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                        {v.sku}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong className="text-emerald-600 dark:text-emerald-400">
                                                        ৳{Number(v.selling_price).toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td>{v.stock?.quantity ?? '—'}</td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            v.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                                : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                    >
                                                        {v.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(v)}
                                                        className="text-gray-400 hover:text-[#f47721] transition-colors p-1.5 mr-1 rounded hover:bg-orange-50"
                                                        title="Edit variant"
                                                    >
                                                        <i className="ti ti-edit text-base" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(v)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                                                        title="Delete variant"
                                                    >
                                                        <i className="ti ti-trash text-base" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredVariants.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-adjustments" />
                                        <p>No variants found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {!loading && filteredVariants.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredVariants.length}
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
