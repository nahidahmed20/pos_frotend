'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function DiscountPlansPage() {
    return (
        <CrudWorkspace
            title="Discount Plans"
            eyebrow="PROMOTIONS"
            description="Manage tiered pricing and temporal discount schemes."
            endpoint="/api/discount-plans"
            fields={[
                { name: 'name', label: 'Plan Name', placeholder: 'e.g. Seasonal Clearance 2026', required: true },
                { name: 'start_date', label: 'Start Date', type: 'date' },
                { name: 'end_date', label: 'End Date', type: 'date' },
                { name: 'description', label: 'Plan Notes', type: 'textarea', placeholder: 'Scope and branches...' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Scheme' },
            ]}
            columns={[
                { key: 'name', label: 'Plan Name' },
                { key: 'start_date', label: 'Start' },
                { key: 'end_date', label: 'End' },
                { key: 'description', label: 'Description' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', start_date: '', end_date: '', description: '', is_active: true }}
            mapForm={(f) => ({ ...f, is_active: Boolean(f.is_active) })}
            mapRow={(item, key) =>
                key === 'is_active' ? (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                ) : (
                    item[key] || '—'
                )
            }
        />
    );
}

