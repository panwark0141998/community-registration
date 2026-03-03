"use client";

import { useState } from "react";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, imageUrl }),
            });

            if (res.ok) {
                setContent("");
                setImageUrl("");
                setShowImageInput(false);
                onPostCreated();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create post");
            }
        } catch (error) {
            console.error("Create post error:", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create a Post</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px] transition-all"
                />

                {showImageInput && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Image URL (Optional)
                        </label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-3">
                    <button
                        type="button"
                        onClick={() => setShowImageInput(!showImageInput)}
                        className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg transition-colors ${showImageInput
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Add Image
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !content.trim()}
                        className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}
