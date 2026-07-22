"use client";

import {
useState,
useEffect,
useRef,
useCallback,
type ComponentType,
} from "react";

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
Download,
CircleStop,
} from "lucide-react";

/* =========================================================
TYPES
========================================================= */

interface PlaylistItem {
id?: string;
title: string;
url: string;
type?: "AUDIO" | "VIDEO";
duration?: number | null;
}

interface Playlist {
id: string;
title: string;
items?: PlaylistItem[];
}

interface Track {
id: string;
title: string;
artist?: string | null;
url: string;
duration?: number | null;
category?: string | null;
type?: string | null;
}

interface ChannelData {
id: string;
name: string;
volume: number;
muted: boolean;
solo: boolean;
peak: number;
color: string;
icon: ComponentType<{
size?: number;
className?: string;
}>;
}

/* =========================================================
HELPERS
========================================================= */

function probeDuration(url: string): Promise<number> {
return new Promise((resolve) => {
const audio = new Audio();


audio.preload = "metadata";

audio.onloadedmetadata = () => {
  resolve(
    Number.isFinite(audio.duration)
      ? Math.floor(audio.duration)
      : 0
  );
};

audio.onerror = () => resolve(0);

audio.src = url;


});
}

function fmtDuration(seconds?: number | null) {
if (!seconds || seconds <= 0) {
return "--:--";
}

const minutes = Math.floor(seconds / 60)
.toString()
.padStart(2, "0");

const remainingSeconds = Math.floor(seconds % 60)
.toString()
.padStart(2, "0");

return `${minutes}:${remainingSeconds}`;
}

function fmtRecordingTime(seconds: number) {
const minutes = Math.floor(seconds / 60)
.toString()
.padStart(2, "0");

const remainingSeconds = Math.floor(seconds % 60)
.toString()
.padStart(2, "0");

return `${minutes}:${remainingSeconds}`;
}

/* =========================================================
VU METER
========================================================= */

