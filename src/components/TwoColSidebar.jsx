// src/components/TwoColSidebar.jsx

import Link from 'next/link';

export default function TwoColSidebar() {
    return (
        <div className="two-col-sidebar" id="two-col-sidebar">
            <div className="sidebar sidebar-twocol">
                <div className="twocol-mini">
                    <div className="sidebar-left slimscroll">
                        <div className="nav flex flex-col items-center nav-pills" id="sidebar-tabs" data-tabs-toggle="#sidebar-tab" aria-orientation="vertical" role="tablist" data-tabs-inactive-classes="text-[var(--sidebar-menu-item)]!" data-tabs-active-classes="bg-primary-100 text-[var(--sidebar-col-active-item)]!">
                            <a href="#" className="nav-link active" title="Dashboard" role="tab" data-tabs-target="#dashboard">
                                <i className="ti ti-smart-home"></i>
                            </a>
                            <a href="#" className="nav-link " title="Super Admin" role="tab" data-tabs-target="#super-admin">
                                <i className="ti ti-user-star"></i>
                            </a>
                            <a href="#" className="nav-link " title="Apps" role="tab" data-tabs-target="#application">
                                <i className="ti ti-layout-grid-add"></i>
                            </a>
                            <a href="#" className="nav-link" title="Layout" role="tab" data-tabs-target="#layout">
                                <i className="ti ti-layout-board-split"></i>
                            </a>
                            <a href="#" className="nav-link" title="Inventory" role="tab" data-tabs-target="#inventory">
                                <i className="ti ti-table-plus"></i>
                            </a>
                            <a href="#" className="nav-link" title="Stock" role="tab" data-tabs-target="#stock">
                                <i className="ti ti-stack-3"></i>
                            </a>
                            <a href="#" className="nav-link" title="Sales" role="tab" data-tabs-target="#sales">
                                <i className="ti ti-device-laptop"></i>
                            </a>
                            <a href="#" className="nav-link" title="Finance" role="tab" data-tabs-target="#finance">
                                <i className="ti ti-shopping-cart-dollar"></i>
                            </a>
                            <a href="#" className="nav-link" title="Hrm" role="tab" data-tabs-target="#hrm">
                                <i className="ti ti-cash"></i>
                            </a>
                            <a href="#" className="nav-link" title="Reports" role="tab" data-tabs-target="#reports">
                                <i className="ti ti-license"></i>
                            </a>
                            <a href="#" className="nav-link" title="Pages" role="tab" data-tabs-target="#pages">
                                <i className="ti ti-page-break"></i>
                            </a>
                            <a href="#" className="nav-link" title="Settings" role="tab" data-tabs-target="#settings">
                                <i className="ti ti-lock-check"></i>
                            </a>
                            <a href="#" className="nav-link " title="UI Elements" role="tab" data-tabs-target="#ui-elements">
                                <i className="ti ti-ux-circle"></i>
                            </a>
                            <a href="#" className="nav-link" title="Extras" role="tab" data-tabs-target="#extras">
                                <i className="ti ti-vector-triangle"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="sidebar-right">
                    {/* Logo */}
                    <div className="sidebar-logo">
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
                    <div className="sidebar-scroll">
                        <div className="text-center rounded bg-light p-4 mb-4 border">
                            <div className="relative size-[45px] mx-auto mb-4">
                                <img src="/assets/img/customer/customer15.jpg" alt="Img" className="img-fluid rounded-full" />
                                <span className="bottom-0 end-0 absolute  size-3.5 bg-success border-2 border-white rounded-full"></span>
                            </div>
                            <h6 className="text-sm font-bold mb-1">Adrian Herman</h6>
                            <p className="text-xs mb-0">System Admin</p>
                        </div>
                        <div className="tab-content" id="sidebar-tab">
                            <div className="hidden tab-pane fade show active" id="dashboard">
                                <ul>
                                    <li className="menu-title"><span>MAIN</span></li>
                                    <li><Link href="/dashboard" className="active">Admin Dashboard</Link></li>
                                    <li><Link href="#">Admin Dashboard 2</Link></li>
                                    <li><Link href="#">Sales Dashboard</Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="super-admin">
                                <ul>
                                    <li className="menu-title"><span>SUPER ADMIN</span></li>
                                    <li><Link href="#">Dashboard</Link></li>
                                    <li><Link href="#">Companies</Link></li>
                                    <li><Link href="#">Subscriptions</Link></li>
                                    <li><Link href="#">Packages</Link></li>
                                    <li><Link href="#">Domain</Link></li>
                                    <li><Link href="#">Purchase Transaction</Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="application">
                                <ul>
                                    <li><Link href="#">Chat</Link></li>
                                    <li className="submenu submenu-two"><a href="#">Call<span className="menu-arrow inside-submenu"></span></a>
                                        <ul>
                                            <li><Link href="#">Video Call</Link></li>
                                            <li><Link href="#">Audio Call</Link></li>
                                            <li><Link href="#">Call History</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#">Calendar</Link></li>
                                    <li><Link href="#">Contacts</Link></li>
                                    <li><Link href="#">Email</Link></li>
                                    <li><Link href="#">To Do</Link></li>
                                    <li><Link href="#">Notes</Link></li>
                                    <li><Link href="#">File Manager</Link></li>
                                    <li><Link href="#">Projects</Link></li>
                                    <li className="submenu submenu-two"><a href="#">Ecommerce<span className="menu-arrow inside-submenu"></span></a>
                                        <ul>
                                            <li><Link href="#">Products</Link></li>
                                            <li><Link href="#">Orders</Link></li>
                                            <li><Link href="#">Customers</Link></li>
                                            <li><Link href="#">Cart</Link></li>
                                            <li><Link href="#">Checkout</Link></li>
                                            <li><Link href="#">Wishlist</Link></li>
                                            <li><Link href="#">Reviews</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#">Social Feed</Link></li>
                                    <li><Link href="#">Search List</Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="layout">
                                <ul>
                                    <li className="menu-title"><span>LAYOUT</span></li>
                                    <li><Link href="#">Horizontal</Link></li>
                                    <li><Link href="#">Detached</Link></li>
                                    <li><Link href="#">Two Column</Link></li>
                                    <li><Link href="#">Hovered</Link></li>
                                    <li><Link href="#">Boxed</Link></li>
                                    <li><Link href="#">RTL</Link></li>
                                    <li><Link href="#">Dark</Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="inventory">
                                <ul>
                                    <li className="menu-title"><span>Inventory</span></li>
                                    <li><Link href="#"><span>Products</span></Link></li>
                                    <li><Link href="#"><span>Create Product</span></Link></li>
                                    <li><Link href="#"><span>Expired Products</span></Link></li>
                                    <li><Link href="#"><span>Low Stocks</span></Link></li>
                                    <li><Link href="#"><span>Category</span></Link></li>
                                    <li><Link href="#"><span>Sub Category</span></Link></li>
                                    <li><Link href="#"><span>Brands</span></Link></li>
                                    <li><Link href="#"><span>Units</span></Link></li>
                                    <li><Link href="#"><span>Variant Attributes</span></Link></li>
                                    <li><Link href="#"><span>Warranties</span></Link></li>
                                    <li><Link href="#"><span>Print Barcode</span></Link></li>
                                    <li><Link href="#"><span>Print QR Code</span></Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="stock">
                                <ul>
                                    <li className="menu-title"><span>Stock</span></li>
                                    <li><Link href="#"><span>Manage Stock</span></Link></li>
                                    <li><Link href="#"><span>Stock Adjustment</span></Link></li>
                                    <li><Link href="#"><span>Stock Transfer</span></Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="sales">
                                <ul>
                                    <li className="menu-title"><span>Sales</span></li>
                                    <li className="submenu">
                                        <a href="#"><span>Sales</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Online Orders</Link></li>
                                            <li><Link href="#">POS Orders</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Invoices</span></Link></li>
                                    <li><Link href="#"><span>Sales Return</span></Link></li>
                                    <li><Link href="#"><span>Quotation</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>POS</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">POS 1</Link></li>
                                            <li><Link href="#">POS 2</Link></li>
                                            <li><Link href="#">POS 3</Link></li>
                                            <li><Link href="#">POS 4</Link></li>
                                            <li><Link href="#">POS 5</Link></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="finance">
                                <ul>
                                    <li className="menu-title"><span>FINANCE & ACCOUNTS</span></li>
                                    <li><Link href="#"><span>Coupons</span></Link></li>
                                    <li><Link href="#"><span>Gift Cards</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Discount</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Discount Plan</Link></li>
                                            <li><Link href="#">Discount</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Purchases</span></Link></li>
                                    <li><Link href="#"><span>Purchase Order</span></Link></li>
                                    <li><Link href="#"><span>Purchase Return</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Expenses</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Expenses</Link></li>
                                            <li><Link href="#">Expense Category</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Income</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Income</Link></li>
                                            <li><Link href="#">Income Category</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Bank Accounts</span></Link></li>
                                    <li><Link href="#"><span>Money Transfer</span></Link></li>
                                    <li><Link href="#"><span>Balance Sheet</span></Link></li>
                                    <li><Link href="#"><span>Trial Balance</span></Link></li>
                                    <li><Link href="#"><span>Cash Flow</span></Link></li>
                                    <li><Link href="#"><span>Account Statement</span></Link></li>
                                    <li><Link href="#"><span>Customers</span></Link></li>
                                    <li><Link href="#"><span>Billers</span></Link></li>
                                    <li><Link href="#"><span>Suppliers</span></Link></li>
                                    <li><Link href="#"><span>Stores</span></Link></li>
                                    <li><Link href="#"><span>Warehouses</span></Link></li>                           
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="hrm">
                                <ul>
                                    <li className="menu-title"><span>Hrm</span></li>
                                    <li><Link href="#"><span>Employees</span></Link></li>
                                    <li><Link href="#"><span>Departments</span></Link></li>
                                    <li><Link href="#"><span>Designation</span></Link></li>
                                    <li><Link href="#"><span>Shifts</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Attendence</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Employee</Link></li>
                                            <li><Link href="#">Admin</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Leaves</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Admin Leaves</Link></li>
                                            <li><Link href="#">Employee Leaves</Link></li>
                                            <li><Link href="#">Leave Types</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Holidays</span></Link>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Payroll</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Employee Salary</Link></li>
                                            <li><Link href="#">Payslip</Link></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="reports">
                                <ul>
                                    <li className="menu-title"><span>Reports</span></li>
                                    <li className="submenu">
                                        <a href="#"><span>Sales Report</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Sales Report</Link></li>
                                            <li><Link href="#">Best Seller</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Purchase report</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Inventory Report</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Inventory Report</Link></li>
                                            <li><Link href="#">Stock History</Link></li>
                                            <li><Link href="#">Sold Stock</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Invoice Report</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Supplier Report</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Supplier Report</Link></li>
                                            <li><Link href="#">Supplier Due Report</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Customer Report</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Customer Report</Link></li>
                                            <li><Link href="#">Customer Due Report</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Product Report</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Product Report</Link></li>
                                            <li><Link href="#">Product Expiry Report</Link></li>
                                            <li><Link href="#">Product Quantity Alert</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Expense Report</span></Link></li>
                                    <li><Link href="#"><span>Income Report</span></Link></li>
                                    <li><Link href="#"><span>Tax Report</span></Link></li>
                                    <li><Link href="#"><span>Profit & Loss</span></Link></li>
                                    <li><Link href="#"><span>Annual Report</span></Link></li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="pages">
                                <ul>
                                    <li className="menu-title"><span>Pages</span></li>
                                    <li className="submenu">
                                        <a href="#"><span>Pages</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Pages</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Blog</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">All Blog</Link></li>
                                            <li><Link href="#">Blog Tags</Link></li>
                                            <li><Link href="#">Categories</Link></li>
                                            <li><Link href="#">Blog Comments</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Location</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Countries</Link></li>
                                            <li><Link href="#">States</Link></li>
                                            <li><Link href="#">Cities</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link href="#"><span>Testimonials</span></Link></li>
                                    <li><Link href="#"><span>FAQ</span></Link></li>
                                    <li><Link href="#"><span>Users</span></Link></li>
                                    <li><Link href="#"><span>Roles & Permissions</span></Link></li>
                                    <li><Link href="#"><span>Delete Account Request</span></Link></li>
                                    <li><Link href="#"><span>Profile</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Authentication</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li className="submenu submenu-two"><a href="#">Login<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Cover</Link></li>
                                                    <li><Link href="#">Illustration</Link></li>
                                                    <li><Link href="#">Basic</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two"><a href="#">Register<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Cover</Link></li>
                                                    <li><Link href="#">Illustration</Link></li>
                                                    <li><Link href="#">Basic</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two"><a href="#">Forgot Password<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Cover</Link></li>
                                                    <li><Link href="#">Illustration</Link></li>
                                                    <li><Link href="#">Basic</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two"><a href="#">Reset Password<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Cover</Link></li>
                                                    <li><Link href="#">Illustration</Link></li>
                                                    <li><Link href="#">Basic</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two"><a href="#">Email Verification<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Cover</Link></li>
                                                    <li><Link href="#">Illustration</Link></li>
                                                    <li><Link href="#">Basic</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two"><a href="#">2 Step Verification<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Cover</Link></li>
                                                    <li><Link href="#">Illustration</Link></li>
                                                    <li><Link href="#">Basic</Link></li>
                                                </ul>
                                            </li>
                                            <li><Link href="#">Lock Screen</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Error Pages</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">404 Error </Link></li>
                                            <li><Link href="#">500 Error </Link></li>
                                        </ul>
                                    </li>
                                    <li>
                                        <Link href="#"><span>Blank Page</span> </Link>
                                    </li>
                                    <li>
                                        <Link href="#"><span>Pricing</span> </Link>
                                    </li>
                                    <li>
                                        <Link href="#"><span>Coming Soon</span> </Link>
                                    </li>
                                    <li>
                                        <Link href="#"><span>Under Maintenance</span> </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="settings">
                                <ul>
                                    <li className="menu-title"><span>Settings</span></li>
                                    <li className="submenu">
                                        <a href="#"><span>General Settings</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Profile</Link></li>
                                            <li><Link href="#">Security</Link></li>
                                            <li><Link href="#">Notifications</Link></li>
                                            <li><Link href="#">Connected Apps</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Website Settings</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">System Settings</Link></li>
                                            <li><Link href="#">Company Settings </Link></li>
                                            <li><Link href="#">Localization</Link></li>
                                            <li><Link href="#">Prefixes</Link></li>
                                            <li><Link href="#">Preference</Link></li>
                                            <li><Link href="#">Appearance</Link></li>
                                            <li><Link href="#">Social Authentication</Link></li>
                                            <li><Link href="#">Language</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>App Settings</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li className="submenu submenu-two"><a href="#">Invoice<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Invoice Settings</Link></li>
                                                    <li><Link href="#">Invoice Template</Link></li>
                                                </ul>
                                            </li>
                                            <li><Link href="#">Printer</Link></li>
                                            <li><Link href="#">POS</Link></li>
                                            <li><Link href="#">Custom Fields</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>System Settings</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li className="submenu submenu-two"><a href="#">Email<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Email Settings</Link></li>
                                                    <li><Link href="#">Email Template</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two"><a href="#">SMS<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">SMS Settings</Link></li>
                                                    <li><Link href="#">SMS Template</Link></li>
                                                </ul>
                                            </li>
                                            <li><Link href="#">OTP</Link></li>
                                            <li><Link href="#">GDPR Cookies</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Financial Settings</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li><Link href="#">Payment Gateway</Link></li>
                                            <li><Link href="#">Bank Accounts</Link></li>
                                            <li><Link href="#">Tax Rates</Link></li>
                                            <li><Link href="#">Currencies</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Other Settings</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li><Link href="#">Storage</Link></li>
                                            <li><Link href="#">Ban IP Address</Link></li>
                                        </ul>
                                    </li>
                                    <li>
                                        <Link href="/login"><span>Logout</span> </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="ui-elements">
                                <ul>
                                    <li className="menu-title"><span>Ui Interface</span></li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Base UI</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li><Link href="#">Alerts</Link></li>
                                            <li><Link href="#">Accordion</Link></li>
                                            <li><Link href="#">Avatar</Link></li>
                                            <li><Link href="#">Badges</Link></li>
                                            <li><Link href="#">Buttons</Link></li>
                                            <li><Link href="#">Button Group</Link></li>
                                            <li><Link href="#">Breadcrumb</Link></li>
                                            <li><Link href="#">Card</Link></li>
                                            <li><Link href="#">Carousel</Link></li>
                                            <li><Link href="#">Collapse</Link></li>
                                            <li><Link href="#">Dropdowns</Link></li>
                                            <li><Link href="#">Grid</Link></li>
                                            <li><Link href="#">Images</Link></li>
                                            <li><Link href="#">Lightbox</Link></li>
                                            <li><Link href="#">Links</Link></li>
                                            <li><Link href="#">List Group</Link></li>
                                            <li><Link href="#">Modals</Link></li>
                                            <li><Link href="#">Offcanvas</Link></li>
                                            <li><Link href="#">Pagination</Link></li>
                                            <li><Link href="#">Popovers</Link></li>
                                            <li><Link href="#">Progress</Link></li>
                                            <li><Link href="#">Range Slider</Link></li>
                                            <li><Link href="#">Spinner</Link></li>
                                            <li><Link href="#">Sweet Alerts</Link></li>
                                            <li><Link href="#">Tabs</Link></li>
                                            <li><Link href="#">Typography</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Advanced UI</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li><Link href="#">Dragula</Link></li>
                                            <li><Link href="#">Clipboard</Link></li>
                                            <li><Link href="#">Ratio</Link></li>
                                            <li><Link href="#">Range Slider</Link></li>
                                            <li><Link href="#">Rating</Link></li>
                                            <li><Link href="#">Scrollbar</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Charts</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li><Link href="#">Apex Charts</Link></li>
                                            <li><Link href="#">Chart C3</Link></li>
                                            <li><Link href="#">Chart Js</Link></li>
                                            <li><Link href="#">Morris Charts</Link></li>
                                            <li><Link href="#">Flot Charts</Link></li>
                                            <li><Link href="#">Peity Charts</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Icons</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li><Link href="#">Fontawesome Icons</Link></li>
                                            <li><Link href="#">Feather Icons</Link></li>
                                            <li><Link href="#">Ionic Icons</Link></li>
                                            <li><Link href="#">Material Icons</Link></li>
                                            <li><Link href="#">Pe7 Icons</Link></li>
                                            <li><Link href="#">Simpleline Icons</Link></li>
                                            <li><Link href="#">Themify Icons</Link></li>
                                            <li><Link href="#">Weather Icons</Link></li>
                                            <li><Link href="#">Typicon Icons</Link></li>
                                            <li><Link href="#">Flag Icons</Link></li>
                                            <li><Link href="#">Tabler Icons</Link></li>
                                            <li><Link href="#">Bootstrap Icons</Link></li>
                                            <li><Link href="#">Remix Icons</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#">
                                            <span>Forms</span><span className="menu-arrow"></span>
                                        </a>
                                        <ul>
                                            <li className="submenu submenu-two">
                                                <a href="#">Form Elements<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Basic Inputs</Link></li>
                                                    <li><Link href="#">Checkbox & Radios</Link></li>
                                                    <li><Link href="#">Input Groups</Link></li>
                                                    <li><Link href="#">Grid & Gutters</Link></li>
                                                    <li><Link href="#">Form Select</Link></li>
                                                    <li><Link href="#">Input Masks</Link></li>
                                                    <li><Link href="#">File Uploads</Link></li>
                                                </ul>
                                            </li>
                                            <li className="submenu submenu-two">
                                                <a href="#">Layouts<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Horizontal Form</Link></li>
                                                    <li><Link href="#">Vertical Form</Link></li>
                                                    <li><Link href="#">Floating Labels</Link></li>
                                                </ul>
                                            </li>
                                            <li><Link href="#">Form Validation</Link></li>
                                            <li><Link href="#">Select2</Link></li>
                                            <li><Link href="#">Form Wizard</Link></li>
                                            <li><Link href="#">Form Picker</Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Tables</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Basic Tables </Link></li>
                                            <li><Link href="#">Data Table </Link></li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <a href="#"><span>Maps</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Vector</Link></li>
                                            <li><Link href="#">Leaflet</Link></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                            <div className="hidden tab-pane fade" id="extras">
                                <ul>
                                    <li className="menu-title"><span>Help</span></li>
                                    <li><Link href="#"><span>Documentation</span></Link></li>
                                    <li><Link href="#"><span>Changelog v2.1.4</span></Link></li>
                                    <li className="submenu">
                                        <a href="#"><span>Multi Level</span><span className="menu-arrow"></span></a>
                                        <ul>
                                            <li><Link href="#">Level 1.1</Link></li>
                                            <li className="submenu submenu-two"><a href="#">Level 1.2<span className="menu-arrow inside-submenu"></span></a>
                                                <ul>
                                                    <li><Link href="#">Level 2.1</Link></li>
                                                    <li className="submenu submenu-two submenu-three"><a href="#">Level 2.2<span className="menu-arrow inside-submenu inside-submenu-two"></span></a>
                                                        <ul>
                                                            <li><Link href="#">Level 3.1</Link></li>
                                                            <li><Link href="#">Level 3.2</Link></li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}