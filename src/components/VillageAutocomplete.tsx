import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, MapPin } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside'; // We'll need to create this hook if it doesn't exist, or just inline it.

interface LocationItem {
    village: string;
    subDistrict: string;
    district: string;
    state: string;
}

interface VillageAutocompleteProps {
    name: string;
    value: string;
    stateValue?: string;
    districtValue?: string;
    subDistrictValue?: string;
    onChange: (name: string, value: string) => void;
    onAutoFill: (location: LocationItem) => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    pincodeVillages?: string[]; // Inject pre-fetched postal villages
}

export default function VillageAutocomplete({
    name,
    value,
    stateValue,
    districtValue,
    subDistrictValue,
    onChange,
    onAutoFill,
    disabled = false,
    required = false,
    placeholder = "Enter or Search Village/Town",
    pincodeVillages = []
}: VillageAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<LocationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep internal input value in sync with external value if it changes externally
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch logic
    useEffect(() => {
        const fetchLocations = async () => {
            if (!isOpen) return;

            // Short-circuit: If we have pre-fetched postal villages, instantly use them!
            if (pincodeVillages && pincodeVillages.length > 0) {
                const mapped = pincodeVillages.map(v => ({
                    village: v,
                    subDistrict: subDistrictValue || "",
                    district: districtValue || "",
                    state: stateValue || ""
                }));
                // Filter them locally if the user is actively typing
                if (inputValue && inputValue.length > 0) {
                    setOptions(mapped.filter(o => o.village.toLowerCase().includes(inputValue.toLowerCase())));
                } else {
                    setOptions(mapped);
                }
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                let url = '/api/locations?';
                if (subDistrictValue) {
                    url += `subDistrict=${encodeURIComponent(subDistrictValue)}`;
                } else if (inputValue.length >= 2) {
                    url += `q=${encodeURIComponent(inputValue)}`;
                } else {
                    setOptions([]);
                    setLoading(false);
                    return;
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data: LocationItem[] = await res.json();
                    setOptions(data);
                }
            } catch (err) {
                console.error("Failed to fetch villages", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchLocations, pincodeVillages.length > 0 ? 0 : 300);
        return () => clearTimeout(timeoutId);
    }, [inputValue, subDistrictValue, isOpen, pincodeVillages, stateValue, districtValue]);

    // Local filtering if we have a subDistrict (since we fetch all for the subDistrict)
    const displayOptions = subDistrictValue && inputValue
        ? options.filter(o => o.village.toLowerCase().includes(inputValue.toLowerCase()))
        : options;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setIsOpen(true);
        onChange(name, val); // Pass generic string back to parent immediately
    };

    const handleSelectOption = (option: LocationItem) => {
        setInputValue(option.village);
        setIsOpen(false);
        onAutoFill(option);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                    required={required}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 md:p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50 pr-10"
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </div>

            {isOpen && (inputValue.length >= 2 || subDistrictValue) && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                    {displayOptions.length > 0 ? (
                        <ul className="py-1">
                            {displayOptions.map((opt, idx) => (
                                <li
                                    key={`${opt.village}-${opt.subDistrict}-${idx}`}
                                    onClick={() => handleSelectOption(opt)}
                                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer flex flex-col transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {opt.village}
                                    </span>
                                    {!subDistrictValue && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3" />
                                            {opt.subDistrict}, {opt.district}, {opt.state}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !loading && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                {subDistrictValue
                                    ? "No matching village found in this Tehsil."
                                    : "No village found. You can continue typing to save manually."}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
