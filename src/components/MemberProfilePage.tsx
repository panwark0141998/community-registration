"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Users, MapPin, Phone, Calendar, Heart, Shield } from "lucide-react";

interface MemberProfileProps {
    family: any;
    member: any;
    calculateAge: (dob: string) => string;
    isPdf?: boolean;
}

export const MemberProfilePage = ({ family, member, calculateAge, isPdf = false }: MemberProfileProps) => {
    const { t } = useLanguage();
    const isHead = member.relationshipToHead?.toLowerCase() === "self" || member.relationshipToHead?.toLowerCase() === "head of family";

    const containerClasses = isPdf
        ? "bg-white w-[794px] h-[1123px] p-12 flex flex-col font-sans"
        : "bg-white dark:bg-gray-900 w-full max-w-4xl mx-auto p-6 md:p-12 flex flex-col font-sans min-h-screen sm:min-h-0 sm:rounded-3xl sm:shadow-xl sm:border sm:border-gray-100 sm:dark:border-gray-800";

    return (
        <div className={`member-profile-page ${containerClasses}`} style={{ display: isPdf ? "none" : "flex" }}>
            {/* Header */}
            <div className={`flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8 ${isPdf ? "" : "dark:border-blue-500"}`}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
                        {member.fullName}
                    </h1>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-base md:text-lg mt-1">
                        {isHead ? t("headOfFamily") : (t(member.relationshipToHead?.toLowerCase()) || member.relationshipToHead)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">{t("familyId")}</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{family.familyId}</p>
                </div>
            </div>

            {/* Profile Content */}
            <div className={`flex flex-col md:flex-row gap-6 md:gap-10 ${isPdf ? "h-full" : ""}`}>
                {/* Left Column: Image & Basic Info */}
                <div className="w-full md:w-1/3 space-y-6 md:space-y-8">
                    <div className="w-full aspect-[3/4] bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                        {(member.memberPhoto || (isHead && family.familyPhoto)) ? (
                            <img src={member.memberPhoto || family.familyPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-20 md:w-24 h-20 md:h-24 text-gray-200 dark:text-gray-700" />
                        )}
                    </div>

                    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">{t("dob")}</p>
                                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{new Date(member.dob).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">{t("age")}</p>
                                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{calculateAge(member.dob)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">{t("status")}</p>
                                <p className={`font-bold text-sm ${member.isAlive ? "text-green-600" : "text-red-600"}`}>
                                    {member.isAlive ? t("alive") : t("deceased")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="flex-1 space-y-8 md:space-y-10">
                    {/* Family Context */}
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <div>
                            <p className="text-[10px] text-blue-400 dark:text-blue-500 uppercase font-extrabold mb-1 tracking-widest">{t("community")}</p>
                            <p className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">{family.caste}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 dark:text-blue-500 uppercase font-extrabold mb-1 tracking-widest">{t("gender")}</p>
                            <p className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">{member.gender}</p>
                        </div>
                    </div>

                    {/* Parents/Spouse */}
                    <div className="bg-blue-50/30 dark:bg-blue-900/10 p-6 md:p-8 rounded-3xl border border-blue-50 dark:border-blue-900/30">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg md:text-xl mb-4 md:mb-6 border-b border-blue-100 dark:border-blue-800 pb-2">{t("relationships")}</h3>
                        <div className="space-y-3 md:space-y-5">
                            {member.spouseName && (
                                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t("spouseName")}</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{member.spouseName}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t("fatherName")}</span>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{member.fatherName || (isHead ? family.fatherName : "--")}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t("motherName")}</span>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{member.motherName || (isHead ? family.motherName : "--")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-6">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg md:text-xl mb-4">{t("contactAndAddress")}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t("contact")}</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{family.contactNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t("address")}</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight">
                                        {family.street}, {family.village}<br />
                                        {family.district}, {family.state} - {family.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                <p>DDS</p>
                <p>{isPdf ? `Generated on ${new Date().toLocaleDateString()}` : "Community Management System"}</p>
            </div>
        </div>
    );
};
