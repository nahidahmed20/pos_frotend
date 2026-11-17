'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceSettings, setInvoiceSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const currencySymbol = invoiceSettings.currency_symbol || '৳';
    const settingEnabled = (key, fallback = true) => {
        const value = invoiceSettings[key];
        if (value === undefined || value === null || value === '') return fallback;
        return value === true || value === 1 || value === '1' || value === 'true';
    };

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const [res, settingsRes] = await Promise.all([
                axios.get('/api/invoices'),
                axios.get('/api/settings').catch(() => ({ data: { data: {} } })),
            ]);
            setInvoices(res.data.data || []);
            setInvoiceSettings(settingsRes.data?.data || settingsRes.data?.settings || settingsRes.data || {});
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load invoices', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const viewInvoice = async (id) => {
        try {
            const res = await axios.get(`/api/invoices/${id}`);
            setSelectedInvoice(res.data.data || null);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Could not load invoice receipt', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return invoices;
        const q = search.toLowerCase();
        return invoices.filter((inv) =>
            JSON.stringify(inv).toLowerCase().includes(q)
        );
    }, [invoices, search]);

    const paginatedInvoices = useMemo(() => {
        if (pageSize === -1 || pageSize >= filtered.length) return filtered;
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const invoiceColumns = [
        { key: 'invoice_number', label: 'Invoice #' },
        { key: 'customer', label: 'Customer' },
        { key: 'sold_at', label: 'Date' },
        { key: 'subtotal', label: 'Subtotal' },
        { key: 'discount', label: 'Discount' },
        { key: 'total', label: 'Total' },
        { key: 'payment_status', label: 'Status' },
    ];

    const renderInvoiceCell = (inv, key) => {
        switch (key) {
            case 'invoice_number':
                return inv.invoice_number || '—';
            case 'customer':
                return inv.customer?.name || 'Walk-in Customer';
            case 'sold_at':
                return inv.sold_at?.slice(0, 16).replace('T', ' ') || '—';
            case 'subtotal':
                return `৳ ${parseFloat(inv.subtotal || 0).toLocaleString()}`;
            case 'discount':
                return `৳ ${parseFloat(inv.discount || 0).toLocaleString()}`;
            case 'total':
                return `৳ ${parseFloat(inv.total || 0).toLocaleString()}`;
            case 'payment_status':
                return inv.payment_status?.toUpperCase() || '—';
            default:
                return inv[key] ?? '—';
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero print:hidden">
                <div>
                    <span className="access-kicker">BILLING</span>
                    <h1>Invoices & Receipts</h1>
                    <p>Access, print, and audit all customer sales receipts and tax invoices.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadInvoices}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <section className="access-panel records-panel print:hidden">
                <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <span className="access-kicker">REGISTRY</span>
                        <h2>
                            All Invoices <small className="resource-total">({filtered.length})</small>
                        </h2>
                    </div>
                    <TableToolbar
                        title="Invoices"
                        columns={invoiceColumns}
                        data={filtered}
                        renderCell={renderInvoiceCell}
                        search={search}
                        onSearchChange={(val) => {
                            setSearch(val);
                            setCurrentPage(1);
                        }}
                        searchPlaceholder="Search Invoice #..."
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
                        <p>Loading invoices...</p>
                    </div>
                ) : (
                    <div className="resource-table-wrap">
                        <table className="resource-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Subtotal</th>
                                    <th>Discount</th>
                                    <th>Total</th>
                                    <th>Payment Status</th>
                                    <th className="text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedInvoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="font-mono font-bold text-[#f47721]">
                                            {inv.invoice_number}
                                        </td>
                                        <td className="font-bold text-gray-900">
                                            {inv.customer?.name || 'Walk-in Customer'}
                                        </td>
                                        <td>{inv.sold_at?.slice(0, 16).replace('T', ' ')}</td>
                                        <td>৳ {parseFloat(inv.subtotal || 0).toLocaleString()}</td>
                                        <td>৳ {parseFloat(inv.discount || 0).toLocaleString()}</td>
                                        <td className="font-bold text-gray-900">
                                            ৳ {parseFloat(inv.total || 0).toLocaleString()}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                    inv.payment_status === 'paid'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : inv.payment_status === 'partial'
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}
                                            >
                                                {inv.payment_status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => viewInvoice(inv.id)}
                                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <i className="ti ti-receipt" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="access-empty small">
                                <i className="ti ti-inbox" />
                                <p>No invoices recorded yet.</p>
                            </div>
                        )}
                    </div>
                )}

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

            {/* Receipt Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div id="dashboard-invoice-print" className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start pb-3 border-b mb-4">
                            <div>
                                {settingEnabled('invoice_show_logo') && invoiceSettings.logo_url && <img src={invoiceSettings.logo_url} alt="Business logo" className="max-h-12 max-w-32 object-contain mb-2" />}
                                <h3 className="font-bold text-lg text-gray-900">{invoiceSettings.invoice_title || 'Tax Invoice'}</h3>
                                <p className="font-semibold">{invoiceSettings.company_name || selectedInvoice.store_info?.name || 'Dreams POS'}</p>
                                <p className="text-xs text-gray-500">
                                    {invoiceSettings.address || selectedInvoice.store_info?.address}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="border-b pb-3 mb-3 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Invoice No:</span>
                                <span className="font-mono font-bold text-gray-800">
                                    {selectedInvoice.sale?.invoice_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{selectedInvoice.sale?.sold_at}</span>
                            </div>
                            {settingEnabled('invoice_show_customer') && <div className="flex justify-between">
                                <span className="text-gray-500">Customer:</span>
                                <span className="font-bold">{selectedInvoice.sale?.customer?.name || 'Walk-in'}</span>
                            </div>}
                        </div>

                        {/* Items */}
                        <div className="border-b pb-3 mb-3">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="text-left py-1">Item</th>
                                        <th className="text-center py-1">Qty</th>
                                        <th className="text-right py-1">Price</th>
                                        <th className="text-right py-1">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.sale?.items?.map((it, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-1 font-semibold">{it.product?.name}{settingEnabled('invoice_show_sku') && it.product?.sku ? <small className="block text-gray-500">{it.product.sku}</small> : null}</td>
                                            <td className="text-center py-1">{it.quantity}</td>
                                            <td className="text-right py-1">৳{parseFloat(it.unit_price).toFixed(2)}</td>
                                            <td className="text-right py-1 font-bold">
                                                ৳{(it.quantity * it.unit_price).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="text-xs space-y-1 pb-3 border-b mb-3">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>৳{parseFloat(selectedInvoice.sale?.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {settingEnabled('invoice_show_discount') && parseFloat(selectedInvoice.sale?.discount || 0) > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>Discount:</span>
                                    <span>-৳{parseFloat(selectedInvoice.sale?.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t">
                                <span>Grand Total:</span>
                                <span>৳{parseFloat(selectedInvoice.sale?.total || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Paid Amount:</span>
                                <span>৳{parseFloat(selectedInvoice.sale?.paid_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-500 my-3">
                            {selectedInvoice.store_info?.receipt_footer}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-2 bg-[#f47721] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm"
                            >
                                <i className="ti ti-printer" /> Print Receipt
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg"
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

