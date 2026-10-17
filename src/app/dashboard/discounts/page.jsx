'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function DiscountsPage() {
    return (
        <CrudWorkspace
            title="Discounts"
            eyebrow="PROMOTIONS"
            description="Set automated item discounts applied across catalog checkouts."
            endpoint="/api/discounts"
            fields={[
                { name: 'name', label: 'Discount Title', placeholder: 'e.g. 15% Member Discount', required: true },
                {
                    name: 'discount_type',
                    label: 'Discount Type',
                    type: 'select',
                    options: [
                        { value: 'percentage', label: 'Percentage (%)' },
                        { value: 'fixed', label: 'Fixed Amount (৳)' },
                    ],
                    required: true,
                },
                { name: 'value', label: 'Value', type: 'number', step: '0.01', placeholder: '15', required: true },
                { name: 'valid_from', label: 'Valid From', type: 'date' },
                { name: 'valid_to', label: 'Valid Until', type: 'date' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Discount Active' },
            ]}
            columns={[
                { key: 'name', label: 'Discount Title' },
                { key: 'value', label: 'Rate' },
                { key: 'valid_from', label: 'From' },
                { key: 'valid_to', label: 'Until' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', discount_type: 'percentage', value: '10', valid_from: '', valid_to: '', is_active: true }}
            mapForm={(f) => ({ ...f, value: parseFloat(f.value) || 0, is_active: Boolean(f.is_active) })}
            mapRow={(item, key) => {
                if (key === 'value') {
                    return item.discount_type === 'percentage' ? `${item.value}%` : `৳${item.value}`;
                }
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

