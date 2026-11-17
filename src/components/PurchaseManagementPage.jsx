'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';
import Link from 'next/link';

const emptyLine = {
    product_id: '',
    variant_id: '',
    quantity: '1',
    unit_cost: '',
    discount: '0',
    tax: '0',
    batch_number: '',
    manufactured_date: '',
    expiry_date: '',
};

const getPurchaseLineAmounts = (item) => {
    const quantity = Number(item.quantity) || 0;
    const purchasePrice = Number(item.unit_cost) || 0;
    const gross = quantity * purchasePrice;
    const discount = Number(item.discount) || 0;
    const taxable = Math.max(0, gross - discount);
    const taxAmount = taxable * (Number(item.tax) || 0) / 100;
    const total = taxable + taxAmount;
    return { gross, discount, taxAmount, total, unitCost: quantity ? total / quantity : 0 };
};

export default function PurchaseManagementPage({ mode = 'list' }) {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [header, setHeader] = useState({
        supplier_id: '',
        invoice_number: '',
        purchased_at: new Date().toISOString().slice(0, 10),
        discount: '0',
        tax: '0',
        paid_amount: '0',
    });
    const [line, setLine] = useState(emptyLine);
    const [lines, setLines] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);
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
            timer: 4000,
            timerProgressBar: true,
        });

    const load = async () => {
        setLoading(true);
        try {
            const [supplierResponse, productResponse, purchaseResponse] = await Promise.all([
                axios.get('/api/suppliers'),
                axios.get('/api/products'),
                axios.get('/api/purchases'),
            ]);
            setSuppliers(supplierResponse.data.data || []);
            setProducts(productResponse.data.data || []);
            const data = purchaseResponse.data.data;
            setPurchases(Array.isArray(data) ? data : data?.data || []);
        } catch {
            toast('error', 'Could not load purchasing data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const updateLine = (name, value) => setLine((previous) => ({ ...previous, [name]: value }));

    const selectProduct = async (productId) => {
        const selectedProduct = products.find((product) => String(product.id) === String(productId));
        setLine((previous) => ({
            ...previous,
            product_id: productId,
            variant_id: '',
            unit_cost: selectedProduct?.purchase_price != null ? String(selectedProduct.purchase_price) : '0',
        }));
        setVariants([]);
        if (!productId) return setVariants([]);
        try {
            const response = await axios.get(`/api/products/${productId}/variants`);
            setVariants(response.data.data || []);
        } catch {
            toast('error', 'Could not load variants.');
        }
    };

    const addLine = (event) => {
        event.preventDefault();
        const product = products.find((item) => String(item.id) === String(line.product_id));
        const variant = variants.find((item) => String(item.id) === String(line.variant_id));
        if (!product) return toast('warning', 'Select a product before adding the line.');
        setLines((previous) => [...previous, {
            ...line,
            quantity: line.quantity || '1',
            unit_cost: line.unit_cost || '0',
            product,
            variant,
        }]);
        setLine(emptyLine);
        setVariants([]);
        setProductSearch('');
        setShowProductSuggestions(false);
    };

    const updatePurchaseLine = (index, name, value) => {
        setLines((previous) => previous.map((item, itemIndex) =>
            itemIndex === index ? { ...item, [name]: value } : item
        ));
    };

    const subtotal = lines.reduce((value, item) => value + getPurchaseLineAmounts(item).gross, 0);
    const itemTotal = lines.reduce((value, item) => value + getPurchaseLineAmounts(item).total, 0);
    const total = Math.max(0, itemTotal - Number(header.discount || 0) + Number(header.tax || 0));

    const submit = async (event) => {
        event.preventDefault();
        if (!lines.length) return toast('warning', 'Add at least one purchase item.');
        if (lines.some((item) => !Number(item.quantity) || Number(item.quantity) < 1)) {
            return toast('warning', 'Enter a stock quantity of at least 1 for every product.');
        }
        if (lines.some((item) => item.unit_cost === '' || Number(item.unit_cost) < 0)) {
            return toast('warning', 'Enter a valid unit cost for every product.');
        }
        setSaving(true);
        try {
            await axios.post('/api/purchases', {
                ...header,
                supplier_id: Number(header.supplier_id),
                discount: Number(header.discount || 0),
                tax: Number(header.tax || 0),
                paid_amount: Number(header.paid_amount || 0),
                items: lines.map(({ product, variant, ...item }) => ({
                    ...item,
                    product_id: Number(item.product_id),
                    variant_id: item.variant_id ? Number(item.variant_id) : null,
                    quantity: Number(item.quantity),
                    unit_cost: Number(item.unit_cost),
                    discount: Number(item.discount || 0),
                    tax: getPurchaseLineAmounts(item).taxAmount,
                })),
            });
            toast('success', 'Purchase created successfully');
            setLines([]);
            setHeader({ ...header, invoice_number: '', paid_amount: '0' });
            load();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not create purchase.');
        } finally {
            setSaving(false);
        }
    };

    const filteredPurchases = useMemo(() => {
        if (!search.trim()) return purchases;
        const q = search.toLowerCase();
        return purchases.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    }, [purchases, search]);

    const paginatedPurchases = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredPurchases.length) return filteredPurchases;
        const start = (currentPage - 1) * pageSize;
        return filteredPurchases.slice(start, start + pageSize);
    }, [filteredPurchases, currentPage, pageSize]);

    const purchaseColumns = [
        { key: 'invoice_number', label: 'Invoice #' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'total', label: 'Total' },
        { key: 'purchased_at', label: 'Date' },
    ];

    const renderPurchaseCell = (p, key) => {
        switch (key) {
            case 'invoice_number':
                return p.invoice_number || '—';
            case 'supplier':
                return p.supplier?.name || '—';
            case 'total':
                return `৳ ${Number(p.total || 0).toLocaleString()}`;
            case 'purchased_at':
                return p.purchased_at || '—';
            default:
                return p[key] ?? '—';
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">PURCHASING</span>
                    <h1>{mode === 'create' ? 'Create purchase' : 'Purchases'}</h1>
                    <p>{mode === 'create' ? 'Add multiple products to one supplier invoice.' : 'Review purchase invoices and received stock.'}</p>
                </div>
                {mode === 'create' ? (
                    <Link href="/dashboard/purchases" className="access-refresh"><i className="ti ti-arrow-left" /> Back to purchases</Link>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/purchases/create" className="access-submit inline-flex items-center"><i className="ti ti-plus mr-1" /> New purchase</Link>
                        <button type="button" className="access-refresh" onClick={load}><i className="ti ti-refresh" /> Refresh</button>
                    </div>
                )}
            </div>

            <div className="purchase-layout purchase-page-layout">
                {mode === 'create' && (
                <form className="access-panel create-panel purchase-form" onSubmit={submit}>
                    <div className="product-form-heading">
                        <div>
                            <span className="access-kicker">PURCHASE INVOICE</span>
                            <h2>New purchase</h2>
                        </div>
                        <span className="product-required">* Required</span>
                    </div>

                    <div className="product-grid">
                        <label>
                            Supplier<sup>*</sup>
                            <Select2
                                value={header.supplier_id}
                                onChange={(event) => setHeader({ ...header, supplier_id: event.target.value })}
                                required
                                placeholder="Select supplier"
                                options={[
                                    { value: '', label: 'Select supplier' },
                                    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
                                ]}
                                className="mt-1"
                            />
                        </label>
                        <label>
                            Invoice number<sup>*</sup>
                            <input
                                className="access-input"
                                value={header.invoice_number}
                                onChange={(event) => setHeader({ ...header, invoice_number: event.target.value })}
                                required
                            />
                        </label>
                        <label>
                            Purchase date<sup>*</sup>
                            <input
                                className="access-input"
                                type="date"
                                value={header.purchased_at}
                                onChange={(event) => setHeader({ ...header, purchased_at: event.target.value })}
                                required
                            />
                        </label>
                    </div>

                    <div className="purchase-line-box">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                                <h3 className="mb-0">Add Purchase Items</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-0">Search a product by name or SKU, add it, then enter its stock quantity in the table.</p>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{lines.length} product{lines.length === 1 ? '' : 's'} in this invoice</span>
                        </div>
                        <div className="purchase-product-picker">
                            <label className="purchase-product-search">
                                Product<sup>*</sup>
                                <div className="purchase-product-search-wrap">
                                    <input
                                        className="access-input"
                                        value={productSearch}
                                        onChange={(event) => {
                                            setProductSearch(event.target.value);
                                            setShowProductSuggestions(true);
                                            if (line.product_id) setLine((previous) => ({ ...previous, product_id: '', variant_id: '' }));
                                            setVariants([]);
                                        }}
                                        onFocus={() => setShowProductSuggestions(true)}
                                        placeholder="Search Product by name or SKU"
                                        autoComplete="off"
                                    />
                                    {showProductSuggestions && productSearch.trim() && (
                                        <div className="purchase-product-suggestions">
                                            {products.filter((product) => `${product.name || ''} ${product.sku || ''} ${product.barcode || ''}`.toLowerCase().includes(productSearch.trim().toLowerCase())).slice(0, 10).map((product) => (
                                                <button key={product.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => {
                                                    setProductSearch(product.name);
                                                    setShowProductSuggestions(false);
                                                    selectProduct(String(product.id));
                                                }}>
                                                    <span><strong>{product.name}</strong><small>{product.sku || product.barcode || 'No SKU'}</small></span>
                                                    <i className="ti ti-plus" />
                                                </button>
                                            ))}
                                            {!products.some((product) => `${product.name || ''} ${product.sku || ''} ${product.barcode || ''}`.toLowerCase().includes(productSearch.trim().toLowerCase())) && <p>No products match this search.</p>}
                                        </div>
                                    )}
                                </div>
                            </label>
                            <button className="access-refresh purchase-add-line" type="button" onClick={addLine} disabled={!line.product_id}>
                                <i className="ti ti-plus" /> Add product
                            </button>
                        </div>
                        <div className="product-grid purchase-product-details">
                            <label>
                                Variant
                                <Select2
                                    value={line.variant_id}
                                    onChange={(event) => updateLine('variant_id', event.target.value)}
                                    placeholder="Base product"
                                    options={[
                                        { value: '', label: 'Base product' },
                                        ...variants.map((v) => ({
                                            value: v.id,
                                            label: `${v.name} · ${v.sku}`,
                                            sublabel: v.attributes ? `(${Object.values(v.attributes).join(', ')})` : null,
                                        })),
                                    ]}
                                    className="mt-1"
                                />
                            </label>
                            <label>
                                Batch number
                                <input
                                    className="access-input"
                                    value={line.batch_number}
                                    onChange={(event) => updateLine('batch_number', event.target.value)}
                                />
                            </label>
                            <label>
                                Manufactured date
                                <input
                                    className="access-input"
                                    type="date"
                                    value={line.manufactured_date}
                                    onChange={(event) => updateLine('manufactured_date', event.target.value)}
                                />
                            </label>
                            <label>
                                Expiry date
                                <input
                                    className="access-input"
                                    type="date"
                                    value={line.expiry_date}
                                    onChange={(event) => updateLine('expiry_date', event.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="purchase-lines">
                        <div className="purchase-items-heading">
                            <strong>Products in this purchase</strong>
                            <span>{lines.length} items</span>
                        </div>
                        <div className="resource-table-wrap purchase-items-table-wrap">
                            <table className="resource-table purchase-items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th><th>Stock Qty</th><th>Purchase Price</th><th>Discount</th>
                                        <th>Tax (%)</th><th>Tax Amount</th><th>Unit Cost</th><th>Total Cost</th><th aria-label="Actions" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((item, index) => {
                                        const amounts = getPurchaseLineAmounts(item);
                                        return (
                                            <tr key={`${item.product_id}-${index}`}>
                                                <td className="purchase-item-name"><strong>{item.product.name}</strong><small>{item.product.sku || item.variant?.sku || '—'}{item.variant ? ` · ${item.variant.name}` : ''}</small></td>
                                                <td><input aria-label={`Stock quantity for ${item.product.name}`} className="access-input purchase-item-input" type="number" min="1" value={item.quantity} onChange={(event) => updatePurchaseLine(index, 'quantity', event.target.value)} /></td>
                                                <td><input aria-label={`Purchase price for ${item.product.name}`} className="access-input purchase-item-input" type="number" min="0" step="0.01" value={item.unit_cost} onChange={(event) => updatePurchaseLine(index, 'unit_cost', event.target.value)} /></td>
                                                <td><input aria-label={`Discount for ${item.product.name}`} className="access-input purchase-item-input" type="number" min="0" step="0.01" value={item.discount} onChange={(event) => updatePurchaseLine(index, 'discount', event.target.value)} /></td>
                                                <td><input aria-label={`Tax percentage for ${item.product.name}`} className="access-input purchase-item-input" type="number" min="0" step="0.01" value={item.tax} onChange={(event) => updatePurchaseLine(index, 'tax', event.target.value)} /></td>
                                                <td>৳ {amounts.taxAmount.toFixed(2)}</td>
                                                <td>৳ {amounts.unitCost.toFixed(2)}</td>
                                                <td className="font-bold">৳ {amounts.total.toFixed(2)}</td>
                                                <td><button type="button" className="purchase-remove-item" onClick={() => setLines((previous) => previous.filter((_, currentIndex) => currentIndex !== index))} aria-label={`Remove ${item.product.name}`}><i className="ti ti-trash" /></button></td>
                                            </tr>
                                        );
                                    })}
                                    {!lines.length && <tr><td colSpan="9" className="purchase-items-empty">Search a product by name or SKU above, then add it here.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="purchase-total">
                        <span>
                            Subtotal <b>{subtotal.toFixed(2)}</b>
                        </span>
                        <label>
                            Discount
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                value={header.discount}
                                onChange={(event) => setHeader({ ...header, discount: event.target.value })}
                            />
                        </label>
                        <label>
                            Tax
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                value={header.tax}
                                onChange={(event) => setHeader({ ...header, tax: event.target.value })}
                            />
                        </label>
                        <label>
                            Paid amount
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                value={header.paid_amount}
                                onChange={(event) => setHeader({ ...header, paid_amount: event.target.value })}
                            />
                        </label>
                        <strong>
                            Total <b>{total.toFixed(2)}</b>
                        </strong>
                    </div>

                    <button className="access-submit" type="submit" disabled={saving}>
                        {saving ? 'Saving purchase...' : 'Create purchase'}
                        <i className="ti ti-arrow-up-right" />
                    </button>
                </form>
                )}

                {mode === 'list' && (
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">PURCHASE HISTORY</span>
                                <h2>
                                    Recent invoices <small className="resource-total">({filteredPurchases.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Purchases"
                                columns={purchaseColumns}
                                data={filteredPurchases}
                                renderCell={renderPurchaseCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search purchases..."
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                                currentPage={currentPage}
                                totalItems={filteredPurchases.length}
                                onPageChange={setCurrentPage}
                            />
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading purchases...</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice</th>
                                            <th>Supplier</th>
                                            <th>Total</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPurchases.map((purchase) => (
                                            <tr key={purchase.id}>
                                                <td className="font-mono font-bold text-[#f47721]">{purchase.invoice_number}</td>
                                                <td>{purchase.supplier?.name || '—'}</td>
                                                <td className="font-bold">৳ {Number(purchase.total || 0).toLocaleString()}</td>
                                                <td>{purchase.purchased_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredPurchases.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-inbox" />
                                        <p>No purchases found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!loading && filteredPurchases.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredPurchases.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
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
