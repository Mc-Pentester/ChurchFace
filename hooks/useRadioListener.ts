"use client";

import { useEffect, useRef, useState } from "react";

import { socket } from "@/lib/socket";
import { createPeerConnection } from "@/lib/radio/webrtc";

interface RadioOfferPayload {
offer: RTCSessionDescriptionInit;
senderId: string;
}

interface RadioIceCandidatePayload {
candidate: RTCIceCandidateInit;
senderId: string;
}

interface RadioStatsPayload {
listenerCount: number;
}

interface RadioStatusPayload {
isLive: boolean;
}

interface RadioPeerLeftPayload {
socketId: string;
}

export function useRadioListener(
radioId: string | null,
enabled: boolean
) {
const [radioInfo, setRadioInfo] = useState<any>(null);
const [isLive, setIsLive] = useState(false);
const [listenerCount, setListenerCount] = useState(0);
const [status, setStatus] = useState("Chargement...");
const [audioPlaying, setAudioPlaying] = useState(false);

const audioRef =
useRef<HTMLAudioElement | null>(null);

const pcRef =
useRef<RTCPeerConnection | null>(null);

const connectedRef =
useRef(false);

const negotiatingRef =
useRef(false);

const peerIdRef =
useRef<string | null>(null);

const pendingCandidatesRef =
useRef<RTCIceCandidateInit[]>([]);

function resetConnectionState() {
connectedRef.current = false;
negotiatingRef.current = false;
peerIdRef.current = null;
pendingCandidatesRef.current = [];
}

function closePeerConnection() {
resetConnectionState();

if (pcRef.current) {
  pcRef.current.ontrack = null;
  pcRef.current.onicecandidate = null;
  pcRef.current.onconnectionstatechange = null;
  pcRef.current.close();
  pcRef.current = null;
}

if (audioRef.current) {
  audioRef.current.pause();
  audioRef.current.srcObject = null;
}

setAudioPlaying(false);

}

useEffect(() => {
if (!radioId || !enabled) {
return;
}

let cancelled = false;

async function loadRadio() {
  try {
    const res = await fetch(
      `/api/radio/${radioId}`
    );

    if (!res.ok) {
      throw new Error(
        "Impossible de charger la radio"
      );
    }

    const data = await res.json();

    if (
      cancelled ||
      !data.radio
    ) {
      return;
    }

    setRadioInfo(data.radio);

    const live = Boolean(
      data.radio.isLive
    );

    setIsLive(live);

    setListenerCount(
      data.radio.listenerCount || 0
    );

    setStatus(
      live
        ? "Connexion..."
        : "Hors antenne"
    );
  } catch (error) {
    if (!cancelled) {
      console.error(
        "Radio info error:",
        error
      );

      setStatus(
        "Erreur de chargement"
      );
    }
  }
}

loadRadio();

return () => {
  cancelled = true;
};

}, [radioId, enabled]);

useEffect(() => {
if (!radioId || !enabled) {
return;
}

socket.emit(
  "radio:join",
  radioId
);

const onStats = (
  stats: RadioStatsPayload
) => {
  setListenerCount(
    stats.listenerCount
  );

  setRadioInfo((prev: any) =>
    prev
      ? {
          ...prev,
          ...stats,
        }
      : prev
  );
};

const onStatus = (
  payload: RadioStatusPayload
) => {
  setIsLive(
    payload.isLive
  );

  if (!payload.isLive) {
    closePeerConnection();

    setStatus(
      "Émission terminée"
    );

    return;
  }

  setStatus(
    "Connexion au flux..."
  );
};

const onPeerLeft = (
  payload: RadioPeerLeftPayload
) => {
  if (
    !payload?.socketId
  ) {
    return;
  }

  if (
    peerIdRef.current !==
    payload.socketId
  ) {
    return;
  }

  peerIdRef.current = null;

  closePeerConnection();

  setIsLive(false);

  setStatus(
    "Émission interrompue"
  );
};

const onOffer = async ({
  offer,
  senderId,
}: RadioOfferPayload) => {
  if (
    !offer ||
    !senderId
  ) {
    return;
  }

  if (
    peerIdRef.current &&
    peerIdRef.current !==
      senderId
  ) {
    return;
  }

  if (
    negotiatingRef.current
  ) {
    return;
  }

  negotiatingRef.current =
    true;

  peerIdRef.current =
    senderId;

  try {
    closePeerConnection();

    peerIdRef.current =
      senderId;

    negotiatingRef.current =
      true;

    const pc =
      createPeerConnection();

    pcRef.current =
      pc;

    pc.ontrack = (
      event
    ) => {
      const stream =
        event.streams[0];

      if (
        !stream ||
        !audioRef.current
      ) {
        return;
      }

      audioRef.current.srcObject =
        stream;

      audioRef.current
        .play()
        .then(() => {
          connectedRef.current =
            true;

          negotiatingRef.current =
            false;

          setAudioPlaying(
            true
          );

          setStatus(
            "En écoute"
          );
        })
        .catch(() => {
          connectedRef.current =
            true;

          negotiatingRef.current =
            false;

          setAudioPlaying(
            false
          );

          setStatus(
            "Cliquez pour écouter"
          );
        });
    };

    pc.onicecandidate = (
      event
    ) => {
      if (
        !event.candidate
      ) {
        return;
      }

      socket.emit(
        "radio:ice-candidate",
        {
          radioId,
          candidate:
            event.candidate,
          target:
            senderId,
        }
      );
    };

    pc.onconnectionstatechange =
      () => {
        switch (
          pc.connectionState
        ) {
          case "connected":
            connectedRef.current =
              true;

            negotiatingRef.current =
              false;

            setStatus(
              "En écoute"
            );

            break;

          case "failed":
            closePeerConnection();

            setStatus(
              "Connexion interrompue"
            );

            break;

          case "disconnected":
            setStatus(
              "Connexion instable"
            );

            break;

          case "closed":
            closePeerConnection();

            break;
        }
      };

    await pc.setRemoteDescription(
      new RTCSessionDescription(
        offer
      )
    );

    for (
      const candidate of
        pendingCandidatesRef.current
    ) {
      try {
        await pc.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );
      } catch (error) {
        console.error(
          "Pending ICE candidate error:",
          error
        );
      }
    }

    pendingCandidatesRef.current =
      [];

    const answer =
      await pc.createAnswer();

    await pc.setLocalDescription(
      answer
    );

    socket.emit(
      "radio:answer",
      {
        radioId,
        answer,
        target:
          senderId,
      }
    );
  } catch (error) {
    console.error(
      "Radio listener WebRTC error:",
      error
    );

    closePeerConnection();

    setStatus(
      "Erreur de connexion"
    );
  } finally {
    negotiatingRef.current =
      false;
  }
};

const onIceCandidate = async ({
  candidate,
}: RadioIceCandidatePayload) => {
  if (
    !candidate
  ) {
    return;
  }

  const pc =
    pcRef.current;

  if (
    !pc ||
    !pc.remoteDescription
  ) {
    pendingCandidatesRef.current.push(
      candidate
    );

    return;
  }

  try {
    await pc.addIceCandidate(
      new RTCIceCandidate(
        candidate
      )
    );
  } catch (error) {
    console.error(
      "Add ICE candidate error:",
      error
    );
  }
};

socket.on(
  "radio:stats",
  onStats
);

socket.on(
  "radio:status",
  onStatus
);

socket.on(
  "radio:peer-left",
  onPeerLeft
);

socket.on(
  "radio:offer",
  onOffer
);

socket.on(
  "radio:ice-candidate",
  onIceCandidate
);

return () => {
  socket.emit(
    "radio:leave",
    radioId
  );

  socket.off(
    "radio:stats",
    onStats
  );

  socket.off(
    "radio:status",
    onStatus
  );

  socket.off(
    "radio:peer-left",
    onPeerLeft
  );

  socket.off(
    "radio:offer",
    onOffer
  );

  socket.off(
    "radio:ice-candidate",
    onIceCandidate
  );

  closePeerConnection();
};

}, [
radioId,
enabled,
]);

useEffect(() => {
return () => {
closePeerConnection();
};
}, []);

async function playAudio() {
if (
!audioRef.current
) {
return;
}

try {
  await audioRef.current.play();

  setAudioPlaying(
    true
  );

  if (
    connectedRef.current
  ) {
    setStatus(
      "En écoute"
    );
  }
} catch (error) {
  console.error(
    "Manual audio playback error:",
    error
  );
}

}

return {
audioRef,
radioInfo,
isLive,
listenerCount,
status,
audioPlaying,
setAudioPlaying,
playAudio,
};
}