"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { MemberProfilePage } from "@/components/MemberProfilePage";

export default function DedicatedMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<{ member: any; family: any } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try fetching as a member first
                let res = await fetch(`/api/members/${id}`);
                let memberData = await res.json();

                if (res.ok) {
                    setData({
                        member: memberData,
                        family: memberData.family
                    });
                } else {
                    // Try fetching as a family (head)
                    res = await fetch(`/api/families/${id}`);
                    const familyData = await res.json();

                    if (res.ok) {
                        // Construct dummy head member
                        setData({
                            member: {
                                id: `head-${familyData.family.id}`,
                                fullName: familyData.family.headOfFamily,
                                relationshipToHead: "Self",
                                gender: familyData.family.headGender || "--",
                                dob: familyData.family.headDob || new Date().toISOString(),
                                isAlive: true,
                                memberPhoto: familyData.family.familyPhoto,
                                fatherName: familyData.family.fatherName,
                                motherName: familyData.family.motherName,
                            },
                            family: familyData.family
                        });
                    } else {
                        setError(memberData.error || familyData.error || "Profile not found");
                    }
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);
                setError("Network error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            if (months < 0) months = 11;
        }
        return `${years}${t("years_short")} ${months}${t("months_short")}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">{t("loadingProfile")}...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="text-red-500 bg-red-50 p-4 rounded-full">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("profileNotFound")}</h2>
                <p className="text-gray-500">{error}</p>
                <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline mt-4 flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{t("memberProfile")}</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <MemberProfilePage
                    family={data.family}
                    member={data.member}
                    calculateAge={calculateAge}
                />
            </motion.div>
        </div>
    );
}
