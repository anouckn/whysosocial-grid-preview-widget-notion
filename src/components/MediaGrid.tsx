"use client";

import { MediaPost } from "@/types/media";
import { ChevronLeft, ChevronRight, Images, CameraOff } from "lucide-react";
import { useRef, useState } from "react";

interface MediaGridProps {
  posts: MediaPost[];
  aspectRatio: "1:1" | "4:5";
  onPostClick: (post: MediaPost) => void;
}

export function MediaGrid({ posts, aspectRatio, onPostClick }: MediaGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  // Track current image index for each carousel post by post ID
  const [carouselIndexes, setCarouselIndexes] = useState<{ [postId: string]: number }>({});

  const getAspectRatioClass = () => {
    return aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/5]";
  };

  const handleCarouselChange = (postId: string, imagesLength: number, direction: "prev" | "next") => {
    setCarouselIndexes((prev) => {
      const current = prev[postId] || 0;
      let nextIndex = direction === "prev" ? current - 1 : current + 1;
      if (nextIndex < 0) nextIndex = imagesLength - 1;
      if (nextIndex >= imagesLength) nextIndex = 0;
      return { ...prev, [postId]: nextIndex };
    });
  };

  const renderMediaIcon = (post: MediaPost) => {
    switch (post.type) {
      case "video":
        return (
          <div className="absolute top-2 right-2 flex items-center justify-center">
            <img src="/icons/reel-video.png" alt="video" className="size-4" />
          </div>
        );
      case "carousel":
        return (
          <div className="absolute top-2 right-2 items-center justify-center">
            <Images className="size-4 text-white" strokeWidth={2.5} />
          </div>
        );
      default:
        return null;
    }
  };

  const renderPlayButton = (post: MediaPost) => {
    if (post.type === "video") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/icons/play-video.png" alt="play" className="size-10" />
        </div>
      );
    }
    return null;
  };

  // Accept onPrev and onNext callbacks, and prevent event bubbling
  const renderCarouselIndicators = (post: MediaPost, onPrev: () => void, onNext: () => void) => {
    if (post.type === "carousel" && post.images && post.images.length > 1) {
      return (
        <>
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <button
              className="size-6 border-2 border-[#ebebeb] rounded-full flex items-center justify-center"
              onClick={e => { e.stopPropagation(); onPrev(); }}
              tabIndex={0}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-[#ebebeb]" />
            </button>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button
              className="size-6 border-2 border-[#ebebeb] rounded-full flex items-center justify-center"
              onClick={e => { e.stopPropagation(); onNext(); }}
              tabIndex={0}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-[#ebebeb]" />
            </button>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Grid Container */}
      <div
        ref={gridRef}
        className="overflow-y-auto"
        style={{ maxHeight: "1045px" }}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {posts.map((post) => {
            const hasMedia = (post.type === "video" && post.videoUrl) || (post.images && post.images.length > 0);
            // For carousel, get current image index
            const currentIndex = post.type === "carousel" ? (carouselIndexes[post.id] || 0) : 0;
            return (
              <div
                key={post.id}
                className={`group ${hasMedia ? "cursor-pointer" : ""}`}
                onClick={hasMedia ? () => onPostClick(post) : undefined}
              >
                <div
                  className={`${getAspectRatioClass()} relative overflow-hidden  bg-gray-200 shadow-sm hover:shadow-md transition-shadow`}
                >
                  {post.type === "video" ? (
                    post.videoUrl ? (
                      <video
                        src={post.videoUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#ebebeb] relative">
                        {/* <CameraOff className="absolute top-2 right-2 size-5 text-white" strokeWidth={2.5} /> */}
                      </div>
                    )
                  ) : (
                    post.type === "carousel" && post.images?.length ? (
                      <img
                        src={post.images[currentIndex]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : post.images?.[0] ? (
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#ebebeb] relative">
                        <CameraOff className="absolute top-2 right-2 size-5 text-white" strokeWidth={2.5} />
                      </div>
                    )
                  )}
                  {/* Date Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 text-white text-xs rounded-full font-bold">
                    {post.date}
                  </div>
                  {/* Media Type Icon */}
                  {renderMediaIcon(post)}
                  {/* Play Button Overlay */}
                  {renderPlayButton(post)}
                  {/* Carousel Indicators */}
                  {renderCarouselIndicators(
                    post,
                    () => handleCarouselChange(post.id, post.images?.length || 0, "prev"),
                    () => handleCarouselChange(post.id, post.images?.length || 0, "next")
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Fill remaining slots with camera-off icons */}
          {Array.from({ length: Math.max(0, 12 - posts.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="group">
              <div className={`${getAspectRatioClass()} relative overflow-hidden bg-[#ebebeb] shadow-sm`}>
                <CameraOff className="absolute top-2 right-2 size-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
