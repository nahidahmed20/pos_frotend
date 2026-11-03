'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

export default function StockPage() {
    const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements' | 'batches'
    const [stocks, setStocks] = useState([]);
    const [movements, setMovements] = useState([]);
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Form states
    const [stockForm, setStockForm] = useState({ product_id: '', branch_id: '', quantity: '', reorder_level: '0' });
    const [movementForm, setMovementForm] = useState({ product_id: '', branch_id: '', quantity: '', note: '' });
    const [batchForm, setBatchForm] = useState({
        product_id: '',
        branch_id: '',
        quantity: '',
        batch_number: '',
        manufactured_date: '',
        expiry_date: '',
        note: '',
    });

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

    const loadData = async () => {
        setLoading(true);
        try {
            const [stockRes, prodRes, branchRes] = await Promise.all([
                axios.get('/api/stocks'),
                axios.get('/api/products'),
                axios.get('/api/branches').catch(() => ({ data: { data: [] } })),
            ]);
            setStocks(stockRes.data.data || []);
            setProducts(prodRes.data.data || []);
            setBranches(branchRes.data.data || []);

            if (activeTab === 'movements') {
                const movRes = await axios.get('/api/stock-movements');
                setMovements(movRes.data.data?.data || movRes.data.data || []);
            } else if (activeTab === 'batches') {
                const batchRes = await axios.get('/api/stock-batches');
                setBatches(batchRes.data.data?.data || batchRes.data.data || []);
            }
        } catch {
            toast('error', 'Could not load inventory data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setSearch('');
        setCurrentPage(1);
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/products/${stockForm.product_id}/stock`, {
                branch_id: stockForm.branch_id ? Number(stockForm.branch_id) : null,
                quantity: Number(stockForm.quantity),
                reorder_level: Number(stockForm.reorder_level || 0),
            });
            toast('success', 'Stock updated successfully');
            setStockForm({ product_id: '', branch_id: '', quantity: '', reorder_level: '0' });
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not update stock.');
        }
    };

    const selectStockForEdit = (stock) => {
        setStockForm({
            product_id: String(stock.product_id || ''),
            branch_id: stock.branch_id ? String(stock.branch_id) : '',
            quantity: String(stock.quantity ?? ''),
            reorder_level: String(stock.reorder_level ?? '0'),
        });
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleMovementCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/stock-movements', {
                product_id: Number(movementForm.product_id),
                branch_id: movementForm.branch_id ? Number(movementForm.branch_id) : null,
                quantity: Number(movementForm.quantity),
                note: movementForm.note || null,
            });
            toast('success', 'Stock movement recorded successfully');
            setMovementForm({ product_id: '', branch_id: '', quantity: '', note: '' });
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Failed to record movement.');
        }
    };

    const handleBatchCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/stock-batches/opening', {
                product_id: Number(batchForm.product_id),
                branch_id: batchForm.branch_id ? Number(batchForm.branch_id) : null,
                quantity: Number(batchForm.quantity),
                batch_number: batchForm.batch_number || null,
                manufactured_date: batchForm.manufactured_date || null,
                expiry_date: batchForm.expiry_date,
                note: batchForm.note || null,
            });
            toast('success', 'Opening stock batch registered');
            setBatchForm({
                product_id: '',
                branch_id: '',
                quantity: '',
                batch_number: '',
                manufactured_date: '',
                expiry_date: '',
                note: '',
            });
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Failed to register batch.');
        }
    };

    // --- TAB 1: STOCKS ---
    const filteredStocks = useMemo(() => {
        if (!search.trim()) return stocks;
        const q = search.toLowerCase();
        return stocks.filter((s) => {
            const prodName = s.product?.name || '';
            const sku = s.product?.sku || '';
            const branch = s.branch?.name || '';
            return prodName.toLowerCase().includes(q) || sku.toLowerCase().includes(q) || branch.toLowerCase().includes(q);
        });
    }, [stocks, search]);

    const paginatedStocks = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredStocks.length) return filteredStocks;
        const start = (currentPage - 1) * pageSize;
        return filteredStocks.slice(start, start + pageSize);
    }, [filteredStocks, currentPage, pageSize]);

    const stockColumns = [
        { key: 'sl', label: 'SL' },
        { key: 'product', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        { key: 'branch', label: 'Branch' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'reorder_level', label: 'Reorder At' },
        { key: 'status', label: 'Status' },
    ];

    const renderStockCell = (stock, key, idx) => {
        switch (key) {
            case 'sl':
                return idx !== undefined ? idx + 1 : (stock.id ?? '—');
            case 'product':
                return stock.product?.name || '—';
            case 'sku':
                return stock.product?.sku || '—';
            case 'branch':
                return stock.branch?.name || 'Main Branch';
            case 'quantity':
                return stock.quantity ?? 0;
            case 'reorder_level':
                return stock.reorder_level ?? '—';
            case 'status':
                return (stock.quantity <= (stock.reorder_level || 5)) ? 'Low Stock' : 'Adequate';
            default:
                return stock[key] ?? '—';
        }
    };

    // --- TAB 2: MOVEMENTS ---
    const filteredMovements = useMemo(() => {
        if (!search.trim()) return movements;
        const q = search.toLowerCase();
        return movements.filter((m) => {
            const prodName = m.product?.name || '';
            const sku = m.product?.sku || '';
            const type = m.type || '';
            const note = m.note || '';
            const user = m.user?.name || '';
            return prodName.toLowerCase().includes(q) || sku.toLowerCase().includes(q) || type.toLowerCase().includes(q) || note.toLowerCase().includes(q) || user.toLowerCase().includes(q);
        });
    }, [movements, search]);

    const paginatedMovements = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredMovements.length) return filteredMovements;
        const start = (currentPage - 1) * pageSize;
        return filteredMovements.slice(start, start + pageSize);
    }, [filteredMovements, currentPage, pageSize]);

    const movementColumns = [
        { key: 'sl', label: 'SL' },
        { key: 'product', label: 'Product' },
        { key: 'type', label: 'Type' },
        { key: 'quantity', label: 'Qty Changed' },
        { key: 'balance_after', label: 'Balance After' },
        { key: 'user', label: 'Logged By' },
        { key: 'date', label: 'Date' },
    ];

    const renderMovementCell = (m, key, idx) => {
        switch (key) {
            case 'sl':
                return idx !== undefined ? idx + 1 : (m.id ?? '—');
            case 'product':
                return m.product?.name || '—';
            case 'type':
                return m.type || '—';
            case 'quantity':
                return m.quantity > 0 ? `+${m.quantity}` : m.quantity;
            case 'balance_after':
                return m.balance_after ?? '—';
            case 'user':
                return m.user?.name || 'System';
            case 'date':
                return m.created_at ? new Date(m.created_at).toLocaleDateString() : '—';
            default:
                return m[key] ?? '—';
        }
    };

    // --- TAB 3: BATCHES ---
    const filteredBatches = useMemo(() => {
        if (!search.trim()) return batches;
        const q = search.toLowerCase();
        return batches.filter((b) => {
            const prodName = b.product?.name || '';
            const sku = b.product?.sku || '';
            const batchNum = b.batch_number || '';
            return prodName.toLowerCase().includes(q) || sku.toLowerCase().includes(q) || batchNum.toLowerCase().includes(q);
        });
    }, [batches, search]);

    const paginatedBatches = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredBatches.length) return filteredBatches;
        const start = (currentPage - 1) * pageSize;
        return filteredBatches.slice(start, start + pageSize);
    }, [filteredBatches, currentPage, pageSize]);

    const batchColumns = [
        { key: 'sl', label: 'SL' },
        { key: 'product', label: 'Product' },
        { key: 'batch_number', label: 'Batch #' },
        { key: 'quantity', label: 'Qty Remaining' },
        { key: 'unit_cost', label: 'Unit Cost' },
        { key: 'expiry_date', label: 'Expiry Date' },
    ];

    const renderBatchCell = (b, key, idx) => {
        switch (key) {
            case 'sl':
                return idx !== undefined ? idx + 1 : (b.id ?? '—');
            case 'product':
                return b.product?.name || '—';
            case 'batch_number':
                return b.batch_number || 'Default';
            case 'quantity':
                return b.quantity ?? 0;
            case 'unit_cost':
                return b.unit_cost ? `৳${b.unit_cost}` : '—';
            case 'expiry_date':
                return b.expiry_date || '—';
            default:
                return b[key] ?? '—';
        }
    };

    const getBaseIndex = () => {
        return pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">INVENTORY CONTROL</span>
                    <h1>Stock &amp; Inventory Hub</h1>
                    <p>Monitor branch stock levels, log movements, and manage product batch tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Navigation Tabs */}
                    <div className="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleTabSwitch('stock')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                activeTab === 'stock'
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <i className="ti ti-archive me-1" /> Branch Stock
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabSwitch('movements')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                activeTab === 'movements'
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <i className="ti ti-arrows-exchange me-1" /> Movements
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabSwitch('batches')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                activeTab === 'batches'
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <i className="ti ti-layers-linked me-1" /> Batches
                        </button>
                    </div>

                    <button type="button" className="access-refresh" onClick={loadData}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            {/* TAB 1: BRANCH STOCK */}
            {activeTab === 'stock' && (
                <div className="resource-layout">
                    <form className="access-panel create-panel" onSubmit={handleStockUpdate}>
                        <span className="access-kicker">STOCK UPDATE</span>
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="mb-0">Adjust Quantity</h2>
                            {stockForm.product_id && (
                                <button
                                    type="button"
                                    onClick={() => setStockForm({ product_id: '', branch_id: '', quantity: '', reorder_level: '0' })}
                                    className="text-[11px] font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center"
                                >
                                    <i className="ti ti-x mr-1 text-xs" /> Clear
                                </button>
                            )}
                        </div>
                        <p>Choose a product or click edit in the table to record its current stock level.</p>

                        <label>
                            Product *
                            <Select2
                                value={stockForm.product_id}
                                onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}
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
                                className="mt-1"
                            />
                        </label>

                        <label>
                            Branch (Optional)
                            <Select2
                                value={stockForm.branch_id}
                                onChange={(e) => setStockForm({ ...stockForm, branch_id: e.target.value })}
                                placeholder="Current Branch (Default)"
                                options={[
                                    { value: '', label: 'Current Branch (Default)' },
                                    ...branches.map((b) => ({ value: b.id, label: b.name })),
                                ]}
                                className="mt-1"
                            />
                        </label>

                        <label>
                            New Quantity *
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                value={stockForm.quantity}
                                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                                required
                                placeholder="Total units in stock"
                            />
                        </label>

                        <label>
                            Reorder Level
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                value={stockForm.reorder_level}
                                onChange={(e) => setStockForm({ ...stockForm, reorder_level: e.target.value })}
                                placeholder="Alert when stock hits"
                            />
                        </label>

                        <button className="access-submit" type="submit">
                            Update Stock <i className="ti ti-arrow-up-right ml-1" />
                        </button>
                    </form>

                    <section className="access-panel records-panel flex flex-col justify-between">
                        <div>
                            <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <span className="access-kicker">INVENTORY DIRECTORY</span>
                                    <h2>
                                        Current Stock <small className="resource-total">({filteredStocks.length})</small>
                                    </h2>
                                </div>
                                <TableToolbar
                                    title="Current Stock"
                                    columns={stockColumns}
                                    data={filteredStocks}
                                    renderCell={renderStockCell}
                                    search={search}
                                    onSearchChange={(val) => {
                                        setSearch(val);
                                        setCurrentPage(1);
                                    }}
                                    searchPlaceholder="Search stock..."
                                    pageSize={pageSize}
                                    onPageSizeChange={(newSize) => {
                                        setPageSize(newSize);
                                        setCurrentPage(1);
                                    }}
                                    currentPage={currentPage}
                                    totalItems={filteredStocks.length}
                                    onPageChange={setCurrentPage}
                                />
                            </div>

                            {loading ? (
                                <div className="access-empty">
                                    <i className="ti ti-loader-2 animate-spin" />
                                    <p>Loading stock data...</p>
                                </div>
                            ) : (
                                <div className="resource-table-wrap">
                                    <table className="resource-table">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">SL</th>
                                                <th>Product</th>
                                                <th>Branch</th>
                                                <th>Quantity</th>
                                                <th>Reorder At</th>
                                                <th>Status</th>
                                                <th className="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedStocks.map((stock, idx) => {
                                                const isLow = stock.quantity <= (stock.reorder_level || 5);
                                                const sl = getBaseIndex() + idx + 1;
                                                return (
                                                    <tr key={stock.id}>
                                                        <td className="text-center font-bold text-slate-500">{sl}</td>
                                                        <td>
                                                            <strong>{stock.product?.name}</strong>
                                                            <small>{stock.product?.sku}</small>
                                                        </td>
                                                        <td>{stock.branch?.name || 'Main Branch'}</td>
                                                        <td>
                                                            <span className="font-bold text-slate-800 dark:text-slate-100">
                                                                {stock.quantity}
                                                            </span>
                                                        </td>
                                                        <td>{stock.reorder_level ?? '—'}</td>
                                                        <td>
                                                            <span
                                                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                    isLow
                                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                                }`}
                                                            >
                                                                {isLow ? 'Low Stock' : 'Adequate'}
                                                            </span>
                                                        </td>
                                                        <td className="text-right whitespace-nowrap">
                                                            <button
                                                                type="button"
                                                                onClick={() => selectStockForEdit(stock)}
                                                                className="text-gray-400 hover:text-[#f47721] transition-colors p-1.5 rounded hover:bg-orange-50"
                                                                title="Adjust stock in form"
                                                            >
                                                                <i className="ti ti-edit text-base" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {filteredStocks.length === 0 && (
                                        <div className="access-empty small">
                                            <i className="ti ti-archive" />
                                            <p>No stock entries found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {!loading && filteredStocks.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredStocks.length}
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
            )}

            {/* TAB 2: STOCK MOVEMENTS */}
            {activeTab === 'movements' && (
                <div className="resource-layout">
                    <form className="access-panel create-panel" onSubmit={handleMovementCreate}>
                        <span className="access-kicker">MANUAL LOG</span>
                        <h2>Log Movement</h2>
                        <p>Record inward or outward quantity shifts (+ / -).</p>

                        <label>
                            Product *
                            <Select2
                                value={movementForm.product_id}
                                onChange={(e) => setMovementForm({ ...movementForm, product_id: e.target.value })}
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
                                className="mt-1"
                            />
                        </label>

                        <label>
                            Quantity (+ for in, - for out) *
                            <input
                                className="access-input"
                                type="number"
                                value={movementForm.quantity}
                                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                                required
                                placeholder="e.g. 10 or -5"
                            />
                        </label>

                        <label>
                            Branch (Optional)
                            <Select2
                                value={movementForm.branch_id}
                                onChange={(e) => setMovementForm({ ...movementForm, branch_id: e.target.value })}
                                placeholder="Current Branch"
                                options={[
                                    { value: '', label: 'Current Branch' },
                                    ...branches.map((b) => ({ value: b.id, label: b.name })),
                                ]}
                                className="mt-1"
                            />
                        </label>

                        <label>
                            Reason / Note
                            <input
                                className="access-input"
                                type="text"
                                value={movementForm.note}
                                onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value })}
                                placeholder="e.g. Broken packaging, restock"
                            />
                        </label>

                        <button className="access-submit" type="submit">
                            Save Movement <i className="ti ti-arrow-right ml-1" />
                        </button>
                    </form>

                    <section className="access-panel records-panel flex flex-col justify-between">
                        <div>
                            <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <span className="access-kicker">AUDIT LOG</span>
                                    <h2>
                                        Stock Movements{' '}
                                        <small className="resource-total">({filteredMovements.length})</small>
                                    </h2>
                                </div>
                                <TableToolbar
                                    title="Stock Movements"
                                    columns={movementColumns}
                                    data={filteredMovements}
                                    renderCell={renderMovementCell}
                                    search={search}
                                    onSearchChange={(val) => {
                                        setSearch(val);
                                        setCurrentPage(1);
                                    }}
                                    searchPlaceholder="Search movements..."
                                    pageSize={pageSize}
                                    onPageSizeChange={(newSize) => {
                                        setPageSize(newSize);
                                        setCurrentPage(1);
                                    }}
                                    currentPage={currentPage}
                                    totalItems={filteredMovements.length}
                                    onPageChange={setCurrentPage}
                                />
                            </div>

                            {loading ? (
                                <div className="access-empty">
                                    <i className="ti ti-loader-2 animate-spin" />
                                    <p>Loading movements...</p>
                                </div>
                            ) : (
                                <div className="resource-table-wrap">
                                    <table className="resource-table">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">SL</th>
                                                <th>Product</th>
                                                <th>Type</th>
                                                <th>Qty Changed</th>
                                                <th>Balance After</th>
                                                <th>Date &amp; By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedMovements.map((m, idx) => {
                                                const sl = getBaseIndex() + idx + 1;
                                                return (
                                                    <tr key={m.id}>
                                                        <td className="text-center font-bold text-slate-500">{sl}</td>
                                                        <td>
                                                            <strong>{m.product?.name}</strong>
                                                            <small>{m.note || m.product?.sku}</small>
                                                        </td>
                                                        <td>
                                                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 dark:bg-slate-700">
                                                                {m.type}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`font-bold ${
                                                                    m.quantity > 0
                                                                        ? 'text-emerald-600'
                                                                        : 'text-rose-600'
                                                                }`}
                                                            >
                                                                {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                                            </span>
                                                        </td>
                                                        <td>{m.balance_after}</td>
                                                        <td>
                                                            <strong>{m.user?.name || 'System'}</strong>
                                                            <small>
                                                                {m.created_at
                                                                    ? new Date(m.created_at).toLocaleDateString()
                                                                    : '—'}
                                                            </small>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {filteredMovements.length === 0 && (
                                        <div className="access-empty small">
                                            <i className="ti ti-arrows-exchange" />
                                            <p>No stock movements logged yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {!loading && filteredMovements.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredMovements.length}
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
            )}

            {/* TAB 3: BATCHES & OPENING STOCK */}
            {activeTab === 'batches' && (
                <div className="resource-layout">
                    <form className="access-panel create-panel" onSubmit={handleBatchCreate}>
                        <span className="access-kicker">BATCH REGISTRATION</span>
                        <h2>Opening Batch</h2>
                        <p>Register initial batch numbers and expiration dates for products.</p>

                        <label>
                            Product *
                            <Select2
                                value={batchForm.product_id}
                                onChange={(e) => setBatchForm({ ...batchForm, product_id: e.target.value })}
                                required
                                placeholder="Select expiry-tracked product"
                                options={[
                                    { value: '', label: 'Select expiry-tracked product' },
                                    ...products.map((p) => ({
                                        value: p.id,
                                        label: p.name,
                                        sublabel: p.has_expiry ? '(Expiry-tracked)' : null,
                                    })),
                                ]}
                                className="mt-1"
                            />
                        </label>

                        <label>
                            Batch Number
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. BATCH-2026-A"
                                value={batchForm.batch_number}
                                onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                            />
                        </label>

                        <label>
                            Quantity *
                            <input
                                className="access-input"
                                type="number"
                                min="1"
                                placeholder="Units in batch"
                                value={batchForm.quantity}
                                onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })}
                                required
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <label>
                                Mfd Date
                                <input
                                    className="access-input"
                                    type="date"
                                    value={batchForm.manufactured_date}
                                    onChange={(e) => setBatchForm({ ...batchForm, manufactured_date: e.target.value })}
                                />
                            </label>
                            <label>
                                Expiry Date *
                                <input
                                    className="access-input"
                                    type="date"
                                    value={batchForm.expiry_date}
                                    onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                                    required
                                />
                            </label>
                        </div>

                        <label>
                            Notes
                            <input
                                className="access-input"
                                type="text"
                                placeholder="Optional note"
                                value={batchForm.note}
                                onChange={(e) => setBatchForm({ ...batchForm, note: e.target.value })}
                            />
                        </label>

                        <button className="access-submit" type="submit">
                            Register Batch <i className="ti ti-check ml-1" />
                        </button>
                    </form>

                    <section className="access-panel records-panel flex flex-col justify-between">
                        <div>
                            <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <span className="access-kicker">BATCH INVENTORY</span>
                                    <h2>
                                        Inventory Batches{' '}
                                        <small className="resource-total">{batches.length}</small>
                                    </h2>
                                </div>
                                <TableToolbar
                                    title="Inventory Batches"
                                    columns={batchColumns}
                                    data={filteredBatches}
                                    renderCell={renderBatchCell}
                                    search={search}
                                    onSearchChange={(val) => {
                                        setSearch(val);
                                        setCurrentPage(1);
                                    }}
                                    searchPlaceholder="Search batches..."
                                    pageSize={pageSize}
                                    onPageSizeChange={(newSize) => {
                                        setPageSize(newSize);
                                        setCurrentPage(1);
                                    }}
                                    currentPage={currentPage}
                                    totalItems={filteredBatches.length}
                                    onPageChange={setCurrentPage}
                                />
                            </div>

                            {loading ? (
                                <div className="access-empty">
                                    <i className="ti ti-loader-2 animate-spin" />
                                    <p>Loading batches...</p>
                                </div>
                            ) : (
                                <div className="resource-table-wrap">
                                    <table className="resource-table">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">SL</th>
                                                <th>Product</th>
                                                <th>Batch #</th>
                                                <th>Qty Remaining</th>
                                                <th>Unit Cost</th>
                                                <th>Expiry Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedBatches.map((b, idx) => {
                                                const sl = getBaseIndex() + idx + 1;
                                                return (
                                                    <tr key={b.id}>
                                                        <td className="text-center font-bold text-slate-500">{sl}</td>
                                                        <td>
                                                            <strong>{b.product?.name}</strong>
                                                            <small>{b.product?.sku}</small>
                                                        </td>
                                                        <td>
                                                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                                                                {b.batch_number || 'Default'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <strong className="text-emerald-600">{b.quantity}</strong>
                                                        </td>
                                                        <td>{b.unit_cost ? `৳${b.unit_cost}` : '—'}</td>
                                                        <td>
                                                            <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs">
                                                                {b.expiry_date}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {filteredBatches.length === 0 && (
                                        <div className="access-empty small">
                                            <i className="ti ti-layers-linked" />
                                            <p>No batches registered yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {!loading && filteredBatches.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredBatches.length}
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
            )}
        </div>
    );
}
