"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StoryViewer() {
  const { id } = useParams();

  const router = useRouter();

  const [story, setStory] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(5000); // Default 5s for images
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadStory();
  }, [id]);

  useEffect(() => {
    if (!story) return;

    // Mark as viewed
    fetch(`/api/stories/${id}/view`, { method: "POST" });

    // If video, use video duration
    if (story.videoUrl && videoRef.current) {
      const handleVideoEnd = () => {
        console.log("Video ended, navigating to next story");
        if (story.nextStoryId) {
          router.push(`/stories/${story.nextStoryId}`);
        } else {
          router.back();
        }
      };

      const handleVideoLoad = () => {
        const videoDuration = videoRef.current?.duration || 5000;
        setDuration(videoDuration * 1000); // Convert to ms
        console.log("Video loaded, duration:", videoDuration);
      };

      videoRef.current.addEventListener('loadedmetadata', handleVideoLoad);
      videoRef.current.addEventListener('ended', handleVideoEnd);

      // Update progress during video playback
      const progressInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.duration) {
          const videoProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setProgress(videoProgress);
        }
      }, 50);

      return () => {
        clearInterval(progressInterval);
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleVideoLoad);
          videoRef.current.removeEventListener('ended', handleVideoEnd);
        }
      };
    }

    // Progress animation (only for images)
    if (!story.videoUrl) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (elapsed >= duration) {
          clearInterval(interval);
          if (story.nextStoryId) {
            router.push(`/stories/${story.nextStoryId}`);
          } else {
            router.back();
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [story, duration, id, router]);

  async function loadStory() {
    const res = await fetch(`/api/stories/${id}`);
    const data = await res.json();
    setStory(data);
  }

  if (!story)
    return (
      <div className="h-screen bg-black" />
    );

  return (
    <div className="fixed inset-0 bg-black z-50">

      <div className="absolute top-4 left-4 right-4">

        <div className="h-1 bg-white/20 rounded">

          <div
            className="h-1 bg-white transition-all duration-50"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

      <div className="h-full flex items-center justify-center">

        {story.imageUrl && (
          <img
            src={story.imageUrl}
            alt=""
            className="max-h-full object-contain"
          />
        )}

        {story.videoUrl && (
          <video
            ref={videoRef}
            src={story.videoUrl}
            autoPlay
            className="max-h-full"
          />
        )}

      </div>

    </div>
  );
}