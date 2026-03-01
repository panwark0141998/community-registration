"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminControlPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUsers(data);
        } catch (err: any) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusUpdate = async (userId: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");

            // Refresh user list purely on frontend to avoid re-fetch latency
            setUsers((prev: any) =>
                prev.map((u: any) => (u._id === userId ? { ...u, status } : u))
            );
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Control Panel</h1>
                <div className="text-sm text-gray-500">
                    Total Requests: {users.length}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Name</th>
                                <th scope="col" className="px-6 py-4">Email</th>
                                <th scope="col" className="px-6 py-4">Phone</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Joined At</th>
                                <th scope="col" className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading user requests...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No family representative requests found.</td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">{user.phone}</td>
                                        <td className="px-6 py-4">
                                            {user.status === "pending" && <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-full w-fit"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                                            {user.status === "approved" && <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full w-fit"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>}
                                            {user.status === "rejected" && <span className="flex items-center gap-1.5 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full w-fit"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                                        </td>
                                        <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 flex items-center justify-center gap-2">
                                            {user.status !== "approved" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(user._id, "approved")}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.status !== "rejected" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(user._id, "rejected")}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
