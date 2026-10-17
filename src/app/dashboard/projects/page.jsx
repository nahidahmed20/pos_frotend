'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function ProjectsPage() {
    return (
        <CrudWorkspace
            title="Projects"
            eyebrow="APPLICATION"
            description="Manage corporate store openings, software migrations, and marketing rollouts."
            endpoint="/api/projects"
            fields={[
                { name: 'name', label: 'Project Name', placeholder: 'e.g. Uttara Branch Grand Opening', required: true },
                { name: 'budget', label: 'Allocated Budget (৳)', type: 'number', step: '0.01', placeholder: '50000' },
                { name: 'start_date', label: 'Start Date', type: 'date' },
                { name: 'end_date', label: 'Target Completion Date', type: 'date' },
                {
                    name: 'status',
                    label: 'Project Status',
                    type: 'select',
                    options: [
                        { value: 'not_started', label: 'Not Started' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'on_hold', label: 'On Hold' },
                        { value: 'completed', label: 'Completed' },
                    ],
                    required: true,
                },
                { name: 'description', label: 'Scope of Work', type: 'textarea', placeholder: 'Objectives and milestones...' },
            ]}
            columns={[
                { key: 'name', label: 'Project' },
                { key: 'budget', label: 'Budget' },
                { key: 'start_date', label: 'Start' },
                { key: 'end_date', label: 'Deadline' },
                { key: 'status', label: 'Status' },
            ]}
            initialForm={{
                name: '',
                budget: '0',
                start_date: '',
                end_date: '',
                status: 'in_progress',
                description: '',
            }}
            mapForm={(f) => ({
                ...f,
                budget: parseFloat(f.budget) || 0,
            })}
            mapRow={(item, key) => {
                if (key === 'budget') return `৳${parseFloat(item.budget || 0).toLocaleString()}`;
                if (key === 'status') {
                    return (
                        <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.status === 'completed'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : item.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {item.status?.replace('_', ' ').toUpperCase()}
                        </span>
                    );
                }
                return item[key] || '—';
            }}
        />
    );
}

