"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ComponentType } from "react";
import { useRadioBroadcast } from "@/hooks/useRadioBroadcast";
import { UploadButton } from "@/lib/uploadthing";
import {
Play,
Pause,
Square,
Plus,
Search,
Mic,
Music,
Bell,
Volume2,
MonitorUp,
Signal,
Radio,
StopCircle,
Link2,
Upload,
} from "lucide-react";

/* ============================================================================

* TYPES
* ========================================================================== */

type IconComponent = ComponentType<{ size?: number; className?: string }>;

interface RadioTrack {
id: string;
title: string;
url: string;
duration?: number | null;
type?: string;
artist?: string | null;
category?: string | null;
}

interface Playlist {
id: string;
title: string;
items: RadioTrack[];
}

interface RadioData {
id: string;
title?: string | null;
description?: string | null;
isAutoDJ?: boolean;
playlistId?: string | null;
playlist?: Playlist | null;
}

interface ChannelData {
id: string;
name: string;
volume: number;
muted: boolean;
solo: boolean;
peak: number;
color: string;
icon: IconComponent;
}

interface LibraryItem {
id: string;
title: string;
artist: string;
duration?: number | null;
url: string;
category: string;
}

interface UploadResult {
url?: string;
ufsUrl?: string;
name?: string;
}

/* ============================================================================

* HELPERS
* ========================================================================== */

function probeDuration(url: string): Promise<number> {
return new Promise((resolve) => {
const audio = new Audio();


audio.preload = "metadata";

audio.onloadedmetadata = () => {
  const duration = Number.isFinite(audio.duration)
    ? Math.floor(audio.duration)
    : 0;

  resolve(duration);
};

audio.onerror = () => resolve(0);
audio.src = url;


});
}

function fmtDuration(seconds?: number | null): string {
if (!seconds || seconds <= 0) return "--:--";

const minutes = Math.floor(seconds / 60)
.toString()
.padStart(2, "0");

const remainingSeconds = Math.floor(seconds % 60)
.toString()
.padStart(2, "0");

return `${minutes}:${remainingSeconds}`;
}

/* ============================================================================

* SOUND EFFECTS
* ========================================================================== */

function playTone(
frequency: number,
duration: number,
type: OscillatorType = "sine",
) {
try {
const AudioContextClass =
window.AudioContext ||
(window as typeof window & {
webkitAudioContext?: typeof AudioContext;
}).webkitAudioContext;


if (!AudioContextClass) return;

const context = new AudioContextClass();
const oscillator = context.createOscillator();
const gain = context.createGain();

oscillator.type = type;
oscillator.frequency.value = frequency;

oscillator.connect(gain);
gain.connect(context.destination);

gain.gain.setValueAtTime(0.3, context.currentTime);
gain.gain.exponentialRampToValueAtTime(
  0.001,
  context.currentTime + duration,
);

oscillator.start();
oscillator.stop(context.currentTime + duration);

window.setTimeout(() => {
  context.close().catch(() => undefined);
}, duration * 1000 + 100);


} catch (error) {
console.error("Audio error:", error);
}
}

function playJingle() {
[523, 659, 784, 1047].forEach((frequency, index) => {
window.setTimeout(
() => playTone(frequency, 0.3, "triangle"),
index * 150,
);
});
}

function playApplause() {
for (let index = 0; index < 15; index++) {
window.setTimeout(
() =>
playTone(
200 + Math.random() * 800,
0.2,
"sawtooth",
),
index * 40,
);
}
}

function playLaugh() {
[400, 350, 450, 300].forEach((frequency, index) => {
window.setTimeout(
() => playTone(frequency, 0.25, "sine"),
index * 120,
);
});
}

function playSiren() {
for (let index = 0; index < 4; index++) {
window.setTimeout(
() => playTone(800, 0.4, "sawtooth"),
index * 800,
);


window.setTimeout(
  () => playTone(600, 0.4, "sawtooth"),
  index * 800 + 400,
);


}
}

function playBell() {
playTone(880, 1.5, "sine");

window.setTimeout(
() => playTone(1100, 1.2, "sine"),
200,
);
}

/* ============================================================================

* VU METER
* ========================================================================== */

function VUMeter({
peak,
active,
}: {
peak: number;
active: boolean;
}) {
const fill = active
? Math.round((Math.max(0, Math.min(100, peak)) / 100) * 14)
: 0;

return ( <div className="flex w-[6px] flex-col-reverse gap-[1.5px]">
{Array.from({ length: 14 }).map((_, index) => {
const activeLevel = index < fill;


    let className = "bg-gray-800";

    if (activeLevel) {
      if (index < 8) {
        className = "bg-emerald-500";
      } else if (index < 11) {
        className = "bg-yellow-500";
      } else {
        className = "bg-red-500";
      }
    }

    return (
      <div
        key={index}
        className={`h-[2px] w-full rounded-full ${className}`}
      />
    );
  })}
</div>


);
}

/* ============================================================================

* CHANNEL STRIP
* ========================================================================== */

