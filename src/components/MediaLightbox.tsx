'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { MediaPost } from '@/types/media';
import { Button } from './ui/button';

interface MediaLightboxProps {
  post: MediaPost;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ post, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const images = post.type === 'carousel' && post.images ? post.images : [post.images?.[0]];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    // Pause video on close
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [onClose]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying((prev) => !prev);
  };

  const renderContent = () => {
    if (post.type === 'video') {
      return (
        <div className="relative max-w-4xl max-h-[80vh] mx-auto">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={post.videoUrl}
              className="max-w-full max-h-[80vh] object-contain"
              controls={false}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            {/* Video overlay */}
            {!isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={toggleVideo}
                  variant="secondary"
                  size="lg"
                  className="bg-white/90 hover:bg-white text-black rounded-full p-4"
                >
                  <Play className="h-8 w-8 fill-current" />
                </Button>
              </div>
            )}
            {isVideoPlaying && (
              <div className="absolute top-4 right-4">
                <Button
                  onClick={toggleVideo}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-black rounded-full p-2"
                >
                  <Pause className="h-5 w-5" />
                </Button>
              </div>
            )}
            {/* Video status */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
              {isVideoPlaying ? 'Playing' : 'Paused'} • {post.date}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative max-w-4xl max-h-[80vh] mx-auto">
        <img
          src={images[currentImageIndex]}
          alt={`Image ${currentImageIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-notion-lg"
        />
        
        {/* Image navigation for carousel */}
        {post.type === 'carousel' && images.length > 1 && (
          <>
            <Button
              onClick={previousImage}
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={nextImage}
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
              {currentImageIndex + 1} / {images.length} • {post.date}
            </div>
          </>
        )}
        
        {/* Single image date */}
        {post.type === 'image' && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
            {post.date}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="secondary"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-black rounded-full p-2"
      >
        <X className="h-5 w-5" />
      </Button>
      
      {/* Content */}
      <div className="w-full h-full flex items-center justify-center p-4">
        {renderContent()}
      </div>
      
      {/* Background click to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};