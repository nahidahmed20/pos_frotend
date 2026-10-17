'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function WarrantiesPage() {
    return (
        <CrudWorkspace
            title="Warranties"
            eyebrow="INVENTORY"
            description="Manage warranty policies and guarantee durations for your products."
            endpoint="/api/warranties"
            fields={[
                { name: 'name', label: 'Warranty Plan', placeholder: 'e.g. 1 Year Official Warranty', required: true },
                { name: 'duration', label: 'Duration (Number)', type: 'number', placeholder: '12', required: true },
                {
                    name: 'duration_type',
                    label: 'Period Type',
                    type: 'select',
                    options: [
                        { value: 'days', label: 'Days' },
                        { value: 'months', label: 'Months' },
                        { value: 'years', label: 'Years' },
                    ],
                    required: true,
                },
                { name: 'description', label: 'Warranty Terms & Conditions', type: 'textarea', placeholder: 'Coverage and claim terms...' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Policy' },
            ]}
            columns={[
                { key: 'name', label: 'Warranty Plan' },
                { key: 'duration', label: 'Duration' },
                { key: 'description', label: 'Terms' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', duration: '12', duration_type: 'months', description: '', is_active: true }}
            mapForm={(f) => ({ ...f, duration: parseInt(f.duration, 10) || 0, is_active: Boolean(f.is_active) })}
            mapRow={(item, key) => {
                if (key === 'is_active') {
                    return (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                    );
                }
                if (key === 'duration') {
                    return `${item.duration} ${item.duration_type || 'months'}`;
                }
                return item[key] || '—';
            }}
        />
    );
}

