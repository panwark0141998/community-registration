"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Activity, UserPlus, FileText, MapPin, Building2, Home, ChevronRight, Cake } from "lucide-react";
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

    const MemberDetailSection = ({
        title, subtitle, items, icon, colorClass, emptyIcon, emptyMessage
    }: {
        title: string; subtitle: string; items: any[]; icon: React.ReactNode;
        colorClass: string; emptyIcon: React.ReactNode; emptyMessage: string;
    }) => (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
            <div className={`p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r ${colorClass}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 flex-grow">
                {loading ? (
                    <div className="flex flex-col items-center py-12">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <p className="text-sm text-gray-400">Loading details...</p>
                    </div>
                ) : items && items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((person, i) => (
                            <motion.div
                                key={`${person.name}-${person.familyId}-${i}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-all"
                            >
                                {/* Photo / Avatar */}
                                <div className="flex-shrink-0">
                                    {person.photo ? (
                                        <img
                                            src={person.photo}
                                            alt={person.name}
                                            className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                            <Users className="w-6 h-6 text-gray-400/70" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase truncate">
                                                {person.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                {person.isHead ? "Head of Family" : "Family Member"}
                                            </p>
                                        </div>
                                        {person.daysUntil !== undefined && (
                                            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${person.daysUntil === 0 ? "bg-pink-500 text-white" : "bg-blue-500 text-white"
                                                }`}>
                                                {person.daysUntil === 0 ? "Today!" : "In " + person.daysUntil + "d"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-1">
                                        <div className="flex items-center gap-2 text-gray-500/80">
                                            <Cake className="w-3.5 h-3.5 text-pink-400/80" />
                                            <span className="text-[11px] font-medium leading-none">
                                                {new Date(person.dob).toLocaleDateString("en-GB")}
                                                <span className="ml-1 text-gray-900 dark:text-gray-100 font-bold">({person.age}y)</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500/80">
                                            <Activity className="w-3.5 h-3.5 text-blue-400/80" />
                                            <span className="text-[11px] font-medium leading-none">
                                                {person.mobile || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500/80">
                                            <MapPin className="w-3.5 h-3.5 text-green-400/80" />
                                            <span className="text-[11px] italic truncate font-medium leading-none">{person.location}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/family/${person.familyId}`)}
                                        className="mt-3 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group/btn"
                                    >
                                        Profile <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                            {emptyIcon}
                        </div>
                        <p className="text-sm text-gray-400">{emptyMessage}</p>
                    </div>
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

            {/* Top Stats Section remains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">Browse by Location — click any name to see families</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
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
                    </div>
                </div>

                {/* Optional: Add recent activity or another metric here if needed */}
                <div className="flex flex-col justify-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-xl">
                    <h3 className="text-2xl font-black mb-2 italic">COMMUNITY GROWTH</h3>
                    <p className="text-sm opacity-90 mb-6">Our community is growing stronger every day. Thank you for your contributions!</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Active Now</p>
                            <p className="text-2xl font-black">{stats?.totalMembers || 0}</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Families</p>
                            <p className="text-2xl font-black">{stats?.totalFamilies || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Member Sections - Birthdays and New Joins */}
            <div className="space-y-8">
                <MemberDetailSection
                    title="Upcoming Birthdays"
                    subtitle="Celebrating our community members"
                    items={stats?.upcomingBirthdays || []}
                    icon={<Cake className="w-6 h-6 text-pink-500 animate-bounce" />}
                    colorClass="from-pink-50/50 to-orange-50/50 dark:from-pink-900/10 dark:to-orange-900/10"
                    emptyIcon={<Cake className="w-10 h-10 text-gray-300" />}
                    emptyMessage="No birthdays today or in the next 2 days."
                />

                <MemberDetailSection
                    title="Recently Joined"
                    subtitle="Newest additions to our community"
                    items={stats?.recentMembers || []}
                    icon={<UserPlus className="w-6 h-6 text-blue-500" />}
                    colorClass="from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10"
                    emptyIcon={<Users className="w-10 h-10 text-gray-300" />}
                    emptyMessage="No new members joined recently."
                />
            </div>
        </div>
    );
}



