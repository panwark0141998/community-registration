"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Activity, UserPlus, FileText, MapPin, Building2, Home, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: t("totalFamilies"), value: stats?.totalFamilies || "0", bg: "bg-blue-50 dark:bg-blue-900/20", icon: <Users className="w-8 h-8 text-blue-500" /> },
        { title: t("totalMembers"), value: stats?.totalMembers || "0", bg: "bg-green-50 dark:bg-green-900/20", icon: <Activity className="w-8 h-8 text-green-500" /> },
        { title: t("aliveMembers"), value: stats?.aliveMembers || "0", bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: <UserPlus className="w-8 h-8 text-indigo-500" /> },
        { title: t("deceasedMembers"), value: stats?.deceasedMembers || "0", bg: "bg-purple-50 dark:bg-purple-900/20", icon: <FileText className="w-8 h-8 text-purple-500" /> },
    ];

    const GeoSection = ({
        title, icon, color, items, filterKey
    }: {
        title: string; icon: React.ReactNode; color: string; items: { name: string; count: number }[]; filterKey: string;
    }) => (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <div className="space-y-2">
                {loading ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Loading...</p>
                ) : items && items.length > 0 ? (
                    items.map((item, i) => (
                        <motion.button
                            key={item.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/search?${filterKey}=${encodeURIComponent(item.name)}`)}
                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group text-left"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                    {item.count} {item.count === 1 ? "family" : "families"}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                            </div>
                        </motion.button>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 py-4 text-center">No data available yet.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DDS {t("dashboard")}</h1>
                {stats?.myFamilies !== undefined && (
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>My Families: {stats.myFamilies}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={`p-6 rounded-2xl ${card.bg}`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {loading ? "..." : card.value}
                                </h3>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                {card.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-1">Browse by Location — click any name to see families</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GeoSection
                    title="By State"
                    icon={<MapPin className="w-5 h-5 text-blue-500" />}
                    color="bg-blue-50 dark:bg-blue-900/20"
                    items={stats?.geography?.byState || []}
                    filterKey="state"
                />
                <GeoSection
                    title="By District"
                    icon={<Building2 className="w-5 h-5 text-purple-500" />}
                    color="bg-purple-50 dark:bg-purple-900/20"
                    items={stats?.geography?.byDistrict || []}
                    filterKey="district"
                />
                <GeoSection
                    title="By Village (Gram)"
                    icon={<Home className="w-5 h-5 text-green-500" />}
                    color="bg-green-50 dark:bg-green-900/20"
                    items={stats?.geography?.byVillage || []}
                    filterKey="village"
                />
            </div>
        </div>
    );
}
