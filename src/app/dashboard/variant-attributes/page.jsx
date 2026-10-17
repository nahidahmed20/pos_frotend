'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function VariantAttributesPage() {
    return (
        <CrudWorkspace
            title="Variant Attributes"
            eyebrow="PRODUCT ATTRIBUTES"
            description="Manage product variation attributes (Size, Color, Material, RAM, Storage, etc.)."
            endpoint="/api/variant-attributes"
            fields={[
                { name: 'name', label: 'Attribute Name', placeholder: 'e.g. Size, Color, Storage', required: true },
                { name: 'code', label: 'Attribute Code', placeholder: 'e.g. SIZE, CLR, RAM' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Attribute' },
            ]}
            columns={[
                { key: 'name', label: 'Attribute' },
                { key: 'code', label: 'Code' },
                { key: 'values', label: 'Values' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', code: '', is_active: true }}
            mapForm={(f) => ({ ...f, is_active: Boolean(f.is_active) })}
            mapRow={(item, key) => {
                if (key === 'is_active') {
                    return (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                    );
                }
                if (key === 'values') {
                    const vals = item.values || [];
                    if (!vals.length) return <span className="text-gray-400">No values set</span>;
                    return (
                        <div className="flex flex-wrap gap-1">
                            {vals.map((v) => (
                                <span key={v.id} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                    {v.value}
                                </span>
                            ))}
                        </div>
                    );
                }
                return item[key] || '—';
            }}
        />
    );
}

