import Link from "next/link";

type Story = {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  author?: {
    name?: string | null;
    image?: string | null;
  } | null;
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getStories(): Promise<Story[]> {
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
  const stories = await getStories();

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

      {stories.length === 0 ? (
        <p className="text-gray-500">Aucune story disponible</p>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="block bg-white rounded-xl shadow p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={story.author?.image || "https://i.pravatar.cc/100"}
                  className="w-8 h-8 rounded-full"
                  alt="avatar"
                />
                <span className="font-semibold">
                  {story.author?.name || "Utilisateur"}
                </span>
              </div>

              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  className="rounded-lg mb-2"
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
      )}
    </div>
  );
}