function VUMeter({
peak,
active,
}: {
peak: number;
active: boolean;
}) {
const levels = Array.from({ length: 14 });

const fill = active
? Math.round((peak / 100) * levels.length)
: 0;

return ( <div className="flex w-[6px] flex-col-reverse gap-[1.5px]">
{levels.map((_, index) => {
const isOn = index < fill;


    let className = "bg-gray-800";

    if (isOn) {
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

/* =========================================================
CHANNEL STRIP
========================================================= */

function ChannelStrip({
channel,
onUpdate,
}: {
channel: ChannelData;
onUpdate: (updates: Partial<ChannelData>) => void;
}) {
const Icon = channel.icon;

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
      min="0"
      max="100"
      value={channel.volume}
      onChange={(event) =>
        onUpdate({
          volume: Number(event.target.value),
        })
      }
      className="absolute w-24 -rotate-90 origin-center accent-gray-400 opacity-60 transition hover:opacity-100"
    />
  </div>

  <div className="font-mono text-[9px] text-gray-500">
    {channel.volume > 0
      ? `-${(36 - channel.volume / 2.7).toFixed(1)} dB`
      : "-∞ dB"}
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

/* =========================================================
MAIN COMPONENT
========================================================= */

interface ChurchStudioMainProps {
radio: any;
isLive: boolean;
setIsLive: (value: boolean) => void;
onRadioUpdate?: (radio: any) => void;
churchSlug: string;
}

export default function ChurchStudioMain({
radio,
isLive,
setIsLive,
onRadioUpdate,
churchSlug,
}: ChurchStudioMainProps) {
/* =======================================================
AUDIO PLAYER
======================================================= */

const audioRef =
useRef<HTMLAudioElement | null>(null);

const [isPlaying, setIsPlaying] =
useState(false);

const [currentTrackIndex, setCurrentTrackIndex] =
useState(0);

const [trackElapsed, setTrackElapsed] =
useState(0);

/* =======================================================
RADIO STATE
======================================================= */

const [autoDj, setAutoDj] =
useState(Boolean(radio?.isAutoDJ));

const [playlists, setPlaylists] =
useState<Playlist[]>([]);

const [activePlaylist, setActivePlaylist] =
useState<Playlist | null>(null);

const [tracks, setTracks] =
useState<Track[]>([]);

/* =======================================================
MICROPHONE RECORDING
======================================================= */

const [isRecording, setIsRecording] =
useState(false);

const [recElapsed, setRecElapsed] =
useState(0);

const [recordedAudioUrl, setRecordedAudioUrl] =
useState<string | null>(null);

const [recordingError, setRecordingError] =
useState<string | null>(null);

const mediaRecorderRef =
useRef<MediaRecorder | null>(null);

const mediaStreamRef =
useRef<MediaStream | null>(null);

const recordedChunksRef =
useRef<Blob[]>([]);

const recTimerRef =
useRef<ReturnType<typeof setInterval> | null>(null);

/* =======================================================
MIXER
======================================================= */

const [channels, setChannels] =
useState<ChannelData[]>([
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

/* =======================================================
LIBRARY
======================================================= */

const [libTab, setLibTab] =
useState("music");

const [search, setSearch] =
useState("");

const [showAddForm, setShowAddForm] =
useState(false);

const [addTitle, setAddTitle] =
useState("");

const [addUrl, setAddUrl] =
useState("");

const [addingTrack, setAddingTrack] =
useState(false);

const [playlistMsg, setPlaylistMsg] =
useState<string | null>(null);

/* =======================================================
CURRENT PLAYLIST
======================================================= */

const activePlaylistItems =
activePlaylist?.items ?? [];

const currentTrack =
activePlaylistItems[currentTrackIndex] ??
null;

const currentDuration =
currentTrack?.duration ?? 0;

/* =======================================================
BROADCAST
======================================================= */

const micChannel =
channels.find(
(channel) => channel.id === "mic1"
);

const musicChannel =
channels.find(
(channel) => channel.id === "music"
);

const {
status: broadcastStatus,
peerCount,
error: broadcastError,
} = useRadioBroadcast({
radioId: radio?.id,
isLive,
audioRef,
micVolume:
micChannel?.volume ?? 75,
micMuted:
micChannel?.muted ?? false,
musicVolume:
musicChannel?.volume ?? 70,
musicMuted:
musicChannel?.muted ?? false,
});

/* =======================================================
MICROPHONE RECORDING
======================================================= */

async function startRecording() {
try {
setRecordingError(null);


  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error(
      "La capture du microphone n'est pas supportée par ce navigateur."
    );
  }

  const stream =
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

  mediaStreamRef.current = stream;

  recordedChunksRef.current = [];

  const recorder =
    new MediaRecorder(stream);

  mediaRecorderRef.current = recorder;

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunksRef.current.push(
        event.data
      );
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(
      recordedChunksRef.current,
      {
        type: "audio/webm",
      }
    );

    const url =
      URL.createObjectURL(blob);

    setRecordedAudioUrl(
      (previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(
            previousUrl
          );
        }

        return url;
      }
    );

    stream
      .getTracks()
      .forEach((track) =>
        track.stop()
      );
  };

  recorder.start();

  setRecElapsed(0);
  setIsRecording(true);
} catch (error) {
  console.error(
    "Microphone recording error:",
    error
  );

  setRecordingError(
    error instanceof Error
      ? error.message
      : "Impossible d'accéder au microphone."
  );
}


}

function stopRecording() {
const recorder =
mediaRecorderRef.current;


if (
  recorder &&
  recorder.state !== "inactive"
) {
  recorder.stop();
}

mediaRecorderRef.current = null;

mediaStreamRef.current
  ?.getTracks()
  .forEach((track) =>
    track.stop()
  );

mediaStreamRef.current = null;

setIsRecording(false);


}

function downloadRecording() {
if (!recordedAudioUrl) {
return;
}


const link =
  document.createElement("a");

link.href = recordedAudioUrl;

link.download =
  `churchface-recording-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.webm`;

document.body.appendChild(link);

link.click();

document.body.removeChild(link);


}

/* =======================================================
AUTO DJ
======================================================= */

useEffect(() => {
setAutoDj(
Boolean(radio?.isAutoDJ)
);
}, [radio?.isAutoDJ]);

/* =======================================================
RECORDING TIMER
======================================================= */

useEffect(() => {
if (!isRecording) {
if (recTimerRef.current) {
clearInterval(
recTimerRef.current
);


    recTimerRef.current = null;
  }

  return;
}

recTimerRef.current =
  setInterval(() => {
    setRecElapsed(
      (elapsed) => elapsed + 1
    );
  }, 1000);

return () => {
  if (recTimerRef.current) {
    clearInterval(
      recTimerRef.current
    );

    recTimerRef.current = null;
  }
};


}, [isRecording]);

/* =======================================================
FETCH DATA
======================================================= */

const refreshTracks = useCallback(
async () => {
try {
const response =
await fetch(
`/api/church/${churchSlug}/studio/tracks`
);


    if (!response.ok) {
      throw new Error(
        "Impossible de charger les pistes"
      );
    }

    const data =
      await response.json();

    setTracks(
      data.tracks || []
    );
  } catch (error) {
    console.error(
      "Refresh tracks error:",
      error
    );
  }
},
[churchSlug]


);

useEffect(() => {
let cancelled = false;


async function fetchStudioData() {
  try {
    const [
      playlistsResponse,
      tracksResponse,
    ] = await Promise.all([
      fetch(
        `/api/church/${churchSlug}/studio/playlists`
      ),
      fetch(
        `/api/church/${churchSlug}/studio/tracks`
      ),
    ]);

    if (
      !playlistsResponse.ok ||
      !tracksResponse.ok
    ) {
      throw new Error(
        "Erreur de chargement du studio"
      );
    }

    const playlistsData =
      await playlistsResponse.json();

    const tracksData =
      await tracksResponse.json();

    if (cancelled) {
      return;
    }

    const loadedPlaylists =
      playlistsData.playlists || [];

    setPlaylists(
      loadedPlaylists
    );

    setTracks(
      tracksData.tracks || []
    );

    const assignedPlaylist =
      radio?.playlistId
        ? loadedPlaylists.find(
            (playlist: Playlist) =>
              playlist.id ===
              radio.playlistId
          )
        : radio?.playlist;

    if (assignedPlaylist) {
      setActivePlaylist(
        assignedPlaylist
      );
    } else if (
      loadedPlaylists.length > 0
    ) {
      setActivePlaylist(
        loadedPlaylists[0]
      );
    }
  } catch (error) {
    console.error(
      "Studio data fetch error:",
      error
    );
  }
}

void fetchStudioData();

return () => {
  cancelled = true;
};


}, [
churchSlug,
radio?.id,
radio?.playlistId,
]);

/* =======================================================
PLAYLIST SYNCHRONIZATION
======================================================= */

useEffect(() => {
const audio =
audioRef.current;


const track =
  activePlaylistItems[
    currentTrackIndex
  ];

if (!audio || !track?.url) {
  return;
}

const currentSrc =
  audio.getAttribute("src");

if (currentSrc !== track.url) {
  audio.src = track.url;
  audio.load();
}

if (isPlaying) {
  void audio.play().catch((error) => {
    console.warn(
      "Audio playback blocked:",
      error
    );

    setIsPlaying(false);
  });
}


}, [
currentTrackIndex,
activePlaylist?.id,
activePlaylistItems,
isPlaying,
]);

/* =======================================================
PLAY / PAUSE
======================================================= */

useEffect(() => {
const audio =
audioRef.current;


if (!audio) {
  return;
}

if (isPlaying) {
  void audio.play().catch((error) => {
    console.warn(
      "Audio playback error:",
      error
    );

    setIsPlaying(false);
  });
} else {
  audio.pause();
}


}, [isPlaying]);

/* =======================================================
RESET PLAYLIST
======================================================= */

useEffect(() => {
setCurrentTrackIndex(0);
setTrackElapsed(0);
setIsPlaying(false);


const audio =
  audioRef.current;

if (audio) {
  audio.pause();
  audio.currentTime = 0;
}


}, [activePlaylist?.id]);

/* =======================================================
VU METER
======================================================= */

useEffect(() => {
const interval =
setInterval(() => {
setChannels((previous) =>
previous.map((channel) => ({
...channel,


        peak: channel.muted
          ? 0
          : Math.max(
              0,
              Math.min(
                100,
                channel.volume +
                  (Math.random() *
                    30 -
                    15)
              )
            ),
      }))
    );
  }, 180);

return () => {
  clearInterval(interval);
};


}, []);

/* =======================================================
CHANNEL UPDATE
======================================================= */

function updateChannel(
id: string,
updates: Partial<ChannelData>
) {
setChannels((previous) =>
previous.map((channel) =>
channel.id === id
? {
...channel,
...updates,
}
: channel
)
);
}

/* =======================================================
PLAY TRACK
======================================================= */

function playTrack(index: number) {
const track =
activePlaylistItems[index];


if (!track?.url) {
  return;
}

setCurrentTrackIndex(index);
setTrackElapsed(0);
setIsPlaying(true);

if (track.id) {
  void syncCurrentTrack(
    track.id
  );
}


}

/* =======================================================
SYNC CURRENT TRACK
======================================================= */

async function syncCurrentTrack(
trackId: string | null
) {
if (!radio?.id) {
return;
}


try {
  const response =
    await fetch(
      `/api/church/${churchSlug}/studio/radio`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: radio.id,
          radioId: radio.id,
          currentTrackId:
            trackId,
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Impossible de synchroniser la piste"
    );
  }

  const data =
    await response.json();

  if (data.radio) {
    onRadioUpdate?.(
      data.radio
    );
  }
} catch (error) {
  console.error(
    "Sync track error:",
    error
  );
}


}

/* =======================================================
TRACK END
======================================================= */

function handleTrackEnded() {
if (
autoDj &&
activePlaylistItems.length > 0
) {
const nextIndex =
(currentTrackIndex + 1) %
activePlaylistItems.length;


  const nextTrack =
    activePlaylistItems[
      nextIndex
    ];

  setCurrentTrackIndex(
    nextIndex
  );

  setTrackElapsed(0);
  setIsPlaying(true);

  if (nextTrack?.id) {
    void syncCurrentTrack(
      nextTrack.id
    );
  }

  return;
}

setIsPlaying(false);
setTrackElapsed(0);


}

/* =======================================================
PERSIST PLAYLIST
======================================================= */

async function persistPlaylist(
items: PlaylistItem[]
): Promise<boolean> {
if (!activePlaylist?.id) {
setPlaylistMsg(
"Aucune playlist active."
);


  return false;
}

try {
  const response =
    await fetch(
      `/api/church/${churchSlug}/studio/playlists`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: activePlaylist.id,
          items: items.map(
            (item) => ({
              title:
                item.title ||
                "Sans titre",
              url: item.url,
              type:
                item.type === "VIDEO"
                  ? "VIDEO"
                  : "AUDIO",
              duration:
                item.duration ??
                null,
            })
          ),
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    setPlaylistMsg(
      data.error ||
        "Erreur lors de la sauvegarde."
    );

    return false;
  }

  if (data.playlist) {
    setActivePlaylist(
      data.playlist
    );

    setPlaylists((previous) =>
      previous.map(
        (playlist) =>
          playlist.id ===
          data.playlist.id
            ? data.playlist
            : playlist
      )
    );
  }

  return true;
} catch (error) {
  console.error(
    "Persist playlist error:",
    error
  );

  setPlaylistMsg(
    "Erreur réseau lors de la sauvegarde."
  );

  return false;
}


}

/* =======================================================
MOVE TRACK
======================================================= */

function moveTrack(
index: number,
direction: -1 | 1
) {
if (!activePlaylist) {
return;
}


const items = [
  ...activePlaylistItems,
];

const newIndex =
  index + direction;

if (
  newIndex < 0 ||
  newIndex >= items.length
) {
  return;
}

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

void persistPlaylist(items);


}

/* =======================================================
REMOVE TRACK
======================================================= */

function removeTrack(index: number) {
if (!activePlaylist) {
return;
}


const items =
  activePlaylistItems.filter(
    (_, itemIndex) =>
      itemIndex !== index
  );

setActivePlaylist({
  ...activePlaylist,
  items,
});

void persistPlaylist(items);

if (
  index === currentTrackIndex
) {
  audioRef.current?.pause();

  setIsPlaying(false);
  setTrackElapsed(0);
} else if (
  index < currentTrackIndex
) {
  setCurrentTrackIndex(
    (currentIndex) =>
      Math.max(
        0,
        currentIndex - 1
      )
  );
}


}

/* =======================================================
LIBRARY
======================================================= */

async function saveToLibrary(
item: {
title: string;
url: string;
duration?: number;
category?: string;
}
) {
try {
const response =
await fetch(
`/api/church/${churchSlug}/studio/tracks`,
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
}
);


  if (response.ok) {
    await refreshTracks();
  }
} catch (error) {
  console.error(
    "Save library track error:",
    error
  );
}


}

/* =======================================================
ADD TO PLAYLIST
======================================================= */

async function addToPlaylist(
item: {
title: string;
url: string;
type?: string;
duration?: number;
saveToLib?: boolean;
}
) {
if (!item.url?.trim()) {
setPlaylistMsg(
"URL de la piste manquante."
);


  return false;
}

if (!activePlaylist?.id) {
  setPlaylistMsg(
    "Aucune playlist active."
  );

  return false;
}

const newItem = {
  title:
    item.title?.trim() ||
    "Sans titre",

  url: item.url.trim(),

  type:
    item.type === "VIDEO"
      ? "VIDEO"
      : "AUDIO",

  duration:
    item.duration ?? 0,
};

try {
  const response =
    await fetch(
      `/api/church/${churchSlug}/studio/playlists/${activePlaylist.id}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          newItem
        ),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    setPlaylistMsg(
      data.error ||
        "Impossible d'ajouter la piste."
    );

    return false;
  }

  if (data.playlist) {
    setActivePlaylist(
      data.playlist
    );

    setPlaylists((previous) =>
      previous.map(
        (playlist) =>
          playlist.id ===
          data.playlist.id
            ? data.playlist
            : playlist
      )
    );
  }

  if (
    item.saveToLib !== false
  ) {
    await saveToLibrary({
      title: newItem.title,
      url: newItem.url,
      duration:
        newItem.duration,
    });
  }

  setPlaylistMsg(
    `« ${newItem.title} » ajouté à la playlist.`
  );

  return true;
} catch (error) {
  console.error(
    "Add to playlist error:",
    error
  );

  setPlaylistMsg(
    "Erreur réseau."
  );

  return false;
}


}

/* =======================================================
ON AIR
======================================================= */

async function toggleLive() {
if (!radio?.id) {
return;
}


const nextLive =
  !isLive;

try {
  const response =
    await fetch(
      `/api/church/${churchSlug}/studio/radio`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: radio.id,
          radioId: radio.id,
          isLive: nextLive,
          isAutoDJ: autoDj,
          currentTrackId:
            currentTrack?.id ||
            null,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Impossible de modifier le statut."
    );
  }

  if (data.radio) {
    onRadioUpdate?.(
      data.radio
    );
  }

  setIsLive(nextLive);

  if (!nextLive) {
    audioRef.current?.pause();

    setIsPlaying(false);
  }
} catch (error) {
  console.error(
    "Toggle live error:",
    error
  );
}


}

/* =======================================================
AUTO DJ
======================================================= */

async function toggleAutoDj() {
const next =
!autoDj;


setAutoDj(next);

if (!radio?.id) {
  return;
}

try {
  const response =
    await fetch(
      `/api/church/${churchSlug}/studio/radio`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: radio.id,
          radioId: radio.id,
          isAutoDJ: next,
        }),
      }
    );

  const data =
    await response.json();

  if (data.radio) {
    onRadioUpdate?.(
      data.radio
    );
  }
} catch (error) {
  console.error(
    "Auto DJ update error:",
    error
  );

  setAutoDj(
    !next
  );
}


}

/* =======================================================
LIBRARY FILTER
======================================================= */

const categoryMap: Record<
string,
string
> = {
 GENERAL: "music",
 MUSIC: "music",
 PREACHING: "preaching",
 JINGLE: "jingles",
 PODCAST: "podcasts",
 };

const trackItems =
tracks.map((track) => ({
id: track.id,
title: track.title,
artist:
track.artist ||
"Bibliothèque",
duration:
track.duration,
url: track.url,
category:
categoryMap[
track.category ||
track.type ||
"GENERAL"
] ||
"music",
}));

const playlistLibraryItems =
playlists.flatMap(
(playlist) =>
(playlist.items || []).map(
(item) => ({
id:
item.id ||
`${playlist.id}-${item.title}`,
title:
item.title,
artist:
playlist.title,
duration:
item.duration,
url:
item.url,
category:
item.type === "VIDEO"
? "preaching"
: "music",
})
)
);

const allLibraryItems = [
...trackItems,
...playlistLibraryItems,
];

const activeLibraryItems =
allLibraryItems.filter(
(item) => {
const categoryMatch =
libTab === "music"
? [
"music",
"jingles",
"podcasts",
].includes(
item.category
)
: item.category ===
libTab;


    const searchMatch =
      search.trim() === "" ||
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    return (
      categoryMatch &&
      searchMatch
    );
  }
);

async function handleAudioUpload(
  uploadedFiles: Array<{
    ufsUrl: string;
    name?: string;
  }>
) {
  const uploadedFile = uploadedFiles[0];

  if (!uploadedFile?.ufsUrl) {
    setPlaylistMsg("Fichier audio invalide.");
    return;
  }

  const fileTitle =
    uploadedFile.name
      ?.replace(/\.[^/.]+$/, "")
      .trim() || "Nouvelle piste";

  setAddingTrack(true);

  try {
    const duration = await probeDuration(
      uploadedFile.ufsUrl
    );

    const success = await addToPlaylist({
      title: fileTitle,
      url: uploadedFile.ufsUrl,
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

/* =======================================================
RENDER
======================================================= */

return ( <main className="min-w-0 flex-1 overflow-y-auto bg-[#0a0a0f]">
<audio
ref={audioRef}
preload="metadata"
onTimeUpdate={() => {
setTrackElapsed(
Math.floor(
audioRef.current
?.currentTime || 0
)
);
}}
onEnded={handleTrackEnded}
onPlay={() =>
setIsPlaying(true)
}
onPause={() => {
if (
audioRef.current &&
!audioRef.current.ended
) {
setIsPlaying(false);
}
}}
className="hidden"
/>


  <div className="space-y-4 p-4">

    {/* =====================================================
        MICROPHONE RECORDER
    ====================================================== */}

    <div className="rounded-xl bg-[#16161f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Capture microphone
        </h3>

        {isRecording && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            ENREGISTREMENT
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={() =>
              void startRecording()
            }
            className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-500"
          >
            <Mic size={14} />
            Démarrer l'enregistrement
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-gray-600"
          >
            <CircleStop size={14} />
            Arrêter
          </button>
        )}

        <span className="font-mono text-sm text-gray-300">
          {fmtRecordingTime(
            recElapsed
          )}
        </span>

        {recordedAudioUrl && (
          <button
            type="button"
            onClick={downloadRecording}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
          >
            <Download size={14} />
            Télécharger
          </button>
        )}
      </div>

      {recordingError && (
        <p className="mt-2 text-[10px] text-red-400">
          {recordingError}
        </p>
      )}

      {recordedAudioUrl && (
        <audio
          controls
          src={recordedAudioUrl}
          className="mt-3 w-full"
        />
      )}
    </div>

    {/* =====================================================
        LIVE BROADCAST
    ====================================================== */}

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
                trackElapsed
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
              }).map((_, index) => {
                const isPast =
                  currentDuration >
                    0 &&
                  index / 60 <
                    trackElapsed /
                      currentDuration;

                const height =
                  15 +
                  ((index * 17) %
                    50);

                return (
                  <div
                    key={index}
                    className={`w-[3px] rounded-full ${
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
              })}
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-[9px] text-gray-500">
                {fmtDuration(
                  trackElapsed
                )}
              </span>

              <span className="text-[9px] text-gray-500">
                {fmtDuration(
                  currentDuration
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
                    (playing) =>
                      !playing
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
                  const audio =
                    audioRef.current;

                  audio?.pause();

                  if (audio) {
                    audio.currentTime = 0;
                  }

                  setIsPlaying(
                    false
                  );

                  setTrackElapsed(
                    0
                  );
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-500"
              >
                <Square size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                void toggleLive()
              }
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
                void toggleAutoDj()
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

            <span className="text-[10px] font-bold text-gray-400">
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
        </div>
      </div>
    </div>

    {/* =====================================================
        MIXER
    ====================================================== */}

    <div className="rounded-xl bg-[#16161f] p-4">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Mixeur Audio
      </h3>

      <div className="flex flex-wrap justify-center gap-2">
        {channels.map((channel) => (
          <ChannelStrip
            key={channel.id}
            channel={channel}
            onUpdate={(updates) =>
              updateChannel(
                channel.id,
                updates
              )
            }
          />
        ))}
      </div>
    </div>

    {/* =====================================================
        PLAYLIST + LIBRARY
    ====================================================== */}

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-xl bg-[#16161f] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Playlist en cours
            </h3>

            <div className="mb-3">
              <button
                type="button"
                onClick={() =>
                  setShowAddForm((value) => !value)
                }
                className="flex items-center gap-1 text-[10px] text-white bg-violet-600 hover:bg-violet-500 px-2.5 py-1.5 rounded-lg transition"
              >
                <Plus size={12} />
                Ajouter une piste
              </button>
            </div>

           {showAddForm && (
              <div className="mb-3 space-y-3 rounded-lg bg-[#1e1e2d] p-3">

                {/* AJOUT MANUEL PAR URL */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Ajouter par URL
                  </p>

                  <input
                    value={addTitle}
                    onChange={(event) =>
                      setAddTitle(event.target.value)
                    }
                    placeholder="Titre de la piste"
                    className="w-full rounded bg-[#16161f] px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-violet-500"
                  />

                  <input
                    value={addUrl}
                    onChange={(event) =>
                      setAddUrl(event.target.value)
                    }
                    placeholder="URL audio"
                    className="w-full rounded bg-[#16161f] px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-violet-500"
                  />

                  <button
                    type="button"
                    disabled={
                      addingTrack ||
                      !addTitle.trim() ||
                      !addUrl.trim()
                    }
                    onClick={async () => {
                      if (
                        !addTitle.trim() ||
                        !addUrl.trim()
                      ) {
                        setPlaylistMsg(
                          "Le titre et l'URL sont requis pour un ajout par URL."
                        );
                        return;
                      }

                      setAddingTrack(true);

                      try {
                        const duration =
                          await probeDuration(
                            addUrl.trim()
                          );

                        const success =
                          await addToPlaylist({
                            title:
                              addTitle.trim(),
                            url:
                              addUrl.trim(),
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
                    }}
                    className="w-full rounded bg-emerald-600 px-3 py-1.5 text-xs text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingTrack
                      ? "Ajout..."
                      : "Ajouter par URL"}
                  </button>
                </div>

                {/* SÉPARATEUR */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-700" />

                  <span className="text-[9px] uppercase text-gray-600">
                    ou
                  </span>

                  <div className="h-px flex-1 bg-gray-700" />
                </div>

                {/* UPLOAD DIRECT DANS LA PLAYLIST */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Importer un fichier audio
                  </p>

                  <UploadButton
                    endpoint="audioUploader"
                    onClientUploadComplete={
                      handleAudioUpload
                    }
                    onUploadError={(error: Error) => {
                      setPlaylistMsg(
                        `Erreur d'upload : ${error.message}`
                      );
                    }}
                  />

                  <p className="mt-2 text-[9px] text-gray-600">
                    Le nom du fichier sera utilisé
                    automatiquement comme titre de la piste.
                  </p>
                </div>
              </div>
            )}

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
                        .value
                  );

                if (playlist) {
                  setActivePlaylist(
                    playlist
                  );
                }
              }}
              className="mt-1 w-full rounded-lg bg-[#1e1e2d] px-2 py-1 text-xs text-white"
            >
              {playlists.map(
                (playlist) => (
                  <option
                    key={
                      playlist.id
                    }
                    value={
                      playlist.id
                    }
                  >
                    {
                      playlist.title
                    }
                  </option>
                )
              )}
            </select>

            <p className="mt-0.5 text-[10px] text-gray-600">
              {
                activePlaylistItems.length
              }{" "}
              titres
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddForm(
                (value) =>
                  !value
              )
            }
            className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[10px] text-white transition hover:bg-violet-500"
          >
            <Plus size={12} />
            Ajouter
          </button>
        </div>

        {playlistMsg && (
          <p className="mb-2 text-[10px] text-gray-300">
            {playlistMsg}
          </p>
        )}

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {activePlaylistItems.map(
            (
              track,
              index
            ) => (
              <div
                key={
                  track.id ||
                  `${track.url}-${index}`
                }
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  index ===
                  currentTrackIndex
                    ? "bg-violet-600/20 text-violet-300"
                    : "bg-[#1e1e2d] text-gray-300 hover:bg-[#252535]"
                }`}
              >
                <span className="w-4 text-gray-500">
                  {index + 1}
                </span>

                <span className="flex-1 truncate">
                  {track.title}
                </span>

                <span className="text-[10px] text-gray-500">
                  {fmtDuration(
                    track.duration
                  )}
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      playTrack(
                        index
                      )
                    }
                    className="rounded p-1 transition hover:bg-violet-600/30"
                  >
                    <Play size={10} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveTrack(
                        index,
                        -1
                      )
                    }
                    disabled={
                      index === 0
                    }
                    className="rounded p-1 transition hover:bg-violet-600/30 disabled:opacity-30"
                  >
                    <Plus
                      size={10}
                      className="rotate-180"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveTrack(
                        index,
                        1
                      )
                    }
                    disabled={
                      index ===
                      activePlaylistItems.length -
                        1
                    }
                    className="rounded p-1 transition hover:bg-violet-600/30 disabled:opacity-30"
                  >
                    <Plus size={10} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeTrack(
                        index
                      )
                    }
                    className="rounded p-1 text-red-400 transition hover:bg-red-600/30"
                  >
                    <StopCircle size={10} />
                  </button>
                </div>
              </div>
            )
          )}

          {!activePlaylistItems.length && (
            <p className="py-4 text-center text-xs text-gray-500">
              Aucune piste dans la playlist
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-[#16161f] p-4">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Bibliothèque
        </h3>

        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Rechercher..."
              className="w-full rounded bg-[#16161f] px-7 py-1.5 text-xs text-white"
            />
          </div>

          <select
            value={libTab}
            onChange={(event) =>
              setLibTab(
                event.target
                  .value
              )
            }
            className="rounded bg-[#1e1e2d] px-2 py-1.5 text-xs text-white"
          >
            <option value="music">
              Musique
            </option>

            <option value="preaching">
              Prédications
            </option>

            <option value="jingles">
              Jingles
            </option>

            <option value="podcasts">
              Podcasts
            </option>
          </select>
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {activeLibraryItems.map(
            (item) => (
              <button
                type="button"
                key={item.id}
                className="flex w-full items-center gap-2 rounded-lg bg-[#1e1e2d] px-2 py-1.5 text-left text-xs text-gray-300 transition hover:bg-[#252535]"
                onClick={() =>
                  void addToPlaylist({
                    title:
                      item.title,
                    url:
                      item.url,
                    duration:
                      item.duration ||
                      0,
                    type:
                      item.category ===
                      "preaching"
                        ? "VIDEO"
                        : "AUDIO",
                  })
                }
              >
                <span className="flex-1 truncate">
                  {item.title}
                </span>

                <span className="text-[10px] text-gray-500">
                  {item.artist}
                </span>

                <span className="text-[10px] text-gray-500">
                  {fmtDuration(
                    item.duration
                  )}
                </span>

                <Plus
                  size={10}
                  className="shrink-0 text-violet-400"
                />
              </button>
            )
          )}

          {!activeLibraryItems.length && (
            <p className="py-4 text-center text-xs text-gray-500">
              Aucun élément trouvé
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
</main>


);
}
