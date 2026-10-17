// src/components/Header.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function Header() {
    const [user, setUser] = useState(null);
    const [branches, setBranches] = useState([]);
    const [lowStocks, setLowStocks] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const router = useRouter();

    const headerRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load user and branch data
    useEffect(() => {
        const loadHeaderData = async () => {
            try {
                const [meRes, branchRes, lowStockRes] = await Promise.all([
                    axios.get('/api/me').catch(() => axios.get('/api/profile')),
                    axios.get('/api/branches').catch(() => ({ data: { data: [] } })),
                    axios.get('/api/inventory/low-stocks').catch(() => ({ data: { data: [] } })),
                ]);

                const userData = meRes.data?.user || meRes.data?.data || meRes.data;
                setUser(userData);
                const branchList = branchRes.data?.data || [];
                setBranches(branchList);
                setSelectedBranch(userData?.branch || branchList[0] || null);
                setLowStocks(lowStockRes.data?.data || []);
            } catch (err) {
                // auth errors handled gracefully
            }
        };
        loadHeaderData();
    }, []);

    const toggleDropdown = (name) => {
        setOpenDropdown((prev) => (prev === name ? null : name));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    };

    const handleLogout = async (e) => {
        e?.preventDefault();
        setOpenDropdown(null);

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
            // proceed even if network or auth error
        } finally {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('pos_token');
                window.location.href = '/login';
            }
        }
    };

    const toggleMobileMenu = () => {
        if (typeof document !== 'undefined') {
            const wrapper = document.querySelector('.main-wrapper');
            const overlay = document.querySelector('.sidebar-overlay');
            if (wrapper) wrapper.classList.toggle('slide-nav');
            if (overlay) overlay.classList.toggle('opened');
        }
    };

    return (
        <div className="header" ref={headerRef}>
            <div className="main-header h-[inherit]">
                {/* Logo */}
                <div className="header-left active">
                    <Link href="/dashboard" className="logo logo-normal">
                        <img src="/assets/img/logo.svg" alt="Img" />
                    </Link>
                    <Link href="/dashboard" className="logo logo-white">
                        <img src="/assets/img/logo-white.svg" alt="Img" />
                    </Link>
                    <Link href="/dashboard" className="logo-small">
                        <img src="/assets/img/logo-small.png" alt="Img" />
                    </Link>
                </div>
                {/* /Logo */}
                
                <a id="mobile_btn" className="mobile_btn cursor-pointer" onClick={toggleMobileMenu}>
                    <span className="bar-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </a>

                {/* Header Menu */}
                <ul className="nav user-menu items-center justify-center relative h-full transition-all duration-[0.5s] ease-[ease] m-0 pr-6">

                    {/* Search */}
                    <li className="nav-item nav-searchinputs">
                        <div className="top-nav-search">
                            <a href="#" className="responsive-search hidden text-white text-xl h-[60px] leading-[60px] px-[15px]">
                                <i className="fa fa-search"></i>
                            </a>
                            <div className="dropdown relative">
                                <div className="searchinputs input-group dropdown-toggle cursor-pointer" onClick={() => toggleDropdown('search')}>
                                    <input type="text" placeholder="Search..." className="focus:border-border-color focus:ring-0" />
                                    <div className="search-addon">
                                        <span className="flex items-center justify-center cursor-pointer text-[#A6AAAF] rounded-[5px] absolute -translate-y-2/4 z-[9] start-2 top-1/2">
                                            <i className="ti ti-search"></i>
                                        </span>
                                    </div>
                                    <span className="input-group-text">
                                        <kbd className="flex items-center bg-secondary-transparent text-[10px] font-medium text-text-title py-0.5 p-1 rounded-[5px]">
                                            <img src="/assets/img/icons/command.svg" alt="img" className="me-1" />K
                                        </kbd>
                                    </span>
                                </div>
                                <div id="search-dropdown" className={`dropdown-menu search-dropdown w-[300px] h-[315px] shadow overflow-y-auto mt-0 p-5 rounded-[10px] ${openDropdown === 'search' ? 'block' : 'hidden'}`}>
                                    <div className="text-sm text-text-default mt-0 mb-[15px] mx-0 pt-0 pb-[15px] px-0 border-b-border-color border-b">
                                        <h6 className="flex items-center text-sm font-bold mb-[15px]">
                                            <span><i className="ti ti-search text-secondary me-1.5"></i></span>Quick Shortcuts
                                        </h6>
                                        <ul className="search-tags flex items-center gap-[10px]">
                                            <li><Link href="/dashboard/products" onClick={() => setOpenDropdown(null)} className="block text-text-default bg-secondary-transparent px-2.5 py-[5px] rounded-[50px] hover:bg-primary hover:text-white">Products</Link></li>
                                            <li><Link href="/dashboard/sales" onClick={() => setOpenDropdown(null)} className="block text-text-default bg-secondary-transparent px-2.5 py-[5px] rounded-[50px] hover:bg-primary hover:text-white">Sales</Link></li>
                                            <li><Link href="/pos" onClick={() => setOpenDropdown(null)} className="block text-text-default bg-secondary-transparent px-2.5 py-[5px] rounded-[50px] hover:bg-primary hover:text-white">POS</Link></li>
                                        </ul>
                                    </div>
                                    <div className="text-sm text-text-default mt-0 mb-[15px] mx-0 pt-0 pb-[15px] px-0 border-b-border-color border-b">
                                        <h6 className="flex items-center text-sm font-bold mb-[15px]"><span><i className="ti ti-help text-secondary me-1.5"></i></span>Help & Documentation</h6>
                                        <p className="mb-[10px]">How to process branch inventory transfers</p>
                                        <p>Adjust stock & opening batches</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    {/* /Search */}

                    {/* Select Store (Dynamic) */}
                    <li className="nav-item dropdown relative select-store-dropdown">
                        <button
                            type="button"
                            onClick={() => toggleDropdown('store')}
                            className="px-[8px] py-[6px] border border-[#E6EAED] rounded-[8px] nav-link select-store flex items-center"
                        >
                            <span className="user-info flex items-center justify-center relative">
                                <span className="w-4 h-4 me-2">
                                    <img src="/assets/img/store/store-01.png" alt="Store Logo" className="rounded" />
                                </span>
                                <span className="user-detail">
                                    <span className="text-sm font-normal text-gray-900">
                                        {selectedBranch?.name || user?.branch?.name || 'Main Branch'}
                                    </span>
                                </span>
                            </span>
                        </button>
                        <div id="store-dropdown" className={`dropdown-menu p-2 ${openDropdown === 'store' ? 'block' : 'hidden'}`}>
                            {branches.length > 0 ? (
                                branches.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedBranch(b);
                                            setOpenDropdown(null);
                                        }}
                                        className="w-full text-left flex items-center text-text-default text-[0.8125rem] px-[0.9375rem] py-2 whitespace-nowrap hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary"
                                    >
                                        <img src="/assets/img/store/store-01.png" alt="Store Logo" className="w-5 h-5 rounded me-2" />
                                        <span>{b.name}</span>
                                        {selectedBranch?.id === b.id && <i className="ti ti-check text-primary ms-auto" />}
                                    </button>
                                ))
                            ) : (
                                <span className="text-xs text-gray-500 px-3 py-2 block">
                                    {user?.branch?.name || 'Main Branch'}
                                </span>
                            )}
                        </div>
                    </li>
                    {/* /Select Store */}

                    {/* Add New Dropdown */}
                    <li className="nav-item dropdown relative link-nav">
                        <button
                            type="button"
                            onClick={() => toggleDropdown('new')}
                            className="btn bg-primary border border-primary text-white text-center hover:bg-primary-hover hover:text-white btn-md inline-flex items-center"
                        >
                            <i className="ti ti-circle-plus me-1"></i>Add New
                        </button>
                        <div id="new-dropdown" className={`dropdown-menu p-5 w-[600px] ${openDropdown === 'new' ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 gap-[8px]">
                                <div>
                                    <Link href="/dashboard/categories" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-brand-codepen"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Category</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/products/create" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-square-plus"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Product</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/purchases" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-shopping-bag"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Purchase</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/sales" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-shopping-cart"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Sale</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/expenses/create" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-file-text"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Expense</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/quotations" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-device-floppy"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Quotation</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/returns" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-copy"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Return</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/access-control?tab=users" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-user"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">User</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/customers" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-users"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Customer</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/billers" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-shield"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Biller</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/suppliers" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-user-check"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Supplier</p>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/dashboard/inventory/transfers" onClick={() => setOpenDropdown(null)} className="group block text-center border border-border-color rounded-[8px] p-[10px] hover:bg-primary-100 hover:border-primary-100 transition-all">
                                        <span className="w-[36px] h-[36px] rounded-[8px] mx-auto mb-2 inline-flex items-center justify-center text-secondary bg-secondary-transparent group-hover:bg-primary group-hover:text-white transition-all">
                                            <i className="ti ti-truck"></i>
                                        </span>
                                        <p className="text-[13px] text-text-default group-hover:text-primary">Transfer</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </li>
                    
                    {/* POS Button */}
                    <li className="nav-item pos-nav">
                        <Link href="/pos" className="btn bg-dark border border-dark text-white text-center hover:bg-black hover:text-white btn-md inline-flex items-center">
                            <i className="ti ti-device-laptop me-1"></i>POS
                        </Link>
                    </li>

                    {/* Flag */}
                    <li className="nav-item dropdown relative flag-nav nav-item-box">
                        <a className="nav-link dropdown-toggle cursor-pointer" onClick={() => toggleDropdown('flag')} role="button">
                            <img src="/assets/img/flags/us-flag.svg" alt="Language" className="img-fluid" />
                        </a>
                        <div id="flag-dropdown" className={`dropdown-menu dropdown-menu-right ${openDropdown === 'flag' ? 'block' : 'hidden'}`}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setOpenDropdown(null); }} className="text-gray-500 rounded-[5px] font-medium px-4 py-2 hover:text-primary hover:bg-primary/5 flex items-center">
                                <img src="/assets/img/flags/english.svg" alt="Img" height="16" className="me-2" />English
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); setOpenDropdown(null); }} className="text-gray-500 rounded-[5px] font-medium px-4 py-2 hover:text-primary hover:bg-primary/5 flex items-center">
                                <img src="/assets/img/flags/arabic.svg" alt="Img" height="16" className="me-2" />Arabic
                            </a>
                        </div>
                    </li>
                    {/* /Flag */}

                    <li className="nav-item nav-item-box">
                        <a href="#" id="btnFullscreen" onClick={(e) => { e.preventDefault(); toggleFullscreen(); }}>
                            <i className="ti ti-maximize"></i>
                        </a>
                    </li>
                    <li className="nav-item nav-item-box">
                        <Link href="/dashboard/emails">
                            <i className="ti ti-mail"></i>
                            <span className="text-[11px] capitalize font-medium tracking-[0.5px] px-[0.45rem] py-[0.35rem] rounded-full leading-none rounded-pill bg-danger text-white">1</span>
                        </Link>
                    </li>

                    {/* Notifications (Dynamic) */}
                    <li className="nav-item dropdown relative nav-item-box">
                        <a href="#" className="dropdown-toggle nav-link" onClick={(e) => { e.preventDefault(); toggleDropdown('notifications'); }}>
                            <i className="ti ti-bell"></i>
                            {lowStocks.length > 0 && (
                                <span className="notification-status-dot"></span>
                            )}
                        </a>
                        <div id="notification-dropdown" className={`dropdown-menu notifications w-[350px] right-0 ${openDropdown === 'notifications' ? 'block' : 'hidden'}`}>
                            <div className="border-b border-border-color text-center text-[12px] px-[20px] py-[15px] flex items-center justify-between">
                                <h5 className="notification-title font-bold text-sm">Low Stock Alerts ({lowStocks.length})</h5>
                                <Link href="/dashboard/inventory/low-stocks" onClick={() => setOpenDropdown(null)} className="text-primary font-medium">View all</Link>
                            </div>
                            <div className="noti-content">
                                <ul className="notification-list">
                                    {lowStocks.length === 0 ? (
                                        <li className="p-4 text-center text-xs text-gray-500">
                                            No critical low stock alerts.
                                        </li>
                                    ) : (
                                        lowStocks.slice(0, 4).map((item, idx) => (
                                            <li key={idx} className="border-b border-border-color">
                                                <Link href="/dashboard/inventory/low-stocks" onClick={() => setOpenDropdown(null)} className="block relative p-4">
                                                    <div className="media flex items-center">
                                                        <span className="w-10 h-10 me-3 shrink-0 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                                            <i className="ti ti-alert-triangle text-lg"></i>
                                                        </span>
                                                        <div className="flex-grow-1">
                                                            <p className="text-text-default font-medium text-xs mb-1">
                                                                <span className="text-gray-900 font-bold">{item.product?.name || item.name || 'Product'}</span> has only <span className="text-danger font-bold">{item.quantity ?? 0}</span> units left!
                                                            </p>
                                                            <p className="text-gray-400 text-[10px]">Reorder trigger: {item.reorder_level || 5}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                            <div className="border-t border-border-color text-center px-[20px] py-[12px] flex items-center gap-3">
                                <Link href="/dashboard/inventory/low-stocks" onClick={() => setOpenDropdown(null)} className="btn bg-primary border border-primary text-white text-center hover:bg-primary-hover hover:text-white btn-md w-100">
                                    Manage Inventory
                                </Link>
                            </div>
                        </div>
                    </li>
                    {/* /Notifications */}

                    <li className="nav-item nav-item-box">
                        <Link href="/dashboard/settings"><i className="ti ti-settings"></i></Link>
                    </li>

                    {/* Profile Dropdown (Dynamic) */}
                    <li className="nav-item dropdown relative profile-nav">
                        <a href="#" className="nav-link userset" onClick={(e) => { e.preventDefault(); toggleDropdown('profile'); }}>
                            <span className="user-info p-0">
                                <span className="user-letter flex items-center justify-center text-white w-8 h-8 font-semibold text-[15px] rounded-[10px] bg-primary">
                                    {user?.name?.charAt(0) || 'A'}
                                </span>
                            </span>
                        </a>
                        <div id="profile-dropdown" className={`dropdown-menu menu-drop-user right-0 ${openDropdown === 'profile' ? 'block' : 'hidden'}`}>
                            <div className="bg-light mb-2 p-4 rounded-[5px] flex items-center">
                                <span className="user-img me-2">
                                    <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-base">
                                        {user?.name?.charAt(0) || 'A'}
                                    </span>
                                </span>
                                <div>
                                    <h6 className="font-medium text-sm text-gray-900">{user?.name || 'Administrator'}</h6>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">{user?.role || user?.roles?.[0]?.name || 'Admin'}</p>
                                </div>
                            </div>
                            <Link className="dropdown-item flex items-center font-medium px-4 py-2 hover:text-primary hover:bg-primary/5" href="/dashboard/settings/profile" onClick={() => setOpenDropdown(null)}>
                                <i className="ti ti-user-circle me-2"></i>My Profile
                            </Link>
                            <Link className="dropdown-item flex items-center font-medium px-4 py-2 hover:text-primary hover:bg-primary/5" href="/dashboard/reports" onClick={() => setOpenDropdown(null)}>
                                <i className="ti ti-file-text me-2"></i>Reports
                            </Link>
                            <Link className="dropdown-item flex items-center font-medium px-4 py-2 hover:text-primary hover:bg-primary/5" href="/dashboard/settings" onClick={() => setOpenDropdown(null)}>
                                <i className="ti ti-settings-2 me-2"></i>Settings
                            </Link>
                            <hr className="my-2" />
                            <a
                                href="#"
                                onClick={handleLogout}
                                className="dropdown-item flex items-center font-medium text-danger px-4 py-2 hover:text-danger-hover hover:bg-primary/5"
                            >
                                <i className="ti ti-logout me-2"></i>Logout
                            </a>
                        </div>
                    </li>
                </ul>
                {/* /Header Menu */}

                {/* Mobile Menu */}
                <div className="dropdown mobile-user-menu">
                    <a href="#" className="nav-link dropdown-toggle" onClick={(e) => { e.preventDefault(); toggleDropdown('mobile'); }}>
                        <i className="fa fa-ellipsis-v"></i>
                    </a>
                    <div className={`dropdown-menu dropdown-menu-right ${openDropdown === 'mobile' ? 'block' : 'hidden'}`} id="mobile-dropdown">
                        <Link className="flex items-center font-medium px-4 py-2 hover:text-primary hover:bg-primary/5" href="/dashboard/settings/profile" onClick={() => setOpenDropdown(null)}>
                            My Profile
                        </Link>
                        <Link className="flex items-center font-medium px-4 py-2 hover:text-primary hover:bg-primary/5" href="/dashboard/settings" onClick={() => setOpenDropdown(null)}>
                            Settings
                        </Link>
                        <a className="flex items-center font-medium text-danger px-4 py-2 hover:text-danger-hover hover:bg-primary/5" href="#" onClick={handleLogout}>
                            Logout
                        </a>
                    </div>
                </div>
                {/* /Mobile Menu */}
            </div>
        </div>
    );
}