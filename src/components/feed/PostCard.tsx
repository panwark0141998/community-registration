import { formatDistanceToNow } from "date-fns";
import { Share2, Clock, User } from "lucide-react";

interface Post {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    author: {
        name: string;
    };
}

export default function PostCard({ post }: { post: Post }) {
    const shareOnWhatsApp = () => {
        const text = encodeURIComponent(`Check out this post: ${post.content}`);
        const url = `https://wa.me/?text=${text}`;
        window.open(url, "_blank");
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                <button
                    onClick={shareOnWhatsApp}
                    className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                    title="Share on WhatsApp"
                >
                    <Share2 className="w-5 h-5" />
                </button>
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

            <div className="pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-sm text-gray-500">
                <span>Community Update</span>
                <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Live
                </span>
            </div>
        </div>
    );
}
