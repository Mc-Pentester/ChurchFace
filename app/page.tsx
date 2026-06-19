"use client";

import { useState } from "react";

import Navbar from "@/components/layout/Navbar";
import HeroSlider from "@/components/HeroSlider";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import StoriesBar from "@/components/stories/StoriesBar";
import LoginModal from "@/components/LoginModal";
import NotificationToast from "@/components/notifications/NotificationToast";
import Feed from "@/components/posts/Feed";

export default function HomePage() {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">

      <NotificationToast />

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <HeroSlider />

      {/* BODY */}
      <section className="w-full">

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-4 px-3 py-6">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block sticky top-20 h-fit">
            <LeftSidebar />
          </aside>

          {/* FEED CENTER */}
          <section className="min-w-0 max-w-[680px] mx-auto w-full space-y-6">

            <StoriesBar />

            <div className="min-w-0 overflow-hidden">
              <Feed />
            </div>

          </section>

          {/* RIGHT SIDEBAR */}
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