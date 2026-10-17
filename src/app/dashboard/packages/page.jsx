'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function SubscriptionPackagesPage() {
    return (
        <CrudWorkspace
            title="SaaS Packages"
            eyebrow="SUPER ADMIN"
            description="Define subscription membership plans, branch quotas, and user limits."
            endpoint="/api/packages"
            fields={[
                { name: 'name', label: 'Plan Name', placeholder: 'e.g. Starter, Pro, Enterprise', required: true },
                { name: 'price', label: 'Price (৳)', type: 'number', step: '0.01', placeholder: '2500', required: true },
                { name: 'duration_days', label: 'Duration (Days)', type: 'number', placeholder: '30', required: true },
                { name: 'max_branches', label: 'Branch Quota', type: 'number', placeholder: '1', required: true },
                { name: 'max_users', label: 'Max Users Allowed', type: 'number', placeholder: '5', required: true },
                { name: 'max_products', label: 'Max Products', type: 'number', placeholder: '1000', required: true },
                { name: 'description', label: 'Plan Features', type: 'textarea', placeholder: 'List features included...' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Plan Active for Purchase' },
            ]}
            columns={[
                { key: 'name', label: 'Plan' },
                { key: 'price', label: 'Price' },
                { key: 'duration_days', label: 'Validity' },
                { key: 'max_branches', label: 'Branches' },
                { key: 'max_users', label: 'Users' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{
                name: '',
                price: '2500',
                duration_days: '30',
                max_branches: '1',
                max_users: '5',
                max_products: '1000',
                description: '',
                is_active: true,
            }}
            mapForm={(f) => ({
                ...f,
                price: parseFloat(f.price) || 0,
                duration_days: parseInt(f.duration_days, 10) || 30,
                max_branches: parseInt(f.max_branches, 10) || 1,
                max_users: parseInt(f.max_users, 10) || 5,
                max_products: parseInt(f.max_products, 10) || 1000,
                is_active: Boolean(f.is_active),
            })}
            mapRow={(item, key) => {
                if (key === 'price') return `৳${parseFloat(item.price).toLocaleString()}`;
                if (key === 'duration_days') return `${item.duration_days} days`;
                if (key === 'max_branches') return `${item.max_branches} branch(es)`;
                if (key === 'max_users') return `${item.max_users} user(s)`;
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

