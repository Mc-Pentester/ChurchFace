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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);


  useEffect(() => {

    if (!token || !serverUrl) {
      console.error(
        "LiveKit configuration missing",
        {
          serverUrl,
          roomName,
        }
      );
      return;
    }


    async function connectRoom() {

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


              const element =
                track.attach();


              if (
                videoRef.current &&
                element instanceof HTMLVideoElement
              ) {

                videoRef.current.srcObject =
                  element.srcObject;

              }

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



      } catch(error) {

        console.error(
          "LiveKit connection error:",
          error
        );

      }

    }



    connectRoom();



    return () => {

      if(roomRef.current){

        roomRef.current.disconnect();

        roomRef.current = null;

      }

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