function ChannelStrip({
channel,
onUpdate,
}: {
channel: ChannelData;
onUpdate: (updates: Partial<ChannelData>) => void;
}) {
const Icon = channel.icon;

const dbValue =
channel.volume > 0
? `-${Math.max(0, 36 - channel.volume / 2.7).toFixed(1)} dB`
: "-∞ dB";

return ( <div className="flex min-w-[90px] flex-col items-center gap-2 rounded-lg bg-[#16161f] p-2"> <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400"> <Icon size={10} className={channel.color} />


    <span className="max-w-[70px] truncate">
      {channel.name}
    </span>
  </div>

  <div className="flex h-28 gap-1">
    <VUMeter
      peak={channel.peak}
      active={!channel.muted}
    />

    <VUMeter
      peak={channel.peak}
      active={!channel.muted}
    />
  </div>

  <div className="relative flex h-24 w-5 items-center justify-center">
    <input
      type="range"
      min={0}
      max={100}
      value={channel.volume}
      onChange={(event) =>
        onUpdate({
          volume: Number(event.target.value),
        })
      }
      className="absolute w-24 -rotate-90 accent-gray-400 opacity-60 transition hover:opacity-100"
      
    />
  </div>

  <div className="text-[9px] font-mono text-gray-500">
    {dbValue}
  </div>

  <div className="flex w-full gap-1">
    <button
      type="button"
      onClick={() =>
        onUpdate({
          muted: !channel.muted,
        })
      }
      className={`flex-1 rounded py-0.5 text-[9px] font-bold transition ${
        channel.muted
          ? "bg-red-600/80 text-white"
          : "bg-[#252535] text-gray-500 hover:text-gray-300"
      }`}
    >
      MUTE
    </button>

    <button
      type="button"
      onClick={() =>
        onUpdate({
          solo: !channel.solo,
        })
      }
      className={`flex-1 rounded py-0.5 text-[9px] font-bold transition ${
        channel.solo
          ? "bg-yellow-500/80 text-black"
          : "bg-[#252535] text-gray-500 hover:text-gray-300"
      }`}
    >
      SOLO
    </button>
  </div>
</div>


);
}

/* ============================================================================

* MAIN COMPONENT
* ========================================================================== */

