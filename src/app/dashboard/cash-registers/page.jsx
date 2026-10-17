'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export default function CashRegistersPage() {
    const [tab, setTab] = useState('terminals'); // 'terminals' | 'sessions'
    const [registers, setRegisters] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [closingSession, setClosingSession] = useState(null);
    const [closingBalance, setClosingBalance] = useState('');
    const [closingNote, setClosingNote] = useState('');

    // Terminal form
    const [terminalForm, setTerminalForm] = useState({
        name: '',
        code: `CR-${Math.floor(100 + Math.random() * 900)}`,
        location: '',
        is_active: true,
    });

    // Session form
    const [sessionForm, setSessionForm] = useState({
        cash_register_id: '',
        opening_balance: '0',
        opening_note: '',
    });

    const toast = (icon, title) =>
        window.Swal?.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            timer: 2600,
            timerProgressBar: true,
        });

    const loadData = async () => {
        setLoading(true);
        try {
            const [regRes, sessRes] = await Promise.all([
                axios.get('/api/cash-registers'),
                axios.get('/api/cash-register-sessions').catch(() => ({ data: { data: [] } })),
            ]);
            setRegisters(regRes.data?.data || []);
            setSessions(sessRes.data?.data?.data || sessRes.data?.data || []);
        } catch {
            toast('error', 'Could not load cash register data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [tab]);

    const handleCreateTerminal = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/cash-registers', {
                ...terminalForm,
                is_active: Boolean(terminalForm.is_active),
            });
            toast('success', 'Cash register terminal created');
            setTerminalForm({
                name: '',
                code: `CR-${Math.floor(100 + Math.random() * 900)}`,
                location: '',
                is_active: true,
            });
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Failed to create terminal.');
        }
    };

    const handleOpenSession = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/cash-register-sessions', {
                cash_register_id: Number(sessionForm.cash_register_id),
                opening_balance: Number(sessionForm.opening_balance || 0),
                opening_note: sessionForm.opening_note || null,
            });
            toast('success', 'Cash register session opened successfully');
            setSessionForm({ cash_register_id: '', opening_balance: '0', opening_note: '' });
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Failed to open session.');
        }
    };

    const handleCloseSession = async (e) => {
        e.preventDefault();
        if (!closingSession) return;
        try {
            await axios.post(`/api/cash-register-sessions/${closingSession.id}/close`, {
                closing_balance: Number(closingBalance),
                closing_note: closingNote || null,
            });
            toast('success', `Session #${closingSession.id} closed successfully`);
            setClosingSession(null);
            setClosingBalance('');
            setClosingNote('');
            loadData();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Failed to close session.');
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">POINT OF SALE</span>
                    <h1>Cash Registers & Sessions</h1>
                    <p>Manage hardware checkout counters, shift cash drawers, and track closing balances.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTab('terminals')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                tab === 'terminals'
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <i className="ti ti-device-laptop me-1" /> Terminals
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('sessions')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                tab === 'sessions'
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <i className="ti ti-clock-check me-1" /> Shift Sessions
                        </button>
                    </div>

                    <button type="button" className="access-refresh" onClick={loadData}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            {/* TAB 1: TERMINALS */}
            {tab === 'terminals' && (
                <div className="resource-layout">
                    <form className="access-panel create-panel" onSubmit={handleCreateTerminal}>
                        <span className="access-kicker">NEW REGISTER</span>
                        <h2>Add Cash Register</h2>
                        <p>Configure a new physical counter or station.</p>

                        <label>
                            Terminal Name *
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. Counter 01 - Main Floor"
                                value={terminalForm.name}
                                onChange={(e) => setTerminalForm({ ...terminalForm, name: e.target.value })}
                                required
                            />
                        </label>

                        <label>
                            Terminal Code *
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. CR-101"
                                value={terminalForm.code}
                                onChange={(e) => setTerminalForm({ ...terminalForm, code: e.target.value })}
                                required
                            />
                        </label>

                        <label>
                            Location
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. Ground Floor, Checkout Counter A"
                                value={terminalForm.location}
                                onChange={(e) => setTerminalForm({ ...terminalForm, location: e.target.value })}
                            />
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                checked={terminalForm.is_active}
                                onChange={(e) => setTerminalForm({ ...terminalForm, is_active: e.target.checked })}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Active POS Register
                            </span>
                        </label>

                        <button className="access-submit mt-3" type="submit">
                            Save Register <i className="ti ti-check" />
                        </button>
                    </form>

                    <section className="access-panel records-panel">
                        <div className="records-heading">
                            <div>
                                <span className="access-kicker">TERMINALS</span>
                                <h2>
                                    Active Counters <small className="resource-total">{registers.length}</small>
                                </h2>
                            </div>
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading terminals...</p>
                            </div>
                        ) : registers.length === 0 ? (
                            <div className="access-empty">
                                <i className="ti ti-device-laptop" />
                                <p>No cash registers found.</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th>Register Name</th>
                                            <th>Code</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registers.map((r) => (
                                            <tr key={r.id}>
                                                <td>
                                                    <strong>{r.name}</strong>
                                                </td>
                                                <td>
                                                    <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                        {r.code}
                                                    </span>
                                                </td>
                                                <td>{r.location || '—'}</td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            r.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                                : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                    >
                                                        {r.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* TAB 2: SESSIONS */}
            {tab === 'sessions' && (
                <div className="resource-layout">
                    <form className="access-panel create-panel" onSubmit={handleOpenSession}>
                        <span className="access-kicker">START SHIFT</span>
                        <h2>Open Cash Session</h2>
                        <p>Open the cash drawer with an initial floating balance.</p>

                        <label>
                            Select Register *
                            <select
                                className="access-input"
                                value={sessionForm.cash_register_id}
                                onChange={(e) => setSessionForm({ ...sessionForm, cash_register_id: e.target.value })}
                                required
                            >
                                <option value="">Select counter</option>
                                {registers
                                    .filter((r) => r.is_active)
                                    .map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} ({r.code})
                                        </option>
                                    ))}
                            </select>
                        </label>

                        <label>
                            Opening Float Balance (৳) *
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                step="any"
                                value={sessionForm.opening_balance}
                                onChange={(e) => setSessionForm({ ...sessionForm, opening_balance: e.target.value })}
                                required
                                placeholder="0.00"
                            />
                        </label>

                        <label>
                            Shift Notes
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. Morning Shift"
                                value={sessionForm.opening_note}
                                onChange={(e) => setSessionForm({ ...sessionForm, opening_note: e.target.value })}
                            />
                        </label>

                        <button className="access-submit" type="submit">
                            Open Shift Drawer <i className="ti ti-lock-open" />
                        </button>
                    </form>

                    <section className="access-panel records-panel">
                        <div className="records-heading">
                            <div>
                                <span className="access-kicker">SHIFT LOG</span>
                                <h2>
                                    Register Sessions{' '}
                                    <small className="resource-total">{sessions.length}</small>
                                </h2>
                            </div>
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading sessions...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="access-empty">
                                <i className="ti ti-clock-check" />
                                <p>No register sessions recorded yet.</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th>Register</th>
                                            <th>Cashier</th>
                                            <th>Opening</th>
                                            <th>Closing</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((s) => (
                                            <tr key={s.id}>
                                                <td>
                                                    <strong>{s.cash_register?.name || s.cashRegister?.name || `Counter #${s.cash_register_id}`}</strong>
                                                    <small>Opened: {new Date(s.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                                </td>
                                                <td>{s.user?.name || 'Cashier'}</td>
                                                <td>৳{Number(s.opening_balance).toFixed(2)}</td>
                                                <td>
                                                    {s.closing_balance !== null && s.closing_balance !== undefined
                                                        ? `৳${Number(s.closing_balance).toFixed(2)}`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                            s.status === 'open'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {s.status === 'open' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setClosingSession(s)}
                                                            className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                                                        >
                                                            <i className="ti ti-lock" /> Close Shift
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-semibold">
                                                            Closed {s.closed_at ? new Date(s.closed_at).toLocaleDateString() : ''}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* Close Session Modal */}
            {closingSession && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleCloseSession}
                        className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-bold">Close Shift Session #{closingSession.id}</h3>
                                <p className="text-xs text-slate-500">
                                    {closingSession.cash_register?.name || closingSession.cashRegister?.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setClosingSession(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Counted Drawer Cash (৳) *
                            </label>
                            <input
                                className="access-input"
                                type="number"
                                min="0"
                                step="any"
                                value={closingBalance}
                                onChange={(e) => setClosingBalance(e.target.value)}
                                required
                                placeholder="Total cash inside drawer"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Closing Remarks
                            </label>
                            <input
                                className="access-input"
                                type="text"
                                placeholder="e.g. Drawer balanced, shift handover done"
                                value={closingNote}
                                onChange={(e) => setClosingNote(e.target.value)}
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setClosingSession(null)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs font-bold rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                            >
                                <i className="ti ti-lock" /> Confirm Close Shift
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
