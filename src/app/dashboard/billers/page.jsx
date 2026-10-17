'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function BillersPage() {
    return (
        <CrudWorkspace
            title="Billers"
            eyebrow="PEOPLES & PARTNERS"
            description="Manage corporate billing entities, issuing vendors, and invoice signatories."
            endpoint="/api/billers"
            fields={[
                { name: 'name', label: 'Biller / Company Name', placeholder: 'e.g. Dreams Retail Ltd', required: true },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'billing@company.com' },
                { name: 'phone', label: 'Primary Phone', placeholder: '+880 17...' },
                { name: 'alt_phone', label: 'Alternate Phone', placeholder: '+880 18...' },
                { name: 'tax_number', label: 'BIN / Tax Number', placeholder: 'e.g. 00293847-0101' },
                { name: 'address', label: 'Street Address', type: 'textarea', placeholder: 'Corporate office address...' },
                { name: 'city', label: 'City', placeholder: 'Dhaka' },
                { name: 'country', label: 'Country', placeholder: 'Bangladesh' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Biller' },
            ]}
            columns={[
                { key: 'name', label: 'Biller Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'tax_number', label: 'Tax / BIN' },
                { key: 'city', label: 'Location' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{
                name: '',
                email: '',
                phone: '',
                alt_phone: '',
                tax_number: '',
                address: '',
                city: 'Dhaka',
                country: 'Bangladesh',
                is_active: true,
            }}
            mapForm={(f) => ({ ...f, is_active: Boolean(f.is_active) })}
            mapRow={(item, key) => {
                if (key === 'city') return `${item.city || ''}, ${item.country || ''}`.trim() || '—';
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