export default function StudioMain({
radio,
isLive,
setIsLive,
onRadioUpdate,
}: {
radio: RadioData | null;
isLive: boolean;
setIsLive: (value: boolean) => void;
onRadioUpdate?: (radio: RadioData) => void;
}) {
/* --------------------------------------------------------------------------

* PLAYBACK STATE
* ------------------------------------------------------------------------ */

const [isPlaying, setIsPlaying] = useState(false);
const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
const [trackElapsed, setTrackElapsed] = useState(0);
const [autoDj, setAutoDj] = useState(Boolean(radio?.isAutoDJ));

const audioRef = useRef<HTMLAudioElement | null>(null);

/* --------------------------------------------------------------------------

* RECORDING STATE
* ------------------------------------------------------------------------ */

const [isRecording, setIsRecording] = useState(false);
const [recElapsed, setRecElapsed] = useState(0);

const recTimerRef =
useRef<ReturnType<typeof setInterval> | null>(null);

/* --------------------------------------------------------------------------

* PLAYLIST STATE
* ------------------------------------------------------------------------ */

const [playlists, setPlaylists] = useState<Playlist[]>([]);
const [activePlaylist, setActivePlaylist] =
useState<Playlist | null>(null);

const [plLoading, setPlLoading] = useState(true);

/* --------------------------------------------------------------------------

* LIBRARY STATE
* ------------------------------------------------------------------------ */

const [tracks, setTracks] = useState<RadioTrack[]>([]);

const [libTab, setLibTab] = useState("music");
const [search, setSearch] = useState("");

const [showAddForm, setShowAddForm] = useState(false);
const [addTitle, setAddTitle] = useState("");
const [addUrl, setAddUrl] = useState("");

const [addingTrack, setAddingTrack] = useState(false);
const [playlistMsg, setPlaylistMsg] =
useState<string | null>(null);

/* --------------------------------------------------------------------------

* MIXER STATE
* ------------------------------------------------------------------------ */

const [channels, setChannels] = useState<ChannelData[]>([
{
id: "mic1",
name: "MIC PRINCIPAL",
volume: 75,
muted: false,
solo: false,
peak: 0,
color: "text-emerald-400",
icon: Mic,
},
{
id: "mic2",
name: "MIC INVITÉ 1",
volume: 60,
muted: false,
solo: false,
peak: 0,
color: "text-blue-400",
icon: Mic,
},
{
id: "mic3",
name: "MIC INVITÉ 2",
volume: 0,
muted: true,
solo: false,
peak: 0,
color: "text-orange-400",
icon: Mic,
},
{
id: "music",
name: "MUSIQUE",
volume: 70,
muted: false,
solo: false,
peak: 0,
color: "text-violet-400",
icon: Music,
},
{
id: "jingle",
name: "JINGLE",
volume: 50,
muted: false,
solo: false,
peak: 0,
color: "text-yellow-400",
icon: Bell,
},
{
id: "aux",
name: "AUX",
volume: 30,
muted: false,
solo: false,
peak: 0,
color: "text-gray-400",
icon: Volume2,
},
]);

/* --------------------------------------------------------------------------

* DERIVED DATA
* ------------------------------------------------------------------------ */

const activePlaylistItems =
activePlaylist?.items ?? [];

const currentTrack =
activePlaylistItems[currentTrackIndex] ?? null;

const currentDuration =
currentTrack?.duration ?? 0;

const micChannel =
channels.find((channel) => channel.id === "mic1");

const musicChannel =
channels.find((channel) => channel.id === "music");

/* --------------------------------------------------------------------------

* BROADCAST
* ------------------------------------------------------------------------ */

const {
status: broadcastStatus,
peerCount,
error: broadcastError,
} = useRadioBroadcast({
radioId: radio?.id,
isLive,
audioRef,
micVolume: micChannel?.volume ?? 75,
micMuted: micChannel?.muted ?? false,
musicVolume: musicChannel?.volume ?? 70,
musicMuted: musicChannel?.muted ?? false,
});

/* ==========================================================================

* EFFECTS
* ======================================================================== */

useEffect(() => {
setAutoDj(Boolean(radio?.isAutoDJ));
}, [radio?.isAutoDJ]);

/* --------------------------------------------------------------------------

* LOAD PLAYLISTS + TRACKS
* ------------------------------------------------------------------------ */

const refreshTracks = useCallback(async () => {
try {
const response = await fetch("/api/studio/tracks");

  if (!response.ok) {
    throw new Error("Impossible de charger les pistes.");
  }

  const data = await response.json();

  setTracks(data.tracks ?? []);
} catch (error) {
  console.error("Tracks fetch error:", error);
}


}, []);

const loadStudioData = useCallback(async () => {
setPlLoading(true);


try {
  const [playlistResponse, tracksResponse] =
    await Promise.all([
      fetch("/api/studio/playlists"),
      fetch("/api/studio/tracks"),
    ]);

  if (!playlistResponse.ok) {
    throw new Error("Impossible de charger les playlists.");
  }

  if (!tracksResponse.ok) {
    throw new Error("Impossible de charger les pistes.");
  }

  const playlistData =
    await playlistResponse.json();

  const tracksData =
    await tracksResponse.json();

  const loadedPlaylists: Playlist[] =
    playlistData.playlists ?? [];

  setPlaylists(loadedPlaylists);
  setTracks(tracksData.tracks ?? []);

  const assignedPlaylist =
    radio?.playlistId
      ? loadedPlaylists.find(
          (playlist) =>
            playlist.id === radio.playlistId,
        )
      : radio?.playlist;

  if (assignedPlaylist) {
    setActivePlaylist(assignedPlaylist);
  } else if (loadedPlaylists.length > 0) {
    setActivePlaylist(loadedPlaylists[0]);
  } else {
    setActivePlaylist(null);
  }
} catch (error) {
  console.error(
    "Studio data fetch error:",
    error,
  );
} finally {
  setPlLoading(false);
}


}, [radio?.id, radio?.playlistId, radio?.playlist]);

useEffect(() => {
loadStudioData();
}, [loadStudioData]);

/* --------------------------------------------------------------------------

* AUDIO SOURCE
* ------------------------------------------------------------------------ */

useEffect(() => {
const audio = audioRef.current;


if (!audio) return;

const track =
  activePlaylistItems[currentTrackIndex];

if (!track?.url) {
  audio.removeAttribute("src");
  audio.load();
  return;
}

audio.src = track.url;
audio.load();

if (isPlaying) {
  audio.play().catch((error) => {
    console.error(
      "Audio playback error:",
      error,
    );
  });
}


}, [
currentTrackIndex,
activePlaylist?.id,
activePlaylistItems,
isPlaying,
]);

/* --------------------------------------------------------------------------

* PLAY / PAUSE
* ------------------------------------------------------------------------ */

useEffect(() => {
const audio = audioRef.current;


if (!audio) return;

if (isPlaying) {
  audio.play().catch((error) => {
    console.error(
      "Audio playback error:",
      error,
    );
  });
} else {
  audio.pause();
}


}, [isPlaying]);

/* --------------------------------------------------------------------------

* VU METERS
* ------------------------------------------------------------------------ */

useEffect(() => {
const interval = window.setInterval(() => {
setChannels((previousChannels) =>
previousChannels.map((channel) => ({
...channel,
peak: channel.muted
? 0
: Math.max(
0,
Math.min(
100,
channel.volume +
(Math.random() * 30 - 15),
),
),
})),
);
}, 180);


return () => {
  window.clearInterval(interval);
};


}, []);

/* --------------------------------------------------------------------------

* RECORDING TIMER
* ------------------------------------------------------------------------ */

useEffect(() => {
if (!isRecording) {
if (recTimerRef.current) {
clearInterval(recTimerRef.current);
recTimerRef.current = null;
}


  return;
}

recTimerRef.current = setInterval(() => {
  setRecElapsed((elapsed) => elapsed + 1);
}, 1000);

return () => {
  if (recTimerRef.current) {
    clearInterval(recTimerRef.current);
    recTimerRef.current = null;
  }
};


}, [isRecording]);

/* --------------------------------------------------------------------------

* KEYBOARD SHORTCUTS
* ------------------------------------------------------------------------ */

const toggleLive = useCallback(async () => {
if (!radio?.id) return;


const nextLiveState = !isLive;

try {
  const response = await fetch(
    `/api/radio/${radio.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isLive: nextLiveState,
        isAutoDJ: autoDj,
        title: radio.title,
        description: radio.description,
        currentTrackId:
          currentTrack?.id ?? null,
        ...(nextLiveState
          ? {
              startedAt:
                new Date().toISOString(),
              endedAt: null,
            }
          : {
              endedAt:
                new Date().toISOString(),
            }),
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Impossible de modifier le statut live.",
    );
  }

  if (data.radio) {
    onRadioUpdate?.(data.radio);
    setIsLive(nextLiveState);
  }

  if (
    nextLiveState &&
    !isPlaying &&
    activePlaylistItems.length > 0
  ) {
    setIsPlaying(true);
    setTrackElapsed(0);
  }

  if (!nextLiveState) {
    setIsPlaying(false);
  }
} catch (error) {
  console.error(
    "Toggle live error:",
    error,
  );
}


}, [
radio,
isLive,
autoDj,
currentTrack?.id,
isPlaying,
activePlaylistItems.length,
onRadioUpdate,
setIsLive,
]);

useEffect(() => {
function handleKeyboard(event: KeyboardEvent) {
if (!event.ctrlKey) return;


  if (event.key.toLowerCase() === "l") {
    event.preventDefault();
    toggleLive();
  }

  if (event.key.toLowerCase() === "k") {
    event.preventDefault();

    if (isLive) {
      toggleLive();
    }
  }

  if (event.key.toLowerCase() === "j") {
    event.preventDefault();
    playJingle();
  }
}

window.addEventListener(
  "keydown",
  handleKeyboard,
);

return () => {
  window.removeEventListener(
    "keydown",
    handleKeyboard,
  );
};


}, [isLive, toggleLive]);

/* ==========================================================================

* ACTIONS
* ======================================================================== */

function updateChannel(
channelId: string,
updates: Partial<ChannelData>,
) {
setChannels((previousChannels) =>
previousChannels.map((channel) =>
channel.id === channelId
? {
...channel,
...updates,
}
: channel,
),
);
}

async function syncCurrentTrack(
trackId: string | null,
) {
if (!radio?.id) return;


try {
  const response = await fetch(
    `/api/radio/${radio.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentTrackId: trackId,
      }),
    },
  );

  const data = await response.json();

  if (response.ok && data.radio) {
    onRadioUpdate?.(data.radio);
  }
} catch (error) {
  console.error(
    "Sync track error:",
    error,
  );
}


}

