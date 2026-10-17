'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function GiftCardsPage() {
    return (
        <CrudWorkspace
            title="Gift Cards"
            eyebrow="PROMOTIONS"
            description="Manage prepaid customer gift vouchers and balances."
            endpoint="/api/gift-cards"
            fields={[
                { name: 'card_number', label: 'Card Number', placeholder: 'e.g. GC-98234-8219', required: true },
                { name: 'pin', label: 'Security PIN', placeholder: 'e.g. 1234' },
                { name: 'amount', label: 'Card Value (৳)', type: 'number', step: '0.01', placeholder: '1000', required: true },
                { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Card Active' },
            ]}
            columns={[
                { key: 'card_number', label: 'Card Number' },
                { key: 'amount', label: 'Initial Value' },
                { key: 'balance', label: 'Remaining Balance' },
                { key: 'expiry_date', label: 'Expiry' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{
                card_number: `GC-${Math.floor(100000 + Math.random() * 900000)}`,
                pin: '1234',
                amount: '1000',
                expiry_date: '',
                is_active: true,
            }}
            mapForm={(f) => ({
                ...f,
                amount: parseFloat(f.amount) || 0,
                is_active: Boolean(f.is_active),
            })}
            mapRow={(item, key) => {
                if (key === 'card_number') return <span className="font-mono font-bold text-gray-800">{item.card_number}</span>;
                if (key === 'amount') return `৳${parseFloat(item.amount || 0).toLocaleString()}`;
                if (key === 'balance') return <span className="font-bold text-green-700">৳{parseFloat(item.balance || 0).toLocaleString()}</span>;
                if (key === 'is_active') {
                    return (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                    );
                }
                return item[key] || '—';
            }}
        />
    );
}

