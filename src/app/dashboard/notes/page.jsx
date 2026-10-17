'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function NotesPage() {
    return (
        <CrudWorkspace
            title="Notes"
            eyebrow="APPLICATION"
            description="Personal workspace sticky notes, quick business memos, and pinboard reminders."
            endpoint="/api/notes"
            fields={[
                { name: 'title', label: 'Note Title', placeholder: 'e.g. Next Week Supplier Meeting', required: true },
                { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Write note thoughts here...' },
                { name: 'tag', label: 'Tag / Label', placeholder: 'e.g. Suppliers, HR, Sales' },
                {
                    name: 'color',
                    label: 'Accent Color',
                    type: 'select',
                    options: [
                        { value: '#ffffff', label: 'White' },
                        { value: '#fef3c7', label: 'Warm Yellow' },
                        { value: '#e0f2fe', label: 'Soft Sky Blue' },
                        { value: '#dcfce7', label: 'Mint Green' },
                        { value: '#fce7f3', label: 'Blush Pink' },
                    ],
                },
                { name: 'is_pinned', label: 'Pin Status', type: 'checkbox', checkboxLabel: 'Pin Note to Top' },
            ]}
            columns={[
                { key: 'title', label: 'Note' },
                { key: 'tag', label: 'Tag' },
                { key: 'content', label: 'Preview' },
                { key: 'is_pinned', label: 'Pinned' },
            ]}
            initialForm={{ title: '', content: '', tag: '', color: '#fef3c7', is_pinned: false }}
            mapForm={(f) => ({ ...f, is_pinned: Boolean(f.is_pinned) })}
            mapRow={(item, key) => {
                if (key === 'tag') {
                    return item.tag ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700">
                            #{item.tag}
                        </span>
                    ) : (
                        '—'
                    );
                }
                if (key === 'is_pinned') {
                    return item.is_pinned ? (
                        <span className="text-[#f47721] font-bold inline-flex items-center gap-1">
                            <i className="ti ti-pin" /> Pinned
                        </span>
                    ) : (
                        '—'
                    );
                }
                return item[key] || '—';
            }}
        />
    );
}