async function updateAutoDj(
value: boolean,
) {
setAutoDj(value);


if (!radio?.id) return;

try {
  const response = await fetch(
    `/api/radio/${radio.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isAutoDJ: value,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Impossible de modifier AutoDJ.",
    );
  }

  if (data.radio) {
    onRadioUpdate?.(data.radio);
  }
} catch (error) {
  console.error(
    "AutoDJ update error:",
    error,
  );

  setAutoDj(!value);
}


}

async function switchPlaylist(
playlist: Playlist,
) {
setActivePlaylist(playlist);
setCurrentTrackIndex(0);
setTrackElapsed(0);
setIsPlaying(false);


if (!radio?.id) return;

try {
  const response = await fetch(
    "/api/studio/radio",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: radio.id,
        playlistId: playlist.id,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Impossible d'associer la playlist.",
    );
  }

  if (data.radio) {
    onRadioUpdate?.(data.radio);
  }
} catch (error) {
  console.error(
    "Assign playlist error:",
    error,
  );
}


}

function playTrack(index: number) {
if (
index < 0 ||
index >= activePlaylistItems.length
) {
return;
}


const track =
  activePlaylistItems[index];

setCurrentTrackIndex(index);
setTrackElapsed(0);
setIsPlaying(true);

if (track?.id) {
  syncCurrentTrack(track.id);
}


}

function moveTrack(
index: number,
direction: -1 | 1,
) {
if (!activePlaylist) return;


const newIndex = index + direction;

if (
  newIndex < 0 ||
  newIndex >= activePlaylistItems.length
) {
  return;
}

const items = [
  ...activePlaylistItems,
];

[
  items[index],
  items[newIndex],
] = [
  items[newIndex],
  items[index],
];

setActivePlaylist({
  ...activePlaylist,
  items,
});


}

async function persistPlaylist(
items: RadioTrack[],
): Promise<boolean> {
if (!activePlaylist?.id) {
setPlaylistMsg(
"Aucune playlist active.",
);


  return false;
}

const payload = items.map((item) => ({
  title:
    item.title || "Sans titre",
  url: item.url,
  type:
    item.type === "VIDEO"
      ? "VIDEO"
      : "AUDIO",
  duration:
    item.duration ?? null,
}));

if (
  payload.some(
    (item) => !item.url,
  )
) {
  setPlaylistMsg(
    "Chaque piste doit avoir une URL valide.",
  );

  return false;
}

try {
  const response = await fetch(
    "/api/studio/playlists",
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        id: activePlaylist.id,
        items: payload,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    setPlaylistMsg(
      data.error ||
        "Erreur lors de la sauvegarde.",
    );

    return false;
  }

  if (data.playlist) {
    setActivePlaylist(
      data.playlist,
    );

    setPlaylists((previous) =>
      previous.map((playlist) =>
        playlist.id ===
        data.playlist.id
          ? data.playlist
          : playlist,
      ),
    );
  }

  return true;
} catch (error) {
  console.error(
    "Persist playlist error:",
    error,
  );

  setPlaylistMsg(
    "Erreur réseau lors de la sauvegarde.",
  );

  return false;
}


}

async function removeTrack(
index: number,
) {
if (!activePlaylist) return;


const items =
  activePlaylistItems.filter(
    (_, itemIndex) =>
      itemIndex !== index,
  );

setActivePlaylist({
  ...activePlaylist,
  items,
});

await persistPlaylist(items);

if (
  index === currentTrackIndex
) {
  setTrackElapsed(0);
  setIsPlaying(false);

  const nextTrack =
    items[index] ??
    items[index - 1] ??
    null;

  if (nextTrack?.id) {
    setCurrentTrackIndex(
      Math.max(
        0,
        Math.min(
          index,
          items.length - 1,
        ),
      ),
    );
  }
} else if (
  index < currentTrackIndex
) {
  setCurrentTrackIndex(
    (currentIndex) =>
      Math.max(
        0,
        currentIndex - 1,
      ),
  );
}


}

async function saveToLibrary(
item: {
title: string;
url: string;
duration?: number;
category?: string;
},
) {
try {
const response = await fetch(
"/api/studio/tracks",
{
method: "POST",
headers: {
"Content-Type":
"application/json",
},
body: JSON.stringify({
title: item.title,
url: item.url,
duration:
item.duration ?? 0,
category:
item.category ||
"GENERAL",
type: "MUSIC",
}),
},
);


  if (response.ok) {
    await refreshTracks();
  }
} catch (error) {
  console.error(
    "Save library error:",
    error,
  );
}


}

async function addToPlaylist(
  item: {
    title?: string;
    url?: string;
    type?: string;
    duration?: number;
    saveToLib?: boolean;
  },
): Promise<boolean> {
  const url = item.url?.trim();

  if (!url) {
    setPlaylistMsg(
      "URL de la piste manquante.",
    );

    return false;
  }

  if (!activePlaylist?.id) {
    setPlaylistMsg(
      "Aucune playlist active.",
    );

    return false;
  }

  const newItem = {
    title:
      item.title?.trim() ||
      "Sans titre",

    url,

    type:
      item.type === "VIDEO"
        ? "VIDEO"
        : "AUDIO",

    duration:
      item.duration ?? null,
  };

  try {
    const response = await fetch(
      `/api/studio/playlists/${activePlaylist.id}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          newItem,
        ),
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      setPlaylistMsg(
        data.error ||
          "Impossible d'ajouter la piste.",
      );

      return false;
    }

    if (data.playlist) {
      setActivePlaylist(
        data.playlist,
      );

      setPlaylists((previous) =>
        previous.map((playlist) =>
          playlist.id ===
          data.playlist.id
            ? data.playlist
            : playlist,
        ),
      );
    }

    if (
      item.saveToLib !== false
    ) {
      await saveToLibrary({
        title: newItem.title,
        url: newItem.url,
        duration:
          newItem.duration ??
          undefined,
      });
    }

    setPlaylistMsg(
      `« ${newItem.title} » ajouté à la playlist.`,
    );

    window.setTimeout(
      () => setPlaylistMsg(null),
      3000,
    );

    return true;
  } catch (error) {
    console.error(
      "Add to playlist error:",
      error,
    );

    setPlaylistMsg(
      "Erreur réseau.",
    );

    return false;
  }
}

