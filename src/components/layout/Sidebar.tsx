"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Search, Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setRole(data.user.role);
                }
            } catch (e) {
                console.error("Failed to fetch user role", e);
            }
        };
        fetchUser();
    }, []);

    const menuItems = [
        { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: t("myFamily"), href: "/family", icon: Users },
        { name: t("addMember"), href: "/family/add-member", icon: UserPlus },
        { name: t("search"), href: "/search", icon: Search },
        ...(role === "admin" ? [{ name: t("adminPanel"), href: "/admin", icon: Settings }] : []),
    ];

    return (
        <aside
            id="logo-sidebar"
            className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                } bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
            aria-label="Sidebar"
        >
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                <ul className="space-y-2 font-medium">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-2 rounded-lg group ${isActive
                                        ? "text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-blue-500"
                                        : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 transition-duration-75 ${isActive
                                            ? "text-blue-600 dark:text-blue-500"
                                            : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                            }`}
                                    />
                                    <span className="ms-3">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
