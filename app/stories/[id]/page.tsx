"use client";

import { useEffect, useState, useRef, use } from "react";
import { useParams, useRouter } from "next/navigation";
import ReportButton from "@/components/moderation/ReportButton";

export default function StoryViewer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const id = resolvedParams.id;

  const [story, setStory] = useState<any>(null);
  const [allStories, setAllStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) return;
    loadStories();
  }, [id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  async function loadStories() {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      
      console.log("Stories API response:", data);
      
      // Flatten all stories from groups
      const flattenedStories = data.flatMap((group: any) => group.stories);
      console.log("Flattened stories:", flattenedStories);
      setAllStories(flattenedStories);
      
      // Find current story index
      const index = flattenedStories.findIndex((s: any) => s.id === id);
      console.log("Current story index:", index);
      setCurrentIndex(index >= 0 ? index : 0);
      
      // Load current story
      const storyRes = await fetch(`/api/stories/${id}`);
      const storyData = await storyRes.json();
      console.log("Current story data:", storyData);
      setStory(storyData);
      
      // Record view
      await fetch(`/api/stories/${id}/view`, { method: "POST" });
      
      // Start progression
      startProgression();
    } catch (e) {
      console.error("Error loading stories:", e);
    }
  }

  function startProgression() {
    setIsPaused(false);
    setProgress(0);
    
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    // Progress interval
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 2; // 2% every 100ms = 5 seconds total
      });
    }, 100);
    
    // Auto-advance after 5 seconds
    timerRef.current = setTimeout(() => {
      goToNext();
    }, 5000);
  }

  function pauseProgression() {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }

  function resumeProgression() {
    if (!isPaused) return;
    startProgression();
  }

  function goToNext() {
    if (currentIndex < allStories.length - 1) {
      const nextStory = allStories[currentIndex + 1];
      router.push(`/stories/${nextStory.id}`);
    } else {
      // Close viewer if no more stories
      router.back();
    }
  }

  function goToPrevious() {
    if (currentIndex > 0) {
      const prevStory = allStories[currentIndex - 1];
      router.push(`/stories/${prevStory.id}`);
    }
  }

  function handleClose() {
    router.back();
  }

  function handleLeftClick() {
    goToPrevious();
  }

  function handleRightClick() {
    goToNext();
  }

  if (!story) {
    return <div className="h-screen bg-black flex items-center justify-center text-white">Chargement...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress indicators */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {allStories.map((s, idx) => (
          <div
            key={s.id}
            className={`flex-1 h-1 rounded ${
              idx === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          >
            {idx === currentIndex && (
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-10 pointer-events-auto">
        <div className="flex items-center gap-3">
          <img
            src={story.author?.image || "/default-avatar.png"}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-semibold text-sm">
              {story.author?.name || "Utilisateur"}
            </p>
            <p className="text-white/60 text-xs">
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ReportButton targetId={id} targetType="story" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center transition backdrop-blur-sm"
            aria-label="Close Story Viewer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation zones */}
      <div className="absolute inset-0 flex pointer-events-none">
        <button
          onClick={handleLeftClick}
          className="flex-1 h-full cursor-pointer pointer-events-auto"
          aria-label="Previous Story"
          onMouseEnter={pauseProgression}
          onMouseLeave={resumeProgression}
        />
        <button
          onClick={handleRightClick}
          className="flex-1 h-full cursor-pointer pointer-events-auto"
          aria-label="Next Story"
          onMouseEnter={pauseProgression}
          onMouseLeave={resumeProgression}
        />
      </div>

      {/* Story content */}
      <div className="h-full flex items-center justify-center pointer-events-none">
        {story.imageUrl && (
          <img
            src={story.imageUrl}
            alt=""
            className="max-h-full object-contain"
          />
        )}

        {story.videoUrl && (
          <video
            src={story.videoUrl}
            autoPlay
            controls
            className="max-h-full pointer-events-auto"
            onPlay={pauseProgression}
            onPause={resumeProgression}
            onEnded={goToNext}
          />
        )}

        {story.content && !story.imageUrl && !story.videoUrl && (
          <div className="text-white text-center px-8 pointer-events-auto">
            <p className="text-2xl whitespace-pre-wrap">{story.content}</p>
          </div>
        )}
      </div>

      {/* Text overlay for stories with media */}
      {story.content && (story.imageUrl || story.videoUrl) && (
        <div className="absolute bottom-20 left-4 right-4 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white text-lg whitespace-pre-wrap">{story.content}</p>
          </div>
        </div>
      )}

      {/* Manual navigation buttons (fallback) */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-between">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="bg-black/50 text-white px-4 py-2 rounded-full disabled:opacity-30 hover:bg-black/70 transition"
          aria-label="Previous Story"
        >
          ◀
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === allStories.length - 1}
          className="bg-black/50 text-white px-4 py-2 rounded-full disabled:opacity-30 hover:bg-black/70 transition"
          aria-label="Next Story"
        >
          ▶
        </button>
      </div>
    </div>
  );
}