'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function ExpiredProductsPage() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(0);

    const loadData = async (filterDays = days) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/inventory/expired-products?days=${filterDays}`);
            setBatches(res.data.data || []);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Could not load expired products', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(days);
    }, [days]);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">INVENTORY ALERTS</span>
                    <h1>Expired & Expiring Products</h1>
                    <p>Track perishable stock batches to prevent sales of expired goods.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="access-input py-1.5 px-3 text-xs"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value, 10))}
                    >
                        <option value={0}>Already Expired</option>
                        <option value={7}>Expiring in 7 Days</option>
                        <option value={30}>Expiring in 30 Days</option>
                        <option value={90}>Expiring in 90 Days</option>
                    </select>
                    <button type="button" className="access-refresh" onClick={() => loadData(days)}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            <section className="access-panel records-panel">
                <div className="records-heading">
                    <div>
                        <span className="access-kicker">BATCH REGISTRY</span>
                        <h2>
                            Affected Batches <small className="resource-total">({batches.length})</small>
                        </h2>
                    </div>
                </div>

                {loading ? (
                    <div className="access-empty">
                        <i className="ti ti-loader-2 animate-spin" />
                        <p>Scanning batch records...</p>
                    </div>
                ) : (
                    <div className="resource-table-wrap">
                        <table className="resource-table">
                            <thead>
                                <tr>
                                    <th>Batch #</th>
                                    <th>Product</th>
                                    <th>SKU / Barcode</th>
                                    <th>Remaining Qty</th>
                                    <th>Expiry Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch) => {
                                    const isExpired = new Date(batch.expiry_date) <= new Date();
                                    return (
                                        <tr key={batch.id}>
                                            <td className="font-mono font-bold text-gray-800">
                                                {batch.batch_number || `BATCH-#${batch.id}`}
                                            </td>
                                            <td className="font-bold text-gray-900">
                                                {batch.product?.name || '—'}
                                            </td>
                                            <td className="font-mono text-xs text-gray-600">
                                                {batch.product?.sku} {batch.product?.barcode && `• ${batch.product.barcode}`}
                                            </td>
                                            <td className="font-bold text-red-600">
                                                {batch.quantity_remaining} pcs
                                            </td>
                                            <td className="font-mono font-bold text-xs">
                                                {batch.expiry_date}
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        isExpired
                                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {isExpired ? 'EXPIRED' : 'Expiring Soon'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {batches.length === 0 && (
                            <div className="access-empty small">
                                <i className="ti ti-circle-check text-green-500" />
                                <p>No expired or expiring products found in this timeframe.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

