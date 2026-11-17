'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

const defaults = {
    name: '', short_name: '', brand: '', category_id: '', sku: '', barcode: '', secondary_barcode: '', unit: 'pcs',
    product_type: 'standard', model_number: '', description: '', image_path: '', weight: '', length: '', width: '', height: '', warranty_months: '',
    purchase_price: '0', wholesale_price: '0', selling_price: '', min_selling_price: '0', tax_rate: '0',
    is_sellable: true, is_purchasable: true, track_stock: true, has_expiry: false, is_serialized: false, allow_negative_stock: false, is_active: true,
};

const fields = [
    ['name', 'Name', 'text', true], ['short_name', 'Short name'], ['brand', 'Brand'], ['category_id', 'Category ID', 'number', true], ['sku', 'SKU', 'text', true], ['barcode', 'Barcode'], ['secondary_barcode', 'Secondary barcode'], ['unit', 'Unit', 'text', true], ['product_type', 'Product type'], ['model_number', 'Model number'],
    ['description', 'Description', 'textarea'], ['image_path', 'Image path'], ['weight', 'Weight', 'number'], ['length', 'Length', 'number'], ['width', 'Width', 'number'], ['height', 'Height', 'number'], ['warranty_months', 'Warranty (months)', 'number'], ['purchase_price', 'Purchase price', 'number'], ['wholesale_price', 'Wholesale price', 'number'], ['selling_price', 'Selling price', 'number', true], ['min_selling_price', 'Minimum selling price', 'number'], ['tax_rate', 'Tax rate (%)', 'number'],
];

const toggles = [
    ['is_sellable', 'Sellable'], ['is_purchasable', 'Purchasable'], ['track_stock', 'Track stock'], ['has_expiry', 'Has expiry'], ['is_serialized', 'Serialized'], ['allow_negative_stock', 'Allow negative stock'], ['is_active', 'Active status'],
];

import Link from 'next/link';

