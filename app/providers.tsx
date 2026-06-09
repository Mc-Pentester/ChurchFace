"use client";

import { SessionProvider } from "next-auth/react";
import { RadioPlayerProvider } from "@/contexts/RadioPlayerContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <RadioPlayerProvider>{children}</RadioPlayerProvider>
    </SessionProvider>
  );
}