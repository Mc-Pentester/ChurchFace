"use client";

import dynamic from "next/dynamic";

const ChatPopup = dynamic(
  () => import("@/components/layout/ChatPopup"),
  { ssr: false }
);

export default function ChatPopupWrapper() {
  return <ChatPopup />;
}
