// src/app/dashboard/layout.jsx

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
// import HorizontalSidebar from "@/components/HorizontalSidebar";
// import TwoColSidebar from "@/components/TwoColSidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="main-wrapper">
            
            <Header />
            
            <Sidebar /> 
            


            <div className="page-wrapper">
                <div className="content">
                    {children}
                </div>
                <footer className="copyright-footer dashboard-footer flex items-center justify-between border-t bg-white gap-3 flex-wrap p-4">
                    <p className="text-[13px] text-gray-900 mb-0">2014 - 2026 © DreamsPOS. All Right Reserved</p>
                    <p className="text-[13px] text-gray-600 mb-0">Designed &amp; Developed By <a href="#" className="text-primary font-bold">Dreams</a></p>
                </footer>
            </div>

        </div>
    );
}