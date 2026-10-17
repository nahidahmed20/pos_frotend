'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function DomainsPage() {
    const [domains, setDomains] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        company_id: '',
        domain: '',
        status: 'pending',
        notes: '',
    });

    const toast = (icon, text) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title: text,
                showConfirmButton: false,
                timer: 2600,
            });
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [domRes, comRes] = await Promise.all([
                axios.get('/api/domains'),
                axios.get('/api/companies'),
            ]);
            setDomains(domRes.data.data || []);
            setCompanies(comRes.data.data || []);
        } catch {
            toast('error', 'Failed to load domain mappings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/domains', {
                ...form,
                company_id: parseInt(form.company_id, 10),
            });
            toast('success', 'Custom domain mapping registered');
            setForm({ company_id: '', domain: '', status: 'pending', notes: '' });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not register domain');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = domains.filter((d) =>
        JSON.stringify(d).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">SAAS INFRASTRUCTURE</span>
                    <h1>Custom Domains</h1>
                    <p>Configure custom white-label hostnames and CNAME mappings for client tenants.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">ADD DOMAIN</span>
                    <h2>Map Custom Domain</h2>
                    <p>Enter client custom FQDN.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Company *</span>
                        <select
                            className="access-input"
                            value={form.company_id}
                            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                            required
                        >
                            <option value="">Select Tenant Company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Domain Hostname *</span>
                        <input
                            type="text"
                            className="access-input font-mono"
                            value={form.domain}
                            onChange={(e) => setForm({ ...form, domain: e.target.value })}
                            placeholder="pos.clientstore.com"
                            required
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Verification Status</span>
                        <select
                            className="access-input"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="pending">Pending DNS Verification</option>
                            <option value="approved">Approved & Active</option>
                            <option value="rejected">Rejected / Misconfigured</option>
                        </select>
                    </label>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Technical Notes</span>
                        <textarea
                            className="access-input min-h-[60px]"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="SSL certificate status, DNS records..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Mapping...' : 'Save Domain Mapping'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* List */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">MAPPED DOMAINS</span>
                            <h2>
                                Active Mappings <small className="resource-total">({domains.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search domain..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading domain mappings...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Domain Host</th>
                                        <th>Tenant</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((d) => (
                                        <tr key={d.id}>
                                            <td className="font-mono font-bold text-blue-600">
                                                <a href={`http://${d.domain}`} target="_blank" rel="noreferrer" className="hover:underline">
                                                    {d.domain} <i className="ti ti-external-link text-xs" />
                                                </a>
                                            </td>
                                            <td className="font-bold text-gray-800">{d.company?.name || 'Company'}</td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        d.status === 'approved'
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : d.status === 'pending'
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    {d.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-xs text-gray-500">{d.notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No custom domains registered yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

