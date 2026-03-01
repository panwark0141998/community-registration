"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import VillageAutocomplete from "@/components/VillageAutocomplete";
import { INDIAN_STATES, DISTRICTS_BY_STATE, SUB_DISTRICTS_BY_DISTRICT } from "@/lib/addressConstants";

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        dob: "",
        relationshipToHead: "",
        fatherName: "",
        fatherState: "",
        fatherDistrict: "",
        fatherSubDistrict: "",
        fatherVillage: "",
        fatherPincode: "",
        fatherPincodeVillages: "[]",
        motherName: "",
        maritalStatus: "Single",
        spouseName: "",
        education: "",
        occupation: "",
        bloodGroup: "",
        isAlive: true,
        memberPhoto: "",
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await fetch(`/api/members/${id}`);
                if (!res.ok) throw new Error("Failed to fetch member details");
                const data = await res.json();

                setFormData({
                    fullName: data.fullName || "",
                    gender: data.gender || "Male",
                    dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
                    relationshipToHead: data.relationshipToHead || "",
                    fatherName: data.fatherName || "",
                    fatherState: data.fatherState || "",
                    fatherDistrict: data.fatherDistrict || "",
                    fatherSubDistrict: data.fatherSubDistrict || "",
                    fatherVillage: data.fatherVillage || "",
                    fatherPincode: data.fatherPincode || "",
                    fatherPincodeVillages: data.fatherPincodeVillages || "[]",
                    motherName: data.motherName || "",
                    maritalStatus: data.maritalStatus || "Single",
                    spouseName: data.spouseName || "",
                    education: data.education || "",
                    occupation: data.occupation || "",
                    bloodGroup: data.bloodGroup || "",
                    isAlive: data.isAlive ?? true,
                    memberPhoto: data.memberPhoto || "",
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    const handleVillageChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFatherAutoFill = (loc: any) => {
        setFormData((prev) => ({
            ...prev,
            fatherState: loc.state || prev.fatherState,
            fatherDistrict: loc.district || prev.fatherDistrict,
            fatherSubDistrict: loc.subDistrict || prev.fatherSubDistrict,
            fatherVillage: loc.village,
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const checked = type === "checkbox" ? e.target.checked : null;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleChange(e);

        if (value.length === 6 && !isNaN(Number(value))) {
            try {
                const res = await fetch(`/api/pincode?code=${value}`);
                if (res.ok) {
                    const data = await res.json();
                    if (name === "fatherPincode") {
                        setFormData((prev: any) => {
                            return {
                                ...prev,
                                fatherState: data.state || prev.fatherState,
                                fatherDistrict: data.district || prev.fatherDistrict,
                                fatherSubDistrict: data.subDistrict || prev.fatherSubDistrict,
                                fatherPincodeVillages: JSON.stringify(data.villages || []),
                            };
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch location by pincode", err);
            }
        }
    };

    const calculateAge = (dobString: string) => {
        if (!dobString) return "";
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const availableFatherStates = [...INDIAN_STATES];
    if (formData.fatherState && !availableFatherStates.includes(formData.fatherState)) {
        availableFatherStates.push(formData.fatherState);
    }

    const availableFatherDistricts = formData.fatherState && DISTRICTS_BY_STATE[formData.fatherState]
        ? [...DISTRICTS_BY_STATE[formData.fatherState]]
        : [];
    if (formData.fatherDistrict && !availableFatherDistricts.includes(formData.fatherDistrict)) {
        availableFatherDistricts.push(formData.fatherDistrict);
    }

    const availableFatherSubDistricts = formData.fatherDistrict && SUB_DISTRICTS_BY_DISTRICT[formData.fatherDistrict]
        ? [...SUB_DISTRICTS_BY_DISTRICT[formData.fatherDistrict]]
        : [];
    if (formData.fatherSubDistrict && !availableFatherSubDistricts.includes(formData.fatherSubDistrict)) {
        availableFatherSubDistricts.push(formData.fatherSubDistrict);
    }



    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    memberPhoto: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update member");

            router.back();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-500">{t("loadingMemberData")}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("editFamilyMember")}</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8"
            >
                {error && (
                    <div className="mb-6 p-4 text-sm text-red-800 bg-red-100 rounded-xl dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("name")}</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={t("fullNamePlaceholder")}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("relation")}</label>
                            <input
                                type="text"
                                name="relationshipToHead"
                                required
                                value={formData.relationshipToHead}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("fatherName")}</label>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's State</label>
                            <select
                                name="fatherState"
                                value={formData.fatherState}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, fatherState: e.target.value, fatherDistrict: "", fatherSubDistrict: "", fatherVillage: "" }));
                                }}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="" disabled>Select Father's State</option>
                                {availableFatherStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's District</label>
                            {availableFatherDistricts.length > 0 ? (
                                <select
                                    name="fatherDistrict"
                                    value={formData.fatherDistrict}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, fatherDistrict: e.target.value, fatherSubDistrict: "", fatherVillage: "" }));
                                    }}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="" disabled>Select Father's District</option>
                                    {availableFatherDistricts.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="fatherDistrict"
                                    value={formData.fatherDistrict}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fatherDistrict: e.target.value, fatherSubDistrict: "", fatherVillage: "" }))}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder={formData.fatherState ? "Enter District Name" : "Select State First"}
                                    disabled={!formData.fatherState}
                                />
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's Sub-District</label>
                            {availableFatherSubDistricts.length > 0 ? (
                                <select
                                    name="fatherSubDistrict"
                                    value={formData.fatherSubDistrict}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, fatherSubDistrict: e.target.value, fatherVillage: "" }));
                                    }}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="" disabled>Select Sub-District</option>
                                    {availableFatherSubDistricts.map(subDist => (
                                        <option key={subDist} value={subDist}>{subDist}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="fatherSubDistrict"
                                    value={formData.fatherSubDistrict}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fatherSubDistrict: e.target.value, fatherVillage: "" }))}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder={formData.fatherDistrict ? "Enter Sub-District Name" : "Select District First"}
                                    disabled={!formData.fatherDistrict}
                                />
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's Grampanchayat / Village</label>
                            <VillageAutocomplete
                                name="fatherVillage"
                                value={formData.fatherVillage}
                                subDistrictValue={formData.fatherSubDistrict}
                                onChange={handleVillageChange}
                                onAutoFill={handleFatherAutoFill}
                                disabled={!formData.fatherSubDistrict}
                                pincodeVillages={JSON.parse(formData.fatherPincodeVillages || "[]")}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's Pincode (Auto-fills Location)</label>
                            <input
                                type="text"
                                name="fatherPincode"
                                maxLength={6}
                                value={formData.fatherPincode}
                                onChange={handlePincodeChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="6-digit Pincode"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("motherName")}</label>
                            <input
                                type="text"
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                required
                                value={formData.dob}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Age: {formData.dob ? calculateAge(formData.dob) : "--"} {t("years")}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("gender")}</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="Male">{t("male")}</option>
                                <option value="Female">{t("female")}</option>
                                <option value="Other">{t("other")}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("maritalStatus")}</label>
                            <select
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="Single">{t("single")}</option>
                                <option value="Married">{t("married")}</option>
                                <option value="Divorced">{t("divorced")}</option>
                                <option value="Widowed">{t("widowed")}</option>
                            </select>
                        </div>

                        {formData.maritalStatus === "Married" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("spouseName")}</label>
                                <input
                                    type="text"
                                    name="spouseName"
                                    required={formData.maritalStatus === "Married"}
                                    value={formData.spouseName}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </motion.div>
                        )}

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("bloodGroup")}</label>
                            <input
                                type="text"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("education")}</label>
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("occupation")}</label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center pt-8">
                            <input
                                id="isAlive"
                                type="checkbox"
                                name="isAlive"
                                checked={formData.isAlive}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="isAlive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {t("memberIsAlive")}
                            </label>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("photo")}</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {formData.memberPhoto && (
                                <div className="mt-4">
                                    <img src={formData.memberPhoto} alt="Member Preview" className="h-24 w-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-xl text-sm w-full md:w-auto transition-colors disabled:opacity-70 shadow-sm flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? t("updating") : t("updateMemberDetails")}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div >
    );
}
