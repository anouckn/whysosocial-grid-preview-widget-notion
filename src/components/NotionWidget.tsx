"use client";

import { MediaPost } from "@/types/media";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { MediaGrid } from "./MediaGrid";
import { MediaLightbox } from "./MediaLightbox";
import { TooltipProvider } from "./ui/tooltip";

export function NotionWidget() {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [aspectRatio] = useState<"1:1" | "4:5">("4:5");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<MediaPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    const searchParams = new URLSearchParams(window.location.search);
    const databaseId = searchParams.get("db");
    const token = searchParams.get("token");

    if (!databaseId || !token) {
      setError("Missing database ID or token in the URL.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/media?db=${databaseId}&token=${token}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      if (data.length === 0) {
        setError("No posts found in Notion database.");
      } else {
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to connect to Notion. Please check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    await fetchPosts();
  };

  const handlePostClick = (post: MediaPost) => {
    setSelectedPost(post);
  };

  const handleCloseLightbox = () => {
    setSelectedPost(null);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <TooltipProvider>
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 ">
          <div className="flex-1 flex justify-center">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#ebebeb] text-[#606060] rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium "
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              RELOAD
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-center font-medium">
            {error}
          </div>
        )}

        {/* Media Grid */}
        <MediaGrid
          posts={posts}
          aspectRatio={aspectRatio}
          onPostClick={handlePostClick}
        />

        {/* Lightbox */}
        {selectedPost && (
          <MediaLightbox post={selectedPost} onClose={handleCloseLightbox} />
        )}

        {/* Footer */}
        <div className="mt-2 text-center">
          <p className="text-xs text-[#D4D4D4] italic">widget by @whysosocial.me</p>
        </div>
      </div>
    </TooltipProvider>
  );
}
