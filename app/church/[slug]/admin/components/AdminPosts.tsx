import { prisma } from "@/lib/prisma";

interface AdminPostsProps {
  churchId: string;
  churchSlug: string;
}

export default async function AdminPosts({ churchId, churchSlug }: AdminPostsProps) {
  const posts = await prisma.churchPost.findMany({
    where: { churchId },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Publications</h2>
        <a
          href={`/church/${churchSlug}/admin/posts/create`}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
        >
          Créer une publication
        </a>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune publication pour le moment</p>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {post.content && (
                    <p className="text-gray-900 mb-3">{post.content}</p>
                  )}
                  {post.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="w-full max-w-md rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>❤️ {post._count.likes}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-500 hover:text-emerald-600 transition">
                    ✏️
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 transition">
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
