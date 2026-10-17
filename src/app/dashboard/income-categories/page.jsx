'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function IncomeCategoriesPage() {
    return (
        <CrudWorkspace
            title="Income Categories"
            eyebrow="FINANCE"
            description="Categorize non-sales revenue streams (Investments, Commissions, Service fees, etc.)."
            endpoint="/api/income-categories"
            fields={[
                { name: 'name', label: 'Income Category', placeholder: 'e.g. Service Charge, Commission', required: true },
                { name: 'code', label: 'Code', placeholder: 'e.g. SERV, COMM' },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Income type notes...' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Category' },
            ]}
            columns={[
                { key: 'name', label: 'Income Category' },
                { key: 'code', label: 'Code' },
                { key: 'description', label: 'Description' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', code: '', description: '', is_active: true }}
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

