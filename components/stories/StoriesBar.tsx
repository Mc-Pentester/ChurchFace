"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Story = {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  isViewed: boolean;
};

type StoryGroup = {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  stories: Story[];
  hasUnviewed: boolean;
};

export default function StoriesBar() {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      setStoryGroups(data);
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
              className="w-24 h-36 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3">
      <div className="flex gap-4 overflow-x-auto">

        {/* Create Story Card */}
        <Link
          key="create-story"
          href="/stories/create"
          className="flex flex-col items-center flex-shrink-0"
          aria-label="Create Story"
        >
          <div className="w-24 h-36 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-4xl mb-2">+</div>
            <span className="text-sm font-medium">Créer</span>
            <span className="text-xs">Story</span>
          </div>
        </Link>

        {/* Story Groups */}
        {storyGroups.map((group) => {
          const isCurrentUser = currentUserId === group.author.id;
          const firstStory = group.stories[0];
          
          return (
            <Link
              key={group.author.id}
              href={`/stories/${firstStory.id}`}
              className="flex flex-col items-center flex-shrink-0 relative"
              aria-label={`View ${group.author.name}'s stories`}
            >
              {/* Portrait card */}
              <div 
                className={`w-24 h-36 rounded-xl relative overflow-hidden ${
                  group.hasUnviewed 
                    ? 'ring-2 ring-pink-500 ring-offset-2' 
                    : 'ring-2 ring-gray-300 ring-offset-2'
                }`}
              >
                {/* Story media background */}
                {firstStory.imageUrl ? (
                  <img
                    src={firstStory.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : firstStory.videoUrl ? (
                  <div className="w-full h-full bg-gray-900 relative">
                    <video
                      src={firstStory.videoUrl}
                      className="w-full h-full object-cover opacity-60"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-white text-2xl">📝</span>
                  </div>
                )}

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* User info overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                  <img
                    src={group.author.image || "/default-avatar.png"}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {isCurrentUser ? 'Vous' : group.author.name}
                    </p>
                  </div>
                </div>

                {/* Unseen indicator */}
                {group.hasUnviewed && !isCurrentUser && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}