'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function BranchesPage() {
    return <CrudWorkspace title="Branches" eyebrow="ORGANIZATION" description="View the active locations connected to your workspace." endpoint="/api/branches" readOnly initialForm={{}} fields={[]} columns={[{ key: 'name', label: 'Branch' }, { key: 'code', label: 'Code' }, { key: 'address', label: 'Address' }, { key: 'is_active', label: 'Status' }]} mapForm={(form) => form} mapRow={(item, key) => key === 'is_active' ? (item[key] ? 'Active' : 'Inactive') : item[key] || '—'} />;
}
