'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        company_name: 'DreamsPOS Store',
        phone: '+880 1700-000000',
        email: 'info@dreamspos.com',
        address: 'House #12, Road #4, Dhanmondi, Dhaka',
        currency: 'BDT (৳)',
        tax_rate: '7.5',
        receipt_header: 'Thank you for shopping at DreamsPOS!',
        receipt_footer: 'Warranty claim requires this original slip. Please visit again!',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/settings');
            if (res.data.data && Object.keys(res.data.data).length > 0) {
                setSettings((prev) => ({ ...prev, ...res.data.data }));
            }
        } catch {
            toast('error', 'Could not load business settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/settings', { settings });
            toast('success', 'Business settings updated successfully!');
            loadSettings();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">CONFIGURATION</span>
                    <h1>Business Settings</h1>
                    <p>Customize store branding, VAT/tax parameters, contact information, and thermal receipt headers.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadSettings}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="access-empty">
                    <i className="ti ti-loader-2 animate-spin text-2xl" />
                    <p>Loading business configuration...</p>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
                    {/* General Company Information */}
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">STORE IDENTITY</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Corporate & Store Info</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Company / Store Name *</span>
                                <input
                                    type="text"
                                    className="access-input"
                                    value={settings.company_name || ''}
                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    required
                                />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Support Phone</span>
                                <input
                                    type="text"
                                    className="access-input"
                                    value={settings.phone || ''}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Support Email</span>
                                <input
                                    type="email"
                                    className="access-input"
                                    value={settings.email || ''}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Default Currency</span>
                                <input
                                    type="text"
                                    className="access-input font-bold"
                                    value={settings.currency || 'BDT (৳)'}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Physical Store Address</span>
                                <textarea
                                    className="access-input min-h-[60px]"
                                    value={settings.address || ''}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Tax & POS Receipt Customization */}
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">TAX & RECEIPT PRINTING</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">POS Receipt Parameters</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block md:col-span-2">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Default Tax / VAT Rate (%)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="access-input max-w-xs font-bold"
                                    value={settings.tax_rate || '0'}
                                    onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Receipt Header Text</span>
                                <input
                                    type="text"
                                    className="access-input"
                                    value={settings.receipt_header || ''}
                                    onChange={(e) => setSettings({ ...settings, receipt_header: e.target.value })}
                                    placeholder="Greeting displayed at top of printed customer invoice"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Receipt Footer Note</span>
                                <textarea
                                    className="access-input min-h-[60px]"
                                    value={settings.receipt_footer || ''}
                                    onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                                    placeholder="Return policy or thank-you message at bottom of receipt"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="access-submit !w-auto !mt-0 !py-3 !px-8 text-sm font-bold shadow-md inline-flex items-center gap-2"
                        >
                            {saving ? 'Saving Changes...' : 'Save Settings'}
                            <i className="ti ti-check" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
