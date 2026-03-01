"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import CloudSync from "@/components/CloudSync";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Navbar onMenuClick={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} />
            <div className="p-4 sm:ml-64 pt-20">
                {children}
            </div>
            <CloudSync />
        </div>
    );
}
