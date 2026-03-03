"use client";

import { useState, useEffect } from "react";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import { Loader2, Rss } from "lucide-react";

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch User
            const userRes = await fetch("/api/auth/me");
            if (userRes.ok) {
                const userData = await userRes.json();
                setCurrentUser(userData.user);
            }

            // Fetch Posts
            const postsRes = await fetch("/api/posts");
            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(postsData.posts);
            }
        } catch (error) {
            console.error("Fetch data error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-2xl mx-auto py-6 px-4">
            <div className="flex items-center space-x-3 mb-8">
                <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
                    <Rss className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Community Feed</h1>
            </div>

            <CreatePost onPostCreated={fetchData} />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 animate-pulse">Loading community updates...</p>
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map((post: any) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUser?.id}
                            onUpdate={fetchData}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Rss className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No posts yet.</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Be the first to share something with the community!</p>
                </div>
            )}
        </div>
    );
}
