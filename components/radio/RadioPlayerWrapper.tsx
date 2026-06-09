"use client";

import dynamic from "next/dynamic";

const FloatingRadioPlayer = dynamic(
  () => import("@/components/radio/FloatingRadioPlayer"),
  { ssr: false }
);

export default function RadioPlayerWrapper() {
  return <FloatingRadioPlayer />;
}
