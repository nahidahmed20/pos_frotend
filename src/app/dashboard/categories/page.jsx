'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function CategoriesPage() {
    return <CrudWorkspace title="Categories" eyebrow="CATALOG STRUCTURE" description="Organize products with parent and child categories." endpoint="/api/categories" initialForm={{ name: '', parent_id: '' }} fields={[{ name: 'name', label: 'Category name', placeholder: 'e.g. Electronics', required: true }, { name: 'parent_id', label: 'Parent category ID (optional)', placeholder: 'Leave empty for a parent category' }]} columns={[{ key: 'name', label: 'Category' }, { key: 'parent', label: 'Parent' }, { key: 'is_active', label: 'Status' }]} mapForm={(form) => ({ name: form.name, parent_id: form.parent_id || null })} mapRow={(item, key) => key === 'parent' ? item.parent?.name || 'Parent category' : key === 'is_active' ? (item[key] ? 'Active' : 'Inactive') : item[key] || '—'} />;
}
