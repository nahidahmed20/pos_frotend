'use client';

import CrudWorkspace from '@/components/CrudWorkspace';

export default function ContactsPage() {
    return (
        <CrudWorkspace
            title="Contacts"
            eyebrow="APPLICATION"
            description="Corporate phonebook, partner representatives, and emergency business contacts."
            endpoint="/api/contacts"
            fields={[
                { name: 'name', label: 'Full Name', placeholder: 'e.g. Tanvir Ahmed', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'tanvir@partner.com' },
                { name: 'phone', label: 'Phone Number', placeholder: '+880 17...' },
                { name: 'role', label: 'Designation / Role', placeholder: 'e.g. Key Account Manager' },
                { name: 'company', label: 'Company / Organization', placeholder: 'e.g. Unilever Bangladesh' },
            ]}
            columns={[
                { key: 'name', label: 'Contact Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Designation' },
                { key: 'company', label: 'Organization' },
            ]}
            initialForm={{ name: '', email: '', phone: '', role: '', company: '' }}
        />
    );
}

