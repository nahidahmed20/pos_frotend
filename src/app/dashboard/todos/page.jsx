'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function TodosPage() {
    return (
        <CrudWorkspace
            title="To-Do List"
            eyebrow="APPLICATION"
            description="Manage daily tasks, stock audits, cashier duties, and prioritized reminders."
            endpoint="/api/todos"
            fields={[
                { name: 'title', label: 'Task Title', placeholder: 'e.g. Daily Cash Reconciliation', required: true },
                { name: 'description', label: 'Task Details', type: 'textarea', placeholder: 'Step by step instructions...' },
                { name: 'due_date', label: 'Due Date', type: 'date' },
                {
                    name: 'priority',
                    label: 'Priority',
                    type: 'select',
                    options: [
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High Priority (Urgent)' },
                    ],
                    required: true,
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: 'pending', label: 'Pending' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                    ],
                    required: true,
                },
            ]}
            columns={[
                { key: 'title', label: 'Task' },
                { key: 'due_date', label: 'Due Date' },
                { key: 'priority', label: 'Priority' },
                { key: 'status', label: 'Status' },
            ]}
            initialForm={{ title: '', description: '', due_date: '', priority: 'medium', status: 'pending' }}
            mapRow={(item, key) => {
                if (key === 'priority') {
                    return (
                        <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.priority === 'high'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : item.priority === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {item.priority?.toUpperCase()}
                        </span>
                    );
                }
                if (key === 'status') {
                    return (
                        <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.status === 'completed'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : item.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-500'
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

