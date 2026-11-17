'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function BarcodePrintPage() {
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.get('/api/inventory/barcode-print')
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

    return (
        <div className="resource-page">
            <div className="resource-hero print:hidden">
                <div>
                    <span className="access-kicker">LABEL PRINTER</span>
                    <h1>Barcode Generation &amp; Print</h1>
                    <p>Choose products and set the number of barcode labels to print for each.</p>
                </div>
                <button type="button" onClick={() => window.print()} disabled={!labelsToPrint.length} className="access-submit !w-auto !mt-0 !py-2 !px-4 text-xs font-bold inline-flex items-center gap-2">
                    <i className="ti ti-printer" /> Print Labels ({labelsToPrint.length})
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
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">{product.name}</div>
                                        <div className="text-gray-500 font-mono text-[11px]">{product.sku} · ৳{product.selling_price}</div>
                                    </div>
                                    <label className="flex items-center gap-1 text-[10px] text-gray-500">
                                        Qty
                                        <input type="number" min="0" step="1" inputMode="numeric" aria-label={`Barcode quantity for ${product.name}`} value={selected[product.id] || ''} placeholder="0" onChange={(event) => setQuantity(product.id, event.target.value)} className="access-input !w-16 !py-1 text-center" />
                                    </label>
                                </div>
                            ))}
                            {!visibleProducts.length && <p className="text-xs text-gray-500">No matching products.</p>}
                        </div>
                    )}
                </div>

                <div id="inventory-print-area" className="lg:col-span-2 access-panel p-6 bg-white">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b print:hidden">
                        <span className="font-bold text-sm text-gray-800">Barcode label preview</span>
                        <span className="text-xs text-gray-500">{labelsToPrint.length} labels selected</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                        {labelsToPrint.map((product, index) => (
                            <div key={`${product.id}-${index}`} className="border border-dashed border-gray-300 p-2.5 text-center rounded flex flex-col items-center justify-center bg-white print:border-black">
                                <span className="font-bold text-[11px] leading-tight text-gray-900 truncate w-full">{product.name}</span>
                                <span className="text-[10px] text-gray-600 font-bold mb-1">৳ {Number(product.selling_price || 0).toFixed(2)}</span>
                                <Code39 value={product.barcode || product.sku || String(product.id)} />
                                <span className="font-mono text-[9px] tracking-widest text-gray-700">{product.barcode || product.sku}</span>
                            </div>
                        ))}
                    </div>
                    {!labelsToPrint.length && <div className="py-12 text-center text-gray-400 print:hidden"><i className="ti ti-barcode text-3xl mb-2" /><p className="text-xs">Enter a quantity beside a product to add its labels.</p></div>}
                </div>
            </div>
        </div>
    );
}

const CODE39 = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn',
    F: 'nnwnwwnnn', G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn',
    K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww', O: 'wnnnwnnwn',
    P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn', S: 'nnwnnnwwn', T: 'nnnnwnwwn',
    U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn', '/': 'nwnwnnnwn',
    '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn',
};

function Code39({ value }) {
    const text = String(value).toUpperCase().replace(/[^0-9A-Z. $/+%-]/g, '-');
    const encoded = `*${text}*`;
    const bars = [];
    let x = 0;
    [...encoded].forEach((character, characterIndex) => {
        [...(CODE39[character] || CODE39['-'])].forEach((width, index) => {
            const units = width === 'w' ? 3 : 1;
            if (index % 2 === 0) bars.push(<rect key={`${characterIndex}-${index}`} x={x} y="0" width={units} height="27" fill="black" />);
            x += units;
        });
        if (characterIndex < encoded.length - 1) x += 1;
    });
    return <svg className="my-1 h-8 max-w-full" width="112" height="32" viewBox={`0 0 ${x} 32`} role="img" aria-label={`Barcode ${text}`}>{bars}</svg>;
}
