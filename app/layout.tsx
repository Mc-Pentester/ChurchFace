import GlobalCallHandler from "@/components/messaging/GlobalCallHandler";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ChatPopupWrapper from "@/components/layout/ChatPopupWrapper";
import RadioPlayerWrapper from "@/components/radio/RadioPlayerWrapper";
import HomeButton from "@/components/layout/HomeButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NotificationToast from "@/components/notifications/NotificationToast";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChurchFace",
  description: "Social platform for churches",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* ✅ AJOUT IMPORTANT UPLOADTHING */}
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />

        <Providers>
          <HomeButton />
          {children}
          {/* Espace pour la nav mobile fixed */}
          <div className="h-20 lg:hidden" />
          <ChatPopupWrapper />
          <RadioPlayerWrapper />
          <MobileBottomNav />
          <NotificationToast />
          <GlobalCallHandler />
        </Providers>
      </body>
    </html>
  );
}