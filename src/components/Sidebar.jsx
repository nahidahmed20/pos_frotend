// src/components/Sidebar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [openSubmenus, setOpenSubmenus] = useState({
        superadmin: false,
        application: false,
    });

    // Auto-open submenu if current route matches
    useEffect(() => {
        if (!pathname) return;
        const isSuperAdmin = [
            '/dashboard/companies',
            '/dashboard/subscriptions',
            '/dashboard/packages',
            '/dashboard/domains',
            '/dashboard/purchase-transactions',
        ].some((p) => pathname.startsWith(p));

        const isApplication = [
            '/dashboard/chat',
            '/dashboard/calendar',
            '/dashboard/contacts',
            '/dashboard/emails',
            '/dashboard/todos',
            '/dashboard/notes',
            '/dashboard/file-manager',
            '/dashboard/projects',
            '/dashboard/call-logs',
            '/dashboard/ecommerce',
        ].some((p) => pathname.startsWith(p));

        if (isSuperAdmin || isApplication) {
            setOpenSubmenus((prev) => ({
                ...prev,
                superadmin: isSuperAdmin ? true : prev.superadmin,
                application: isApplication ? true : prev.application,
            }));
        }
    }, [pathname]);

    const toggleSubmenu = (key) => {
        setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSidebar = (e) => {
        e.preventDefault();
        if (typeof document !== 'undefined') {
            document.body.classList.toggle('mini-sidebar');
            document.body.classList.toggle('expand-menu');
        }
    };

    const isActive = (href) => {
        if (!pathname) return false;
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        const [cleanHref] = href.split('?');
        const expectedParams = new URLSearchParams(href.split('?')[1] || '');
        const hasExpectedParams = [...expectedParams.keys()].length > 0;

        if (hasExpectedParams) {
            if (pathname !== cleanHref) return false;
            return [...expectedParams.entries()].every(([key, value]) => searchParams.get(key) === value);
        }

        // When a menu item has a query-specific sibling on the same path
        // (Users and Roles & Permissions), only the matching tab is active.
        if (cleanHref === '/dashboard/access-control' && searchParams.get('tab') === 'users') {
            return false;
        }

        const nestedMenuRoutes = [
            '/dashboard/products/create',
            '/dashboard/purchases/create',
            '/dashboard/purchases/returns',
            '/dashboard/accounts/balance-sheet',
            '/dashboard/settings/profile',
        ];
        const hasMoreSpecificRoute = nestedMenuRoutes.some((route) =>
            pathname.startsWith(route) && route.startsWith(`${cleanHref}/`)
        );
        if (hasMoreSpecificRoute) return false;

        return pathname === cleanHref || pathname.startsWith(cleanHref + '/');
    };

    const handleLogout = async (e) => {
        e?.preventDefault();

        let confirmed = true;
        if (typeof window !== 'undefined' && window.Swal) {
            const res = await window.Swal.fire({
                title: 'লগআউট নিশ্চিতকরণ',
                text: 'আপনি কি নিশ্চিত যে আপনি আপনার সেশন থেকে লগআউট করতে চান?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#f47721',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'হ্যাঁ, লগআউট করুন',
                cancelButtonText: 'বাতিল',
            });
            confirmed = !!res?.isConfirmed;
        } else if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
            confirmed = window.confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?');
        }

        if (!confirmed) return;

        try {
            await axios.post('/api/logout');
        } catch {
            // ignore
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('pos_token');
                window.location.href = '/login';
            }
        }
    };

    const linkCls = (href) =>
        `flex items-center px-3 py-2 rounded-lg transition-all ${
            isActive(href)
                ? 'bg-[#f47721]/10 !text-[#f47721] font-bold active'
                : 'text-[#5B6670] hover:text-[#f47721] hover:bg-gray-50'
        }`;

    const iconCls = (href) =>
        `text-[16px] me-2 ${isActive(href) ? '!text-[#f47721]' : ''}`;

    return (
        <div className="sidebar" id="sidebar">
            {/* Logo */}
            <div className="sidebar-logo items-center active">
                <Link href="/dashboard" className="logo logo-normal">
                    <img src="/assets/img/logo.svg" alt="DreamsPOS" />
                </Link>
                <Link href="/dashboard" className="logo logo-white">
                    <img src="/assets/img/logo-white.svg" alt="DreamsPOS" />
                </Link>
                <Link href="/dashboard" className="logo-small">
                    <img src="/assets/img/logo-small.png" alt="DreamsPOS" />
                </Link>
                <a
                    id="toggle_btn"
                    href="#"
                    onClick={toggleSidebar}
                    className="flex items-center justify-center absolute end-[-13px] w-[25px] h-[25px] bg-[#f47721] text-white rounded-full opacity-100 cursor-pointer transition-all duration-300 hover:bg-[#d96725]"
                    title="Toggle Sidebar"
                >
                    <i className="ti ti-chevron-left text-sm" />
                </a>
            </div>
            {/* /Logo */}

            <div className="modern-profile p-4 pb-0">
                <div className="text-center rounded bg-light p-4 mb-4 user-profile">
                    <div className="relative size-[45px] mx-auto mb-3">
                        <img src="/assets/img/customer/customer15.jpg" alt="User" className="img-fluid rounded-full" />
                        <span className="bottom-0 end-0 absolute size-3.5 bg-success border-2 border-white rounded-full"></span>
                    </div>
                    <h6 className="text-sm font-bold mb-1">DreamsPOS Workspace</h6>
                    <p className="text-xs text-gray-500 mb-0">System Admin</p>
                </div>
            </div>

            <div className="sidebar-inner">
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        {/* MAIN */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Main</h6>
                            <ul>
                                <li className={isActive('/dashboard') ? 'active' : ''}>
                                    <Link href="/dashboard" className={linkCls('/dashboard')}>
                                        <i className={`ti ti-layout-grid ${iconCls('/dashboard')}`} />
                                        <span>Dashboard</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pos" className="flex items-center px-3 py-2 text-[#f47721] font-bold hover:bg-[#f47721]/10 rounded-lg transition-all">
                                        <i className="ti ti-device-desktop-analytics text-[16px] me-2 text-[#f47721]" />
                                        <span>POS Terminal</span>
                                    </Link>
                                </li>

                                {/* Super Admin / SaaS */}
                                <li className={`submenu ${openSubmenus.superadmin ? 'subdrop' : ''}`}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSubmenu('superadmin');
                                        }}
                                        className={`flex items-center cursor-pointer px-3 py-2 rounded-lg transition-all ${openSubmenus.superadmin ? 'subdrop text-[#f47721] font-bold bg-[#f47721]/5' : 'text-[#5B6670] hover:text-[#f47721]'}`}
                                    >
                                        <i className="ti ti-user-edit text-[16px] me-2" />
                                        <span>Super Admin (SaaS)</span>
                                        <span className={`menu-arrow transition-transform duration-200 ${openSubmenus.superadmin ? 'rotate-90' : ''}`}></span>
                                    </a>
                                    <ul style={{ display: openSubmenus.superadmin ? 'block' : 'none' }}>
                                        <li className={isActive('/dashboard/companies') ? 'active' : ''}><Link href="/dashboard/companies" className={linkCls('/dashboard/companies')}>Companies</Link></li>
                                        <li className={isActive('/dashboard/subscriptions') ? 'active' : ''}><Link href="/dashboard/subscriptions" className={linkCls('/dashboard/subscriptions')}>Subscriptions</Link></li>
                                        <li className={isActive('/dashboard/packages') ? 'active' : ''}><Link href="/dashboard/packages" className={linkCls('/dashboard/packages')}>SaaS Packages</Link></li>
                                        <li className={isActive('/dashboard/domains') ? 'active' : ''}><Link href="/dashboard/domains" className={linkCls('/dashboard/domains')}>Domains</Link></li>
                                        <li className={isActive('/dashboard/purchase-transactions') ? 'active' : ''}><Link href="/dashboard/purchase-transactions" className={linkCls('/dashboard/purchase-transactions')}>Purchase Transactions</Link></li>
                                    </ul>
                                </li>

                                {/* Applications */}
                                <li className={`submenu ${openSubmenus.application ? 'subdrop' : ''}`}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSubmenu('application');
                                        }}
                                        className={`flex items-center cursor-pointer px-3 py-2 rounded-lg transition-all ${openSubmenus.application ? 'subdrop text-[#f47721] font-bold bg-[#f47721]/5' : 'text-[#5B6670] hover:text-[#f47721]'}`}
                                    >
                                        <i className="ti ti-brand-apple-arcade text-[16px] me-2" />
                                        <span>Application</span>
                                        <span className={`menu-arrow transition-transform duration-200 ${openSubmenus.application ? 'rotate-90' : ''}`}></span>
                                    </a>
                                    <ul style={{ display: openSubmenus.application ? 'block' : 'none' }}>
                                        <li className={isActive('/dashboard/chat') ? 'active' : ''}><Link href="/dashboard/chat" className={linkCls('/dashboard/chat')}>Team Chat</Link></li>
                                        <li className={isActive('/dashboard/calendar') ? 'active' : ''}><Link href="/dashboard/calendar" className={linkCls('/dashboard/calendar')}>Calendar</Link></li>
                                        <li className={isActive('/dashboard/contacts') ? 'active' : ''}><Link href="/dashboard/contacts" className={linkCls('/dashboard/contacts')}>Contacts</Link></li>
                                        <li className={isActive('/dashboard/emails') ? 'active' : ''}><Link href="/dashboard/emails" className={linkCls('/dashboard/emails')}>Emails / Inbox</Link></li>
                                        <li className={isActive('/dashboard/todos') ? 'active' : ''}><Link href="/dashboard/todos" className={linkCls('/dashboard/todos')}>To-Do List</Link></li>
                                        <li className={isActive('/dashboard/notes') ? 'active' : ''}><Link href="/dashboard/notes" className={linkCls('/dashboard/notes')}>Notes</Link></li>
                                        <li className={isActive('/dashboard/file-manager') ? 'active' : ''}><Link href="/dashboard/file-manager" className={linkCls('/dashboard/file-manager')}>File Manager</Link></li>
                                        <li className={isActive('/dashboard/projects') ? 'active' : ''}><Link href="/dashboard/projects" className={linkCls('/dashboard/projects')}>Projects</Link></li>
                                        <li className={isActive('/dashboard/call-logs') ? 'active' : ''}><Link href="/dashboard/call-logs" className={linkCls('/dashboard/call-logs')}>Call Logs</Link></li>
                                        <li className={isActive('/dashboard/ecommerce/reviews') ? 'active' : ''}><Link href="/dashboard/ecommerce/reviews" className={linkCls('/dashboard/ecommerce/reviews')}>Ecommerce Reviews</Link></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>

                        {/* INVENTORY */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Inventory</h6>
                            <ul>
                                <li className={isActive('/dashboard/products') ? 'active' : ''}><Link href="/dashboard/products" className={linkCls('/dashboard/products')}><i className={`ti ti-box ${iconCls('/dashboard/products')}`} /><span>Products</span></Link></li>
                                <li className={isActive('/dashboard/products/create') ? 'active' : ''}><Link href="/dashboard/products/create" className={linkCls('/dashboard/products/create')}><i className={`ti ti-table-plus ${iconCls('/dashboard/products/create')}`} /><span>Create Product</span></Link></li>
                                <li className={isActive('/dashboard/inventory/expired-products') ? 'active' : ''}><Link href="/dashboard/inventory/expired-products" className={linkCls('/dashboard/inventory/expired-products')}><i className={`ti ti-alert-triangle ${iconCls('/dashboard/inventory/expired-products')}`} /><span>Expired Products</span></Link></li>
                                <li className={isActive('/dashboard/inventory/low-stocks') ? 'active' : ''}><Link href="/dashboard/inventory/low-stocks" className={linkCls('/dashboard/inventory/low-stocks')}><i className={`ti ti-trending-down ${iconCls('/dashboard/inventory/low-stocks')}`} /><span>Low Stocks</span></Link></li>
                                <li className={isActive('/dashboard/categories') ? 'active' : ''}><Link href="/dashboard/categories" className={linkCls('/dashboard/categories')}><i className={`ti ti-list-details ${iconCls('/dashboard/categories')}`} /><span>Category</span></Link></li>
                                <li className={isActive('/dashboard/product-variants') ? 'active' : ''}><Link href="/dashboard/product-variants" className={linkCls('/dashboard/product-variants')}><i className={`ti ti-adjustments ${iconCls('/dashboard/product-variants')}`} /><span>Product Variants</span></Link></li>
                                <li className={isActive('/dashboard/brands') ? 'active' : ''}><Link href="/dashboard/brands" className={linkCls('/dashboard/brands')}><i className={`ti ti-triangles ${iconCls('/dashboard/brands')}`} /><span>Brands</span></Link></li>
                                <li className={isActive('/dashboard/units') ? 'active' : ''}><Link href="/dashboard/units" className={linkCls('/dashboard/units')}><i className={`ti ti-brand-unity ${iconCls('/dashboard/units')}`} /><span>Units</span></Link></li>
                                <li className={isActive('/dashboard/variant-attributes') ? 'active' : ''}><Link href="/dashboard/variant-attributes" className={linkCls('/dashboard/variant-attributes')}><i className={`ti ti-checklist ${iconCls('/dashboard/variant-attributes')}`} /><span>Variant Attributes</span></Link></li>
                                <li className={isActive('/dashboard/warranties') ? 'active' : ''}><Link href="/dashboard/warranties" className={linkCls('/dashboard/warranties')}><i className={`ti ti-certificate ${iconCls('/dashboard/warranties')}`} /><span>Warranties</span></Link></li>
                                <li className={isActive('/dashboard/inventory/barcode') ? 'active' : ''}><Link href="/dashboard/inventory/barcode" className={linkCls('/dashboard/inventory/barcode')}><i className={`ti ti-barcode ${iconCls('/dashboard/inventory/barcode')}`} /><span>Print Barcode</span></Link></li>
                                <li className={isActive('/dashboard/inventory/qrcode') ? 'active' : ''}><Link href="/dashboard/inventory/qrcode" className={linkCls('/dashboard/inventory/qrcode')}><i className={`ti ti-qrcode ${iconCls('/dashboard/inventory/qrcode')}`} /><span>Print QR Code</span></Link></li>
                            </ul>
                        </li>

                        {/* STOCK */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Stock</h6>
                            <ul>
                                <li className={isActive('/dashboard/stock') ? 'active' : ''}><Link href="/dashboard/stock" className={linkCls('/dashboard/stock')}><i className={`ti ti-stack-3 ${iconCls('/dashboard/stock')}`} /><span>Manage Stock</span></Link></li>
                                <li className={isActive('/dashboard/stock-adjustments') ? 'active' : ''}><Link href="/dashboard/stock-adjustments" className={linkCls('/dashboard/stock-adjustments')}><i className={`ti ti-stairs-up ${iconCls('/dashboard/stock-adjustments')}`} /><span>Stock Adjustment</span></Link></li>
                                <li className={isActive('/dashboard/inventory/transfers') ? 'active' : ''}><Link href="/dashboard/inventory/transfers" className={linkCls('/dashboard/inventory/transfers')}><i className={`ti ti-stack-pop ${iconCls('/dashboard/inventory/transfers')}`} /><span>Stock Transfer</span></Link></li>
                            </ul>
                        </li>

                        {/* SALES */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Sales</h6>
                            <ul>
                                <li className={isActive('/dashboard/sales') ? 'active' : ''}><Link href="/dashboard/sales" className={linkCls('/dashboard/sales')}><i className={`ti ti-receipt ${iconCls('/dashboard/sales')}`} /><span>Sales Orders</span></Link></li>
                                <li className={isActive('/dashboard/invoices') ? 'active' : ''}><Link href="/dashboard/invoices" className={linkCls('/dashboard/invoices')}><i className={`ti ti-file-invoice ${iconCls('/dashboard/invoices')}`} /><span>Invoices</span></Link></li>
                                <li className={isActive('/dashboard/returns') ? 'active' : ''}><Link href="/dashboard/returns" className={linkCls('/dashboard/returns')}><i className={`ti ti-receipt-refund ${iconCls('/dashboard/returns')}`} /><span>Sales Return</span></Link></li>
                                <li className={isActive('/dashboard/payments') ? 'active' : ''}><Link href="/dashboard/payments" className={linkCls('/dashboard/payments')}><i className={`ti ti-cash ${iconCls('/dashboard/payments')}`} /><span>Payments</span></Link></li>
                                <li className={isActive('/dashboard/quotations') ? 'active' : ''}><Link href="/dashboard/quotations" className={linkCls('/dashboard/quotations')}><i className={`ti ti-files ${iconCls('/dashboard/quotations')}`} /><span>Quotation</span></Link></li>
                                <li><Link href="/pos" className="flex items-center px-3 py-2 text-[#f47721] font-bold hover:bg-[#f47721]/10 rounded-lg transition-all"><i className="ti ti-device-laptop text-[16px] me-2 text-[#f47721]" /><span>POS Screen</span></Link></li>
                            </ul>
                        </li>

                        {/* PROMO */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Promo</h6>
                            <ul>
                                <li className={isActive('/dashboard/coupons') ? 'active' : ''}><Link href="/dashboard/coupons" className={linkCls('/dashboard/coupons')}><i className={`ti ti-ticket ${iconCls('/dashboard/coupons')}`} /><span>Coupons</span></Link></li>
                                <li className={isActive('/dashboard/gift-cards') ? 'active' : ''}><Link href="/dashboard/gift-cards" className={linkCls('/dashboard/gift-cards')}><i className={`ti ti-cards ${iconCls('/dashboard/gift-cards')}`} /><span>Gift Cards</span></Link></li>
                                <li className={isActive('/dashboard/discount-plans') ? 'active' : ''}><Link href="/dashboard/discount-plans" className={linkCls('/dashboard/discount-plans')}><i className={`ti ti-file-percent ${iconCls('/dashboard/discount-plans')}`} /><span>Discount Plan</span></Link></li>
                                <li className={isActive('/dashboard/discounts') ? 'active' : ''}><Link href="/dashboard/discounts" className={linkCls('/dashboard/discounts')}><i className={`ti ti-discount ${iconCls('/dashboard/discounts')}`} /><span>Discounts</span></Link></li>
                            </ul>
                        </li>

                        {/* PURCHASES */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Purchases</h6>
                            <ul>
                                <li className={isActive('/dashboard/purchases') ? 'active' : ''}><Link href="/dashboard/purchases" className={linkCls('/dashboard/purchases')}><i className={`ti ti-shopping-bag ${iconCls('/dashboard/purchases')}`} /><span>Purchase List</span></Link></li>
                                <li className={isActive('/dashboard/purchases/create') ? 'active' : ''}><Link href="/dashboard/purchases/create" className={linkCls('/dashboard/purchases/create')}><i className={`ti ti-plus ${iconCls('/dashboard/purchases/create')}`} /><span>Create Purchase</span></Link></li>
                                <li className={isActive('/dashboard/purchase-orders') ? 'active' : ''}><Link href="/dashboard/purchase-orders" className={linkCls('/dashboard/purchase-orders')}><i className={`ti ti-file-unknown ${iconCls('/dashboard/purchase-orders')}`} /><span>Purchase Order</span></Link></li>
                                <li className={isActive('/dashboard/purchases/returns') ? 'active' : ''}><Link href="/dashboard/purchases/returns" className={linkCls('/dashboard/purchases/returns')}><i className={`ti ti-file-upload ${iconCls('/dashboard/purchases/returns')}`} /><span>Purchase Return</span></Link></li>
                            </ul>
                        </li>

                        {/* FINANCE & ACCOUNTS */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Finance & Accounts</h6>
                            <ul>
                                <li className={isActive('/dashboard/reports') ? 'active' : ''}><Link href="/dashboard/reports" className={linkCls('/dashboard/reports')}><i className={`ti ti-report-analytics ${iconCls('/dashboard/reports')}`} /><span>Reports Overview</span></Link></li>
                                <li className={isActive('/dashboard/expenses') ? 'active' : ''}><Link href="/dashboard/expenses" className={linkCls('/dashboard/expenses')}><i className={`ti ti-file-stack ${iconCls('/dashboard/expenses')}`} /><span>Expenses</span></Link></li>
                                <li className={isActive('/dashboard/expense-categories') ? 'active' : ''}><Link href="/dashboard/expense-categories" className={linkCls('/dashboard/expense-categories')}><i className={`ti ti-category-2 ${iconCls('/dashboard/expense-categories')}`} /><span>Expense Category</span></Link></li>
                                <li className={isActive('/dashboard/incomes') ? 'active' : ''}><Link href="/dashboard/incomes" className={linkCls('/dashboard/incomes')}><i className={`ti ti-file-pencil ${iconCls('/dashboard/incomes')}`} /><span>Income</span></Link></li>
                                <li className={isActive('/dashboard/income-categories') ? 'active' : ''}><Link href="/dashboard/income-categories" className={linkCls('/dashboard/income-categories')}><i className={`ti ti-category-plus ${iconCls('/dashboard/income-categories')}`} /><span>Income Category</span></Link></li>
                                <li className={isActive('/dashboard/accounts') ? 'active' : ''}><Link href="/dashboard/accounts" className={linkCls('/dashboard/accounts')}><i className={`ti ti-building-bank ${iconCls('/dashboard/accounts')}`} /><span>Bank Accounts</span></Link></li>
                                <li className={isActive('/dashboard/money-transfers') ? 'active' : ''}><Link href="/dashboard/money-transfers" className={linkCls('/dashboard/money-transfers')}><i className={`ti ti-moneybag ${iconCls('/dashboard/money-transfers')}`} /><span>Money Transfer</span></Link></li>
                                <li className={isActive('/dashboard/accounts/balance-sheet') ? 'active' : ''}><Link href="/dashboard/accounts/balance-sheet" className={linkCls('/dashboard/accounts/balance-sheet')}><i className={`ti ti-report-money ${iconCls('/dashboard/accounts/balance-sheet')}`} /><span>Financial Statements</span></Link></li>
                            </ul>
                        </li>

                        {/* PEOPLES */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Peoples & Branches</h6>
                            <ul>
                                <li className={isActive('/dashboard/customers') ? 'active' : ''}><Link href="/dashboard/customers" className={linkCls('/dashboard/customers')}><i className={`ti ti-users-group ${iconCls('/dashboard/customers')}`} /><span>Customers</span></Link></li>
                                <li className={isActive('/dashboard/billers') ? 'active' : ''}><Link href="/dashboard/billers" className={linkCls('/dashboard/billers')}><i className={`ti ti-user-up ${iconCls('/dashboard/billers')}`} /><span>Billers</span></Link></li>
                                <li className={isActive('/dashboard/suppliers') ? 'active' : ''}><Link href="/dashboard/suppliers" className={linkCls('/dashboard/suppliers')}><i className={`ti ti-user-dollar ${iconCls('/dashboard/suppliers')}`} /><span>Suppliers</span></Link></li>
                                <li className={isActive('/dashboard/branches') ? 'active' : ''}><Link href="/dashboard/branches" className={linkCls('/dashboard/branches')}><i className={`ti ti-home-bolt ${iconCls('/dashboard/branches')}`} /><span>Branches</span></Link></li>
                                <li className={isActive('/dashboard/cash-registers') ? 'active' : ''}><Link href="/dashboard/cash-registers" className={linkCls('/dashboard/cash-registers')}><i className={`ti ti-cash ${iconCls('/dashboard/cash-registers')}`} /><span>Cash Registers</span></Link></li>
                                <li className={isActive('/dashboard/stock') ? 'active' : ''}><Link href="/dashboard/stock" className={linkCls('/dashboard/stock')}><i className={`ti ti-archive ${iconCls('/dashboard/stock')}`} /><span>Branch Stock</span></Link></li>
                            </ul>
                        </li>

                        {/* ACCESS CONTROL */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Access Control</h6>
                            <ul>
                                <li className={isActive('/dashboard/access-control') ? 'active' : ''}><Link href="/dashboard/access-control" className={linkCls('/dashboard/access-control')}><i className={`ti ti-shield-lock ${iconCls('/dashboard/access-control')}`} /><span>Roles & Permissions</span></Link></li>
                                <li className={isActive('/dashboard/access-control?tab=users') ? 'active' : ''}><Link href="/dashboard/access-control?tab=users" className={linkCls('/dashboard/access-control?tab=users')}><i className={`ti ti-users ${iconCls('/dashboard/access-control?tab=users')}`} /><span>Users</span></Link></li>
                            </ul>
                        </li>

                        {/* SETTINGS */}
                        <li className="submenu-open">
                            <h6 className="font-bold text-xs text-[#092C4C] mt-0 mb-2">Settings</h6>
                            <ul>
                                <li className={isActive('/dashboard/settings/profile') ? 'active' : ''}><Link href="/dashboard/settings/profile" className={linkCls('/dashboard/settings/profile')}><i className={`ti ti-user-circle ${iconCls('/dashboard/settings/profile')}`} /><span>My Profile</span></Link></li>
                                <li className={isActive('/dashboard/settings') ? 'active' : ''}><Link href="/dashboard/settings" className={linkCls('/dashboard/settings')}><i className={`ti ti-settings ${iconCls('/dashboard/settings')}`} /><span>Business Settings</span></Link></li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left text-red-600 hover:text-red-800 py-2 px-3 rounded-lg font-bold text-xs transition-colors hover:bg-red-50 cursor-pointer"
                                    >
                                        <i className="ti ti-logout text-[16px] me-2 text-red-600" />
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
