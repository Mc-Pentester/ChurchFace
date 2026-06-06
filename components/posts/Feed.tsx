"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import ShareMenu from "./ShareMenu";


/**
 * ================= TYPES =================
 */
type Post = {
  id: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: string;
  hashtags?: string[];

  author?: {
    id: string;
    name: string;
  };

  comments?: Comment[];
  likes?: { userId: string }[];
  shares?: { userId: string }[];
};

type Comment = {
  id?: string;
  postId: string;
  content: string;
  user: string;
  parentId?: string | null;
  replies?: Comment[];
};

type RawComment = {
  postId: string;
  content: string;
  user?: {
    name?: string | null;
  } | null;
};

type UploadedFile = {
  ufsUrl?: string;
  url?: string;
  fileUrl?: string;
  contentType?: string;
  type?: string;
  mimeType?: string;
};

/**
 * ================= FEED =================
 */
export default function Feed() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaIsVideo, setMediaIsVideo] = useState(false);

  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const isAuth = status === "authenticated" && !!session?.user;

  /**
   * ================= HELPERS =================
   */
  const normalizeComments = (items: any[] = []): Comment[] =>
    items.map((c) => ({
      id: c.id,
      postId: c.postId,
      content: c.content,
      user: c.user?.name || "Utilisateur",
      parentId: c.parentId || null,
      replies: c.replies ? normalizeComments(c.replies) : undefined,
    }));

  const mergePosts = (incoming: Post[]) => {
    setPosts((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const next = [...prev];

      for (const item of incoming) {
        if (!seen.has(item.id)) {
          next.push({
            ...item,
            shares: item.shares || [],
            likes: item.likes || [],
          });
        }
      }
      return next;
    });
  };

  /**
   * ================= LOAD POSTS =================
   */
  const loadPosts = async (mode: "reset" | "more" = "reset") => {
    try {
      const cursorParam =
        mode === "more" && nextCursor
          ? `&cursor=${encodeURIComponent(nextCursor)}`
          : "";

      const res = await fetch(`/api/posts?limit=10${cursorParam}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("POSTS API ERROR:", data);

        if (mode === "reset") {
          setPosts([]);
          setCommentsByPost({});
          setHasMore(false);
          setNextCursor(null);
        }
        return;
      }

      const postsArray: Post[] = Array.isArray(data?.posts)
        ? data.posts
        : [];

      const safePosts = postsArray.map((p) => ({
        ...p,
        shares: p.shares || [],
        likes: p.likes || [],
        comments: p.comments || [],
      }));

      const nextComments: Record<string, Comment[]> = {};

      for (const p of safePosts) {
        nextComments[p.id] = normalizeComments(p.comments as any);
      }

      if (mode === "reset") {
        setPosts(safePosts);
        setCommentsByPost(nextComments);
      } else {
        mergePosts(safePosts);
        setCommentsByPost((prev) => ({ ...prev, ...nextComments }));
      }

      setHasMore(Boolean(data?.hasMore));
      setNextCursor(data?.nextCursor || null);
    } catch (err) {
      console.error("LOAD POSTS ERROR:", err);
    }
  };

  useEffect(() => {
    loadPosts("reset");
  }, []);

  /**
   * ================= CREATE POST =================
   */
  const createPost = async () => {
    if (!isAuth) return;
    if (!text.trim() && !mediaUrl.trim()) return;
    if (isSubmittingPost) return;

    setIsSubmittingPost(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          imageUrl: mediaIsVideo ? null : mediaUrl,
          videoUrl: mediaIsVideo ? mediaUrl : null,
        }),
      });

      if (!res.ok) {
        console.error("CREATE POST ERROR:", await res.text());
        return;
      }

      const data = await res.json();
      const post: Post = data.post;

      if (post?.id) {
        setPosts((prev) => [
          {
            ...post,
            shares: post.shares || [],
            likes: post.likes || [],
          },
          ...prev,
        ]);

        setCommentsByPost((prev) => ({
          [post.id]: normalizeComments(post.comments as any),
          ...prev,
        }));
      } else {
        await loadPosts("reset");
      }

      setText("");
      setMediaUrl("");
      setMediaIsVideo(false);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  /**
   * ================= COMMENT =================
   */
  const sendComment = async (
    postId: string,
    value: string,
    setValue: (v: string) => void
  ) => {
    if (!isAuth) return;

    const content = value.trim();
    if (!content) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      if (!res.ok) return;

      const created = await res.json();

      const newComment: Comment = {
        id: created.id,
        postId: created.postId,
        content: created.content,
        user: created.user,
      };

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));

      setValue("");
    } catch (err) {
      console.error("COMMENT ERROR:", err);
    }
  };

  /**
   * ================= REPLY =================
   */
  const sendReply = async (
    postId: string,
    parentId: string,
    value: string,
    setValue: (v: string) => void
  ) => {
    if (!isAuth) return;

    const content = value.trim();
    if (!content) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
          parentId,
        }),
      });

      if (!res.ok) return;

      const created = await res.json();

      const newReply: Comment = {
        id: created.id,
        postId: created.postId,
        content: created.content,
        user: created.user,
        parentId: created.parentId,
      };

      setCommentsByPost((prev) => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), newReply] }
              : c
          ),
        };
      });

      setValue("");
    } catch (err) {
      console.error("REPLY ERROR:", err);
    }
  };

  /**
   * ================= LIKE =================
   */
  const handleLike = async (postId: string) => {
    if (!isAuth) return;
    if (!postId) {
      console.error("Missing postId");
      return;
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("LIKE ERROR:", data);
        return;
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: data.liked
                  ? [...(p.likes || []), { userId: session?.user?.id || "" }]
                  : (p.likes || []).filter((l) => l.userId !== session?.user?.id),
              }
            : p
        )
      );
    } catch (err) {
      console.error("LIKE ERROR:", err);
    }
  };

  /**
   * ================= SHARE =================
   */
  const handleShare = async (postId: string) => {
  if (!isAuth) return;
  if (!postId) {
    console.error("Missing postId");
    return;
  }

  try {
    const res = await fetch(`/api/posts/${postId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("SHARE ERROR:", data);
      return;
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              shares: data.shared
                ? [
                    ...(p.shares || []),
                    { userId: session?.user?.id || "" },
                  ]
                : (p.shares || []).filter(
                    (s) => s.userId !== session?.user?.id
                  ),
            }
          : p
      )
    );
  } catch (err) {
    console.error("SHARE ERROR:", err);
  }
};

  /**
   * ================= UI =================
   */
  return (
    <div className="space-y-8">

      {/* CREATE POST */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Exprime-toi en Christ ✨"
          className="w-full bg-gray-50 p-4 rounded-xl outline-none resize-none"
        />

        <div className="flex items-center gap-3 mt-4">

          <UploadButton
            endpoint="mediaUploader"
            onClientUploadComplete={(res: any[]) => {
              const file = res?.[0];
              const url = file?.ufsUrl || file?.url || file?.fileUrl || "";

              if (!url) return;

              // UploadThing retourne désormais le type MIME dans file.type
              const type = (file?.type || "").toLowerCase();

              // Fallback sur l'URL si le type est absent
              const cleanUrl = url.split("?")[0].toLowerCase();
              const videoExts = /\.(mp4|mov|webm|ogg|mkv|avi|m4v|flv)$/;

              const isVideo =
                type.startsWith("video/") ||
                videoExts.test(cleanUrl);

              setMediaUrl(url);
              setMediaIsVideo(isVideo);
            }}
          />

          <button
            onClick={createPost}
            disabled={!isAuth || isSubmittingPost}
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white"
          >
            {isSubmittingPost ? "Publication..." : "Publier"}
          </button>

        </div>

        {/* MEDIA PREVIEW */}
        {mediaUrl && (
          <div className="mt-4 relative">
            {mediaIsVideo ? (
              <video
                src={mediaUrl}
                controls
                preload="metadata"
                playsInline
                className="rounded-xl w-full max-h-96 object-contain bg-black"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Aperçu"
                className="rounded-xl w-full max-h-96 object-contain bg-gray-100"
              />
            )}
            <button
              onClick={() => {
                setMediaUrl("");
                setMediaIsVideo(false);
              }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full transition"
            >
              ✕ Retirer
            </button>
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
              {mediaIsVideo ? "🎬 Vidéo" : "🖼️ Image"}
            </span>
          </div>
        )}
      </div>

      {/* POSTS */}
      {posts.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">

          {/* AUTHOR */}
          <div className="font-semibold text-emerald-700">
            {p.author?.name || "Utilisateur"}
          </div>

          {/* CONTENT */}
          <p>{p.content}</p>

          {/* HASHTAGS */}
          {p.hashtags && p.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-emerald-600 text-sm bg-emerald-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-emerald-100"
                  onClick={() => router.push(`/search?q=%23${encodeURIComponent(tag)}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* MEDIA */}
          {p.videoUrl ? (
            <video
              src={p.videoUrl}
              controls
              preload="metadata"
              playsInline
              className="rounded-xl w-full max-h-[600px] object-cover"
            />
          ) : p.imageUrl ? (
            <img src={p.imageUrl} alt="" className="rounded-xl w-full" />
          ) : null}

          {/* ACTIONS */}
          <div className="flex gap-4 text-sm pt-2 border-t">

            <button
              onClick={() => handleLike(p.id)}
              className="text-gray-600 hover:text-red-600"
            >
              {p.likes?.some((l) => l.userId === session?.user?.id) ? "❤️" : "🤍"} ({p.likes?.length || 0})
            </button>

            <ShareMenu
              postId={p.id}
              postContent={p.content}
              onInternalShare={() => handleShare(p.id)}
            />

          </div>

          {/* COMMENTS */}
          <CommentBox
            postId={p.id}
            comments={commentsByPost[p.id] || []}
            sendComment={sendComment}
            sendReply={sendReply}
            isAuth={isAuth}
          />

        </div>
      ))}

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={() => loadPosts("more")}
          disabled={isLoadingMore}
          className="mx-auto block px-4 py-2 bg-white border rounded-xl"
        >
          Charger plus
        </button>
      )}
    </div>
  );
}

/**
 * ================= COMMENT ITEM =================
 */
function CommentItem({
  comment,
  postId,
  sendReply,
  isAuth,
}: {
  comment: Comment;
  postId: string;
  sendReply: (postId: string, parentId: string, value: string, setValue: (v: string) => void) => void;
  isAuth: boolean;
}) {
  const [replyValue, setReplyValue] = useState("");
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="text-sm space-y-1">
      <div>
        <b>{comment.user}</b> {comment.content}
      </div>

      {isAuth && (
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-xs text-gray-500 hover:text-emerald-600"
        >
          {showReply ? "Annuler" : "Répondre"}
        </button>
      )}

      {showReply && (
        <div className="flex gap-2 pl-4">
          <input
            value={replyValue}
            onChange={(e) => setReplyValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && replyValue.trim() && comment.id) {
                sendReply(postId, comment.id, replyValue, setReplyValue);
                setShowReply(false);
              }
            }}
            className="flex-1 bg-gray-100 p-2 rounded-xl text-sm"
            placeholder="Répondre..."
          />
          <button
            onClick={() => {
              if (comment.id && replyValue.trim()) {
                sendReply(postId, comment.id, replyValue, setReplyValue);
                setShowReply(false);
              }
            }}
            disabled={!replyValue.trim() || !comment.id}
            className="text-emerald-600 text-sm disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 border-l-2 border-gray-200 space-y-1">
          {comment.replies.map((reply, idx) => (
            <div key={idx} className="text-sm">
              <b>{reply.user}</b> {reply.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ================= COMMENT BOX =================
 */
function CommentBox({
  postId,
  comments,
  sendComment,
  sendReply,
  isAuth,
}: any) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">

      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!isAuth}
          className="flex-1 bg-gray-100 p-2 rounded-xl"
          placeholder="Commenter..."
        />

        <button
          onClick={() => sendComment(postId, value, setValue)}
          disabled={!isAuth}
          className="text-emerald-600"
        >
          Envoyer
        </button>
      </div>

      {comments.map((c: any, i: number) => (
        <CommentItem
          key={i}
          comment={c}
          postId={postId}
          sendReply={sendReply}
          isAuth={isAuth}
        />
      ))}

    </div>
  );
}