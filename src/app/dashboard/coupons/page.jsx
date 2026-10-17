'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function CouponsPage() {
    return (
        <CrudWorkspace
            title="Coupons"
            eyebrow="PROMOTIONS"
            description="Create voucher discount codes with usage limits and expiry dates."
            endpoint="/api/coupons"
            fields={[
                { name: 'code', label: 'Coupon Code', placeholder: 'e.g. EID2026, SUMMER20', required: true },
                { name: 'name', label: 'Coupon Name', placeholder: 'e.g. Eid Special Discount', required: true },
                {
                    name: 'discount_type',
                    label: 'Discount Type',
                    type: 'select',
                    options: [
                        { value: 'fixed', label: 'Fixed Amount (৳)' },
                        { value: 'percent', label: 'Percentage (%)' },
                    ],
                    required: true,
                },
                { name: 'discount_value', label: 'Discount Value', type: 'number', step: '0.01', placeholder: '10', required: true },
                { name: 'min_spend', label: 'Minimum Cart Spend (৳)', type: 'number', step: '0.01', placeholder: '0' },
                { name: 'max_discount', label: 'Max Discount Cap (৳)', type: 'number', step: '0.01', placeholder: 'Optional' },
                { name: 'start_date', label: 'Start Date', type: 'date' },
                { name: 'end_date', label: 'Expiry Date', type: 'date' },
                { name: 'usage_limit', label: 'Usage Limit', type: 'number', placeholder: '100' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Coupon Active' },
            ]}
            columns={[
                { key: 'code', label: 'Coupon Code' },
                { key: 'name', label: 'Campaign' },
                { key: 'discount_value', label: 'Discount' },
                { key: 'min_spend', label: 'Min Spend' },
                { key: 'usage_count', label: 'Used' },
                { key: 'end_date', label: 'Expires' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{
                code: '',
                name: '',
                discount_type: 'percent',
                discount_value: '10',
                min_spend: '0',
                max_discount: '',
                start_date: '',
                end_date: '',
                usage_limit: '',
                is_active: true,
            }}
            mapForm={(f) => ({
                ...f,
                discount_value: parseFloat(f.discount_value) || 0,
                min_spend: parseFloat(f.min_spend) || 0,
                max_discount: f.max_discount ? parseFloat(f.max_discount) : null,
                usage_limit: f.usage_limit ? parseInt(f.usage_limit, 10) : null,
                is_active: Boolean(f.is_active),
            })}
            mapRow={(item, key) => {
                if (key === 'code') return <span className="font-mono font-bold text-[#f47721]">{item.code}</span>;
                if (key === 'discount_value') {
                    return item.discount_type === 'percent' ? `${item.discount_value}%` : `৳${item.discount_value}`;
                }
                if (key === 'min_spend') return `৳${item.min_spend || 0}`;
                if (key === 'usage_count') return `${item.usage_count || 0} / ${item.usage_limit || '∞'}`;
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

