'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function QrCodePrintPage() {
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.get('/api/inventory/qrcode-print')
            .then((res) => setProducts(res.data.data || []))
            .catch(() => setError('Could not load products. Please refresh and try again.'))
            .finally(() => setLoading(false));
    }, []);

    const setQuantity = (id, value) => {
        const quantity = Math.max(0, Math.floor(Number(value) || 0));
        setSelected((previous) => {
            const next = { ...previous };
            if (quantity > 0) next[id] = quantity;
            else delete next[id];
            return next;
        });
    };

    const visibleProducts = products.filter((product) =>
        `${product.name || ''} ${product.sku || ''} ${product.barcode || ''}`.toLowerCase().includes(search.toLowerCase())
    );
    const labelsToPrint = products.flatMap((product) =>
        Array.from({ length: selected[product.id] || 0 }, () => product)
    );

    const handlePrint = async () => {
        const images = [...document.querySelectorAll('#inventory-print-area img')];
        await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
            const timeout = window.setTimeout(resolve, 10000);
            const done = () => { window.clearTimeout(timeout); resolve(); };
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        })));
        window.print();
    };

    return (
        <div className="resource-page">
            <div className="resource-hero print:hidden">
                <div>
                    <span className="access-kicker">QR GENERATOR</span>
                    <h1>QR Code Print</h1>
                    <p>Print QR labels that encode a product’s name, SKU, and price for quick scanning.</p>
                </div>
                <button type="button" onClick={handlePrint} disabled={!labelsToPrint.length} className="access-submit !w-auto !mt-0 !py-2 !px-4 text-xs font-bold inline-flex items-center gap-2">
                    <i className="ti ti-printer" /> Print QR Labels ({labelsToPrint.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
                <div className="access-panel records-panel p-4 print:hidden">
                    <h3 className="font-bold text-sm text-gray-800 mb-3">Select Products</h3>
                    <input className="access-input mb-3" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, or barcode" />
                    {loading ? <p className="text-xs text-gray-500">Loading catalog...</p> : error ? <p className="text-xs text-red-600">{error}</p> : (
                        <div className="max-h-[520px] overflow-y-auto space-y-2">
                            {visibleProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between gap-2 p-2 rounded border border-gray-100 hover:bg-gray-50 text-xs">
                                    <div className="flex-1 min-w-0"><div className="font-bold truncate">{product.name}</div><div className="text-gray-500 font-mono text-[11px]">{product.sku}</div></div>
                                    <label className="flex items-center gap-1 text-[10px] text-gray-500">Qty
                                        <input type="number" min="0" step="1" inputMode="numeric" aria-label={`QR quantity for ${product.name}`} value={selected[product.id] || ''} placeholder="0" onChange={(event) => setQuantity(product.id, event.target.value)} className="access-input !w-16 !py-1 text-center" />
                                    </label>
                                </div>
                            ))}
                            {!visibleProducts.length && <p className="text-xs text-gray-500">No matching products.</p>}
                        </div>
                    )}
                </div>

                <section id="inventory-print-area" className="lg:col-span-2 access-panel p-6 bg-white">
                    <div className="mb-4 pb-2 border-b print:hidden"><span className="font-bold text-sm text-gray-800">QR label preview</span><span className="ml-3 text-xs text-gray-500">{labelsToPrint.length} labels selected</span></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4 print:gap-3">
                        {labelsToPrint.map((product, index) => {
                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(JSON.stringify({ id: product.id, sku: product.sku, name: product.name, price: product.selling_price }))}`;
                            return <div key={`${product.id}-${index}`} className="border border-gray-200 p-3 rounded-lg text-center flex flex-col items-center bg-white shadow-sm print:shadow-none">
                                <span className="font-bold text-xs text-gray-900 truncate w-full mb-1">{product.name}</span>
                                <img src={qrUrl} alt={`QR code for ${product.name}`} className="w-28 h-28 my-1" />
                                <span className="font-mono text-[10px] text-gray-700 font-bold">{product.sku}</span>
                                <span className="text-xs font-bold text-gray-900">৳ {Number(product.selling_price || 0).toFixed(2)}</span>
                            </div>;
                        })}
                    </div>
                    {!labelsToPrint.length && <div className="py-12 text-center text-gray-400 print:hidden"><i className="ti ti-qrcode text-3xl mb-2" /><p className="text-xs">Enter a quantity beside a product to add its QR labels.</p></div>}
                </section>
            </div>
        </div>
    );
}
