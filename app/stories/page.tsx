import Link from "next/link";

type StoryGroup = {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  stories: {
    id: string;
    content?: string | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
    createdAt?: string;
    isViewed?: boolean;
  }[];
  hasUnviewed: boolean;
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getStories(): Promise<StoryGroup[]> {
  try {
    const res = await fetch(`${baseUrl}/api/stories`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function StoriesPage() {
  const storyGroups = await getStories();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Stories</h1>

        <Link
          href="/stories/create"
          className="bg-emerald-600 text-white px-3 py-1 rounded"
        >
          + Créer
        </Link>
      </div>

      {storyGroups.length === 0 ? (
        <p className="text-gray-500">Aucune story disponible</p>
      ) : (
        <div className="space-y-4">
          {storyGroups.map((group) => (
            <div key={group.author.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={group.author.image || "https://i.pravatar.cc/100"}
                  className="w-10 h-10 rounded-full"
                  alt="avatar"
                />
                <span className="font-semibold">
                  {group.author.name || "Utilisateur"}
                </span>
                {group.hasUnviewed && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Nouveau
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {group.stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block"
                  >
                    {story.imageUrl && (
                      <img
                        src={story.imageUrl}
                        className="rounded-lg mb-2 w-full"
                        alt=""
                      />
                    )}

                    {story.content && (
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {story.content}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}