"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2, ChevronRight, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import VillageAutocomplete from "@/components/VillageAutocomplete";
import { INDIAN_STATES, DISTRICTS_BY_STATE, SUB_DISTRICTS_BY_DISTRICT } from "@/lib/addressConstants";
import { compressImage } from "@/utils/imageCompression";

export default function RegisterFamily() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        familyId: "",
        headOfFamily: "",
        headGender: "",
        headDob: "",
        fatherName: "",
        fatherState: "",
        fatherDistrict: "",
        fatherSubDistrict: "",
        fatherVillage: "",
        fatherPincode: "",
        fatherPincodeVillages: "[]",
        motherName: "",
        caste: "",
        contactNumber: "",
        address: {
            street: "",
            state: "",
            district: "",
            subDistrict: "",
            village: "",
            pincode: "",
            pincodeVillages: "[]",
        },
        familyPhoto: "",
    });

    const handleVillageChange = (name: string, value: string) => {
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
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

    const handleAddressAutoFill = (loc: any) => {
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                state: loc.state || prev.address.state,
                district: loc.district || prev.address.district,
                subDistrict: loc.subDistrict || prev.address.subDistrict,
                village: loc.village,
            },
        }));
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
        return `${years} ${t("years")}, ${months} ${t("months")}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleChange(e); // Update UI state instantly

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
                    } else if (name === "address.pincode") {
                        setFormData((prev: any) => {
                            return {
                                ...prev,
                                address: {
                                    ...prev.address,
                                    state: data.state || prev.address.state,
                                    district: data.district || prev.address.district,
                                    subDistrict: data.subDistrict || prev.address.subDistrict,
                                    pincodeVillages: JSON.stringify(data.villages || []),
                                },
                            };
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch location by pincode", err);
            }
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    const compressed = await compressImage(base64, 800, 800, 0.7);
                    setFormData((prev) => ({
                        ...prev,
                        familyPhoto: compressed,
                    }));
                } catch (err) {
                    console.error("Compression failed", err);
                    setFormData((prev) => ({
                        ...prev,
                        familyPhoto: base64,
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/families", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                if (res.status === 413) {
                    throw new Error("Family photo is too large. Please use an image under 5MB.");
                }

                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    throw new Error(data.message || data.error || "Failed to register family");
                } else {
                    throw new Error(`Server Error: ${res.statusText || res.status}`);
                }
            }

            // Successful
            router.push("/family");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

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

    const availableAddressStates = [...INDIAN_STATES];
    if (formData.address.state && !availableAddressStates.includes(formData.address.state)) {
        availableAddressStates.push(formData.address.state);
    }

    const availableAddressDistricts = formData.address.state && DISTRICTS_BY_STATE[formData.address.state]
        ? [...DISTRICTS_BY_STATE[formData.address.state]]
        : [];
    if (formData.address.district && !availableAddressDistricts.includes(formData.address.district)) {
        availableAddressDistricts.push(formData.address.district);
    }

    const availableAddressSubDistricts = formData.address.district && SUB_DISTRICTS_BY_DISTRICT[formData.address.district]
        ? [...SUB_DISTRICTS_BY_DISTRICT[formData.address.district]]
        : [];
    if (formData.address.subDistrict && !availableAddressSubDistricts.includes(formData.address.subDistrict)) {
        availableAddressSubDistricts.push(formData.address.subDistrict);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("registerNewFamily")}</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8"
            >
                {error && (
                    <div className="mb-6 p-4 text-sm text-red-800 bg-red-100 rounded-xl dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Primary Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 dark:border-gray-700">
                            <Check className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t("primaryInfo")}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("headOfFamily")}</label>
                                <input
                                    type="text"
                                    name="headOfFamily"
                                    required
                                    value={formData.headOfFamily}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm"
                                    placeholder={t("fullNamePlaceholder")}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">{t("dob")}</label>
                                    {formData.headDob && (
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                                            {t("age")}: {calculateAge(formData.headDob)}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="date"
                                    name="headDob"
                                    value={formData.headDob}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("gender")}</label>
                                <select
                                    name="headGender"
                                    required
                                    value={formData.headGender}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm"
                                >
                                    <option value="" disabled>{t("selectGender")}</option>
                                    <option value="Male">{t("male")}</option>
                                    <option value="Female">{t("female")}</option>
                                    <option value="Other">{t("other")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("familyIdOptional")}</label>
                                <input
                                    type="text"
                                    name="familyId"
                                    disabled
                                    value={formData.familyId}
                                    className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-xl block w-full p-3 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    placeholder="AUTO-GENERATED"
                                />
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-50 dark:border-blue-900/20">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's Name</label>
                                    <input
                                        type="text"
                                        name="fatherName"
                                        value={formData.fatherName}
                                        onChange={handleChange}
                                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Father's Full Name"
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
                                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="" disabled>Select State</option>
                                        {availableFatherStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's District</label>
                                    <select
                                        name="fatherDistrict"
                                        value={formData.fatherDistrict}
                                        disabled={!formData.fatherState}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, fatherDistrict: e.target.value, fatherSubDistrict: "", fatherVillage: "" }));
                                        }}
                                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                    >
                                        <option value="" disabled>Select District</option>
                                        {availableFatherDistricts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's Tehsil</label>
                                    <select
                                        name="fatherSubDistrict"
                                        value={formData.fatherSubDistrict}
                                        disabled={!formData.fatherDistrict}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, fatherSubDistrict: e.target.value, fatherVillage: "" }));
                                        }}
                                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                    >
                                        <option value="" disabled>Select Tehsil</option>
                                        {availableFatherSubDistricts.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
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
                                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="6-digit Pincode"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("motherNameOptional")}</label>
                                <input
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm"
                                    placeholder={t("motherName")}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("caste")}</label>
                                <input
                                    type="text"
                                    name="caste"
                                    required
                                    value={formData.caste}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm"
                                    placeholder={t("castePlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("contact")}</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    required
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm"
                                    placeholder={t("contactNumberPlaceholder")}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("familyPhotoOptional")}</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    {formData.familyPhoto && (
                                        <img src={formData.familyPhoto} alt="Preview" className="h-12 w-12 object-cover rounded-lg border dark:border-gray-600 shadow-sm" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t("addressDetails")}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("streetAddress")}</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm"
                                    placeholder={t("streetPlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t("state")}</label>
                                <select
                                    name="address.state"
                                    required
                                    value={formData.address.state}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, state: e.target.value, district: "", subDistrict: "", village: "" }
                                        }));
                                    }}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm"
                                >
                                    <option value="" disabled>{t("selectState")}</option>
                                    {availableAddressStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">District</label>
                                <select
                                    name="address.district"
                                    required
                                    value={formData.address.district}
                                    disabled={!formData.address.state}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, district: e.target.value, subDistrict: "", village: "" }
                                        }));
                                    }}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm disabled:opacity-50"
                                >
                                    <option value="" disabled>Select District</option>
                                    {availableAddressDistricts.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tehsil</label>
                                <select
                                    name="address.subDistrict"
                                    required
                                    value={formData.address.subDistrict}
                                    disabled={!formData.address.district}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, subDistrict: e.target.value, village: "" }
                                        }));
                                    }}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm disabled:opacity-50"
                                >
                                    <option value="" disabled>Select Tehsil</option>
                                    {availableAddressSubDistricts.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Grampanchayat / Village (Current Address)</label>
                                    <VillageAutocomplete
                                        name="address.village"
                                        value={formData.address.village}
                                        subDistrictValue={formData.address.subDistrict}
                                        onChange={handleVillageChange}
                                        onAutoFill={handleAddressAutoFill}
                                        disabled={!formData.address.subDistrict}
                                        required={true}
                                        pincodeVillages={JSON.parse(formData.address.pincodeVillages || "[]")}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pincode (Auto-fills Location)</label>
                                <input
                                    type="text"
                                    name="address.pincode"
                                    maxLength={6}
                                    value={formData.address.pincode}
                                    onChange={handlePincodeChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm"
                                    placeholder="6-digit Pincode"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-2xl text-base w-full md:w-auto text-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{t("registering")}...</span>
                                </div>
                            ) : t("registerNewFamily")}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

