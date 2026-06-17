"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReportButton from "../moderation/ReportButton";

type Story = {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;

  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export default function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const res = await fetch("/api/stories");

      const data = await res.json();

      setStories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-3">
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3">
      <div className="flex gap-4 overflow-x-auto">

        <Link
          href="/stories/create"
          className="flex flex-col items-center flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl">
            +
          </div>

          <span className="text-xs mt-1">
            Story
          </span>
        </Link>

        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/stories/${story.id}`}
            className="flex flex-col items-center flex-shrink-0 relative"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">

              <img
                src={
                  story.author.image ||
                  story.imageUrl ||
                  "/default-avatar.png"
                }
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <span className="text-xs truncate w-16 text-center mt-1">
              {story.author.name}
            </span>
            
            <div className="absolute -top-1 -right-1">
              <ReportButton targetId={story.id} targetType="story" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}