'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function BrandsPage() {
    return (
        <CrudWorkspace
            title="Brands"
            eyebrow="CATALOG"
            description="Manage your product brand registry and manufacturers."
            endpoint="/api/brands"
            fields={[
                { name: 'name', label: 'Brand Name', placeholder: 'e.g. Apple, Samsung', required: true },
                { name: 'slug', label: 'Slug', placeholder: 'apple, samsung' },
                { name: 'image_path', label: 'Logo Image URL', placeholder: 'https://... or /assets/...' },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief brand details' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Brand' },
            ]}
            columns={[
                { key: 'name', label: 'Brand' },
                { key: 'slug', label: 'Slug' },
                { key: 'description', label: 'Description' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{ name: '', slug: '', image_path: '', description: '', is_active: true }}
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

