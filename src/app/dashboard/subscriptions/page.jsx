'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Select2 from '@/components/Select2';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        company_id: '',
        package_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'active',
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
            const [subRes, comRes, pkgRes] = await Promise.all([
                axios.get('/api/subscriptions'),
                axios.get('/api/companies'),
                axios.get('/api/packages'),
            ]);
            setSubscriptions(subRes.data.data || []);
            setCompanies(comRes.data.data || []);
            setPackages(pkgRes.data.data || []);
        } catch {
            toast('error', 'Failed to load subscription registry');
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
            await axios.post('/api/subscriptions', {
                ...form,
                company_id: parseInt(form.company_id, 10),
                package_id: parseInt(form.package_id, 10),
            });
            toast('success', 'Subscription assigned successfully');
            setForm({
                company_id: '',
                package_id: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                status: 'active',
            });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not save subscription');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = subscriptions.filter((s) =>
        JSON.stringify(s).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">SUPER ADMIN</span>
                    <h1>Subscriptions</h1>
                    <p>Monitor company license validity, active packages, and expiration timelines.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">PROVISION LICENSE</span>
                    <h2>Assign Subscription</h2>
                    <p>Link a merchant company to a pricing tier.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Company *</span>
                        <Select2
                            value={form.company_id}
                            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                            required
                            placeholder="Select Company"
                            options={[
                                { value: '', label: 'Select Company' },
                                ...companies.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                    sublabel: c.email ? `(${c.email})` : null,
                                })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Package / Tier *</span>
                        <Select2
                            value={form.package_id}
                            onChange={(e) => setForm({ ...form, package_id: e.target.value })}
                            required
                            placeholder="Select Package"
                            options={[
                                { value: '', label: 'Select Package' },
                                ...packages.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                    sublabel: `৳${p.price} (${p.duration_days} days)`,
                                })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Start Date *</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-bold text-gray-700 mb-1">End Date *</span>
                            <input
                                type="date"
                                className="access-input"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                required
                            />
                        </label>
                    </div>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Status</span>
                        <Select2
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'expired', label: 'Expired' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Assigning...' : 'Provision Subscription'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* List */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">DIRECTORY</span>
                            <h2>
                                Active Subscriptions <small className="resource-total">({subscriptions.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search company..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading subscriptions...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Package</th>
                                        <th>Valid From</th>
                                        <th>Valid Until</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s) => (
                                        <tr key={s.id}>
                                            <td className="font-bold text-gray-900">{s.company?.name || 'Company'}</td>
                                            <td className="font-semibold text-gray-700">{s.package?.name || 'Plan'}</td>
                                            <td>{s.start_date}</td>
                                            <td className="font-bold text-xs">{s.end_date}</td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        s.status === 'active'
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    {s.status?.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No active subscriptions found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

