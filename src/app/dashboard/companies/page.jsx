'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function CompaniesPage() {
    return (
        <CrudWorkspace
            title="Companies"
            eyebrow="SUPER ADMIN / SAAS"
            description="Manage client organizations and merchant business accounts."
            endpoint="/api/companies"
            fields={[
                { name: 'name', label: 'Company / Organization Name', placeholder: 'e.g. Apex Retail Group', required: true },
                { name: 'email', label: 'Billing Email', type: 'email', placeholder: 'admin@apex.com', required: true },
                { name: 'phone', label: 'Phone', placeholder: '+880 17...' },
                { name: 'website', label: 'Website', placeholder: 'https://...' },
                { name: 'address', label: 'Office Address', type: 'textarea', placeholder: 'Street address...' },
                {
                    name: 'status',
                    label: 'Account Status',
                    type: 'select',
                    options: [
                        { value: 'active', label: 'Active' },
                        { value: 'pending', label: 'Pending Onboarding' },
                        { value: 'inactive', label: 'Inactive / Suspended' },
                    ],
                    required: true,
                },
            ]}
            columns={[
                { key: 'name', label: 'Company Name' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status' },
            ]}
            initialForm={{ name: '', email: '', phone: '', website: '', address: '', status: 'active' }}
            mapRow={(item, key) =>
                key === 'status' ? (
                    <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.status === 'active'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : item.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                    >
                        {item.status?.toUpperCase()}
                    </span>
                ) : (
                    item[key] || '—'
                )
            }
        />
    );
}

