"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

import Navbar from "@/components/layout/Navbar";
import HeroSlider from "@/components/HeroSlider";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import StoriesBar from "@/components/stories/StoriesBar";
import LoginModal from "@/components/LoginModal";
import NotificationToast from "@/components/notifications/NotificationToast";
import Feed from "@/components/posts/Feed";

// Lazy load heavy components
const StudioPro = dynamic(() => import("@/components/live/studio/StudioPro"), {
  loading: () => <div className="h-screen bg-[#0a0a14] flex items-center justify-center text-white">Chargement...</div>,
  ssr: false,
});

const MobileLiveSetup = dynamic(() => import("@/components/mobilelive/MobileLiveSetup"), {
  ssr: false,
});

const MobileLiveInterface = dynamic(() => import("@/components/mobilelive/MobileLiveInterface"), {
  ssr: false,
});

export default function HomePage() {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">

      <NotificationToast />

      {/* NAVBAR */}
      <Navbar onOpenLogin={() => setOpenLogin(true)} />

      {/* HERO */}
      <HeroSlider />

      {/* BODY */}
      <section className="w-full">

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_200px] gap-4 px-3 py-6">

          {/* LEFT SIDEBAR - Hidden on mobile, visible on tablet+ */}
          <aside className="hidden md:block sticky top-20 h-fit">
            <LeftSidebar />
          </aside>

          {/* FEED CENTER - Full width on mobile, constrained on tablet+ */}
          <section className="min-w-0 w-full space-y-6">

            <StoriesBar />

            <div className="min-w-0 overflow-hidden">
              <Feed />
            </div>

          </section>

          {/* RIGHT SIDEBAR - Hidden on mobile/tablet, visible on desktop */}
          <aside className="hidden lg:block sticky top-20 h-fit">
            <RightSidebar />
          </aside>

        </div>
      </section>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={openLogin}
        onClose={() => setOpenLogin(false)}
      />

    </main>
  );
}