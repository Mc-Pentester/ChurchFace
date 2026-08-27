"use client";

// Contexte d'appel global : écoute call:incoming sur toute l'application
// quelle que soit la page affichée

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { socket, useSocketPresence } from "@/lib/socket";
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

interface ActiveCall {
  callId: string;
  recipientId: string;
  recipientName: string;
  recipientImage?: string | null;
  callType: "audio" | "video";
  isIncoming: boolean;
  incomingCallData?: IncomingCallData | null;
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

  // Ensure user is registered in onlineUsers registry for call routing
  useSocketPresence();

  // Référence stable pour éviter les réenregistrements de listener
  const activeCallRef = useRef<ActiveCall | null>(null);
  const startingCallRef = useRef(false);

  // État appel entrant
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [showIncoming, setShowIncoming] = useState(false);

  // État modale d'appel active (pour React)
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Synchroniser ref avec state
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  // Écoute app-wide de call:incoming - enregistré une seule fois
  useEffect(() => {
    const handleIncomingCall = (data: IncomingCallData) => {
      console.log("[CALL][INCOMING_RECEIVED]", {
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callType: data.callType,
        hasOffer: !!data.offer
      });

      // Ignorer si déjà en appel
      if (activeCallRef.current) {
        console.log("[CALL][INCOMING_IGNORED_ALREADY_IN_CALL]", data.callId);
        return;
      }

      setIncomingCall(data);
      setShowIncoming(true);

      // Émettre notification
      socket.emit("notification:new", {
        message: `Appel ${data.callType === "video" ? "vidéo" : "audio"} entrant de ${data.callerName || "quelqu'un"}`,
      });
    };

    console.log("[CALL][SOCKET_LISTENER_ADD]", {
      event: "call:incoming",
      socketId: socket.id
    });

    socket.on("call:incoming", handleIncomingCall);
    return () => {
      console.log("[CALL][SOCKET_LISTENER_REMOVE]", {
        event: "call:incoming",
        socketId: socket.id
      });
      socket.off("call:incoming", handleIncomingCall);
    };
  }, []); // Dépendances vides = listener enregistré une seule fois

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
      callId: incomingCall.callId,
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
      // Protection contre double appel en cours de démarrage
      if (startingCallRef.current) {
        console.warn("[CALL][START_ALREADY_IN_PROGRESS]");
        return;
      }

      // Protection atomique basée sur la ref
      if (activeCallRef.current) {
        console.warn("[CALL][ALREADY_ACTIVE]", { callId: activeCallRef.current.callId });
        return;
      }

      startingCallRef.current = true;

      // Créer le callId UNE SEULE FOIS
      const callId = `${currentUserId}-${recipientId}-${Date.now()}`;

      const newCall: ActiveCall = {
        callId,
        recipientId,
        recipientName,
        recipientImage,
        callType,
        isIncoming: false,
        incomingCallData: null,
      };

      console.log("[CALL][START]", {
        callId,
        callerId: currentUserId,
        recipientId,
        callType,
      });

      // Mettre à jour la ref IMMÉDIATEMENT (atomique)
      activeCallRef.current = newCall;

      // Puis mettre à jour le state React
      setActiveCall(newCall);

      startingCallRef.current = false;
    },
    [currentUserId]
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
          callId={incomingCall.callId}
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
          callId={activeCall.callId}
        />
      )}
    </CallContext.Provider>
  );
}
