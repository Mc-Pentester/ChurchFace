"use client";

import { SessionProvider } from "next-auth/react";
import { RadioPlayerProvider } from "@/contexts/RadioPlayerContext";
import { CallProvider } from "@/contexts/CallContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
          <ServiceWorkerRegister />
          {children}
        </CallProvider>
      </RadioPlayerProvider>
    </SessionProvider>
  );
}