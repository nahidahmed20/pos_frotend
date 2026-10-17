'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function BarcodePrintPage() {
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/inventory/barcode-print')
            .then((res) => {
                const list = res.data.data || [];
                setProducts(list);
                const initial = {};
                list.slice(0, 8).forEach((p) => {
                    initial[p.id] = 1;
                });
                setSelected(initial);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleQty = (id, delta) => {
        setSelected((prev) => {
            const current = prev[id] || 0;
            const updated = Math.max(0, current + delta);
            const copy = { ...prev };
            if (updated === 0) delete copy[id];
            else copy[id] = updated;
            return copy;
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const labelsToPrint = [];
    products.forEach((p) => {
        const count = selected[p.id] || 0;
        for (let i = 0; i < count; i++) {
            labelsToPrint.push(p);
        }
    });

    return (
        <div className="resource-page">
            <div className="resource-hero print:hidden">
                <div>
                    <span className="access-kicker">LABEL PRINTER</span>
                    <h1>Barcode Generation & Print</h1>
                    <p>Select products and print thermal adhesive barcode stickers for POS scanners.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={labelsToPrint.length === 0}
                        className="access-submit !w-auto !mt-0 !py-2 !px-4 text-xs font-bold inline-flex items-center gap-2"
                    >
                        <i className="ti ti-printer" /> Print Labels ({labelsToPrint.length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
                {/* Product Selection List */}
                <div className="access-panel records-panel p-4 print:hidden">
                    <h3 className="font-bold text-sm text-gray-800 mb-3">Select Products</h3>
                    {loading ? (
                        <p className="text-xs text-gray-500">Loading catalog...</p>
                    ) : (
                        <div className="max-h-[520px] overflow-y-auto space-y-2">
                            {products.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between p-2 rounded border border-gray-100 hover:bg-gray-50 text-xs"
                                >
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="font-bold truncate">{p.name}</div>
                                        <div className="text-gray-500 font-mono text-[11px]">{p.sku} • ৳{p.selling_price}</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => toggleQty(p.id, -1)}
                                            className="w-6 h-6 border rounded flex items-center justify-center font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="w-5 text-center font-bold">{selected[p.id] || 0}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleQty(p.id, 1)}
                                            className="w-6 h-6 border rounded bg-gray-100 flex items-center justify-center font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Print Sheet Preview */}
                <div className="lg:col-span-2 access-panel p-6 bg-white">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b print:hidden">
                        <span className="font-bold text-sm text-gray-800">Sticker Sheet Preview</span>
                        <span className="text-xs text-gray-500">{labelsToPrint.length} stickers queued</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                        {labelsToPrint.map((p, idx) => (
                            <div
                                key={idx}
                                className="border border-dashed border-gray-300 p-2.5 text-center rounded flex flex-col items-center justify-center bg-white print:border-black"
                            >
                                <span className="font-bold text-[11px] leading-tight text-gray-900 truncate w-full">
                                    {p.name}
                                </span>
                                <span className="text-[10px] text-gray-600 font-bold mb-1">
                                    ৳ {parseFloat(p.selling_price).toFixed(2)}
                                </span>
                                {/* Mock barcode stripe representation */}
                                <div className="h-8 w-28 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)] my-1" />
                                <span className="font-mono text-[9px] tracking-widest text-gray-700">
                                    {p.barcode || p.sku}
                                </span>
                            </div>
                        ))}
                    </div>

                    {labelsToPrint.length === 0 && (
                        <div className="py-12 text-center text-gray-400 print:hidden">
                            <i className="ti ti-barcode text-3xl mb-2" />
                            <p className="text-xs">No stickers selected. Add items from the list on the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

