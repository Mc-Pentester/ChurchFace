"use client";

// Contexte d'appel global : écoute call:incoming sur toute l'application
// quelle que soit la page affichée

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import IncomingCallModal from "@/components/messaging/IncomingCallModal";
import CallModal from "@/components/messaging/CallModal";

interface IncomingCallData {
  callId: string;
  offer: RTCSessionDescriptionInit;
  callerId: string;
  callerName: string;
  callerImage?: string | null;
  callType: "audio" | "video";
}

interface CallContextValue {
  startCall: (params: {
    recipientId: string;
    recipientName: string;
    recipientImage?: string | null;
    callType: "audio" | "video";
  }) => void;
}

const CallContext = createContext<CallContextValue>({
  startCall: () => {},
});

export function useCall() {
  return useContext(CallContext);
}

export function CallProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? "";

  // État appel entrant
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [showIncoming, setShowIncoming] = useState(false);

  // État modale d'appel active
  const [activeCall, setActiveCall] = useState<{
    recipientId: string;
    recipientName: string;
    recipientImage?: string | null;
    callType: "audio" | "video";
    isIncoming: boolean;
    incomingCallData?: IncomingCallData | null;
  } | null>(null);

  // Écoute app-wide de call:incoming
  useEffect(() => {
    const handleIncomingCall = (data: IncomingCallData) => {
      // Ignorer si déjà en appel
      if (activeCall) return;

      setIncomingCall(data);
      setShowIncoming(true);

      // Émettre notification
      socket.emit("notification:new", {
        message: `Appel ${data.callType === "video" ? "vidéo" : "audio"} entrant de ${data.callerName || "quelqu'un"}`,
      });
    };

    socket.on("call:incoming", handleIncomingCall);
    return () => {
      socket.off("call:incoming", handleIncomingCall);
    };
  }, [activeCall]);

  // L'utilisateur rejette l'appel entrant
  const handleRejectIncoming = useCallback(() => {
    setShowIncoming(false);
    setIncomingCall(null);
  }, []);

  // L'utilisateur accepte l'appel entrant
  const handleAcceptIncoming = useCallback(() => {
    if (!incomingCall) return;
    setShowIncoming(false);
    // Ouvrir CallModal en mode réponse en conservant les données de l'appel entrant
    setActiveCall({
      recipientId: incomingCall.callerId,
      recipientName: incomingCall.callerName,
      recipientImage: incomingCall.callerImage,
      callType: incomingCall.callType,
      isIncoming: true,
      incomingCallData: incomingCall,
    });
  }, [incomingCall]);

  // Fin d'appel actif
  const handleEndActiveCall = useCallback(() => {
    setActiveCall(null);
    setIncomingCall(null);
  }, []);

  // Lancer un appel sortant depuis n'importe quelle page
  const startCall = useCallback(
    ({
      recipientId,
      recipientName,
      recipientImage,
      callType,
    }: {
      recipientId: string;
      recipientName: string;
      recipientImage?: string | null;
      callType: "audio" | "video";
    }) => {
      setActiveCall({
        recipientId,
        recipientName,
        recipientImage,
        callType,
        isIncoming: false,
        incomingCallData: null,
      });
    },
    []
  );

  return (
    <CallContext.Provider value={{ startCall }}>
      {children}

      {/* Modale appel entrant – visible sur toutes les pages */}
      {incomingCall && (
        <IncomingCallModal
          isOpen={showIncoming}
          onClose={handleRejectIncoming}
          callerName={incomingCall.callerName}
          callerImage={incomingCall.callerImage}
          callType={incomingCall.callType}
          callerId={incomingCall.callerId}
          currentUserId={currentUserId}
          onAccept={handleAcceptIncoming}
        />
      )}

      {/* Modale d'appel actif (sortant ou entrant accepté) */}
      {activeCall && (
        <CallModal
          isOpen={true}
          onClose={handleEndActiveCall}
          callType={activeCall.callType}
          recipientName={activeCall.recipientName}
          recipientImage={activeCall.recipientImage}
          recipientId={activeCall.recipientId}
          currentUserId={currentUserId}
          isIncoming={activeCall.isIncoming}
          incomingCallData={activeCall.incomingCallData}
        />
      )}
    </CallContext.Provider>
  );
}
