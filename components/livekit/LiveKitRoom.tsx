"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import React from "react";

import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
} from "lucide-react";


interface LiveKitRoomProps {

  token: string;

  serverUrl: string;

  roomName: string;

  onConnected?: () => void;

  onDisconnected?: () => void;

}



export default function LiveKitRoom({
  token,
  serverUrl,
  roomName,
  onConnected,
  onDisconnected,
}: LiveKitRoomProps) {


  const roomRef =
    useRef<Room | null>(null);


  const videoRef =
    useRef<HTMLVideoElement | null>(null);



  const [
    isConnected,
    setIsConnected
  ] = useState(false);



  const [
    isMuted,
    setIsMuted
  ] = useState(false);



  const [
    isVideoEnabled,
    setIsVideoEnabled
  ] = useState(true);



  const [
    remoteParticipants,
    setRemoteParticipants
  ] = useState<Map<string, { track: any; element: HTMLVideoElement }>>(new Map());

  const remoteVideoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [
    localVideoElement,
    setLocalVideoElement
  ] = useState<HTMLVideoElement | null>(null);



  useEffect(() => {


    let mounted = true;



    async function start() {


      try {


        /**
         * LiveKit v2.x
         *
         * Pas de iceServers ici.
         * La configuration ICE/STUN/TURN
         * est gérée côté serveur LiveKit.
         */


        const room =
          new Room({

            adaptiveStream: true,

            dynacast: true,

          });



        roomRef.current = room;



        room.on(
          RoomEvent.Connected,
          () => {


            if(!mounted)
              return;


            console.log(
              "LiveKit connected:",
              roomName
            );


            setIsConnected(true);


            onConnected?.();


          }
        );



        room.on(
          RoomEvent.Disconnected,
          () => {


            if(!mounted)
              return;


            setIsConnected(false);


            onDisconnected?.();


          }
        );




        room.on(
          RoomEvent.TrackSubscribed,
          (
            track,
            publication,
            participant
          ) => {
            console.log('Track subscribed:', track.kind, participant.identity);

            if(track.kind === Track.Kind.Video){
              const element = track.attach() as HTMLVideoElement;
              if (element instanceof HTMLVideoElement) {
                setRemoteParticipants(prev => new Map(prev).set(participant.identity, { track, element }));
              }
            }
          }
        );

        // Nettoyer les tracks quand un participant se déconnecte
        room.on(
          RoomEvent.TrackUnsubscribed,
          (track, publication, participant) => {
            console.log('Track unsubscribed:', participant.identity);
            setRemoteParticipants(prev => {
              const newMap = new Map(prev);
              newMap.delete(participant.identity);
              return newMap;
            });
          }
        );

        // Écouter les publications de tracks locaux
        room.localParticipant.on(
          'trackPublished',
          (publication: any) => {
            console.log('Track published:', publication);
            if (publication.track && publication.track.kind === Track.Kind.Video) {
              console.log('Video track found, attaching...');
              const element = publication.track.attach();
              if (element instanceof HTMLVideoElement) {
                setLocalVideoElement(element);
                console.log('Local video attached');
              }
            }
          }
        );





        await room.connect(
          serverUrl,
          token
        );




        /**
         * Mode studio :
         * publication caméra + micro
         */


        await room.localParticipant
          .setCameraEnabled(true);



        await room.localParticipant
          .setMicrophoneEnabled(true);



        setIsVideoEnabled(true);

        setIsMuted(false);

        // Attendre un court délai pour que le track soit publié puis l'afficher
        setTimeout(() => {
          console.log('Attempting to attach local video...');
          // Essayer de récupérer le track vidéo local via différentes méthodes
          try {
            const cameraPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
            if (cameraPublication && cameraPublication.track) {
              console.log('Camera publication found:', cameraPublication);
              const element = cameraPublication.track.attach();
              if (element instanceof HTMLVideoElement) {
                setLocalVideoElement(element);
                console.log('Local video attached successfully');
              }
            } else {
              console.log('Camera publication not found, trying trackPublications...');
              const publications = Array.from(room.localParticipant.trackPublications.values());
              console.log('Publications:', publications);
              publications.forEach((publication: any) => {
                console.log('Publication:', publication.kind, publication.track?.kind);
                if (publication.track && publication.track.kind === Track.Kind.Video) {
                  const element = publication.track.attach();
                  if (element instanceof HTMLVideoElement) {
                    setLocalVideoElement(element);
                    console.log('Video attached from publications');
                  }
                }
              });
            }
          } catch (e) {
            console.error('Error attaching local video:', e);
          }
        }, 1000);



      } catch(error) {


        console.error(
          "LiveKit connection error:",
          error
        );


      }


    }




    start();




    return () => {


      mounted = false;


      if(roomRef.current){


        roomRef.current.disconnect();


        roomRef.current = null;


      }


    };



  }, [
    token,
    serverUrl,
    roomName,
    onConnected,
    onDisconnected,
  ]);





  async function toggleMute(){


    const room =
      roomRef.current;


    if(!room)
      return;



    try {


      await room.localParticipant
        .setMicrophoneEnabled(
          isMuted
        );



      setIsMuted(
        !isMuted
      );


    } catch(error){


      console.error(
        "Microphone error:",
        error
      );


    }


  }





  async function toggleCamera(){


    const room =
      roomRef.current;


    if(!room)
      return;



    try {


      await room.localParticipant
        .setCameraEnabled(
          !isVideoEnabled
        );



      setIsVideoEnabled(
        !isVideoEnabled
      );



    } catch(error){


      console.error(
        "Camera error:",
        error
      );


    }


  }





  async function disconnect(){


    const room =
      roomRef.current;



    if(room){


      await room.disconnect();


      setIsConnected(false);


    }


  }





  return (

    <div
      className="
      relative
      w-full
      h-full
      bg-black
      rounded-lg
      overflow-hidden
      "
    >


      {
        !isConnected ?

        (

          <div
            className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            "
          >

            <div
              className="
              text-center
              text-white
              "
            >

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

              Connexion LiveKit...


            </div>


          </div>


        )

        :

        (

          <>
            {/* Video Grid - Style ZOOM */}
            <div 
              className="
              w-full
              h-full
              grid
              gap-1
              p-1
              "
              style={{
                gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(remoteParticipants.size + 1))}, 1fr)`,
                gridTemplateRows: `repeat(${Math.ceil((remoteParticipants.size + 1) / Math.ceil(Math.sqrt(remoteParticipants.size + 1)))}, 1fr)`,
              }}
            >
              {/* Local Video */}
              {localVideoElement && (
                <div 
                  ref={(el) => {
                    if (el && localVideoElement) {
                      if (el.firstChild) {
                        el.removeChild(el.firstChild);
                      }
                      el.appendChild(localVideoElement);
                      localVideoElement.className = "w-full h-full object-cover";
                    }
                  }}
                  className="relative bg-gray-900 rounded-lg overflow-hidden"
                >
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Vous
                  </div>
                </div>
              )}

              {/* Remote Participants */}
              {Array.from(remoteParticipants.entries()).map(([identity, { element }]) => (
                <div 
                  key={identity}
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(identity, el);
                      if (el.firstChild) {
                        el.removeChild(el.firstChild);
                      }
                      el.appendChild(element);
                      element.className = "w-full h-full object-cover";
                    }
                  }}
                  className="relative bg-gray-900 rounded-lg overflow-hidden"
                >
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {identity}
                  </div>
                </div>
              ))}
            </div>


            <div
              className="
              absolute
              bottom-4
              left-1/2
              -translate-x-1/2
              flex
              gap-3
              bg-black/70
              px-4
              py-2
              rounded-full
              z-10
              "
            >



              <button
                onClick={toggleMute}
                className="
                p-2
                rounded-full
                bg-gray-700
                "
              >

                {
                  isMuted ?

                  <MicOff
                    size={18}
                    className="text-white"
                  />

                  :

                  <Mic
                    size={18}
                    className="text-white"
                  />
                }


              </button>




              <button
                onClick={toggleCamera}
                className="
                p-2
                rounded-full
                bg-gray-700
                "
              >

                {
                  isVideoEnabled ?

                  <Video
                    size={18}
                    className="text-white"
                  />

                  :

                  <VideoOff
                    size={18}
                    className="text-white"
                  />

                }


              </button>




              <button
                onClick={disconnect}
                className="
                p-2
                rounded-full
                bg-red-600
                "
              >

                <PhoneOff
                  size={18}
                  className="text-white"
                />

              </button>


            </div>





            <div
              className="
              absolute
              top-4
              left-4
              bg-red-600
              text-white
              text-xs
              font-bold
              px-3
              py-1
              rounded-full
              "
            >

              ● LIVE

            </div>



          </>


        )

      }


    </div>

  );


}