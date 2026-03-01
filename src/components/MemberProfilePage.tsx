"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Users, MapPin, Phone, Calendar, Heart, Shield } from "lucide-react";

interface MemberProfileProps {
    family: any;
    member: any;
    calculateAge: (dob: string) => string;
}

export const MemberProfilePage = ({ family, member, calculateAge }: MemberProfileProps) => {
    const { t } = useLanguage();
    const isHead = member.relationshipToHead?.toLowerCase() === "self" || member.relationshipToHead?.toLowerCase() === "head of family";

    return (
        <div className="pdf-page bg-white w-[794px] h-[1123px] p-12 flex flex-col font-sans" style={{ display: "none" }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
                        {member.fullName}
                    </h1>
                    <p className="text-blue-600 font-semibold text-lg mt-1">
                        {isHead ? t("headOfFamily") : (t(member.relationshipToHead?.toLowerCase()) || member.relationshipToHead)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t("familyId")}</p>
                    <p className="text-xl font-bold text-gray-900">{family.familyId}</p>
                </div>
            </div>

            {/* Profile Content */}
            <div className="flex gap-10 h-full">
                {/* Left Column: Image & Basic Info */}
                <div className="w-1/3 space-y-8">
                    <div className="w-full aspect-[3/4] bg-gray-50 border-2 border-gray-100 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                        {(member.memberPhoto || (isHead && family.familyPhoto)) ? (
                            <img src={member.memberPhoto || family.familyPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-24 h-24 text-gray-200" />
                        )}
                    </div>

                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">{t("dob")}</p>
                                <p className="font-semibold text-gray-700">{new Date(member.dob).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-500" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">{t("age")}</p>
                                <p className="font-semibold text-gray-700">{calculateAge(member.dob)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">{t("status")}</p>
                                <p className={`font-bold ${member.isAlive ? "text-green-600" : "text-red-600"}`}>
                                    {member.isAlive ? t("alive") : t("deceased")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="flex-1 space-y-10">
                    {/* Family Context */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-blue-400 uppercase font-extrabold mb-2 tracking-widest">{t("community")}</p>
                            <p className="text-lg font-bold text-gray-800">{family.caste}</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-400 uppercase font-extrabold mb-2 tracking-widest">{t("gender")}</p>
                            <p className="text-lg font-bold text-gray-800">{member.gender}</p>
                        </div>
                    </div>

                    {/* Parents/Spouse */}
                    <div className="bg-blue-50/30 p-8 rounded-3xl border border-blue-50">
                        <h3 className="text-gray-900 font-bold text-xl mb-6 border-b border-blue-100 pb-2">{t("relationships")}</h3>
                        <div className="space-y-5">
                            {member.spouseName && (
                                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                    <span className="text-gray-500 font-medium">{t("spouseName")}</span>
                                    <span className="font-bold text-gray-900">{member.spouseName}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                <span className="text-gray-500 font-medium">{t("fatherName")}</span>
                                <span className="font-bold text-gray-900">{member.fatherName || (isHead ? family.fatherName : "--")}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                <span className="text-gray-500 font-medium">{t("motherName")}</span>
                                <span className="font-bold text-gray-900">{member.motherName || (isHead ? family.motherName : "--")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-6">
                        <h3 className="text-gray-900 font-bold text-xl mb-4">{t("contactAndAddress")}</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-medium">{t("contact")}</p>
                                    <p className="font-bold text-gray-800">{family.contactNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-medium">{t("address")}</p>
                                    <p className="font-bold text-gray-800 leading-tight">
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
            <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-medium">
                <p>DDS</p>
                <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};
