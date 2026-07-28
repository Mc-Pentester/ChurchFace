"use client";

import { Mic, Music, MonitorUp, Volume2, VolumeX } from "lucide-react";

interface AudioChannel {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  peak: number;
  color: string;
  icon: typeof Mic;
}

interface StudioAudioMixerProps {
  channels: AudioChannel[];
  onChannelUpdate: (channelId: string, updates: Partial<AudioChannel>) => void;
}

function VUMeter({ peak, active }: { peak: number; active: boolean }) {
  const fill = active ? Math.round((Math.max(0, Math.min(100, peak)) / 100) * 14) : 0;

  return (
    <div className="flex w-[6px] flex-col-reverse gap-[1.5px]">
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
          <div key={index} className={`h-[2px] w-full rounded-full ${className}`} />
        );
      })}
    </div>
  );
}

function ChannelStrip({
  channel,
  onUpdate,
}: {
  channel: AudioChannel;
  onUpdate: (updates: Partial<AudioChannel>) => void;
}) {
  const Icon = channel.icon;

  const dbValue =
    channel.volume > 0
      ? `-${Math.max(0, 36 - channel.volume / 2.7).toFixed(1)} dB`
      : "-∞ dB";

  return (
    <div className="flex min-w-[90px] flex-col items-center gap-2 rounded-lg bg-[#16161f] p-2">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400">
        <Icon size={10} className={channel.color} />
        <span className="max-w-[70px] truncate">{channel.name}</span>
      </div>

      <div className="flex h-28 gap-1">
        <VUMeter peak={channel.peak} active={!channel.muted} />
        <VUMeter peak={channel.peak} active={!channel.muted} />
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

      <div className="text-[9px] font-mono text-gray-500">{dbValue}</div>

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

export default function StudioAudioMixer({ channels, onChannelUpdate }: StudioAudioMixerProps) {
  const updateChannel = (channelId: string, updates: Partial<AudioChannel>) => {
    onChannelUpdate(channelId, updates);
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-white font-semibold text-sm mb-4">Audio Mixer</h3>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {channels.map((channel) => (
          <ChannelStrip
            key={channel.id}
            channel={channel}
            onUpdate={(updates) => updateChannel(channel.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}
