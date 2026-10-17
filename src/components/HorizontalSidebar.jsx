// src/components/HorizontalSidebar.jsx

import Link from 'next/link';

export default function HorizontalSidebar() {
    return (
        <div className="sidebar sidebar-horizontal" id="horizontal-menu">
            <div id="sidebar-menu-3" className="sidebar-menu">
                <div className="main-menu">
                    <ul className="nav-menu">
                        <li className="submenu">
                            <a href="#"><i className="ti ti-layout-grid text-[16px] me-2"></i><span> Main Menu</span> <span className="menu-arrow"></span></a>
                            <ul>
                                <li className="submenu">
                                    <a href="#" className="active subdrop"><span>Dashboard</span> <span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="/dashboard" className="active">Admin Dashboard</Link></li>
                                        <li><Link href="#">Admin Dashboard 2</Link></li>
                                        <li><Link href="#">Sales Dashboard</Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Super Admin</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Dashboard</Link></li>
                                        <li><Link href="#">Companies</Link></li>
                                        <li><Link href="#">Subscriptions</Link></li>
                                        <li><Link href="#">Packages</Link></li>
                                        <li><Link href="#">Domain</Link></li>
                                        <li><Link href="#">Purchase Transaction</Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Application</span><span className="menu-arrow"></span></a>
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
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Layouts</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Horizontal</Link></li>
                                        <li><Link href="#">Detached</Link></li>
                                        <li><Link href="#">Two Column</Link></li>
                                        <li><Link href="#">Hovered</Link></li>
                                        <li><Link href="#">Boxed</Link></li>
                                        <li><Link href="#">RTL</Link></li>
                                        <li><Link href="#">Dark</Link></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-brand-unity text-[16px] me-2"></i><span> Inventory</span> <span className="menu-arrow"></span></a>
                            <ul>
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
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-layout-grid text-[16px] me-2"></i><span>Sales &amp; Purchase</span> <span className="menu-arrow"></span></a>
                            <ul>
                                <li className="submenu">
                                    <a href="#"><span>Stock</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#"><span>Manage Stock</span></Link></li>
                                        <li><Link href="#"><span>Stock Adjustment</span></Link></li>
                                        <li><Link href="#"><span>Stock Transfer</span></Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Sales</span><span className="menu-arrow"></span></a>
                                    <ul>
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
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Promo</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#"><span>Coupons</span></Link></li>
                                        <li><Link href="#"><span>Gift Cards</span></Link></li>
                                        <li className="submenu">
                                            <a href="#"><span>Discount</span><span className="menu-arrow"></span></a>
                                            <ul>
                                                <li><Link href="#">Discount Plan</Link></li>
                                                <li><Link href="#">Discount</Link></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Purchase</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#"><span>Purchases</span></Link></li>
                                        <li><Link href="#"><span>Purchase Order</span></Link></li>
                                        <li><Link href="#"><span>Purchase Return</span></Link></li>
                                    </ul>
                                </li>
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
                            </ul>
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-users-group text-[16px] me-2"></i><span>UI Interface</span> <span className="menu-arrow"></span></a>
                            <ul>
                                <li className="submenu">
                                    <a href="#"><span>Base UI</span><span className="menu-arrow"></span></a>
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
                                    <a href="#"><span>Advanced UI</span><span className="menu-arrow"></span></a>
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
                                    <a href="#"><span>Charts</span><span className="menu-arrow"></span></a>
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
                                    <a href="#"><span>Icons</span><span className="menu-arrow"></span></a>
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
                                    <a href="#"><span> Forms</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li className="submenu submenu-two">
                                            <a href="#"><span>Form Elements</span><span className="menu-arrow inside-submenu"></span></a>
                                            <ul>
                                                <li><Link href="#">Basic Inputs</Link></li>
                                                <li><Link href="#">Checkbox &amp; Radios</Link></li>
                                                <li><Link href="#">Input Groups</Link></li>
                                                <li><Link href="#">Grid &amp; Gutters</Link></li>
                                                <li><Link href="#">Form Select</Link></li>
                                                <li><Link href="#">Input Masks</Link></li>
                                                <li><Link href="#">File Uploads</Link></li>
                                            </ul>
                                        </li>
                                        <li className="submenu submenu-two">
                                            <a href="#"><span> Layouts</span><span className="menu-arrow inside-submenu"></span></a>
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
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-page-break text-[16px] me-2"></i><span>Pages</span> <span className="menu-arrow"></span></a>
                            <ul>
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
                                    <a href="#"><span>Error</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">404 Error </Link></li>
                                        <li><Link href="#">500 Error </Link></li>
                                    </ul>
                                </li>
                                <li><Link href="#"><span>Blank Page</span> </Link></li>
                                <li><Link href="#"><span>Pricing</span> </Link></li>
                                <li><Link href="#"><span>Coming Soon</span> </Link></li>
                                <li><Link href="#"><span>Under Maintenance</span> </Link></li>
                                <li className="submenu">
                                    <a href="#"><span>Content</span><span className="menu-arrow"></span></a>
                                    <ul>
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
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Employees</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#"><span>Employees</span></Link></li>
                                        <li><Link href="#"><span>Departments</span></Link></li>
                                        <li><Link href="#"><span>Designation</span></Link></li>
                                        <li><Link href="#"><span>Shifts</span></Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Attendence</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Employee Attendence</Link></li>
                                        <li><Link href="#">Admin Attendence</Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Leaves &amp; Holidays</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Admin Leaves</Link></li>
                                        <li><Link href="#">Employee Leaves</Link></li>
                                        <li><Link href="#">Leave Types</Link></li>
                                        <li><Link href="#"><span>Holidays</span></Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Payroll</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Employee Salary</Link></li>
                                        <li><Link href="#">Payslip</Link></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-chart-bar text-[16px] me-2"></i><span>Reports</span><span className="menu-arrow"></span></a>
                            <ul>
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
                                <li><Link href="#"><span>Profit &amp; Loss</span></Link></li>
                                <li><Link href="#"><span>Annual Report</span></Link></li>
                            </ul>
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-settings text-[16px] me-2"></i><span>Settings</span><span className="menu-arrow"></span></a>
                            <ul>
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
                                    <a href="#"><span>App Settings</span><span className="menu-arrow"></span></a>
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
                                    <a href="#"><span>System Settings</span><span className="menu-arrow"></span></a>
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
                                    <a href="#"><span>Financial Settings</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Payment Gateway</Link></li>
                                        <li><Link href="#">Bank Accounts</Link></li>
                                        <li><Link href="#">Tax Rates</Link></li>
                                        <li><Link href="#">Currencies</Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Other Settings</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#">Storage</Link></li>
                                        <li><Link href="#">Ban IP Address</Link></li>
                                    </ul>
                                </li>
                                <li>
                                    <Link href="/login"><span>Logout</span> </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="submenu">
                            <a href="#"><i className="ti ti-circle-plus text-[16px] me-2"></i><span>More</span><span className="menu-arrow"></span></a>
                            <ul>
                                <li className="submenu">
                                    <a href="#"><span>People</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#"><span>Customers</span></Link></li>
                                        <li><Link href="#"><span>Billers</span></Link></li>
                                        <li><Link href="#"><span>Suppliers</span></Link></li>
                                        <li><Link href="#"><span>Stores</span></Link></li>
                                        <li><Link href="#"><span>Warehouses</span></Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>User Management</span><span className="menu-arrow"></span></a>
                                    <ul>
                                        <li><Link href="#"><span>Users</span></Link></li>
                                        <li><Link href="#"><span>Roles &amp; Permissions</span></Link></li>
                                        <li><Link href="#"><span>Delete Account Request</span></Link></li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <a href="#"><span>Help</span><span className="menu-arrow"></span></a>
                                    <ul>
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
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}