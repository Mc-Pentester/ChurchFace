"use client";

import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

interface LiveKitPlayerProps {
  token: string;
  serverUrl: string;
  roomName: string;
}

export default function LiveKitPlayer({
  token,
  serverUrl,
  roomName,
}: LiveKitPlayerProps) {

  const [isConnected, setIsConnected] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const shouldDisconnectRef = useRef(false);


  useEffect(() => {

    if (!token || !serverUrl) {
      console.error(
        "LiveKit configuration missing",
        {
          serverUrl,
          roomName,
          hasToken: !!token,
        }
      );
      return;
    }

    // Prevent multiple connections
    if (roomRef.current) {
      console.log("LiveKit: Room already exists, skipping connection");
      return;
    }

    async function connectRoom() {

      if (isConnecting) {
        console.log("Already connecting, skipping");
        return;
      }

      setIsConnecting(true);

      try {

        const room = new Room({

          adaptiveStream: true,

          dynacast: true,

        });



        roomRef.current = room;



        /**
         * Connexion réussie
         */
        room.on(
          RoomEvent.Connected,
          () => {

            console.log(
              "Connected to LiveKit room",
              roomName
            );

            setIsConnected(true);
            
            // Log participants
            const participants = Array.from(room.remoteParticipants.values());
            console.log("Remote participants:", participants.length, participants.map(p => p.identity));
            setParticipantCount(participants.length);

            // Try to attach existing tracks
            participants.forEach(participant => {
              // Get video track publication
              const videoPublication = participant.getTrackPublication(Track.Source.Camera);
              if (videoPublication?.track) {
                console.log("Attaching existing video track from", participant.identity);
                if (videoRef.current) {
                  videoPublication.track.attach(videoRef.current);
                  setHasVideo(true);
                }
              }
            });

          }
        );



        /**
         * Nouveau participant
         */
        room.on(
          RoomEvent.ParticipantConnected,
          (participant) => {
            console.log("Participant connected:", participant.identity);
            setParticipantCount(prev => prev + 1);
          }
        );

        /**
         * Participant parti
         */
        room.on(
          RoomEvent.ParticipantDisconnected,
          (participant) => {
            console.log("Participant disconnected:", participant.identity);
            setParticipantCount(prev => prev - 1);
          }
        );

        /**
         * Déconnexion
         */
        room.on(
          RoomEvent.Disconnected,
          () => {

            console.log(
              "Disconnected from LiveKit"
            );

            setIsConnected(false);
            setHasVideo(false);
            setParticipantCount(0);

          }
        );



        /**
         * Réception vidéo
         */
        room.on(
          RoomEvent.TrackSubscribed,
          (
            track,
            publication,
            participant
          ) => {


            console.log(
              "Track subscribed",
              track.kind,
              participant.identity
            );


            if (
              track.kind === Track.Kind.Video
            ) {

              setHasVideo(true);


              // Attach track directly to video element
              if (videoRef.current) {
                track.attach(videoRef.current);
              }

            } else if (track.kind === Track.Kind.Audio) {
              // Audio tracks are automatically handled by LiveKit
              console.log("Audio track subscribed");
            }

          }
        );



        /**
         * Vidéo retirée
         */
        room.on(
          RoomEvent.TrackUnsubscribed,
          (
            track
          ) => {


            if (
              track.kind === Track.Kind.Video
            ) {

              setHasVideo(false);
              // Detach track from video element
              if (videoRef.current) {
                track.detach(videoRef.current);
              }

            }

          }
        );



        await room.connect(
          serverUrl,
          token,
          {
            autoSubscribe: true,
          }
        );

        setIsConnecting(false);

      } catch(error) {

        console.error(
          "LiveKit connection error:",
          error
        );
        setIsConnecting(false);

      }

    }



    connectRoom();



    return () => {
      shouldDisconnectRef.current = true;
      
      console.log("LiveKitPlayer cleanup called");
      
      // Only disconnect if actually connected and not in the middle of reconnection
      if (roomRef.current && roomRef.current.state === "connected") {
        console.log("LiveKitPlayer: Disconnecting room");
        roomRef.current.disconnect();
        roomRef.current = null;
      } else {
        console.log("LiveKitPlayer: Room not connected, skipping disconnect");
      }
      
      setIsConnecting(false);
      setIsConnected(false);
      setHasVideo(false);
    };


  }, [
    token,
    serverUrl,
    roomName,
  ]);




  return (

    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">


      {
        !isConnected && (

          <div className="absolute inset-0 flex items-center justify-center">

            <div className="text-center">

              <div
                className="
                animate-spin
                rounded-full
                h-8
                w-8
                border-b-2
                border-white
                mx-auto
                mb-3
                "
              />

              <p className="text-white text-sm">
                Connexion au direct...
              </p>

            </div>

          </div>

        )
      }



      {
        isConnected &&
        !hasVideo && (

          <div className="absolute inset-0 flex items-center justify-center">

            <p className="text-white text-sm">
              En attente du signal vidéo...
            </p>

          </div>

        )
      }




      <video

        ref={videoRef}

        autoPlay

        playsInline

        controls={false}

        className="
          w-full
          h-full
          object-cover
        "

      />



      {
        isConnected &&
        hasVideo && (

          <div
            className="
            absolute
            top-4
            left-4
            bg-red-600
            px-3
            py-1
            rounded-full
            flex
            items-center
            gap-2
            "
          >

            <span
              className="
              w-2
              h-2
              bg-white
              rounded-full
              animate-pulse
              "
            />

            <span className="text-white text-xs font-bold">
              LIVE
            </span>


          </div>

        )
      }


    </div>

  );

}