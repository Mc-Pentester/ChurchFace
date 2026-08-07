"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import PhotoGallery from "@/components/profile/PhotoGallery";
import VideoGallery from "@/components/profile/VideoGallery";
import GoLiveButton from "@/components/mobilelive/GoLiveButton";
import MobileLiveSetup from "@/components/mobilelive/MobileLiveSetup";
import MobileLiveInterface from "@/components/mobilelive/MobileLiveInterface";
import { MobileLiveSession } from "@/lib/mobilelive/MobileLiveTypes";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  coverImage: string | null;
  bio: string | null;
  username: string | null;
  createdAt: string;
};

type FriendshipStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "BLOCKED";

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>("NONE");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [profileLocked, setProfileLocked] = useState(false);
  const [showMobileLiveSetup, setShowMobileLiveSetup] = useState(false);
  const [mobileLiveSession, setMobileLiveSession] = useState<MobileLiveSession | null>(null);

  console.log("UserProfilePage rendered, params.userId:", params.userId, "session:", session);

  useEffect(() => {
    console.log("useEffect triggered, session:", session, "params.userId:", params.userId);
    if (!session) {
      console.log("No session, skipping fetch");
      return;
    }
    fetchUserProfile();
    fetchFriendshipStatus();
    fetchPrivacySettings();
  }, [session, params.userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/${params.userId}`);
      if (!res.ok) {
        router.push("/profile");
        return;
      }
      const data = await res.json();
      console.log("User data:", data.user);
      setUser(data.user);
    } catch (e) {
      console.error(e);
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendshipStatus = async () => {
    try {
      const res = await fetch(`/api/friends/check?userId=${params.userId}`);
      const data = await res.json();
      setFriendshipStatus(data.status || "NONE");
      setFriendshipId(data.friendshipId || null);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const res = await fetch(`/api/profile/privacy`);
      const data = await res.json();
      if (data.privacy) {
        setProfileLocked(data.privacy.profileLocked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: params.userId }),
      });

      if (res.ok) {
        setFriendshipStatus("PENDING_SENT");
        const data = await res.json();
        setFriendshipId(data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const acceptFriendRequest = async () => {
    if (!friendshipId) return;
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      if (res.ok) {
        setFriendshipStatus("ACCEPTED");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unfriend = async () => {
    if (!friendshipId) return;
    if (!confirm("Voulez-vous vraiment supprimer cet ami ?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFriendshipStatus("NONE");
        setFriendshipId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlock = async () => {
    if (!confirm("Voulez-vous vraiment bloquer cet utilisateur ?")) return;

    try {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: params.userId }),
      });

      if (res.ok) {
        setFriendshipStatus("BLOCKED");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessage = () => {
    router.push(`/chat?userId=${params.userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow w-full max-w-md">
            <p className="text-center text-gray-500">Utilisateur non trouvé</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === user.id;

  const handleMobileLiveStart = (sessionId: string) => {
    setShowMobileLiveSetup(false);
    fetch(`/api/mobilelive/session/${sessionId}`)
      .then(res => res.json())
      .then(data => setMobileLiveSession(data))
      .catch(console.error);
  };

  const handleMobileLiveEnd = () => {
    setMobileLiveSession(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div className="p-6">
            <p className="text-gray-500 text-center">Les publications seront affichées ici</p>
          </div>
        );
      case "about":
        return (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
              {user.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900">Bio</h3>
                  <p className="text-gray-600">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        );
      case "friends":
        return (
          <div className="p-6">
            <p className="text-gray-500 text-center">La liste d'amis sera affichée ici</p>
          </div>
        );
      case "photos":
        return (
          <div className="p-6">
            <PhotoGallery userId={user.id} isOwnProfile={isOwnProfile} />
          </div>
        );
      case "videos":
        return (
          <div className="p-6">
            <VideoGallery userId={user.id} isOwnProfile={isOwnProfile} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <Navbar />
      
      <ProfileHeader
        user={user}
        friendshipStatus={friendshipStatus}
        friendshipId={friendshipId}
        isOwnProfile={isOwnProfile}
        profileLocked={profileLocked}
        onSendFriendRequest={sendFriendRequest}
        onAcceptFriendRequest={acceptFriendRequest}
        onUnfriend={unfriend}
        onMessage={handleMessage}
        onBlock={handleBlock}
      />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={isOwnProfile}
        profileLocked={profileLocked}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        <div className="bg-white rounded-xl shadow">{renderTabContent()}</div>
      </div>

      {isOwnProfile && (
        <div className="fixed bottom-6 right-6">
          <GoLiveButton
            context="PERSONAL"
            ownerId={user.id}
            ownerType="USER"
            onOpenSetup={() => setShowMobileLiveSetup(true)}
          />
        </div>
      )}

      {showMobileLiveSetup && (
        <MobileLiveSetup
          context="PERSONAL"
          ownerId={user.id}
          ownerType="USER"
          ownerName={user.name || "User"}
          onClose={() => setShowMobileLiveSetup(false)}
          onStart={handleMobileLiveStart}
        />
      )}

      {mobileLiveSession && (
        <MobileLiveInterface
          sessionId={mobileLiveSession.id}
          session={mobileLiveSession}
          onEnd={handleMobileLiveEnd}
        />
      )}
    </div>
  );
}
