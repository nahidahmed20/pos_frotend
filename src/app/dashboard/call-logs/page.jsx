'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function CallLogsPage() {
    return (
        <CrudWorkspace
            title="Call Logs"
            eyebrow="APPLICATION"
            description="Log customer service inquiries, supplier phone calls, and support notes."
            endpoint="/api/call-logs"
            fields={[
                { name: 'contact_name', label: 'Contact / Caller Name', placeholder: 'e.g. Shafiqul Islam', required: true },
                { name: 'phone', label: 'Phone Number', placeholder: '+880 19...' },
                {
                    name: 'call_type',
                    label: 'Call Type',
                    type: 'select',
                    options: [
                        { value: 'incoming', label: 'Incoming Call' },
                        { value: 'outgoing', label: 'Outgoing Call' },
                        { value: 'missed', label: 'Missed Call' },
                        { value: 'video', label: 'Video Conference' },
                    ],
                    required: true,
                },
                { name: 'duration_seconds', label: 'Duration (Seconds)', type: 'number', placeholder: '120' },
                { name: 'called_at', label: 'Call Time', type: 'datetime-local', required: true },
                { name: 'notes', label: 'Discussion Summary', type: 'textarea', placeholder: 'Points discussed...' },
            ]}
            columns={[
                { key: 'contact_name', label: 'Caller' },
                { key: 'phone', label: 'Phone' },
                { key: 'call_type', label: 'Type' },
                { key: 'duration_seconds', label: 'Duration' },
                { key: 'called_at', label: 'Date & Time' },
            ]}
            initialForm={{
                contact_name: '',
                phone: '',
                call_type: 'incoming',
                duration_seconds: '60',
                called_at: new Date().toISOString().slice(0, 16),
                notes: '',
            }}
            mapForm={(f) => ({
                ...f,
                duration_seconds: parseInt(f.duration_seconds, 10) || 0,
            })}
            mapRow={(item, key) => {
                if (key === 'call_type') {
                    return (
                        <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.call_type === 'incoming'
                                    ? 'bg-blue-50 text-blue-700'
                                    : item.call_type === 'outgoing'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                        >
                            {item.call_type?.toUpperCase()}
                        </span>
                    );
                }
                if (key === 'duration_seconds') {
                    const m = Math.floor((item.duration_seconds || 0) / 60);
                    const s = (item.duration_seconds || 0) % 60;
                    return `${m}m ${s}s`;
                }
                if (key === 'called_at') return item.called_at?.slice(0, 16).replace('T', ' ') || '—';
                return item[key] || '—';
            }}
        />
    );
}

