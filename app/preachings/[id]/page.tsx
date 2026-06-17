"use client";

import { useEffect, useState } from "react";
import { Play, Heart, Share2, MessageCircle, Clock, Eye, BookOpen, Edit3, Save, X } from "lucide-react";
import type { Preaching, PreachingNote, PreachingComment, PreachingVerse } from "@/types/preaching";

export default function PreachingPage({ params }: { params: { id: string } }) {
  const [preaching, setPreaching] = useState<Preaching | null>(null);
  const [notes, setNotes] = useState<PreachingNote[]>([]);
  const [comments, setComments] = useState<PreachingComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchPreaching();
    fetchNotes();
    fetchComments();
  }, [params.id]);

  const fetchPreaching = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}`);
      const data = await res.json();
      setPreaching(data);
    } catch (error) {
      console.error("Error fetching preaching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/notes`);
      const data = await res.json();
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/comments`);
      const data = await res.json();
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/likes`, {
        method: "POST",
      });
      if (res.ok) {
        setPreaching((prev) => prev ? { ...prev, isLiked: true } : null);
      }
    } catch (error) {
      console.error("Error liking preaching:", error);
    }
  };

  const handleUnlike = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/likes`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPreaching((prev) => prev ? { ...prev, isLiked: false } : null);
      }
    } catch (error) {
      console.error("Error unliking preaching:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/bookmarks`, {
        method: "POST",
      });
      if (res.ok) {
        setPreaching((prev) => prev ? { ...prev, isBookmarked: true } : null);
      }
    } catch (error) {
      console.error("Error bookmarking preaching:", error);
    }
  };

  const handleRemoveBookmark = async () => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/bookmarks`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPreaching((prev) => prev ? { ...prev, isBookmarked: false } : null);
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`/api/preachings/${params.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes([...notes, data]);
        setNewNote("");
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/preachings/${params.id}/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes(notes.filter((note) => note.id !== noteId));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/preachings/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([data, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!preaching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Prédication non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Video Player Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center">
            <Play size={96} className="text-white opacity-80" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{preaching.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                {preaching.author?.image && (
                  <img
                    src={preaching.author.image || "/default-avatar.png"}
                    alt={preaching.author.name || ""}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{preaching.author?.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(preaching.publishedAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{preaching.views} vues</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{formatDuration(preaching.duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={preaching.isLiked ? handleUnlike : handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    preaching.isLiked
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Heart
                    size={20}
                    className={preaching.isLiked ? "fill-current" : ""}
                  />
                  <span>{preaching._count?.likes || 0}</span>
                </button>
                <button
                  onClick={preaching.isBookmarked ? handleRemoveBookmark : handleBookmark}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <BookOpen size={20} />
                  <span>{preaching.isBookmarked ? "Sauvegardé" : "Sauvegarder"}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <Share2 size={20} />
                  <span>Partager</span>
                </button>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{preaching.description}</p>

              {/* Verses */}
              {preaching.verses && preaching.verses.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">Versets bibliques</h3>
                  <div className="space-y-3">
                    {preaching.verses?.map((verse: PreachingVerse) => (
                      <div
                        key={verse.id}
                        className="bg-gradient-to-r from-emerald-50 to-purple-50 p-4 rounded-xl"
                      >
                        <p className="font-medium text-emerald-700 mb-1">
                          {verse.book} {verse.chapter}:{verse.verse}
                        </p>
                        <p className="text-gray-700 italic">{verse.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Edit3 size={20} />
                    Mes notes
                  </h3>
                  <button
                    onClick={() => setIsNotesOpen(!isNotesOpen)}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    {isNotesOpen ? "Fermer" : "Voir toutes"}
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Ajouter une note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Save size={18} />
                  </button>
                </div>

                {isNotesOpen && notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl"
                      >
                        <p className="flex-1 text-gray-700">{note.content}</p>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.slice(0, 2).map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 p-3 rounded-xl text-gray-700"
                      >
                        {note.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune note pour le moment</p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle size={20} />
                Commentaires ({comments.length})
              </h3>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  Envoyer
                </button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.user?.image && (
                      <img
                        src={comment.user.image || "/default-avatar.png"}
                        alt={comment.user.name || ""}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="font-semibold text-gray-900 text-sm">
                          {comment.user?.name}
                        </p>
                        <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{formatDate(comment.createdAt)}</span>
                        <button className="hover:text-emerald-600">Répondre</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {/* Series Info */}
              {preaching.series && (
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Série</h3>
                  <div className="flex gap-3">
                    {preaching.series.thumbnail && (
                      <img
                        src={preaching.series.thumbnail}
                        alt={preaching.series.title}
                        className="w-24 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {preaching.series.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {preaching.series._count?.preachings} messages
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Catégorie</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preaching.category?.icon}</span>
                  <p className="text-gray-700">{preaching.category?.name}</p>
                </div>
              </div>

              {/* More from Author */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Plus de {preaching.author?.name}
                </h3>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chargement...</p>
                </div>
              </div>

              {/* Related Preachings */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">À voir aussi</h3>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chargement...</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
