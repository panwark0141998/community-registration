"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, MapPin, Phone, ArrowLeft, Eye, Edit2, Trash2, Loader2, Download, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { exportFullFamilyPDF } from "@/utils/pdfExport";
import { MemberProfilePage } from "@/components/MemberProfilePage";

export default function FamilyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [familyData, setFamilyData] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const res = await fetch(`/api/families/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setFamilyData(data.family);
                    setMembers(data.members || []);
                } else {
                    setError(data.error || "Failed to fetch family");
                }
            } catch (e) {
                console.error("Error fetching family");
                setError("Network error");
            } finally {
                setLoading(false);
            }
        };
        fetchFamily();
    }, [id]);

    const calculateAge = (dobString: string) => {
        if (!dobString) return "";
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
            if (months < 0) {
                months = 11;
            }
        }
        return `${years}${t("years_short")} ${months}${t("months_short")}`;
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm(t("confirmDeleteMember"))) return;

        setIsDeleting(memberId);
        try {
            const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete member");
            }

            // Refresh data
            window.location.reload();
        } catch (err: any) {
            console.error("Delete Member Error:", err);
            alert(`${t("error")}: ${err.message}`);
        } finally {
            setIsDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <p className="text-gray-500">{t("loadingFamDetails")}</p>
            </div>
        );
    }

    if (error || !familyData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="text-red-500 bg-red-50 p-4 rounded-full">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("familyNotFound")}</h2>
                <p className="text-gray-500">{error || t("familyNotFoundDesc")}</p>
                <Link href="/search" className="text-blue-600 hover:underline mt-4">
                    {t("backToSearch")}
                </Link>
            </div>
        );
    }

    let displayMembers = [...members];
    if (familyData) {
        const headExists = displayMembers.some(
            (m) =>
                m.relationshipToHead?.toLowerCase() === "self" ||
                m.relationshipToHead?.toLowerCase() === "head" ||
                m.fullName === familyData.headOfFamily
        );

        if (!headExists) {
            displayMembers.unshift({
                id: `head-dummy-${familyData.id}`,
                fullName: familyData.headOfFamily,
                relationshipToHead: "Head of Family",
                gender: familyData.headGender || "--",
                dob: familyData.headDob || new Date().toISOString(),
                isAlive: true,
                memberPhoto: familyData.familyPhoto,
            });
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/search" className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("familyDetails")}</h1>
                </div>
                <button
                    onClick={() => exportFullFamilyPDF("full-family-report", `Full_Report_Family_${familyData.familyId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors text-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    <span>{t("downloadPDF")}</span>
                </button>
            </div>

            <div id="family-report" className="space-y-6 bg-white dark:bg-gray-900 p-4 rounded-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="space-y-4 flex-grow">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t("familyOf").replace("{name}", familyData.headOfFamily)}
                                    </h2>
                                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                        ID: {familyData.familyId}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t("caste")}: {familyData.caste}</p>
                                    {familyData.headDob && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{t("dob")}:</span> {new Date(familyData.headDob).toLocaleDateString()}
                                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase">
                                                {t("age")}: {calculateAge(familyData.headDob)}
                                            </span>
                                        </p>
                                    )}
                                    {familyData.fatherName && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{t("fatherName")}:</span> {familyData.fatherName}
                                        </p>
                                    )}
                                    {familyData.motherName && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{t("motherName")}:</span> {familyData.motherName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t("contact")}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{familyData.contactNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t("address")}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {familyData.street}, {familyData.village} <br />
                                            {familyData.district}, {familyData.state} - {familyData.pincode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Member List Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("familyMembers")}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {t("membersCount").replace("{count}", displayMembers.length.toString())}
                        </span>
                    </div>

                    {displayMembers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">{t("name")}</th>
                                        <th className="px-6 py-4">{t("relation")}</th>
                                        <th className="px-6 py-4">{t("fatherName")}</th>
                                        <th className="px-6 py-4">{t("motherName")}</th>
                                        <th className="px-6 py-4">{t("gender")}</th>
                                        <th className="px-6 py-4">{t("age")}</th>
                                        <th className="px-6 py-4">{t("spouseName")}</th>
                                        <th className="px-6 py-4">{t("status")}</th>
                                        <th className="px-6 py-4 no-pdf">{t("actions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {displayMembers.map((member) => {
                                        const isDummy = member.id.toString().startsWith("head-dummy");
                                        const isAuthorized = currentUser?.role === "admin" || familyData?.representativeId === currentUser?.id;

                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                                            {(member.memberPhoto || ((member.relationshipToHead?.toLowerCase() === "self" || member.relationshipToHead?.toLowerCase() === "head of family") && familyData.familyPhoto)) ? (
                                                                <img src={member.memberPhoto || familyData.familyPhoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{member.fullName}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isDummy ? t("headOfFamily") : (t(member.relationshipToHead?.toLowerCase()) || member.relationshipToHead)}
                                                </td>
                                                <td className="px-6 py-4">{isDummy ? familyData.fatherName : (member.fatherName || "--")}</td>
                                                <td className="px-6 py-4">{isDummy ? familyData.motherName : (member.motherName || "--")}</td>
                                                <td className="px-6 py-4">{member.gender}</td>
                                                <td className="px-6 py-4">{calculateAge(member.dob)}</td>
                                                <td className="px-6 py-4">{member.spouseName || "--"}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isAlive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                        {member.isAlive ? t("alive") : t("deceased")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 no-pdf">
                                                    <div className="flex items-center gap-2">
                                                        {isAuthorized ? (
                                                            <>
                                                                {!isDummy ? (
                                                                    <>
                                                                        <button
                                                                            title={t("viewDetails")}
                                                                            onClick={() => router.push(`/member/${member.id}`)}
                                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                        </button>
                                                                        <Link
                                                                            href={`/family/edit-member/${member.id}`}
                                                                            title={t("editMember")}
                                                                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors dark:text-amber-400 dark:hover:bg-amber-900/30"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleDeleteMember(member.id)}
                                                                            disabled={isDeleting === member.id}
                                                                            title={t("deleteMember")}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                                                                        >
                                                                            {isDeleting === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <Link
                                                                        href={`/family/edit/${familyData.id}`}
                                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors dark:text-amber-400 dark:hover:bg-amber-900/30"
                                                                        title={t("editHead")}
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </Link>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <button
                                                                title={t("viewDetails")}
                                                                onClick={() => router.push(`/member/${member.id}`)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>{t("noMembersRecorded")}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden Multi-page Report Template */}
            <div id="full-family-report" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                {displayMembers.map((member) => (
                    <MemberProfilePage
                        key={member.id}
                        family={familyData}
                        member={member}
                        calculateAge={calculateAge}
                        isPdf={true}
                    />
                ))}
            </div>
        </div>
    );
}
