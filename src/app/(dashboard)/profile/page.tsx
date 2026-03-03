"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
    const { t } = useLanguage();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Fetch user error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        setIsUpdating(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                setMessage({ type: "success", text: t("passwordUpdated") });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                setMessage({ type: "error", text: data.error || "Failed to update password" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">{t("loading")}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">{t("profile")}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                        <div className="px-6 pb-6">
                            <div className="relative -mt-12 mb-4">
                                <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full inline-block shadow-md">
                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full">
                                        <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-1">
                                {isEditingName ? (
                                    <form onSubmit={handleUpdateName} className="flex flex-col w-full gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full p-2 text-lg font-bold text-gray-900 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-md"
                                            >
                                                {t("save")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsEditingName(false); setNewName(user.name); }}
                                                className="text-[10px] font-bold bg-gray-200 text-gray-700 px-3 py-1 rounded-md"
                                            >
                                                {t("cancel")}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                                            title={t("editName")}
                                        >
                                            <Shield className="w-4 h-4" /> {/* Swap with more appropriate icon if needed, but Shield is already imported */}
                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium uppercase tracking-wider">{user?.role}</p>

                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter leading-none mb-1">{t("email")}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter leading-none mb-1">{t("phone")}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user?.phone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter leading-none mb-1">{t("userStatus")}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user?.status === "approved" ? "bg-green-100 text-green-700" :
                                            user?.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {t(user?.status || "pending")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("security")}</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {t("currentPassword")}
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t("newPassword")}
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t("confirmPassword")}
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {message.text && (
                                <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === "success"
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    }`}>
                                    {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <p className="text-sm font-medium">{message.text}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {t("updatePassword")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
