"use client";

import { useState, useEffect } from "react";
import { Cloud, Check, RefreshCw, CloudOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CloudSync() {
    const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
    const [lastSync, setLastSync] = useState<string>("");
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        // Initial sync "simulation" when page loads
        setLastSync(new Date().toLocaleTimeString());

        // Try to fetch latest data to get debug info
        fetch("/api/families/me").then(res => res.json()).then(data => {
            if (data && Array.isArray(data) && data.length > 0 && data[0]._debug) {
                setDebugInfo(data[0]._debug);
            } else if (data && !Array.isArray(data) && data._debug) {
                setDebugInfo(data._debug);
            }
        }).catch(() => { });
    }, []);

    const handleSync = () => {
        if (status === "syncing") return;

        setStatus("syncing");

        // Simulate a real data refresh by reloading the page data or just refreshing
        setTimeout(() => {
            window.location.reload();
            setStatus("success");
            setLastSync(new Date().toLocaleTimeString());

            setTimeout(() => {
                setStatus("idle");
            }, 3000);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative group"
            >
                {/* Status Tooltip */}
                <AnimatePresence>
                    {(status !== "idle" || lastSync) && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 pointer-events-none"
                        >
                            <div className="flex flex-col gap-1">
                                {status === "syncing" && <span>Syncing with Cloud...</span>}
                                {status === "success" && <span>Synced Successfully!</span>}
                                {status === "idle" && lastSync && <span>Last Sync: {lastSync}</span>}
                                {debugInfo && (
                                    <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 text-[10px] opacity-70">
                                        ID: {debugInfo.userId?.slice(-6)} | Role: {debugInfo.role}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main FAB */}
                <button
                    onClick={handleSync}
                    className={`
                        flex items-center justify-center w-12 h-12 rounded-full shadow-xl transition-all duration-300
                        ${status === "syncing" ? "bg-blue-500 cursor-wait rotate-180" : "bg-white dark:bg-gray-800 hover:scale-110 active:scale-95"}
                        border border-gray-100 dark:border-gray-700
                    `}
                    title="Click to sync data with Cloud"
                >
                    <AnimatePresence mode="wait">
                        {status === "syncing" ? (
                            <motion.div
                                key="syncing"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                                <RefreshCw className="w-5 h-5 text-white" />
                            </motion.div>
                        ) : status === "success" ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <Check className="w-5 h-5 text-green-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="relative"
                            >
                                <Cloud className="w-5 h-5 text-blue-500" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-white dark:border-gray-800" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </motion.div>
        </div>
    );
}
