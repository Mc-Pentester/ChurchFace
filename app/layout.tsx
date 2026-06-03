import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ChatPopupWrapper from "@/components/layout/ChatPopupWrapper";
import HomeButton from "@/components/layout/HomeButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

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
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}