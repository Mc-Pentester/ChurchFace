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
    <main className="min-h-screen bg-gray-100">

      <NotificationToast />

      {/* NAVBAR */}
      <Navbar onLoginClick={() => setOpenLogin(true)} />

      {/* HERO */}
      <HeroSlider onLoginClick={() => setOpenLogin(true)} />

      {/* BODY */}
      <section className="w-full">
        <div className="max-w-[1700px] mx-auto flex gap-6 px-4 py-6">

          {/* LEFT */}
          <div className="hidden lg:block w-64 shrink-0">
            <LeftSidebar />
          </div>

          {/* CENTER */}
          <div className="flex-1 min-w-0 max-w-3xl mx-auto">

            <StoriesBar />

            <div className="mt-5">
              <Feed />
            </div>

          </div>

          {/* RIGHT */}
          <div className="hidden xl:block w-72 shrink-0">
            <RightSidebar />
          </div>

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
