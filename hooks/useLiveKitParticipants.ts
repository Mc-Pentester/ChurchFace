"use client";

import { useState, useCallback, useEffect } from "react";
import { RemoteParticipant, Track, TrackPublication } from "livekit-client";

export interface ParticipantInfo {
  identity: string;
  name: string;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "unknown";
  ping: number;
  bitrate: number;
  joinedAt: Date;
}

export function useLiveKitParticipants(room: any) {
  const [participants, setParticipants] = useState<Map<string, ParticipantInfo>>(new Map());
  const [localParticipant, setLocalParticipant] = useState<ParticipantInfo | null>(null);

  // Update participant info from LiveKit participant
  const updateParticipantInfo = useCallback((participant: RemoteParticipant): ParticipantInfo => {
    const cameraTrack = participant.getTrackPublication(Track.Source.Camera);
    const microphoneTrack = participant.getTrackPublication(Track.Source.Microphone);
    const screenShareTrack = participant.getTrackPublication(Track.Source.ScreenShare);

    // Get connection quality info (simplified for demo)
    const connectionQuality = getConnectionQuality(participant);

    return {
      identity: participant.identity,
      name: participant.name || participant.identity,
      isCameraEnabled: cameraTrack?.isSubscribed || false,
      isMicrophoneEnabled: microphoneTrack?.isSubscribed || false,
      isScreenSharing: screenShareTrack?.isSubscribed || false,
      connectionQuality,
      ping: 0, // Would come from connection stats in real implementation
      bitrate: 0, // Would come from connection stats in real implementation
      joinedAt: new Date(), // Would come from participant metadata in real implementation
    };
  }, []);

  // Get connection quality string
  const getConnectionQuality = useCallback((participant: RemoteParticipant): "excellent" | "good" | "poor" | "unknown" => {
    // In a real implementation, this would use participant.connectionQuality
    // For now, return a default value
    return "excellent";
  }, []);

  // Handle participant joined
  useEffect(() => {
    if (!room) return;

    const handleParticipantJoined = (participant: RemoteParticipant) => {
      const info = updateParticipantInfo(participant);
      setParticipants((prev) => new Map(prev).set(participant.identity, info));
    };

    const handleParticipantLeft = (participant: RemoteParticipant) => {
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.delete(participant.identity);
        return newMap;
      });
    };

    const handleTrackPublished = (publication: TrackPublication, participant: RemoteParticipant) => {
      const info = updateParticipantInfo(participant);
      setParticipants((prev) => new Map(prev).set(participant.identity, info));
    };

    const handleTrackUnpublished = (publication: TrackPublication, participant: RemoteParticipant) => {
      const info = updateParticipantInfo(participant);
      setParticipants((prev) => new Map(prev).set(participant.identity, info));
    };

    const handleTrackSubscribed = (track: Track, publication: TrackPublication, participant: RemoteParticipant) => {
      const info = updateParticipantInfo(participant);
      setParticipants((prev) => new Map(prev).set(participant.identity, info));
    };

    const handleTrackUnsubscribed = (track: Track, publication: TrackPublication, participant: RemoteParticipant) => {
      const info = updateParticipantInfo(participant);
      setParticipants((prev) => new Map(prev).set(participant.identity, info));
    };

    room.on("participantConnected", handleParticipantJoined);
    room.on("participantDisconnected", handleParticipantLeft);
    room.on("trackPublished", handleTrackPublished);
    room.on("trackUnpublished", handleTrackUnpublished);
    room.on("trackSubscribed", handleTrackSubscribed);
    room.on("trackUnsubscribed", handleTrackUnsubscribed);

    // Initialize existing participants
    room.remoteParticipants.forEach((participant: RemoteParticipant) => {
      const info = updateParticipantInfo(participant);
      setParticipants((prev) => new Map(prev).set(participant.identity, info));
    });

    // Set local participant
    if (room.localParticipant) {
      const localInfo: ParticipantInfo = {
        identity: room.localParticipant.identity,
        name: room.localParticipant.name || room.localParticipant.identity,
        isCameraEnabled: true,
        isMicrophoneEnabled: true,
        isScreenSharing: false,
        connectionQuality: "excellent",
        ping: 0,
        bitrate: 0,
        joinedAt: new Date(),
      };
      setLocalParticipant(localInfo);
    }

    return () => {
      room.off("participantConnected", handleParticipantJoined);
      room.off("participantDisconnected", handleParticipantLeft);
      room.off("trackPublished", handleTrackPublished);
      room.off("trackUnpublished", handleTrackUnpublished);
      room.off("trackSubscribed", handleTrackSubscribed);
      room.off("trackUnsubscribed", handleTrackUnsubscribed);
    };
  }, [room, updateParticipantInfo]);

  // Mute participant's audio
  const muteParticipant = useCallback((identity: string) => {
    if (!room) return;
    const participant = room.remoteParticipants.get(identity);
    if (participant) {
      // In a real implementation, this would use LiveKit's server-side API
      // to mute the participant's audio track
      console.log(`Muting participant: ${identity}`);
    }
  }, [room]);

  // Disable participant's camera
  const disableCamera = useCallback((identity: string) => {
    if (!room) return;
    const participant = room.remoteParticipants.get(identity);
    if (participant) {
      // In a real implementation, this would use LiveKit's server-side API
      // to disable the participant's camera
      console.log(`Disabling camera for participant: ${identity}`);
    }
  }, [room]);

  // Remove participant from room
  const removeParticipant = useCallback((identity: string) => {
    if (!room) return;
    const participant = room.remoteParticipants.get(identity);
    if (participant) {
      // In a real implementation, this would use LiveKit's server-side API
      // to remove the participant from the room
      console.log(`Removing participant: ${identity}`);
    }
  }, [room]);

  // Promote participant to host
  const promoteParticipant = useCallback((identity: string) => {
    if (!room) return;
    const participant = room.remoteParticipants.get(identity);
    if (participant) {
      // In a real implementation, this would update permissions
      console.log(`Promoting participant: ${identity}`);
    }
  }, [room]);

  // Demote participant from host
  const demoteParticipant = useCallback((identity: string) => {
    if (!room) return;
    const participant = room.remoteParticipants.get(identity);
    if (participant) {
      // In a real implementation, this would update permissions
      console.log(`Demoting participant: ${identity}`);
    }
  }, [room]);

  // Get participant count
  const getParticipantCount = useCallback(() => {
    return participants.size + (localParticipant ? 1 : 0);
  }, [participants.size, localParticipant]);

  // Get all participants as array
  const getParticipantsArray = useCallback(() => {
    return Array.from(participants.values());
  }, [participants]);

  return {
    // State
    participants,
    localParticipant,
    participantCount: getParticipantCount(),
    participantsArray: getParticipantsArray(),

    // Actions
    muteParticipant,
    disableCamera,
    removeParticipant,
    promoteParticipant,
    demoteParticipant,

    // Utilities
    getParticipantCount,
    getParticipantsArray,
  };
}
