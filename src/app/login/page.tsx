"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to log in");
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/assets/login-bg.png')",
                    backgroundColor: "#020617"
                }}
            >
                <div className="absolute inset-0 bg-slate-950/20"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md p-10 mx-4"
            >
                {/* Transparent Container */}
                <div className="absolute inset-0 bg-transparent rounded-3xl overflow-hidden">
                    {/* Optional: Keep a very subtle gradient if it helps readability, but removing entirely based on 'transparent' request */}
                </div>

                <div className="relative">
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                                Welcome Back
                            </h1>
                            <p className="text-white/80 mt-3 font-medium">
                                Sign in to access your family portal
                            </p>
                        </motion.div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mb-6 p-4 text-sm text-red-200 bg-red-900/40 border border-red-500/50 rounded-xl backdrop-blur-md"
                            role="alert"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-white/90 ml-1"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent block w-full p-3.5 outline-none transition-all hover:bg-white/20 dark:bg-black/30 dark:border-white/10"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-white/90 ml-1"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent block w-full p-3.5 outline-none transition-all hover:bg-white/20 dark:bg-black/30 dark:border-white/10"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="w-4 h-4 border border-white/30 rounded bg-white/10 focus:ring-blue-400 text-blue-500 transition-colors"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2.5 text-sm font-medium text-white/80 cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>
                            <a
                                href="#"
                                className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full overflow-hidden text-white bg-blue-600 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-400 font-bold rounded-xl text-md px-5 py-4 text-center transition-all disabled:opacity-70 shadow-lg shadow-blue-900/40 active:scale-95"
                        >
                            <span className="relative z-10">
                                {loading ? "Signing in..." : "Sign In to Portal"}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>

                        <p className="text-sm font-medium text-white/60 text-center pt-2">
                            Don’t have an account yet?{" "}
                            <Link
                                href="/register"
                                className="text-blue-300 hover:text-blue-200 underline decoration-blue-300/30 underline-offset-4 transition-all"
                            >
                                Create Account
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
