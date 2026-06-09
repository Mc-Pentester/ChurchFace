"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRadioPlayer } from "@/contexts/RadioPlayerContext";

export default function RadioListenRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { openRadio } = useRadioPlayer();
  const radioId = params.radioId as string;

  useEffect(() => {
    if (!radioId) return;
    openRadio(radioId);
    router.replace("/radio");
  }, [radioId, openRadio, router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
      Ouverture du lecteur radio...
    </div>
  );
}
