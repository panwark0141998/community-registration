"use client";

import { useState, useRef } from "react";
import { Send, Image as ImageIcon, Loader2, Camera, X, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset URL input if file is selected
        setImageUrl("");
        setShowImageInput(false);

        // Compress image
        const compressedFile = await compressImage(file);
        setSelectedFile(compressedFile);
        setPreviewUrl(URL.createObjectURL(compressedFile));
    };

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                resolve(file);
                            }
                        },
                        "image/jpeg",
                        0.7 // Compression quality
                    );
                };
            };
        });
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsLoading(true);
        try {
            let finalImageUrl = imageUrl;

            // Handle file upload if a file is selected
            if (selectedFile) {
                const fileName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const { error, path } = await supabase.storage
                    .from('posts_images')
                    .upload(`public/${fileName}`, selectedFile);

                if (error) {
                    throw new Error("Failed to upload image");
                }

                finalImageUrl = supabase.storage.from('posts_images').getPublicUrl(`public/${fileName}`);
            }

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, imageUrl: finalImageUrl }),
            });

            if (res.ok) {
                setContent("");
                setImageUrl("");
                setSelectedFile(null);
                setPreviewUrl(null);
                setShowImageInput(false);
                onPostCreated();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create post");
            }
        } catch (error: any) {
            console.error("Create post error:", error);
            alert(error.message || "Something went wrong");
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

                {/* Preview Section */}
                {previewUrl && (
                    <div className="relative mt-4 group">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-[400px] object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all shadow-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* URL Input */}
                {showImageInput && !previewUrl && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Image URL
                            </label>
                        </div>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={cameraInputRef}
                            onChange={handleFileChange}
                        />

                        {/* Gallery Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center text-sm font-medium px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                        >
                            <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                            Gallery
                        </button>

                        {/* Camera Button */}
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex items-center text-sm font-medium px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                        >
                            <Camera className="w-4 h-4 mr-2 text-emerald-500" />
                            Camera
                        </button>

                        {/* URL Toggle Button */}
                        {!previewUrl && (
                            <button
                                type="button"
                                onClick={() => setShowImageInput(!showImageInput)}
                                className={`flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-all border shadow-sm ${showImageInput
                                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-100 dark:border-slate-700"
                                    }`}
                            >
                                <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                                URL
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (!content.trim() && !selectedFile && !imageUrl)}
                        className="flex items-center px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}
