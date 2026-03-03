import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Share2, Clock, User, Heart, Trash2, Edit2, Loader2, MoreVertical } from "lucide-react";

interface Post {
    id: string;
    content: string;
    imageUrl?: string | null;
    shares: number;
    createdAt: string;
    authorId: string;
    author: {
        id: string;
        name: string;
        image?: string | null;
    };
    likeCount: number;
    isLiked: boolean;
}

export default function PostCard({ post, currentUserId, onUpdate }: { post: Post; currentUserId?: string; onUpdate: () => void }) {
    const [isLiking, setIsLiking] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const isAuthor = currentUserId === post.authorId;

    const handleLike = async () => {
        if (!currentUserId) {
            alert("Please login to like posts");
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
            if (res.ok) {
                onUpdate();
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to like post");
            }
        } catch (error) {
            console.error("Like error:", error);
            alert("Something went wrong while liking");
        } finally {
            setIsLiking(false);
        }
    };

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            // Increment share count in DB
            await fetch(`/api/posts/${post.id}/share`, { method: "POST" });

            // Open WhatsApp
            const text = encodeURIComponent(`Check out this post: ${post.content}`);
            const url = `https://wa.me/?text=${text}`;
            window.open(url, "_blank");

            onUpdate();
        } catch (error) {
            console.error("Share error:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
            if (res.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                            {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                            {post.author.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {isAuthor && (
                        <div className="relative">
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {showOptions && (
                                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-10 py-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                                    >
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        <span>Delete Post</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-gray-800 dark:text-gray-200 text-base mb-4 whitespace-pre-wrap">
                {post.content}
            </div>

            {post.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-4">
                    <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full h-auto object-cover max-h-96"
                    />
                </div>
            )}

            <div className="pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`group flex items-center space-x-2 text-sm font-medium transition-colors ${post.isLiked
                            ? "text-pink-600"
                            : "text-gray-500 hover:text-pink-600 dark:text-gray-400"
                            }`}
                    >
                        <div className={`p-2 rounded-full transition-colors ${post.isLiked ? "bg-pink-50 dark:bg-pink-900/20" : "group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20"
                            }`}>
                            <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                        </div>
                        <span>{post.likeCount}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="group flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                    >
                        <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <span>{post.shares}</span>
                    </button>
                </div>

                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Live Update
                </div>
            </div>
        </div>
    );
}