async function handleAddByUrl(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (!addUrl.trim()) {
    setPlaylistMsg(
      "URL de la piste requise.",
    );

    return;
  }

  setAddingTrack(true);

  try {
    const url =
      addUrl.trim();

    const duration =
      await probeDuration(url);

    const success =
      await addToPlaylist({
        title:
          addTitle.trim() ||
          "Nouvelle piste",
        url,
        duration,
      });

    if (success) {
      setAddTitle("");
      setAddUrl("");
      setShowAddForm(false);
    }
  } finally {
    setAddingTrack(false);
  }
}

async function handleAudioUpload(
  results: UploadResult[],
) {
  const file =
    results?.[0];

  const url =
    file?.ufsUrl ||
    file?.url;

  if (!url) {
    setPlaylistMsg(
      "Upload échoué — URL introuvable.",
    );

    return;
  }

  setAddingTrack(true);

  try {
    const title =
      file.name?.replace(
        /\.[^.]+$/,
        "",
      ).trim() ||
      "Piste audio";

    const duration =
      await probeDuration(url);

    const success =
      await addToPlaylist({
        title,
        url,
        duration,
      });

    if (success) {
      setAddTitle("");
      setAddUrl("");
      setShowAddForm(false);
    }
  } finally {
    setAddingTrack(false);
  }
}

/* ==========================================================================

* LIBRARY DATA
* ======================================================================== */

const categoryMap: Record<string, string> = {
 GENERAL: "music",
 MUSIC: "music",
 PREACHING: "preaching",
 JINGLE: "jingles",
 PODCAST: "podcasts",
 };

const libraryTracks: LibraryItem[] =
tracks.map((track) => ({
id: track.id,
title: track.title,
artist:
track.artist ||
"Bibliothèque",
duration: track.duration,
url: track.url,
category:
categoryMap[
track.category ||
track.type ||
"GENERAL"
] || "music",
}));

const playlistLibraryItems: LibraryItem[] =
playlists.flatMap((playlist) =>
(playlist.items || []).map(
(item) => ({
id: item.id,
title: item.title,
artist: playlist.title,
duration: item.duration,
url: item.url,
category:
item.type === "VIDEO"
? "preaching"
: "music",
}),
),
);

const allLibraryItems = [
...libraryTracks,
...playlistLibraryItems,
];

const activeLibraryItems =
allLibraryItems.filter((item) => {
const validCategory =
libTab === "music"
? [
"music",
"jingles",
"podcasts",
].includes(
item.category,
)
: item.category ===
libTab;


  const matchesSearch =
    !search ||
    item.title
      .toLowerCase()
      .includes(
        search.toLowerCase(),
      );

  return (
    validCategory &&
    matchesSearch
  );
});


/* ==========================================================================

* RENDER
* ======================================================================== */

