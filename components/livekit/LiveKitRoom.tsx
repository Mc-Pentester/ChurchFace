"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
            track
          ) => {


            if(
              track.kind === Track.Kind.Video
            ){


              const element =
                track.attach();



              if(
                videoRef.current
              ){


                videoRef.current.srcObject =
                  element as unknown as MediaStream;


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


            <video

              ref={videoRef}

              autoPlay

              playsInline

              muted

              className="
              w-full
              h-full
              object-cover
              "

            />




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