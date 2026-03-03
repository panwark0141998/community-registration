"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, UserCircle, Languages, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const { language, setLanguage, t } = useLanguage();
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser({ name: data.user.name, role: data.user.role });
                }
            } catch (e) {
                console.error("Auth check failed", e);
            }
        };
        checkAuth();
    }, [usePathname()]); // Re-run when route changes to catch login state

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button
                            onClick={onMenuClick}
                            type="button"
                            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link href="/" className="flex ms-2 md:me-24">
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                                DDS <span className="text-blue-600">Portal</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center ms-3 gap-4">
                            {/* Language Switcher */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className="flex items-center gap-1 p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Languages className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase hidden sm:block">{language}</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isLangOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-[100]">
                                        <button
                                            onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${language === "en" ? "text-blue-600 font-bold" : "text-gray-700 dark:text-gray-300"}`}
                                        >
                                            {t("english")}
                                        </button>
                                        <button
                                            onClick={() => { setLanguage("hi"); setIsLangOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${language === "hi" ? "text-blue-600 font-bold" : "text-gray-700 dark:text-gray-300"}`}
                                        >
                                            {t("hindi")}
                                        </button>
                                        <button
                                            onClick={() => { setLanguage("gu"); setIsLangOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${language === "gu" ? "text-blue-600 font-bold" : "text-gray-700 dark:text-gray-300"}`}
                                        >
                                            {t("gujarati")}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <>
                                    <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1.5 rounded-lg transition-colors">
                                        <UserCircle className="w-6 h-6 text-gray-500" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">
                                                {user.role}
                                            </span>
                                        </div>
                                    </Link>
                                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">Login</Link>
                                    <Link href="/register" className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg py-1 px-3 hover:bg-gray-100">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
