'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function CalendarPage() {
    return (
        <CrudWorkspace
            title="Calendar Events"
            eyebrow="APPLICATION"
            description="Schedule branch audits, vendor meetings, promotional events, and team shifts."
            endpoint="/api/calendar-events"
            fields={[
                { name: 'title', label: 'Event Title', placeholder: 'e.g. Monthly Stock Taking', required: true },
                { name: 'start_time', label: 'Start Time', type: 'datetime-local', required: true },
                { name: 'end_time', label: 'End Time', type: 'datetime-local', required: true },
                { name: 'location', label: 'Location / Venue', placeholder: 'e.g. Dhanmondi Branch #01' },
                {
                    name: 'color',
                    label: 'Event Color',
                    type: 'select',
                    options: [
                        { value: '#f47721', label: 'Brand Orange' },
                        { value: '#3b82f6', label: 'Blue' },
                        { value: '#10b981', label: 'Emerald' },
                        { value: '#8b5cf6', label: 'Purple' },
                    ],
                },
                { name: 'description', label: 'Agenda / Description', type: 'textarea', placeholder: 'Event details...' },
                { name: 'is_all_day', label: 'All Day Event', type: 'checkbox', checkboxLabel: 'Runs all day' },
            ]}
            columns={[
                { key: 'title', label: 'Event' },
                { key: 'start_time', label: 'Starts' },
                { key: 'end_time', label: 'Ends' },
                { key: 'location', label: 'Location' },
            ]}
            initialForm={{
                title: '',
                start_time: new Date().toISOString().slice(0, 16),
                end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                location: '',
                color: '#f47721',
                description: '',
                is_all_day: false,
            }}
            mapForm={(f) => ({ ...f, is_all_day: Boolean(f.is_all_day) })}
            mapRow={(item, key) => {
                if (key === 'title') {
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: item.color || '#f47721' }}
                            />
                            <span className="font-bold">{item.title}</span>
                        </div>
                    );
                }
                if (key === 'start_time' || key === 'end_time') {
                    return item[key]?.slice(0, 16).replace('T', ' ') || '—';
                }
                return item[key] || '—';
            }}
        />
    );
}

