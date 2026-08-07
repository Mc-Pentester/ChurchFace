"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import PhotoGallery from "@/components/profile/PhotoGallery";
import VideoGallery from "@/components/profile/VideoGallery";
import PrivacySettings from "@/components/profile/PrivacySettings";
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
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [profileLocked, setProfileLocked] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showMobileLiveSetup, setShowMobileLiveSetup] = useState(false);
  const [mobileLiveSession, setMobileLiveSession] = useState<MobileLiveSession | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchUserProfile();
    fetchPrivacySettings();
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const res = await fetch("/api/profile/privacy");
      const data = await res.json();
      if (data.privacy) {
        setProfileLocked(data.privacy.profileLocked);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    }
  };

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

  if (!session || !user) return null;

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
              <button
                onClick={() => setShowPrivacySettings(true)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Modifier les paramètres de confidentialité →
              </button>
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
            <PhotoGallery userId={user.id} isOwnProfile={true} />
          </div>
        );
      case "videos":
        return (
          <div className="p-6">
            <VideoGallery userId={user.id} isOwnProfile={true} />
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
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          coverImage: user.coverImage,
          bio: user.bio,
          username: user.username,
          createdAt: new Date().toISOString(),
        } as any}
        friendshipStatus="NONE"
        friendshipId={null}
        isOwnProfile={true}
        profileLocked={profileLocked}
      />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={true}
        profileLocked={profileLocked}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        <div className="bg-white rounded-xl shadow">{renderTabContent()}</div>
      </div>

      <div className="fixed bottom-6 right-6">
        <GoLiveButton
          context="PERSONAL"
          ownerId={user.id}
          ownerType="USER"
          onOpenSetup={() => setShowMobileLiveSetup(true)}
        />
      </div>

      {showPrivacySettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Paramètres de confidentialité</h2>
                <button
                  onClick={() => setShowPrivacySettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PrivacySettings onClose={() => setShowPrivacySettings(false)} />
            </div>
          </div>
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
