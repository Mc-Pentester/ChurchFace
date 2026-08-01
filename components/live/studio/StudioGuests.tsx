"use client";

import { useState } from "react";
import { User, Mic, MicOff, Video, VideoOff, MoreVertical, Crown } from "lucide-react";
import { RemoteParticipant, Track } from "livekit-client";

interface StudioGuestsProps {
  participants: RemoteParticipant[];
  onMuteParticipant?: (participantId: string) => void;
  onUnmuteParticipant?: (participantId: string) => void;
  onDisableVideo?: (participantId: string) => void;
  onEnableVideo?: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  hostId?: string;
}

export default function StudioGuests({
  participants,
  onMuteParticipant,
  onUnmuteParticipant,
  onDisableVideo,
  onEnableVideo,
  onRemoveParticipant,
  hostId,
}: StudioGuestsProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const getParticipantName = (participant: RemoteParticipant) => {
    const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
    return metadata.name || participant.name || participant.identity;
  };

  const isHost = (participant: RemoteParticipant) => {
    const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
    return metadata.role === 'host' || participant.identity === hostId;
  };

  const isMuted = (participant: RemoteParticipant) => {
    const track = participant.getTrackPublication(Track.Source.Microphone);
    return !track || track.isMuted;
  };

  const isVideoOff = (participant: RemoteParticipant) => {
    const track = participant.getTrackPublication(Track.Source.Camera);
    return !track || track.isMuted;
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Invités ({participants.length})</h3>
        <button className="text-violet-400 hover:text-violet-300 text-xs font-medium">
          + Inviter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Aucun invité connecté
          </div>
        ) : (
          participants.map((participant) => {
            const participantId = participant.identity;
            const isSelected = selectedParticipant === participantId;
            const host = isHost(participant);
            const muted = isMuted(participant);
            const videoOff = isVideoOff(participant);

            return (
              <div
                key={participantId}
                className={`bg-[#252535] rounded-lg p-3 cursor-pointer transition ${
                  isSelected ? "ring-2 ring-violet-500" : "hover:bg-[#353545]"
                }`}
                onClick={() => setSelectedParticipant(isSelected ? null : participantId)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    {host && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                        <Crown size={10} className="text-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">
                        {getParticipantName(participant)}
                      </p>
                      {host && (
                        <span className="text-yellow-400 text-xs">Hôte</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex items-center gap-1 ${muted ? 'text-red-400' : 'text-emerald-400'}`}>
                        {muted ? <MicOff size={12} /> : <Mic size={12} />}
                      </div>
                      <div className={`flex items-center gap-1 ${videoOff ? 'text-red-400' : 'text-emerald-400'}`}>
                        {videoOff ? <VideoOff size={12} /> : <Video size={12} />}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParticipant(isSelected ? null : participantId);
                    }}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2">
                    {muted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnmuteParticipant?.(participantId);
                        }}
                        className="flex items-center justify-center gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 py-1.5 rounded text-xs font-medium"
                      >
                        <Mic size={12} />
                        <span>Unmute</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMuteParticipant?.(participantId);
                        }}
                        className="flex items-center justify-center gap-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 py-1.5 rounded text-xs font-medium"
                      >
                        <MicOff size={12} />
                        <span>Mute</span>
                      </button>
                    )}

                    {videoOff ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnableVideo?.(participantId);
                        }}
                        className="flex items-center justify-center gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 py-1.5 rounded text-xs font-medium"
                      >
                        <Video size={12} />
                        <span>Video</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDisableVideo?.(participantId);
                        }}
                        className="flex items-center justify-center gap-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 py-1.5 rounded text-xs font-medium"
                      >
                        <VideoOff size={12} />
                        <span>No Video</span>
                      </button>
                    )}

                    {!host && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveParticipant?.(participantId);
                        }}
                        className="col-span-2 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-medium"
                      >
                        <span>Retirer du studio</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
