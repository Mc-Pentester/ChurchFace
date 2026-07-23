"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { socket, useSocketPresence } from "@/lib/socket";
import IncomingCallModal from "./IncomingCallModal";
import CallModal from "./CallModal";

export default function GlobalCallHandler() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const currentUser = session?.user;

  // Active la présence socket globalement
  useSocketPresence();

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<any>(null);
  const [callType, setCallType] = useState<"audio" | "video">("audio");

  useEffect(() => {
    if (!currentUserId) return;

    const handleIncomingCall = (data: any) => {
      console.log("Global incoming call received:", data);
      setIncomingCallData(data);
      setCallType(data.callType);
      setIsIncomingCall(true);
      setIsCallModalOpen(true);
    };

    socket.on("call:incoming", handleIncomingCall);
    return () => {
      socket.off("call:incoming", handleIncomingCall);
    };
  }, [currentUserId]);

  const handleEndCall = () => {
    setIsCallModalOpen(false);
    setIsIncomingCall(false);
    setIncomingCallData(null);
  };

  const handleAcceptIncomingCall = () => {
    setIsIncomingCall(false);
  };

  if (!currentUserId || !isCallModalOpen) return null;

  return (
    <>
      {isIncomingCall && incomingCallData && (
        <IncomingCallModal
          isOpen={isIncomingCall}
          onClose={handleEndCall}
          callerName={incomingCallData.callerName || "Inconnu"}
          callerImage={incomingCallData.callerImage}
          callType={incomingCallData.callType}
          callerId={incomingCallData.callerId}
          currentUserId={currentUserId}
          onAccept={handleAcceptIncomingCall}
        />
      )}

      {!isIncomingCall && incomingCallData && (
        <CallModal
          isOpen={isCallModalOpen}
          onClose={handleEndCall}
          callType={callType}
          recipientName={incomingCallData.callerName || "Inconnu"}
          recipientImage={incomingCallData.callerImage}
          recipientId={incomingCallData.callerId}
          currentUserId={currentUserId}
          currentUser={currentUser}
          isIncoming={true}
          incomingCallData={incomingCallData}
        />
      )}
    </>
  );
}
