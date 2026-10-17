'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const loadData = async (user = selectedUser) => {
        try {
            const [usersRes, msgRes] = await Promise.all([
                axios.get('/api/users'),
                axios.get(user ? `/api/chat/messages?user_id=${user.id}` : '/api/chat/messages'),
            ]);
            setUsers(usersRes.data || []);
            setMessages(msgRes.data.data || []);
        } catch {
            // silent catch
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(selectedUser);
    }, [selectedUser]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await axios.post('/api/chat/messages', {
                receiver_id: selectedUser ? selectedUser.id : null,
                message: newMessage.trim(),
            });
            setNewMessage('');
            loadData(selectedUser);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to send message', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">APPLICATION</span>
                    <h1>Team Chat & Messages</h1>
                    <p>Internal real-time messaging between cashiers, managers, and system administrators.</p>
                </div>
                <button type="button" className="access-refresh" onClick={() => loadData(selectedUser)}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="access-panel bg-white rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
                {/* Users / Channels */}
                <div className="border-r border-gray-100 p-3 bg-gray-50 flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                        Team Members
                    </span>
                    <div
                        onClick={() => setSelectedUser(null)}
                        className={`p-2.5 rounded-lg cursor-pointer mb-1 text-xs font-bold flex items-center gap-2 ${
                            selectedUser === null ? 'bg-white shadow-sm text-[#f47721]' : 'hover:bg-white text-gray-700'
                        }`}
                    >
                        <i className="ti ti-messages text-base" /> All Team Stream
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-1">
                        {users.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className={`p-2.5 rounded-lg cursor-pointer text-xs flex items-center justify-between ${
                                    selectedUser?.id === u.id
                                        ? 'bg-white shadow-sm font-bold text-[#f47721]'
                                        : 'hover:bg-white text-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                    <span>{u.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{u.role || 'Staff'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Stream */}
                <div className="md:col-span-2 flex flex-col justify-between p-4 bg-white">
                    {/* Header */}
                    <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <strong className="text-sm text-gray-900">
                                {selectedUser ? selectedUser.name : 'Team Announcement Channel'}
                            </strong>
                        </div>
                        <span className="text-xs text-gray-400">{messages.length} messages</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[400px]">
                        {loading ? (
                            <div className="text-center py-10 text-xs text-gray-400">Loading conversation...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-16 text-xs text-gray-400">
                                No messages yet. Say hello to your team!
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className="flex flex-col text-xs">
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <strong className="text-gray-900 font-bold">{m.sender?.name || 'User'}</strong>
                                        <span className="text-[10px] text-gray-400">
                                            {m.created_at?.slice(11, 16) || 'now'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 leading-relaxed max-w-xl">
                                        {m.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Send Input */}
                    <form onSubmit={handleSend} className="pt-3 border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${selectedUser ? selectedUser.name : 'team'}...`}
                            className="access-input flex-1"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="access-submit !w-auto !mt-0 !px-5 text-xs font-bold"
                        >
                            {sending ? 'Sending...' : 'Send'}
                            <i className="ti ti-send ml-1" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

