'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function LowStocksPage() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/inventory/low-stocks');
            setStocks(res.data.data || []);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Could not load low stocks', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">INVENTORY HEALTH</span>
                    <h1>Low Stock Alerts</h1>
                    <p>Items reaching or falling below safety reorder levels.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/purchases"
                        className="access-submit !w-auto !mt-0 !py-2 !px-4 text-xs font-bold inline-flex items-center gap-1"
                    >
                        <i className="ti ti-shopping-cart-plus" /> Create Purchase Order
                    </Link>
                    <button type="button" className="access-refresh" onClick={loadData}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            <section className="access-panel records-panel">
                <div className="records-heading">
                    <div>
                        <span className="access-kicker">CRITICAL STOCK</span>
                        <h2>
                            Products Needing Reorder <small className="resource-total">({stocks.length})</small>
                        </h2>
                    </div>
                </div>

                {loading ? (
                    <div className="access-empty">
                        <i className="ti ti-loader-2 animate-spin" />
                        <p>Scanning stock levels...</p>
                    </div>
                ) : (
                    <div className="resource-table-wrap">
                        <table className="resource-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>SKU / Barcode</th>
                                    <th>Branch</th>
                                    <th>Current Qty</th>
                                    <th>Reorder Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-bold text-gray-900">
                                            {item.product?.name || '—'}
                                            {item.variant && (
                                                <span className="block text-xs font-normal text-gray-500">
                                                    Variant: {item.variant.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="font-mono text-xs text-gray-600">
                                            {item.product?.sku} {item.product?.barcode && `• ${item.product.barcode}`}
                                        </td>
                                        <td>{item.branch?.name || 'Main Branch'}</td>
                                        <td className="font-bold text-red-600 text-sm">
                                            {item.quantity} {item.product?.unit || 'pcs'}
                                        </td>
                                        <td className="font-semibold text-gray-700">
                                            {item.reorder_level} {item.product?.unit || 'pcs'}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                    item.quantity <= 0
                                                        ? 'bg-red-100 text-red-800 border border-red-300'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                }`}
                                            >
                                                {item.quantity <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stocks.length === 0 && (
                            <div className="access-empty small">
                                <i className="ti ti-circle-check text-green-500" />
                                <p>All product stocks are currently healthy and above reorder levels!</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

