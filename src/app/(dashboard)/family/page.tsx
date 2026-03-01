"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, MapPin, Phone, Pencil, Trash2, Eye, Edit2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function MyFamilyPage() {
    const [families, setFamilies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchFamilies = async () => {
        try {
            const res = await fetch("/api/families/me");
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data)) {
                    setFamilies(data);
                }
            }
        } catch (e) {
            console.error("Error fetching families");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
    }, []);

    const handleDeleteFamily = async (id: string, name: string) => {
        if (!window.confirm(t("confirmDelete").replace("इसे", `${name} के परिवार को`))) {
            return;
        }

        try {
            const res = await fetch(`/api/families/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                // Refresh the list
                fetchFamilies();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete family");
            }
        } catch (err) {
            alert("Network error: Failed to delete family");
        }
    };

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
        return `${years}y ${months}m`;
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm(t("confirmDelete"))) return;

        setIsDeleting(memberId);
        try {
            const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete member");

            // Refresh data
            fetchFamilies();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <p className="text-gray-500">{t("loading")}</p>
            </div>
        );
    }

    if (families.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Families Registered</h2>
                    <p className="text-gray-500 mt-2 max-w-md">
                        You haven't registered any family profiles yet. Create a family profile to start adding members.
                    </p>
                </div>
                <Link
                    href="/family/register"
                    className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {t("registerFamily")}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("familiesOverview")}</h1>
                <Link
                    href="/family/register"
                    className="inline-flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("registerFamily")}
                </Link>
            </div>

            {families.map((family, index) => {
                // Ensure the head of family is virtually in the members array if not already present
                const members = [...(family.members || [])];
                const headExists = members.some(
                    (m) =>
                        m.relationshipToHead?.toLowerCase() === "self" ||
                        m.relationshipToHead?.toLowerCase() === "head" ||
                        m.fullName === family.headOfFamily
                );

                if (!headExists) {
                    members.unshift({
                        id: `head-dummy-${family.id}`,
                        fullName: family.headOfFamily,
                        relationshipToHead: "Head of Family",
                        gender: family.headGender || "--",
                        dob: family.headDob || new Date().toISOString(),
                        isAlive: true,
                        memberPhoto: null,
                    });
                }

                return (
                    <motion.div
                        key={family.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-6"
                    >
                        {/* Family details card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700 p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t("familyHeader").replace("{name}", family.headOfFamily)}
                                    </h2>
                                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                        {t("familyId")}: {family.familyId}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/family/${family.id}`}
                                        title="View Details"
                                        className="p-2 text-gray-500 bg-white rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                                    >
                                        <Users className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={`/family/edit/${family.id}`}
                                        title="Edit Family"
                                        className="p-2 text-blue-600 bg-white rounded-lg hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/30 dark:text-blue-400 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <button
                                        title="Delete Family"
                                        onClick={() => handleDeleteFamily(family.id, family.headOfFamily)}
                                        className="p-2 text-red-600 bg-white rounded-lg hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30 dark:text-red-400 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <Link
                                        href={`/family/add-member?familyId=${family.id}`}
                                        className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm ml-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t("addMember")}
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    {family.familyPhoto ? (
                                        <img src={family.familyPhoto} alt="Family" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <Users className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="space-y-4 flex-grow">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t("caste")}: {family.caste}</p>
                                        {family.headDob && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium text-gray-900 dark:text-gray-200">{t("dob")}:</span> {new Date(family.headDob).toLocaleDateString()}
                                                <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase">
                                                    {t("age")}: {calculateAge(family.headDob)}
                                                </span>
                                            </p>
                                        )}
                                        {family.fatherName && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium text-gray-900 dark:text-gray-200">{t("fatherName")}:</span> {family.fatherName}
                                            </p>
                                        )}
                                        {family.motherName && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium text-gray-900 dark:text-gray-200">{t("motherName")}:</span> {family.motherName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("contact")}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{family.contactNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("address")}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {family.street}, {family.village} <br />
                                                    {family.district}, {family.state} - {family.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Member List Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("membersDirectory")}</h3>
                                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                    {members.length} {t("total")}
                                </span>
                            </div>

                            {members.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100/50 dark:bg-gray-700/50 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-6 py-4">{t("photo")}</th>
                                                <th scope="col" className="px-6 py-4">{t("name")}</th>
                                                <th scope="col" className="px-6 py-4">{t("relation")}</th>
                                                <th scope="col" className="px-6 py-4">{t("spouseName")}</th>
                                                <th scope="col" className="px-6 py-4">{t("gender")}</th>
                                                <th scope="col" className="px-6 py-4">{t("age")} / {t("dob")}</th>
                                                <th scope="col" className="px-6 py-4">{t("status")}</th>
                                                <th scope="col" className="px-6 py-4">{t("actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map((member: any) => {
                                                const hasRealDob = member.gender !== "--" || member.id.startsWith("head-dummy");
                                                const age = hasRealDob ? calculateAge(member.dob) : "--";
                                                const isDummy = member.id.startsWith("head-dummy");

                                                return (
                                                    <tr key={member.id} className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isDummy && 'bg-blue-50/30 dark:bg-blue-900/10'}`}>
                                                        <td className="px-6 py-4">
                                                            {member.memberPhoto ? (
                                                                <img src={member.memberPhoto} alt={member.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-500">
                                                                    <Users className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center gap-2">
                                                            {member.fullName}
                                                            {isDummy && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-yellow-100 text-yellow-800 rounded dark:bg-yellow-900/30 dark:text-yellow-500">Auto</span>}
                                                        </th>
                                                        <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                                                            {isDummy ? t("headOfFamily") : (t(member.relationshipToHead.toLowerCase()) || member.relationshipToHead)}
                                                        </td>
                                                        <td className="px-6 py-4">{member.spouseName || "--"}</td>
                                                        <td className="px-6 py-4">{member.gender}</td>
                                                        <td className="px-6 py-4">
                                                            {age}
                                                            {hasRealDob && <div className="text-xs text-gray-400">{new Date(member.dob).toLocaleDateString()}</div>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isAlive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                                {member.isAlive ? t("alive") : t("deceased")}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/family/${family.id}`}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                                    title="See Family Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Link>
                                                                {!isDummy && (
                                                                    <>
                                                                        <Link
                                                                            href={`/family/edit-member/${member.id}`}
                                                                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors dark:text-amber-400 dark:hover:bg-amber-900/30"
                                                                            title="Edit Member"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleDeleteMember(member.id)}
                                                                            disabled={isDeleting === member.id}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                                                                            title="Delete Member"
                                                                        >
                                                                            {isDeleting === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {isDummy && (
                                                                    <Link
                                                                        href={`/family/edit/${family.id}`}
                                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors dark:text-amber-400 dark:hover:bg-amber-900/30"
                                                                        title="Edit Head of Family"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </Link>
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
                                    <p>No members recorded for this family yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