export default function ProductManagementPage({ mode = 'list' }) {
    const [form, setForm] = useState(defaults);
    const [editingProduct, setEditingProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
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

    const load = async () => {
        setLoading(true);
        try {
            const [productResponse, categoryResponse] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/categories'),
            ]);
            setProducts(productResponse.data.data || []);
            setCategories(categoryResponse.data.data || []);
        } catch {
            toast('error', 'Could not load products or categories.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && products.length > 0) {
            const editId = new URLSearchParams(window.location.search).get('edit');
            if (editId) {
                const target = products.find((p) => String(p.id) === String(editId));
                if (target) startEdit(target);
            }
        }
    }, [products]);

    const change = (name, value) => setForm({ ...form, [name]: value });

    const startEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name || '',
            short_name: product.short_name || '',
            brand: product.brand || '',
            category_id: product.category_id ? String(product.category_id) : '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            secondary_barcode: product.secondary_barcode || '',
            unit: product.unit || 'pcs',
            product_type: product.product_type || 'standard',
            model_number: product.model_number || '',
            description: product.description || '',
            image_path: product.image_path || '',
            weight: product.weight !== null && product.weight !== undefined ? String(product.weight) : '',
            length: product.length !== null && product.length !== undefined ? String(product.length) : '',
            width: product.width !== null && product.width !== undefined ? String(product.width) : '',
            height: product.height !== null && product.height !== undefined ? String(product.height) : '',
            warranty_months: product.warranty_months !== null && product.warranty_months !== undefined ? String(product.warranty_months) : '',
            purchase_price: product.purchase_price !== null && product.purchase_price !== undefined ? String(product.purchase_price) : '0',
            wholesale_price: product.wholesale_price !== null && product.wholesale_price !== undefined ? String(product.wholesale_price) : '0',
            selling_price: product.selling_price !== null && product.selling_price !== undefined ? String(product.selling_price) : '',
            min_selling_price: product.min_selling_price !== null && product.min_selling_price !== undefined ? String(product.min_selling_price) : '0',
            tax_rate: product.tax_rate !== null && product.tax_rate !== undefined ? String(product.tax_rate) : '0',
            is_sellable: Boolean(product.is_sellable),
            is_purchasable: Boolean(product.is_purchasable),
            track_stock: Boolean(product.track_stock),
            has_expiry: Boolean(product.has_expiry),
            is_serialized: Boolean(product.is_serialized),
            allow_negative_stock: Boolean(product.allow_negative_stock),
            is_active: Boolean(product.is_active),
        });
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setForm(defaults);
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const numeric = ['category_id', 'weight', 'length', 'width', 'height', 'warranty_months', 'purchase_price', 'wholesale_price', 'selling_price', 'min_selling_price', 'tax_rate'];
            const payload = { ...form };
            numeric.forEach((key) => {
                if (payload[key] !== '' && payload[key] !== null && payload[key] !== undefined) {
                    payload[key] = Number(payload[key]);
                } else if (key === 'category_id' || key === 'selling_price') {
                    payload[key] = Number(payload[key] || 0);
                } else {
                    payload[key] = null;
                }
            });

            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id}`, payload);
                toast('success', 'Product updated successfully');
                setEditingProduct(null);
            } else {
                await axios.post('/api/products', payload);
                toast('success', 'Product created successfully');
            }
            setForm(defaults);
            load();
        } catch (error) {
            const errors = error.response?.data?.errors;
            toast('error', errors ? Object.values(errors).flat().join(' ') : error.response?.data?.message || 'Could not save product.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: 'Delete this product?',
                text: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
            });
            if (!res.isConfirmed) return;
        } else if (!confirm(`Delete "${product.name}"?`)) {
            return;
        }

        try {
            await axios.delete(`/api/products/${product.id}`);
            toast('success', 'Product deleted successfully');
            if (editingProduct?.id === product.id) {
                cancelEdit();
            }
            load();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not delete product.');
        }
    };

    // Filter products
    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter((p) =>
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q) ||
            p.category?.name?.toLowerCase().includes(q)
        );
    }, [products, search]);

    // Paginated slice
    const paginatedProducts = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredProducts.length) return filteredProducts;
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    const productColumns = [
        { key: 'name', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price' },
        { key: 'stock', label: 'Stock' },
    ];

    const renderProductCell = (product, key) => {
        switch (key) {
            case 'name':
                return product.name || '—';
            case 'sku':
                return product.sku || '—';
            case 'category':
                return product.category?.name || '—';
            case 'price':
                return `৳${Number(product.selling_price || 0).toFixed(2)}`;
            case 'stock':
                return product.stock?.quantity ?? 0;
            default:
                return product[key] ?? '—';
        }
    };

    return (
        <div className={`resource-page ${mode === 'create' ? 'resource-page-full' : ''}`}>
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">PRODUCT CATALOG</span>
                    <h1>{mode === 'create' ? 'Create product' : 'Products'}</h1>
                    <p>{mode === 'create' ? 'Enter product details, pricing, tax, and availability.' : 'Browse and manage your product catalog.'}</p>
                </div>
                {mode === 'create' ? (
                    <Link href="/dashboard/products" className="access-refresh"><i className="ti ti-arrow-left" /> Back to products</Link>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/products/create" className="access-submit inline-flex items-center"><i className="ti ti-plus mr-1" /> Create product</Link>
                        <button type="button" className="access-refresh" onClick={load}>
                            <i className="ti ti-refresh" /><span>Refresh</span>
                        </button>
                    </div>
                )}
            </div>

            <div className={mode === 'create' ? 'product-create-layout' : 'product-list-layout'}>
                {mode === 'create' && (
                <form className="access-panel product-form" onSubmit={submit}>
                    <div className="product-form-heading flex items-center justify-between">
                        <div>
                            <span className="access-kicker">{editingProduct ? 'EDIT PRODUCT' : 'PRODUCT DETAILS'}</span>
                            <h2>{editingProduct ? `Edit ${editingProduct.name}` : 'Create product'}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {editingProduct && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-[11px] font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center"
                                >
                                    <i className="ti ti-x mr-1 text-xs" /> Cancel Edit
                                </button>
                            )}
                            <span className="product-required">* Required</span>
                        </div>
                    </div>

                    <div className="product-section">
                        <h3>Identity</h3>
                        <div className="product-grid">
                            {fields.slice(0, 10).map((field) => (
                                <ProductField
                                    key={field[0]}
                                    field={field}
                                    value={form[field[0]]}
                                    onChange={change}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="product-section">
                        <h3>Physical information</h3>
                        <div className="product-grid">
                            {fields.slice(10, 17).map((field) => (
                                <ProductField
                                    key={field[0]}
                                    field={field}
                                    value={form[field[0]]}
                                    onChange={change}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="product-section">
                        <h3>Pricing and tax</h3>
                        <div className="product-grid">
                            {fields.slice(17).map((field) => (
                                <ProductField
                                    key={field[0]}
                                    field={field}
                                    value={form[field[0]]}
                                    onChange={change}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="product-section">
                        <h3>Availability rules</h3>
                        <div className="product-toggles">
                            {toggles.map(([name, label]) => (
                                <label key={name} className={form[name] ? 'checked' : ''}>
                                    <input
                                        type="checkbox"
                                        checked={form[name]}
                                        onChange={(event) => change(name, event.target.checked)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="access-submit" disabled={saving} type="submit">
                        {saving ? 'Saving product...' : editingProduct ? 'Update product' : 'Create product'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>
                )}

                {/* Directory Column */}
                {mode === 'list' && (
                <section className="access-panel records-panel product-directory flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">DIRECTORY</span>
                                <h2>
                                    Product list <small className="resource-total">({filteredProducts.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Products"
                                columns={productColumns}
                                data={filteredProducts}
                                renderCell={renderProductCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search products..."
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                                currentPage={currentPage}
                                totalItems={filteredProducts.length}
                                onPageChange={setCurrentPage}
                            />
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading products...</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <strong>{product.name}</strong>
                                                    <small>{product.brand || product.short_name || 'Standard product'}</small>
                                                </td>
                                                <td>{product.sku}</td>
                                                <td>{product.category?.name || '—'}</td>
                                                <td>৳{Number(product.selling_price || 0).toFixed(2)}</td>
                                                <td>
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        (product.stock?.quantity ?? 0) <= 0
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                        {product.stock?.quantity ?? 0}
                                                    </span>
                                                </td>
                                                <td className="text-right whitespace-nowrap">
                                                    <Link
                                                        href={`/dashboard/products/create?edit=${product.id}`}
                                                        className="text-gray-400 hover:text-[#f47721] transition-colors p-1.5 mr-1 rounded hover:bg-orange-50 inline-block"
                                                        title="Edit product"
                                                    >
                                                        <i className="ti ti-edit text-base" />
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/product-variants?product_id=${product.id}`}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 mr-1 rounded hover:bg-blue-50 inline-block align-middle"
                                                        title="Manage variants"
                                                    >
                                                        <i className="ti ti-adjustments text-base" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(product)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                                                        title="Delete product"
                                                    >
                                                        <i className="ti ti-trash text-base" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredProducts.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-inbox" />
                                        <p>No products found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {!loading && filteredProducts.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredProducts.length}
                            pageSize={pageSize}
                            onPageChange={(p) => setCurrentPage(p)}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </section>
                )}
            </div>
        </div>
    );
}

function ProductField({ field, value, onChange, categories = [] }) {
    const [name, label, type = 'text', required] = field;
    const control =
        name === 'category_id' ? (
            <Select2
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
                required={required}
                placeholder="Select category"
                options={[
                    { value: '', label: 'Select category' },
                    ...categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                        sublabel: category.parent?.name ? `(${category.parent.name})` : null,
                    })),
                ]}
                className="mt-1"
            />
        ) : type === 'textarea' ? (
            <textarea
                className="access-input product-textarea"
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
                placeholder="Add product description"
            />
        ) : (
            <input
                className="access-input"
                type={type}
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
                placeholder={label}
                required={required}
                min="0"
                step={type === 'number' ? '0.01' : undefined}
            />
        );
    return (
        <label>
            {label}
            {required && <sup>*</sup>}
            {control}
        </label>
    );
}
