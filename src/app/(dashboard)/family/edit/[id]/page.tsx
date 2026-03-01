"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import VillageAutocomplete from "@/components/VillageAutocomplete";
import { INDIAN_STATES, DISTRICTS_BY_STATE, SUB_DISTRICTS_BY_DISTRICT } from "@/lib/addressConstants";

export default function EditFamilyPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
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

    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const res = await fetch(`/api/families/${id}`);
                const data = await res.json();
                if (res.ok && data.family) {
                    const fam = data.family;
                    setFormData({
                        familyId: fam.familyId || "",
                        headOfFamily: fam.headOfFamily || "",
                        headGender: fam.headGender || "",
                        headDob: fam.headDob ? new Date(fam.headDob).toISOString().split("T")[0] : "",
                        fatherName: fam.fatherName || "",
                        fatherState: fam.fatherState || "",
                        fatherDistrict: fam.fatherDistrict || "",
                        fatherSubDistrict: fam.fatherSubDistrict || "",
                        fatherVillage: fam.fatherVillage || "",
                        fatherPincode: fam.fatherPincode || "",
                        fatherPincodeVillages: fam.fatherPincodeVillages || "[]",
                        motherName: fam.motherName || "",
                        caste: fam.caste || "",
                        contactNumber: fam.contactNumber || "",
                        address: {
                            street: fam.street || "",
                            state: fam.state || "",
                            district: fam.district || "",
                            subDistrict: fam.subDistrict || "",
                            village: fam.village || "",
                            pincode: fam.pincode || "",
                            pincodeVillages: fam.pincodeVillages || "[]",
                        },
                        familyPhoto: fam.familyPhoto || "",
                    });
                } else {
                    setError(data.error || "Failed to fetch family details");
                }
            } catch (err) {
                setError("Network error while fetching family details.");
            } finally {
                setFetching(false);
            }
        };
        fetchFamily();
    }, [id]);

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
        return `${years} Years, ${months} Months`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            if (child === "state") {
                setFormData((prev: any) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value,
                        district: "",
                        subDistrict: "",
                        village: "",
                    },
                }));
            } else if (child === "district") {
                setFormData((prev: any) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value,
                        subDistrict: "",
                        village: "",
                    },
                }));
            } else if (child === "subDistrict") {
                setFormData((prev: any) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value,
                        village: "",
                    },
                }));
            } else {
                setFormData((prev: any) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value,
                    },
                }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
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

    const availableStates = [...INDIAN_STATES];
    if (formData.address.state && !availableStates.includes(formData.address.state)) {
        availableStates.push(formData.address.state);
    }

    const availableDistricts = formData.address.state && DISTRICTS_BY_STATE[formData.address.state]
        ? [...DISTRICTS_BY_STATE[formData.address.state]]
        : [];
    if (formData.address.district && !availableDistricts.includes(formData.address.district)) {
        availableDistricts.push(formData.address.district);
    }

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

    const availableSubDistricts = formData.address.district && SUB_DISTRICTS_BY_DISTRICT[formData.address.district]
        ? [...SUB_DISTRICTS_BY_DISTRICT[formData.address.district]]
        : [];
    if (formData.address.subDistrict && !availableSubDistricts.includes(formData.address.subDistrict)) {
        availableSubDistricts.push(formData.address.subDistrict);
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
                    familyPhoto: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/families/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update family");
            }

            router.push("/family");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center p-12">
                <p className="text-gray-500">Loading family details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Family Settings</h1>
                <button
                    onClick={() => router.back()}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    Cancel
                </button>
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

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Primary Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                            Primary Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Head of Family</label>
                                <input
                                    type="text"
                                    name="headOfFamily"
                                    required
                                    value={formData.headOfFamily}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Date of Birth</label>
                                    {formData.headDob && (
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                                            Age: {calculateAge(formData.headDob)}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="date"
                                    name="headDob"
                                    value={formData.headDob}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gender</label>
                                <select
                                    name="headGender"
                                    required
                                    value={formData.headGender}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Family ID</label>
                                <input
                                    type="text"
                                    name="familyId"
                                    value={formData.familyId}
                                    disabled
                                    className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-xl block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">Family ID cannot be changed.</p>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father's Name (Optional)</label>
                                <input
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="" disabled>Select Father's State</option>
                                    {INDIAN_STATES.map(state => (
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="" disabled>Select District</option>
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        placeholder="Select State First"
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        placeholder="Select District First"
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="6-digit Pincode"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mother's Name (Optional)</label>
                                <input
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Caste / Community</label>
                                <input
                                    type="text"
                                    name="caste"
                                    required
                                    value={formData.caste}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contact Number</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    required
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Family Photo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                {formData.familyPhoto && (
                                    <div className="mt-4">
                                        <img src={formData.familyPhoto} alt="Family Preview" className="h-32 w-32 object-cover rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                            Address Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">State</label>
                                <select
                                    name="address.state"
                                    required
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="" disabled>Select State</option>
                                    {availableStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">District</label>
                                {availableDistricts.length > 0 ? (
                                    <select
                                        name="address.district"
                                        required
                                        value={formData.address.district}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="" disabled>Select District</option>
                                        {availableDistricts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name="address.district"
                                        required
                                        value={formData.address.district}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        placeholder={formData.address.state ? "Enter District Name" : "Select State First"}
                                        disabled={!formData.address.state}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sub-District</label>
                                {availableSubDistricts.length > 0 ? (
                                    <select
                                        name="address.subDistrict"
                                        required
                                        value={formData.address.subDistrict}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="" disabled>Select Sub-District</option>
                                        {availableSubDistricts.map(subDist => (
                                            <option key={subDist} value={subDist}>{subDist}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name="address.subDistrict"
                                        required
                                        value={formData.address.subDistrict}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        placeholder={formData.address.district ? "Enter Sub-District Name" : "Select District First"}
                                        disabled={!formData.address.district}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Grampanchayat / Village (Current Address)</label>
                                <VillageAutocomplete
                                    name="address.village"
                                    value={formData.address.village}
                                    subDistrictValue={formData.address.subDistrict}
                                    onChange={handleVillageChange}
                                    onAutoFill={handleAddressAutoFill}
                                    disabled={!formData.address.subDistrict}
                                    pincodeVillages={JSON.parse(formData.address.pincodeVillages || "[]")}
                                    required={true}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pincode (Auto-fills Location)</label>
                                <input
                                    type="text"
                                    name="address.pincode"
                                    maxLength={6}
                                    value={formData.address.pincode}
                                    onChange={handlePincodeChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="6-digit Pincode"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-xl text-sm w-full md:w-auto text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
