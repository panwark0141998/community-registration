"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, Users, ChevronDown, ChevronUp, Eye, Edit2, Info, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { exportToPDF } from "@/utils/pdfExport";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "@/lib/addressConstants";

function SearchContent() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [district, setDistrict] = useState(searchParams.get("district") || "");
    const [village, setVillage] = useState(searchParams.get("village") || "");
    const [state, setState] = useState(searchParams.get("state") || "");
    const [caste, setCaste] = useState(searchParams.get("caste") || "");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const { t } = useLanguage();

    const calculateAge = (dobString: string) => {
        if (!dobString) return "--";
        const dob = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
            years--;
            months += 12;
        }
        if (today.getDate() < dob.getDate()) {
            months--;
            if (months < 0) months = 11;
        }
        return `${years}${t("years_short")} ${months}${t("months_short")}`;
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setHasSearched(true);

        try {
            const params = new URLSearchParams();
            if (query) params.append("q", query);
            if (district) params.append("district", district);
            if (village) params.append("village", village);
            if (state) params.append("state", state);
            if (caste) params.append("caste", caste);

            const res = await fetch(`/api/search?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("searchDirectory")}</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
            >
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder={t("searchPlaceholder")}
                        />
                    </div>
                    <div className="md:w-48">
                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            disabled={!state}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                        >
                            <option value="">{t("allDistricts") || "All Districts"}</option>
                            {state && DISTRICTS_BY_STATE[state]?.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:w-48">
                        <input
                            type="text"
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder={t("filterByVillage")}
                        />
                    </div>
                    <div className="md:w-48">
                        <select
                            value={state}
                            onChange={(e) => {
                                setState(e.target.value);
                                setDistrict("");
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">{t("allStates") || "All States"}</option>
                            {INDIAN_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:w-48">
                        <input
                            type="text"
                            value={caste}
                            onChange={(e) => setCaste(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder={t("filterByCaste")}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-xl text-sm transition-colors disabled:opacity-70 flex items-center justify-center shrink-0"
                    >
                        {loading ? t("searching") : t("search")}
                    </button>
                </form>
            </motion.div>

            {/* Results */}
            <div className="space-y-4 pt-4">
                {loading && initialLoad ? (
                    <div className="flex justify-center p-12">
                        <p className="text-gray-500">{t("searching")}</p>
                    </div>
                ) : hasSearched && results.length === 0 ? (
                    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">{t("noResults")}</p>
                    </div>
                ) : (
                    results.map((family: any, index) => {
                        const isExpanded = expandedId === family.id;
                        return (
                            <motion.div
                                key={family.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <div id={`family-card-${family.id}`} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                            {family.familyPhoto ? (
                                                <img src={family.familyPhoto} alt="" className="w-16 h-16 rounded-xl object-cover" />
                                            ) : (
                                                <Users className="w-8 h-8 text-blue-50" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{family.headOfFamily}</h3>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                                                    {family.caste}
                                                </span>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg">
                                                    {t("familyId")}: {family.familyId}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" /> {family.contactNumber}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" /> {family.district}, {family.state}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" /> {family.members?.length || 0} {t("totalMembers")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : family.id)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isExpanded
                                                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                                                }`}
                                        >
                                            {t(isExpanded ? "hideMembers" : "showMembers")}
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => exportToPDF(`family-card-${family.id}`, `Family_${family.familyId}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors no-pdf"
                                            title={t("downloadPDF")}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <Link
                                            href={`/family/${family.id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors no-pdf"
                                            title={t("viewDetails")}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10"
                                    >
                                        <div className="p-6">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                                                        <tr>
                                                            <th className="px-4 py-3">{t("name")}</th>
                                                            <th className="px-4 py-3">{t("relation")}</th>
                                                            <th className="px-4 py-3">{t("fatherName")}</th>
                                                            <th className="px-4 py-3">{t("motherName")}</th>
                                                            <th className="px-4 py-3">{t("gender")}</th>
                                                            <th className="px-4 py-3">{t("age")}</th>
                                                            <th className="px-4 py-3">{t("spouseName")}</th>
                                                            <th className="px-4 py-3">{t("status")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* Head Dummy Detail */}
                                                        <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                                {family.headOfFamily} ({t("headOfFamily")})
                                                            </td>
                                                            <td className="px-4 py-3">{t("self")}</td>
                                                            <td className="px-4 py-3">{family.fatherName || "--"}</td>
                                                            <td className="px-4 py-3">{family.motherName || "--"}</td>
                                                            <td className="px-4 py-3">{family.headGender || "--"}</td>
                                                            <td className="px-4 py-3">{calculateAge(family.headDob)}</td>
                                                            <td className="px-4 py-3">--</td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 rounded">{t("alive")}</span>
                                                            </td>
                                                        </tr>
                                                        {family.members?.map((member: any) => (
                                                            <tr key={member.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                                                <td className="px-4 py-3 text-gray-900 dark:text-white">{member.fullName}</td>
                                                                <td className="px-4 py-3">{t(member.relationshipToHead?.toLowerCase()) || member.relationshipToHead}</td>
                                                                <td className="px-4 py-3">{member.fatherName || "--"}</td>
                                                                <td className="px-4 py-3">{member.motherName || "--"}</td>
                                                                <td className="px-4 py-3">{member.gender}</td>
                                                                <td className="px-4 py-3">{calculateAge(member.dob)}</td>
                                                                <td className="px-4 py-3">{member.spouseName || "--"}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${member.isAlive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                                        {member.isAlive ? t("alive") : t("deceased")}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>}>
            <SearchContent />
        </Suspense>
    );
}