return ( <main className="min-w-0 flex-1 overflow-y-auto bg-[#0a0a0f]">
<audio
ref={audioRef}
preload="metadata"
className="hidden"
onTimeUpdate={() =>
setTrackElapsed(
Math.floor(
audioRef.current
?.currentTime || 0,
),
)
}
onEnded={() => {
if (
autoDj &&
activePlaylistItems.length >
0
) {
const nextIndex =
(currentTrackIndex + 1) %
activePlaylistItems.length;


        setCurrentTrackIndex(
          nextIndex,
        );

        setTrackElapsed(0);

        const nextTrack =
          activePlaylistItems[
            nextIndex
          ];

        if (nextTrack?.id) {
          syncCurrentTrack(
            nextTrack.id,
          );
        }

        return;
      }

      setIsPlaying(false);
    }}
  />

  <div className="space-y-4 p-4">
    {/* --------------------------------------------------------------------
     * LIVE BROADCAST
     * ------------------------------------------------------------------ */}

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-xl bg-[#16161f] p-4 xl:col-span-2">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Diffusion en direct
        </h3>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop"
              alt="Cover"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[9px] text-white">
              {fmtDuration(
                trackElapsed,
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="truncate font-semibold text-white">
                {currentTrack?.title ||
                  "En attente"}
              </h4>

              {isLive && (
                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  ON AIR
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400">
              {activePlaylist?.title ||
                "Playlist"}
            </p>

            <div className="mt-2 flex h-6 items-end gap-[2px]">
              {Array.from({
                length: 60,
              }).map(
                (_, index) => {
                  const isPast =
                    currentDuration >
                      0 &&
                    index / 60 <
                      trackElapsed /
                        currentDuration;

                  const height =
                    20 +
                    ((index * 37) %
                      60);

                  return (
                    <div
                      key={index}
                      className={`w-[3px] rounded-full transition-all duration-300 ${
                        isPlaying
                          ? isPast
                            ? "bg-violet-500"
                            : "bg-violet-500/30"
                          : "bg-gray-700"
                      }`}
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  );
                },
              )}
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-[9px] text-gray-500">
                {fmtDuration(
                  trackElapsed,
                )}
              </span>

              <span className="text-[9px] text-gray-500">
                {fmtDuration(
                  currentDuration,
                )}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setIsPlaying(
                    (value) =>
                      !value,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500"
              >
                {isPlaying ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(
                    false,
                  );

                  setTrackElapsed(
                    0,
                  );

                  if (
                    audioRef.current
                  ) {
                    audioRef.current.currentTime =
                      0;
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-500"
              >
                <Square size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleLive}
              className={`flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition ${
                isLive
                  ? "bg-red-600/20 text-red-400"
                  : "bg-emerald-600/20 text-emerald-400"
              }`}
            >
              <Radio size={10} />

              {isLive
                ? "OFF AIR"
                : "ON AIR"}
            </button>

            <button
              type="button"
              onClick={() =>
                updateAutoDj(
                  !autoDj,
                )
              }
              className={`flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] transition ${
                autoDj
                  ? "bg-violet-600/30 text-violet-300"
                  : "bg-[#1e1e2d] text-gray-400 hover:bg-[#252535]"
              }`}
            >
              <MonitorUp size={10} />

              AutoDJ{" "}
              {autoDj
                ? "ON"
                : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* STATUS */}
      <div className="rounded-xl bg-[#16161f] p-4">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Statut diffusion
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Statut
            </span>

            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                isLive
                  ? "bg-red-500/20 text-red-400"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {isLive
                ? "EN DIRECT"
                : "HORS LIGNE"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Qualité
            </span>

            <span className="text-[10px] font-bold text-emerald-400">
              EXCELLENTE
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Source
            </span>

            <span className="text-xs text-gray-300">
              Live Studio
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              WebRTC
            </span>

            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                broadcastStatus ===
                "live"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : broadcastStatus ===
                      "connecting"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : broadcastStatus ===
                        "error"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-700 text-gray-400"
              }`}
            >
              {broadcastStatus ===
              "live"
                ? `ACTIF · ${peerCount} flux`
                : broadcastStatus ===
                    "connecting"
                  ? "CONNEXION..."
                  : broadcastStatus ===
                      "error"
                    ? "ERREUR"
                    : "INACTIF"}
            </span>
          </div>

          {broadcastError && (
            <p className="text-[10px] text-red-400">
              {broadcastError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Audio
            </span>

            <span className="text-xs text-gray-300">
              128 kbps{" "}
              <Signal
                size={10}
                className="inline text-emerald-400"
              />
            </span>
          </div>

          {isLive &&
            radio?.id && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Page d'écoute
                </span>

                <a
                  href={`/radio/${radio.id}`}
                  className="text-[10px] text-violet-400 underline hover:text-violet-300"
                >
                  Ouvrir le lecteur
                </a>
              </div>
            )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Diffusion sur
            </span>

            <div className="flex gap-1.5">
              {[
                "W",
                "F",
                "Y",
                "T",
                "+",
              ].map(
                (letter) => (
                  <span
                    key={letter}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-[9px] text-gray-300"
                  >
                    {letter}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* --------------------------------------------------------------------
     * MIXER
     * ------------------------------------------------------------------ */}

    <div className="rounded-xl bg-[#16161f] p-4">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Mixeur Audio
      </h3>

      <div className="flex flex-wrap justify-center gap-2">
        {channels.map(
          (channel) => (
            <ChannelStrip
              key={channel.id}
              channel={channel}
              onUpdate={(updates) =>
                updateChannel(
                  channel.id,
                  updates,
                )
              }
            />
          ),
        )}
      </div>
    </div>

    {/* --------------------------------------------------------------------
     * PLAYLIST + LIBRARY
     * ------------------------------------------------------------------ */}

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* PLAYLIST */}
      <div className="rounded-xl bg-[#16161f] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Playlist en cours
            </h3>

            <select
              value={
                activePlaylist?.id ||
                ""
              }
              onChange={(event) => {
                const playlist =
                  playlists.find(
                    (item) =>
                      item.id ===
                      event.target
                        .value,
                  );

                if (playlist) {
                  switchPlaylist(
                    playlist,
                  );
                }
              }}
              className="mt-1 w-full rounded-lg bg-[#1e1e2d] px-2 py-1 text-xs text-white"
            >
              <option value="">
                Sélectionner une playlist
              </option>

              {playlists.map(
                (playlist) => (
                  <option
                    key={playlist.id}
                    value={
                      playlist.id
                    }
                  >
                    {playlist.title}
                  </option>
                ),
              )}
            </select>

            <p className="mt-0.5 text-[10px] text-gray-600">
              {
                activePlaylistItems.length
              }{" "}
              titres ·{" "}
              {fmtDuration(
                activePlaylistItems.reduce(
                  (
                    total,
                    item,
                  ) =>
                    total +
                    (item.duration ||
                      0),
                  0,
                ),
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddForm(
                (value) =>
                  !value,
              )
            }
            className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[10px] text-white transition hover:bg-violet-500"
          >
            <Plus size={12} />

            Ajouter
          </button>
        </div>

        {playlistMsg && (
          <p
            className={`mb-2 text-[10px] ${
              playlistMsg.includes(
                "ajouté",
              )
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {playlistMsg}
          </p>
        )}

        {showAddForm && (
          <form
            onSubmit={
              handleAddByUrl
            }
            className="mb-3 space-y-2 rounded-lg bg-[#1e1e2d] p-2"
          >
            <input
              value={addTitle}
              onChange={(event) =>
                setAddTitle(
                  event.target
                    .value,
                )
              }
              placeholder="Titre de la piste"
              className="w-full rounded bg-[#16161f] px-2 py-1.5 text-xs text-white"
            />

            <input
              value={addUrl}
              onChange={(event) =>
                setAddUrl(
                  event.target
                    .value,
                )
              }
              placeholder="URL audio"
              className="w-full rounded bg-[#16161f] px-2 py-1.5 text-xs text-white"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingTrack}
                className="flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600 py-1.5 text-[10px] disabled:opacity-50"
              >
                <Link2 size={10} />

                {addingTrack
                  ? "Ajout..."
                  : "Ajouter à la playlist"}
              </button>

              <div className="ut-studio-upload">
                <UploadButton
                  endpoint="audioUploader"
                  onClientUploadComplete={
                    handleAudioUpload
                  }
                  onUploadError={(
                    error,
                  ) =>
                    setPlaylistMsg(
                      error.message,
                    )
                  }
                  appearance={{
                    button:
                      "rounded bg-violet-600 px-2 py-1.5 text-[10px] hover:bg-violet-500",
                    allowedContent:
                      "hidden",
                  }}
                  content={{
                    button: ({
                      ready,
                    }) => (
                      <span className="flex items-center gap-1">
                        <Upload
                          size={
                            10
                          }
                        />

                        {ready
                          ? "Importer"
                          : "..."}
                      </span>
                    ),
                  }}
                />
              </div>
            </div>
          </form>
        )}

        {plLoading ? (
          <div className="py-4 text-center text-xs text-gray-600">
            Chargement...
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {activePlaylistItems.length ===
                0 && (
                <div className="rounded-lg py-6 text-center text-xs text-gray-500">
                  Playlist vide.
                </div>
              )}

              {activePlaylistItems.map(
                (
                  track,
                  index,
                ) => (
                  <div
                    key={
                      track.id ||
                      index
                    }
                    onClick={() =>
                      playTrack(
                        index,
                      )
                    }
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                      index ===
                      currentTrackIndex
                        ? "bg-violet-600/10"
                        : "hover:bg-[#1e1e2d]"
                    }`}
                  >
                    <span className="w-4 text-center text-[10px] text-gray-500">
                      {index + 1}
                    </span>

                    <span className="text-gray-500">
                      ♪
                    </span>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate ${
                          index ===
                          currentTrackIndex
                            ? "font-medium text-white"
                            : "text-gray-300"
                        }`}
                      >
                        {track.title}
                      </div>

                      <div className="truncate text-[10px] text-gray-500">
                        {activePlaylist?.title ||
                          "-"}
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] text-gray-500">
                      {fmtDuration(
                        track.duration,
                      )}
                    </span>

                    {index ===
                      currentTrackIndex && (
                      <span className="shrink-0 rounded bg-emerald-600/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                        EN COURS
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();
                      }}
                      className="shrink-0 text-gray-500 hover:text-white"
                    >
                      ⋮
                    </button>
                  </div>
                ),
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  playTrack(
                    currentTrackIndex,
                  )
                }
                className="flex-1 rounded bg-[#1e1e2d] py-1.5 text-[10px] text-emerald-400 transition hover:bg-[#252535]"
              >
                <span className="flex items-center justify-center gap-1">
                  <Play size={10} />

                  Lire maintenant
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  moveTrack(
                    currentTrackIndex,
                    -1,
                  )
                }
                className="rounded bg-[#1e1e2d] px-2 py-1.5 text-[10px] text-gray-400 transition hover:bg-[#252535]"
              >
                Monter
              </button>

              <button
                type="button"
                onClick={() =>
                  moveTrack(
                    currentTrackIndex,
                    1,
                  )
                }
                className="rounded bg-[#1e1e2d] px-2 py-1.5 text-[10px] text-gray-400 transition hover:bg-[#252535]"
              >
                Descendre
              </button>

              <button
                type="button"
                onClick={() =>
                  removeTrack(
                    currentTrackIndex,
                  )
                }
                className="rounded bg-[#1e1e2d] px-2 py-1.5 text-[10px] text-red-400 transition hover:bg-red-900/30"
              >
                Retirer
              </button>
            </div>
          </>
        )}
      </div>

      {/* LIBRARY */}
      <div className="rounded-xl bg-[#16161f] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Bibliothèque
          </h3>

          <UploadButton
            endpoint="audioUploader"
            onClientUploadComplete={
              handleAudioUpload
            }
            onUploadError={(error) =>
              setPlaylistMsg(
                error.message,
              )
            }
            appearance={{
              button:
                "rounded bg-violet-600/80 px-2 py-1 text-[10px] hover:bg-violet-500",
              allowedContent:
                "hidden",
            }}
            content={{
              button: ({
                ready,
              }) => (
                <span className="flex items-center gap-1 text-white">
                  <Upload size={10} />

                  {ready
                    ? "Importer audio"
                    : "..."}
                </span>
              ),
            }}
          />
        </div>

        <div className="mb-3 flex gap-1 overflow-x-auto">
          {[
            "music",
            "preaching",
            "jingles",
            "podcasts",
            "shows",
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                setLibTab(tab)
              }
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-medium transition ${
                libTab === tab
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab ===
              "music"
                ? "Musiques"
                : tab ===
                    "preaching"
                  ? "Prédications"
                  : tab ===
                      "jingles"
                    ? "Jingles"
                    : tab ===
                        "podcasts"
                      ? "Podcasts"
                      : "Émissions"}
            </button>
          ))}
        </div>

        <div className="relative mb-3">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Rechercher..."
            className="w-full rounded-lg bg-[#1e1e2d] py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none"
          />
        </div>

        <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
          {activeLibraryItems.length ===
            0 && (
            <div className="space-y-1 py-4 text-center text-xs text-gray-500">
              <p>
                Aucune piste dans la bibliothèque.
              </p>

              <p className="text-gray-600">
                Importez un fichier audio ou ajoutez une URL.
              </p>
            </div>
          )}

          {activeLibraryItems
            .slice(0, 20)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition hover:bg-[#1e1e2d]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-gray-500">
                  <Music size={10} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-gray-300">
                    {item.title}
                  </div>

                  <div className="text-[10px] text-gray-500">
                    {item.artist}
                  </div>
                </div>

                <span className="text-[10px] text-gray-500">
                  {fmtDuration(
                    item.duration,
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    addToPlaylist({
                      title:
                        item.title,
                      url: item.url,
                      duration:
                        item.duration ??
                        undefined,
                      saveToLib: false,
                    })
                  }
                  className="px-1 text-gray-500 transition hover:text-emerald-400"
                  title="Ajouter à la playlist"
                >
                  +
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>

    {/* --------------------------------------------------------------------
     * BOTTOM TOOLS
     * ------------------------------------------------------------------ */}

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-xl bg-[#16161f] p-4">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Intervenants en ligne
        </h3>

        <div className="flex items-center gap-3">
          {[
            {
              name: "Pasteur Daniel",
              role: "Animateur",
              mic: true,
            },
            {
              name: "Frère Joseph",
              role: "Invité",
              mic: true,
            },
            {
              name: "Sœur Grace",
              role: "Invitée",
              mic: false,
            },
          ].map((guest) => (
            <div
              key={guest.name}
              className="relative flex flex-col items-center gap-1"
            >
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-xs text-gray-300">
                  {guest.name
                    .charAt(
                      0,
                    )
                    .toUpperCase()}
                </div>

                <div
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${
                    guest.mic
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                >
                  <Mic
                    size={6}
                    className="absolute inset-0 m-auto text-white"
                  />
                </div>
              </div>

              <span className="text-[10px] font-medium text-gray-300">
                {guest.name}
              </span>

              <span className="text-[9px] text-gray-500">
                {guest.role}
              </span>
            </div>
          ))}

          <button
            type="button"
            className="flex flex-col items-center gap-1 text-gray-500 transition hover:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full">
              <Plus size={14} />
            </div>

            <span className="text-[10px]">
              Inviter
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-[#16161f] p-4">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Effets & Outils
        </h3>

        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Jingle",
              icon: Music,
              action: playJingle,
            },
            {
              label: "Applaudissements",
              icon: Volume2,
              action: playApplause,
            },
            {
              label: "Rires",
              icon: Volume2,
              action: playLaugh,
            },
            {
              label: "Sirène",
              icon: Volume2,
              action: playSiren,
            },
            {
              label: "Cloche",
              icon: Bell,
              action: playBell,
            },
            {
              label: "Publicité",
              icon: MonitorUp,
              action: () =>
                playTone(
                  440,
                  0.5,
                  "square",
                ),
            },
          ].map((effect) => {
            const Icon =
              effect.icon;

            return (
              <button
                key={effect.label}
                type="button"
                onClick={
                  effect.action
                }
                className="flex flex-col items-center gap-1 rounded-lg bg-[#1e1e2d] p-2 transition hover:bg-[#252535]"
              >
                <Icon
                  size={14}
                  className="text-gray-400"
                />

                <span className="text-[9px] text-gray-500">
                  {effect.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-[#16161f] p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Enregistrement
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setIsRecording(
                  (value) =>
                    !value,
                )
              }
              className="flex items-center gap-1.5"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isRecording
                    ? "animate-pulse bg-red-500"
                    : "bg-gray-600"
                }`}
              />

              <span
                className={`text-xs font-bold ${
                  isRecording
                    ? "text-red-400"
                    : "text-gray-500"
                }`}
              >
                REC
              </span>
            </button>

            <span className="font-mono text-sm text-gray-300">
              {fmtDuration(
                recElapsed,
              )}
            </span>

            <span className="text-[10px] text-gray-500">
              {isRecording
                ? "Enregistrement en cours"
                : "En pause"}
            </span>

            {isRecording && (
              <button
                type="button"
                onClick={() => {
                  setIsRecording(
                    false,
                  );

                  setRecElapsed(
                    0,
                  );
                }}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <StopCircle
                  size={14}
                />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[#16161f] p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Raccourcis
          </h3>

          <div className="space-y-1 text-[10px] text-gray-400">
            <div className="flex justify-between">
              <span>
                Démarrer live
              </span>

              <span className="rounded bg-[#1e1e2d] px-1 font-mono text-gray-500">
                CTRL + L
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Stop live
              </span>

              <span className="rounded bg-[#1e1e2d] px-1 font-mono text-gray-500">
                CTRL + K
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Jingle
              </span>

              <span className="rounded bg-[#1e1e2d] px-1 font-mono text-gray-500">
                CTRL + J
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

);
}
