'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function QrCodePrintPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/inventory/qrcode-print')
            .then((res) => setProducts(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="resource-page">
            <div className="resource-hero print:hidden">
                <div>
                    <span className="access-kicker">QR GENERATOR</span>
                    <h1>QR Code Print</h1>
                    <p>Generate QR codes for digital catalog scanning and quick item lookups.</p>
                </div>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="access-submit !w-auto !mt-0 !py-2 !px-4 text-xs font-bold inline-flex items-center gap-2"
                >
                    <i className="ti ti-printer" /> Print QR Sheet
                </button>
            </div>

            <section className="access-panel p-6 bg-white">
                {loading ? (
                    <div className="access-empty">
                        <i className="ti ti-loader-2 animate-spin" />
                        <p>Loading catalog items...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4 print:gap-3">
                        {products.map((p) => {
                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                                JSON.stringify({ sku: p.sku, name: p.name, price: p.selling_price })
                            )}`;
                            return (
                                <div
                                    key={p.id}
                                    className="border border-gray-200 p-3 rounded-lg text-center flex flex-col items-center bg-white shadow-sm"
                                >
                                    <span className="font-bold text-xs text-gray-900 truncate w-full mb-1">
                                        {p.name}
                                    </span>
                                    <img src={qrUrl} alt={p.name} className="w-20 h-20 my-1" />
                                    <span className="font-mono text-[10px] text-gray-500 font-bold">{p.sku}</span>
                                    <span className="text-xs font-bold text-[#f47721]">৳ {parseFloat(p.selling_price).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

