'use client';

import CrudWorkspace from '@/components/CrudWorkspace';
import Link from 'next/link';

export default function BankAccountsPage() {
    return (
        <CrudWorkspace
            title="Bank Accounts"
            eyebrow="TREASURY"
            description="Manage corporate bank accounts, cash registers, and current balance reconciliations."
            endpoint="/api/accounts"
            fields={[
                { name: 'name', label: 'Account Holder / Display Name', placeholder: 'e.g. Main Operating Account, Petty Cash', required: true },
                { name: 'account_number', label: 'Account Number', placeholder: 'e.g. 10293847561' },
                { name: 'bank_name', label: 'Bank Name', placeholder: 'e.g. BRAC Bank PLC, City Bank' },
                { name: 'branch_name', label: 'Bank Branch', placeholder: 'e.g. Gulshan Branch' },
                { name: 'opening_balance', label: 'Opening Balance (৳)', type: 'number', step: '0.01', placeholder: '0.00' },
                { name: 'note', label: 'Account Notes', type: 'textarea', placeholder: 'Routing or signatory info...' },
                { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Active Account' },
            ]}
            columns={[
                { key: 'name', label: 'Account Name' },
                { key: 'bank_name', label: 'Bank' },
                { key: 'account_number', label: 'Account #' },
                { key: 'current_balance', label: 'Current Balance' },
                { key: 'is_active', label: 'Status' },
            ]}
            initialForm={{
                name: '',
                account_number: '',
                bank_name: '',
                branch_name: '',
                opening_balance: '0',
                note: '',
                is_active: true,
            }}
            mapForm={(f) => ({
                ...f,
                opening_balance: parseFloat(f.opening_balance) || 0,
                is_active: Boolean(f.is_active),
            })}
            mapRow={(item, key) => {
                if (key === 'current_balance') {
                    return (
                        <span className="font-bold text-emerald-700">
                            ৳ {parseFloat(item.current_balance || item.opening_balance || 0).toLocaleString()}
                        </span>
                    );
                }
                if (key === 'is_active') {
                    return (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                    );
                }
                return item[key] || '—';
            }}
            customAction={
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/money-transfers"
                        className="access-submit !w-auto !mt-0 !py-2 !px-3 text-xs font-bold inline-flex items-center gap-1"
                    >
                        <i className="ti ti-arrows-left-right" /> Transfer Money
                    </Link>
                    <Link
                        href="/dashboard/accounts/balance-sheet"
                        className="px-3 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:border-[#f47721] hover:text-[#f47721] transition-colors"
                    >
                        <i className="ti ti-file-analytics" /> Financial Reports
                    </Link>
                </div>
            }
        />
    );
}

