"use client";

import {
useEffect,
useRef,
useState,
type RefObject,
} from "react";

import { socket } from "@/lib/socket";

import {
createPeerConnection,
RadioAudioMixer,
} from "@/lib/radio/webrtc";

export type BroadcastStatus =
| "idle"
| "connecting"
| "live"
| "error";

interface UseRadioBroadcastOptions {
radioId?: string;
isLive: boolean;
audioRef: RefObject<HTMLAudioElement | null>;
micVolume: number;
micMuted: boolean;
musicVolume: number;
musicMuted: boolean;
}

interface RadioAnswerPayload {
answer: RTCSessionDescriptionInit;
senderId: string;
}

interface RadioIceCandidatePayload {
candidate: RTCIceCandidateInit;
senderId: string;
}

export function useRadioBroadcast({
radioId,
isLive,
audioRef,
micVolume,
micMuted,
musicVolume,
musicMuted,
}: UseRadioBroadcastOptions) {
const [status, setStatus] =
useState<BroadcastStatus>("idle");

const [peerCount, setPeerCount] =
useState(0);

const [error, setError] =
useState<string | null>(null);

const [audioStream, setAudioStream] =
useState<MediaStream | null>(null);

const mixerRef =
useRef<RadioAudioMixer | null>(null);

const streamRef =
useRef<MediaStream | null>(null);

const peersRef =
useRef<Map<string, RTCPeerConnection>>(
new Map()
);

const connectingListenersRef =
useRef<Set<string>>(
new Set()
);

const pendingIceCandidatesRef =
useRef<
Map<string, RTCIceCandidateInit[]>
>(new Map());

const activeRef =
useRef(false);

const sessionRef =
useRef<string | null>(null);

useEffect(() => {
mixerRef.current?.setMicLevel(
micVolume,
micMuted
);
}, [
micVolume,
micMuted,
]);

useEffect(() => {
mixerRef.current?.setMusicLevel(
musicVolume,
musicMuted
);
}, [
musicVolume,
musicMuted,
]);

function updatePeerCount() {
setPeerCount(
peersRef.current.size
);
}

function clearPendingIceCandidates(
listenerId?: string
) {
if (listenerId) {
pendingIceCandidatesRef.current.delete(
listenerId
);


  return;
}

pendingIceCandidatesRef.current.clear();


}

function closePeer(
listenerId: string
) {
const pc =
peersRef.current.get(
listenerId
);


peersRef.current.delete(
  listenerId
);

connectingListenersRef.current.delete(
  listenerId
);

clearPendingIceCandidates(
  listenerId
);

if (pc) {
  pc.onicecandidate = null;
  pc.onconnectionstatechange = null;
  pc.oniceconnectionstatechange = null;
  pc.ontrack = null;

  try {
    pc.close();
  } catch {
    // Connexion déjà fermée.
  }
}

updatePeerCount();


}

function closeAllPeers() {
const listenerIds =
Array.from(
peersRef.current.keys()
);


for (
  const listenerId of
  listenerIds
) {
  closePeer(
    listenerId
  );
}

peersRef.current.clear();

connectingListenersRef.current.clear();

clearPendingIceCandidates();

updatePeerCount();


}

async function flushPendingIceCandidates(
listenerId: string,
pc: RTCPeerConnection
) {
const candidates =
pendingIceCandidatesRef.current.get(
listenerId
);


if (
  !candidates ||
  candidates.length === 0
) {
  return;
}

pendingIceCandidatesRef.current.delete(
  listenerId
);

for (
  const candidate of
  candidates
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


}

async function connectListener(
listenerId: string
) {
if (
!radioId ||
!activeRef.current ||
!streamRef.current ||
peersRef.current.has(
listenerId
) ||
connectingListenersRef.current.has(
listenerId
)
) {
return;
}


connectingListenersRef.current.add(
  listenerId
);

let pc:
  | RTCPeerConnection
  | null = null;

try {
  pc =
    createPeerConnection();

  const stream =
    streamRef.current;

  if (
    !stream ||
    !activeRef.current
  ) {
    return;
  }

  for (
    const track of
    stream.getTracks()
  ) {
    pc.addTrack(
      track,
      stream
    );
  }

  pc.onicecandidate = (
    event
  ) => {
    if (
      !event.candidate ||
      !radioId ||
      !activeRef.current
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
          listenerId,
      }
    );
  };

  pc.onconnectionstatechange =
    () => {
      if (
        pc?.connectionState ===
          "failed" ||
        pc?.connectionState ===
          "closed"
      ) {
        closePeer(
          listenerId
        );
      }
    };

  pc.oniceconnectionstatechange =
    () => {
      if (
        pc?.iceConnectionState ===
          "failed" ||
        pc?.iceConnectionState ===
          "closed"
      ) {
        closePeer(
          listenerId
        );
      }
    };

  peersRef.current.set(
    listenerId,
    pc
  );

  connectingListenersRef.current.delete(
    listenerId
  );

  updatePeerCount();

  const offer =
    await pc.createOffer();

  if (
    !activeRef.current ||
    !radioId ||
    pc.connectionState ===
      "closed"
  ) {
    closePeer(
      listenerId
    );

    return;
  }

  await pc.setLocalDescription(
    offer
  );

  if (
    !activeRef.current ||
    !radioId
  ) {
    closePeer(
      listenerId
    );

    return;
  }

  socket.emit(
    "radio:offer",
    {
      radioId,
      offer,
      target:
        listenerId,
    }
  );
} catch (error) {
  console.error(
    "Connect listener error:",
    error
  );

  if (pc) {
    closePeer(
      listenerId
    );
  } else {
    connectingListenersRef.current.delete(
      listenerId
    );
  }
}


}

useEffect(() => {
if (
!radioId ||
!isLive
) {
activeRef.current =
false;

  sessionRef.current =
    null;

  closeAllPeers();

  mixerRef.current?.suspend();

  streamRef.current =
    null;

  setAudioStream(
    null
  );

  if (radioId) {
    socket.emit(
      "radio:broadcast-leave",
      radioId
    );

    socket.emit(
      "studio:leave",
      radioId
    );
  }

  setStatus(
    "idle"
  );

  setError(
    null
  );

  return;
}

let cancelled =
  false;

const sessionId =
  `${radioId}:${Date.now()}`;

sessionRef.current =
  sessionId;

activeRef.current =
  true;

const onListenerJoined =
  (
    listenerId: string
  ) => {
    if (
      cancelled ||
      !activeRef.current ||
      !listenerId
    ) {
      return;
    }

    void connectListener(
      listenerId
    );
  };

const onAnswer =
  async (
    payload: RadioAnswerPayload
  ) => {
    if (
      cancelled ||
      !activeRef.current ||
      !payload?.senderId ||
      !payload?.answer
    ) {
      return;
    }

    const pc =
      peersRef.current.get(
        payload.senderId
      );

    if (
      !pc ||
      pc.signalingState ===
        "closed"
    ) {
      return;
    }

    try {
      await pc.setRemoteDescription(
        new RTCSessionDescription(
          payload.answer
        )
      );

      await flushPendingIceCandidates(
        payload.senderId,
        pc
      );
    } catch (error) {
      console.error(
        "Set remote answer error:",
        error
      );

      closePeer(
        payload.senderId
      );
    }
  };

const onIceCandidate =
  async (
    payload: RadioIceCandidatePayload
  ) => {
    if (
      cancelled ||
      !activeRef.current ||
      !payload?.senderId ||
      !payload?.candidate
    ) {
      return;
    }

    const pc =
      peersRef.current.get(
        payload.senderId
      );

    if (
      !pc ||
      pc.signalingState ===
        "closed"
    ) {
      return;
    }

    if (
      !pc.remoteDescription
    ) {
      const pending =
        pendingIceCandidatesRef.current.get(
          payload.senderId
        ) ?? [];

      pending.push(
        payload.candidate
      );

      pendingIceCandidatesRef.current.set(
        payload.senderId,
        pending
      );

      return;
    }

    try {
      await pc.addIceCandidate(
        new RTCIceCandidate(
          payload.candidate
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
  "radio:listener-joined",
  onListenerJoined
);

socket.on(
  "radio:answer",
  onAnswer
);

socket.on(
  "radio:ice-candidate",
  onIceCandidate
);

async function startBroadcast() {
  setStatus(
    "connecting"
  );

  setError(
    null
  );

  try {
    if (
      cancelled ||
      !activeRef.current
    ) {
      return;
    }

    if (
      !mixerRef.current
    ) {
      const mixer =
        new RadioAudioMixer();

      const stream =
        await mixer.start(
          audioRef.current
        );

      if (
        cancelled ||
        !activeRef.current
      ) {
        mixer.stop();

        return;
      }

      mixerRef.current =
        mixer;

      streamRef.current =
        stream;

      setAudioStream(
        stream
      );
    } else {
      const stream =
        await mixerRef.current.start(
          audioRef.current
        );

      if (
        cancelled ||
        !activeRef.current
      ) {
        return;
      }

      streamRef.current =
        stream;

      setAudioStream(
        stream
      );
    }

    if (
      !mixerRef.current ||
      cancelled ||
      !activeRef.current
    ) {
      return;
    }

    mixerRef.current.setMicLevel(
      micVolume,
      micMuted
    );

    mixerRef.current.setMusicLevel(
      musicVolume,
      musicMuted
    );

    if (
      cancelled ||
      !activeRef.current
    ) {
      return;
    }

    socket.emit(
      "studio:join",
      radioId
    );

    socket.emit(
      "radio:broadcast-join",
      radioId
    );

    if (
      !cancelled &&
      activeRef.current
    ) {
      setStatus(
        "live"
      );
    }
  } catch (error) {
    console.error(
      "Broadcast start error:",
      error
    );

    if (
      cancelled ||
      !activeRef.current
    ) {
      return;
    }

    setStatus(
      "error"
    );

    setError(
      error instanceof Error
        ? error.message
        : "Impossible d'accéder au microphone"
    );
  }
}

void startBroadcast();

return () => {
  cancelled =
    true;

  activeRef.current =
    false;

  if (
    sessionRef.current ===
    sessionId
  ) {
    sessionRef.current =
      null;
  }

  socket.off(
    "radio:listener-joined",
    onListenerJoined
  );

  socket.off(
    "radio:answer",
    onAnswer
  );

  socket.off(
    "radio:ice-candidate",
    onIceCandidate
  );

  closeAllPeers();

  socket.emit(
    "radio:broadcast-leave",
    radioId
  );

  socket.emit(
    "studio:leave",
    radioId
  );
};


}, [
radioId,
isLive,
]);

useEffect(() => {
return () => {
activeRef.current =
false;


  closeAllPeers();

  mixerRef.current?.stop();

  mixerRef.current =
    null;

  streamRef.current =
    null;

  setAudioStream(
    null
  );
};


}, []);

return {
status,
peerCount,
error,
audioStream,
};
}
