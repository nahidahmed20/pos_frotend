'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function UnitsPage() {
    return (
        <CrudWorkspace
            title="Units"
            eyebrow="INVENTORY"
            description="Manage measurement units for products (Pcs, Kg, Liter, Meter, etc.)."
            endpoint="/api/units"
            fields={[
                { name: 'name', label: 'Unit Name', placeholder: 'e.g. Kilogram, Pieces, Box', required: true },
                { name: 'short_name', label: 'Short Name', placeholder: 'e.g. kg, pcs, bx' },
                { name: 'allow_decimal', label: 'Allow Decimals', type: 'checkbox', checkboxLabel: 'Allow fractional amounts (e.g. 1.5 kg)' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Unit' },
            ]}
            columns={[
                { key: 'name', label: 'Unit Name' },
                { key: 'short_name', label: 'Short Code' },
                { key: 'allow_decimal', label: 'Decimals' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', short_name: '', allow_decimal: false, is_active: true }}
            mapForm={(f) => ({ ...f, allow_decimal: Boolean(f.allow_decimal), is_active: Boolean(f.is_active) })}
            mapRow={(item, key) => {
                if (key === 'is_active') {
                    return (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                    );
                }
                if (key === 'allow_decimal') {
                    return item.allow_decimal ? 'Yes (Decimal allowed)' : 'No (Integers only)';
                }
                return item[key] || '—';
            }}
        />
    );
}

