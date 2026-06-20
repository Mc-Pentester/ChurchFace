"use client";

import { SessionProvider } from "next-auth/react";
import { RadioPlayerProvider } from "@/contexts/RadioPlayerContext";
import { CallProvider } from "@/contexts/CallContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <RadioPlayerProvider>
        {/* CallProvider écoute call:incoming sur toute l'application */}
        <CallProvider>
          {children}
        </CallProvider>
      </RadioPlayerProvider>
    </SessionProvider>
  );
}