'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function EmailsPage() {
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/emails');
            const list = res.data.data || [];
            setEmails(list);
            if (list.length > 0 && !selectedEmail) setSelectedEmail(list[0]);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load inbox', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">APPLICATION</span>
                    <h1>Inbox & Notifications</h1>
                    <p>Internal system notifications, alerts, and operational email messages.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="access-panel records-panel bg-white p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                    {/* List */}
                    <div className="border-r border-gray-100 p-3 space-y-1 overflow-y-auto">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-2 mb-2">
                            Inbox ({emails.length})
                        </span>
                        {loading ? (
                            <p className="text-xs text-gray-500 p-2">Loading messages...</p>
                        ) : (
                            emails.map((e) => (
                                <div
                                    key={e.id}
                                    onClick={() => setSelectedEmail(e)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedEmail?.id === e.id
                                            ? 'bg-orange-50 border border-[#f47721]/30'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-xs ${!e.is_read ? 'font-black text-gray-900' : 'text-gray-700 font-bold'}`}>
                                            {e.from}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{e.date?.slice(0, 10)}</span>
                                    </div>
                                    <div className={`text-xs truncate ${!e.is_read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                        {e.subject}
                                    </div>
                                    <div className="text-[11px] text-gray-500 truncate mt-0.5">{e.snippet}</div>
                                </div>
                            ))
                        )}
                        {!loading && emails.length === 0 && (
                            <p className="text-xs text-gray-400 p-4 text-center">Inbox is empty</p>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="md:col-span-2 p-6 flex flex-col justify-between">
                        {selectedEmail ? (
                            <div>
                                <div className="border-b pb-4 mb-4">
                                    <h2 className="text-lg font-extrabold text-gray-900 mb-2">
                                        {selectedEmail.subject}
                                    </h2>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div>
                                            From: <strong className="text-gray-800">{selectedEmail.from}</strong>
                                        </div>
                                        <span>{selectedEmail.date}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                                    <p>{selectedEmail.snippet}</p>
                                    <p className="text-xs text-gray-500 italic mt-6">
                                        This is a system generated notification dispatched via DreamsPOS Notification Engine.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <i className="ti ti-mail-opened text-4xl mb-2" />
                                <p className="text-xs">Select a message to preview its contents</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

