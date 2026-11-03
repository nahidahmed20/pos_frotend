'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

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

export default function PurchasesPage() {
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

    const updateLine = (name, value) => setLine({ ...line, [name]: value });

    const selectProduct = async (productId) => {
        updateLine('product_id', productId);
        updateLine('variant_id', '');
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
        if (!product) return;
        setLines([...lines, { ...line, product, variant }]);
        setLine(emptyLine);
        setVariants([]);
    };

    const subtotal = lines.reduce((value, item) => value + Number(item.quantity) * Number(item.unit_cost), 0);
    const total = subtotal - Number(header.discount || 0) + Number(header.tax || 0);

    const submit = async (event) => {
        event.preventDefault();
        if (!lines.length) return toast('warning', 'Add at least one purchase item.');
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
                    tax: Number(item.tax || 0),
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
                    <h1>Purchases</h1>
                    <p>Receive products and variants with batch and expiry tracking.</p>
                </div>
                <button type="button" className="access-refresh" onClick={load}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="purchase-layout">
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
                        <h3>Add product line</h3>
                        <div className="product-grid">
                            <label>
                                Product<sup>*</sup>
                                <Select2
                                    value={line.product_id}
                                    onChange={(event) => selectProduct(event.target.value)}
                                    required
                                    placeholder="Select product"
                                    options={[
                                        { value: '', label: 'Select product' },
                                        ...products.map((p) => ({
                                            value: p.id,
                                            label: p.name,
                                            sublabel: p.sku ? `· ${p.sku}` : null,
                                        })),
                                    ]}
                                    className="mt-1"
                                />
                            </label>
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
                                Quantity<sup>*</sup>
                                <input
                                    className="access-input"
                                    type="number"
                                    min="1"
                                    value={line.quantity}
                                    onChange={(event) => updateLine('quantity', event.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Unit cost<sup>*</sup>
                                <input
                                    className="access-input"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={line.unit_cost}
                                    onChange={(event) => updateLine('unit_cost', event.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Line discount
                                <input
                                    className="access-input"
                                    type="number"
                                    min="0"
                                    value={line.discount}
                                    onChange={(event) => updateLine('discount', event.target.value)}
                                />
                            </label>
                            <label>
                                Line tax
                                <input
                                    className="access-input"
                                    type="number"
                                    min="0"
                                    value={line.tax}
                                    onChange={(event) => updateLine('tax', event.target.value)}
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
                        <button className="access-refresh purchase-add-line" type="button" onClick={addLine}>
                            <i className="ti ti-plus" /> Add line
                        </button>
                    </div>

                    <div className="purchase-lines">
                        {lines.map((item, index) => (
                            <div className="purchase-line" key={`${item.product_id}-${index}`}>
                                <span className="record-mark">
                                    <i className="ti ti-package" />
                                </span>
                                <span>
                                    <strong>
                                        {item.product.name}
                                        {item.variant ? ` · ${item.variant.name}` : ''}
                                    </strong>
                                    <small>
                                        {item.quantity} × {item.unit_cost} · Batch {item.batch_number || 'N/A'}
                                    </small>
                                </span>
                                <b>{(Number(item.quantity) * Number(item.unit_cost)).toFixed(2)}</b>
                                <button
                                    type="button"
                                    onClick={() => setLines(lines.filter((_, currentIndex) => currentIndex !== index))}
                                    aria-label="Remove line"
                                >
                                    <i className="ti ti-trash" />
                                </button>
                            </div>
                        ))}
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
            </div>
        </div>
    );
}
