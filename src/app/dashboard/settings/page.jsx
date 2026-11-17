'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        company_name: 'DreamsPOS Store',
        legal_name: '',
        business_type: 'retail',
        tax_number: '',
        phone: '+880 1700-000000',
        email: 'info@dreamspos.com',
        website: '',
        address: 'House #12, Road #4, Dhanmondi, Dhaka',
        city: 'Dhaka',
        state: '',
        postal_code: '',
        country: 'Bangladesh',
        currency: 'BDT (৳)',
        currency_code: 'BDT',
        currency_symbol: '৳',
        timezone: 'Asia/Dhaka',
        date_format: 'DD/MM/YYYY',
        tax_rate: '7.5',
        allow_negative_stock: false,
        low_stock_alert_quantity: '5',
        invoice_prefix: 'INV-',
        invoice_title: 'Tax Invoice',
        invoice_terms: 'Goods once sold cannot be returned without the original invoice.',
        invoice_show_logo: true,
        invoice_show_tax_number: true,
        invoice_show_customer: true,
        invoice_show_cashier: true,
        invoice_show_sku: true,
        invoice_show_discount: true,
        invoice_show_tax: true,
        invoice_show_paid_due: true,
        receipt_width: '80mm',
        receipt_show_logo: true,
        receipt_show_tax_number: true,
        receipt_show_customer: true,
        receipt_show_cashier: true,
        receipt_show_sku: true,
        receipt_header: 'Thank you for shopping at DreamsPOS!',
        receipt_footer: 'Warranty claim requires this original slip. Please visit again!',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

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
                <form onSubmit={handleSave} className="settings-workspace-form">
                    <div className="settings-workspace">
                        <aside className="settings-subnav access-panel">
                            <h2>Settings</h2>
                            <div className="settings-subnav-group">
                                <span className="settings-subnav-heading"><i className="ti ti-settings" /> General Settings</span>
                                {[
                                    ['profile', 'Business Profile', 'ti-user-circle'],
                                    ['regional', 'Regional Preferences', 'ti-world'],
                                    ['invoice', 'Invoice Settings', 'ti-file-invoice'],
                                ].map(([key, label, icon]) => (
                                    <button type="button" key={key} onClick={() => setActiveSection(key)} className={activeSection === key ? 'active' : ''}>
                                        <i className={`ti ${icon}`} />{label}
                                    </button>
                                ))}
                            </div>
                            <div className="settings-subnav-group">
                                <span className="settings-subnav-heading"><i className="ti ti-device-desktop-analytics" /> POS Settings</span>
                                {[
                                    ['pos', 'Stock & Tax', 'ti-building-store'],
                                    ['receipt', 'Receipt Settings', 'ti-receipt'],
                                ].map(([key, label, icon]) => (
                                    <button type="button" key={key} onClick={() => setActiveSection(key)} className={activeSection === key ? 'active' : ''}>
                                        <i className={`ti ${icon}`} />{label}
                                    </button>
                                ))}
                            </div>
                            <p className="settings-subnav-note">Choose a section to manage your store configuration.</p>
                        </aside>

                        <div className="settings-content">
                    {/* General Company Information */}
                    {activeSection === 'profile' && (
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">STORE IDENTITY</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Corporate & Store Info</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                <span className="block text-xs font-bold text-gray-700 mb-1">Legal Business Name</span>
                                <input type="text" className="access-input" value={settings.legal_name || ''} onChange={(e) => setSettings({ ...settings, legal_name: e.target.value })} placeholder="Registered company name" />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Business Type</span>
                                <select className="access-input" value={settings.business_type || 'retail'} onChange={(e) => setSettings({ ...settings, business_type: e.target.value })}>
                                    <option value="retail">Retail</option><option value="wholesale">Wholesale</option><option value="restaurant">Restaurant / Cafe</option><option value="pharmacy">Pharmacy</option><option value="service">Services</option><option value="other">Other</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">BIN / Tax Registration Number</span>
                                <input type="text" className="access-input" value={settings.tax_number || ''} onChange={(e) => setSettings({ ...settings, tax_number: e.target.value })} placeholder="Business tax identifier" />
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
                                <span className="block text-xs font-bold text-gray-700 mb-1">Website</span>
                                <input type="url" className="access-input" value={settings.website || ''} onChange={(e) => setSettings({ ...settings, website: e.target.value })} placeholder="https://example.com" />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Business Logo URL</span>
                                <input type="text" className="access-input" value={settings.logo_url || ''} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} placeholder="/assets/img/logo.svg" />
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
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Currency Code</span>
                                <input type="text" className="access-input uppercase" value={settings.currency_code || ''} onChange={(e) => setSettings({ ...settings, currency_code: e.target.value.toUpperCase() })} placeholder="BDT" />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Currency Symbol</span>
                                <input type="text" className="access-input" value={settings.currency_symbol || ''} onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })} placeholder="৳" />
                            </label>
                            <label className="block md:col-span-2 xl:col-span-3">
                                <span className="block text-xs font-bold text-gray-700 mb-1">Physical Store Address</span>
                                <textarea
                                    className="access-input min-h-[60px]"
                                    value={settings.address || ''}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                />
                            </label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">City</span><input className="access-input" value={settings.city || ''} onChange={(e) => setSettings({ ...settings, city: e.target.value })} /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">State / District</span><input className="access-input" value={settings.state || ''} onChange={(e) => setSettings({ ...settings, state: e.target.value })} /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Postal Code</span><input className="access-input" value={settings.postal_code || ''} onChange={(e) => setSettings({ ...settings, postal_code: e.target.value })} /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Country</span><input className="access-input" value={settings.country || ''} onChange={(e) => setSettings({ ...settings, country: e.target.value })} /></label>
                        </div>
                    </div>
                    )}

                    {activeSection === 'regional' && (
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">REGIONAL PREFERENCES</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Date, Time &amp; Number Format</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Timezone</span><input className="access-input" value={settings.timezone || ''} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} placeholder="Asia/Dhaka" /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Date Format</span><select className="access-input" value={settings.date_format || 'DD/MM/YYYY'} onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></label>
                        </div>
                    </div>
                    )}

                    {activeSection === 'pos' && (
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">POS &amp; INVENTORY</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Default Store Rules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Default Tax / VAT Rate (%)</span><input type="number" step="0.01" min="0" className="access-input" value={settings.tax_rate ?? '0'} onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })} /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Low Stock Alert Quantity</span><input type="number" min="0" step="1" className="access-input" value={settings.low_stock_alert_quantity ?? '0'} onChange={(e) => setSettings({ ...settings, low_stock_alert_quantity: e.target.value })} /></label>
                            <label className="block flex items-center gap-2 pt-5"><input type="checkbox" checked={Boolean(settings.allow_negative_stock)} onChange={(e) => setSettings({ ...settings, allow_negative_stock: e.target.checked })} className="h-4 w-4 accent-[#f47721]" /><span className="text-xs font-bold text-gray-700">Allow sales when stock is zero</span></label>
                        </div>
                    </div>
                    )}

                    {activeSection === 'invoice' && (
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">SALES DOCUMENTS</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Invoice Settings</h2>
                        <p className="text-xs text-gray-500 mb-5">Set invoice numbering, print size, and which details appear on POS receipts.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Invoice Number Prefix</span><input className="access-input" value={settings.invoice_prefix || ''} onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })} placeholder="INV-" /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Invoice Title</span><input className="access-input" value={settings.invoice_title || ''} onChange={(e) => setSettings({ ...settings, invoice_title: e.target.value })} placeholder="Tax Invoice" /></label>
                            <label className="block"><span className="block text-xs font-bold text-gray-700 mb-1">Print Paper Size</span><select className="access-input" value={settings.receipt_width || '80mm'} onChange={(e) => setSettings({ ...settings, receipt_width: e.target.value })}><option value="58mm">58 mm thermal</option><option value="80mm">80 mm thermal</option><option value="A4">A4 invoice</option></select></label>
                            <label className="block md:col-span-2 xl:col-span-3"><span className="block text-xs font-bold text-gray-700 mb-1">Invoice Terms / Return Policy</span><textarea className="access-input min-h-[90px]" value={settings.invoice_terms || ''} onChange={(e) => setSettings({ ...settings, invoice_terms: e.target.value })} placeholder="Terms printed at the bottom of the invoice" /></label>
                            <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 border-t pt-4">
                                {[
                                    ['invoice_show_logo', 'Show business logo'],
                                    ['invoice_show_tax_number', 'Show BIN / tax number'],
                                    ['invoice_show_customer', 'Show customer details'],
                                    ['invoice_show_cashier', 'Show cashier name'],
                                    ['invoice_show_sku', 'Show product SKU'],
                                    ['invoice_show_discount', 'Show discount'],
                                    ['invoice_show_tax', 'Show tax breakdown'],
                                    ['invoice_show_paid_due', 'Show paid and due amounts'],
                                ].map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 text-xs font-semibold text-gray-700"><input type="checkbox" checked={Boolean(settings[key])} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} className="h-4 w-4 accent-[#f47721]" />{label}</label>
                                ))}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Tax & POS Receipt Customization */}
                    {activeSection === 'receipt' && (
                    <div className="access-panel p-6 bg-white rounded-xl shadow-sm">
                        <span className="access-kicker">TAX & RECEIPT PRINTING</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">POS Receipt Parameters</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    )}
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
