import {
  Room,
  RoomEvent,
  Track,
  LocalParticipant,
  RemoteParticipant,
  LocalVideoTrack,
  LocalAudioTrack,
  createLocalVideoTrack,
  createLocalAudioTrack
} from "livekit-client";
import { errorHandler } from "./ErrorHandler";
import { connectionManager } from "./ConnectionManager";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export type LiveKitStatus =
  | "idle"
  | "preparing"
  | "preview_ready"
  | "connecting"
  | "participant_ready"
  | "publishing"
  | "media_ready"
  | "ready"
  | "error";

export interface LiveKitConfig {
  token:string;
  serverUrl:string;
  roomName:string;
  initialCameraEnabled?:boolean;
  initialMicEnabled?:boolean;
}

export interface StudioState {
  cameraEnabled:boolean;
  microphoneEnabled:boolean;
  screenSharing:boolean;
  cameraDeviceId?:string;
  microphoneDeviceId?:string;
}

export interface LiveKitCallbacks {
  onConnected?:()=>void;
  onDisconnected?:()=>void;
  onError?:(error:Error)=>void;
  onPreviewTrack?:(track:LocalVideoTrack|null)=>void;
  onPreviewStream?:(stream:MediaStream|null)=>void;
  onLocalStreamChange?:(stream:MediaStream|null)=>void;
  onParticipantJoined?:(participant:RemoteParticipant)=>void;
  onParticipantLeft?:(participant:RemoteParticipant)=>void;
  onCameraEnabledChange?:(enabled:boolean)=>void;
  onMicEnabledChange?:(enabled:boolean)=>void;
  onDevicesAvailable?:(devices:{
    cameras:MediaDeviceInfo[];
    microphones:MediaDeviceInfo[];
  })=>void;
  onStateChange?:(state:ConnectionState)=>void;
  onStatusChange?:(status:LiveKitStatus)=>void;
}

class LiveKitService {
  private static instance:LiveKitService;
  private room:Room|null=null;
  private state:ConnectionState="idle";
  private status:LiveKitStatus="idle";
  private callbacks:LiveKitCallbacks={};
  private currentConfig:LiveKitConfig|null=null;
  private mounted=true;

  private previewVideoTrack:LocalVideoTrack|null=null;
  private previewAudioTrack:LocalAudioTrack|null=null;

  private mediaInitializing=false;

  private reconnectAttempts=0;
  private maxReconnectAttempts=5;
  private reconnectDelay=1000;
  private reconnectTimer:NodeJS.Timeout|null=null;

  private studioState:StudioState={
    cameraEnabled:false,
    microphoneEnabled:false,
    screenSharing:false
  };

  private constructor(){}

  static getInstance(){
    if(!LiveKitService.instance){
      LiveKitService.instance=new LiveKitService();
    }
    return LiveKitService.instance;
  }

  private setState(state:ConnectionState){
    if(this.state!==state){
      this.state=state;
      this.callbacks.onStateChange?.(state);
    }
  }

  getState(){
    return this.state;
  }

  private setStatus(status:LiveKitStatus){
    if(this.status!==status){
      console.log("LiveKit status:",status);
      this.status=status;
      this.callbacks.onStatusChange?.(status);
    }
  }

  getStatus(){
    return this.status;
  }

  isReady(){
    return (
      this.status==="participant_ready" ||
      this.status==="publishing" ||
      this.status==="media_ready" ||
      this.status==="ready"
    );
  }

  getRoom(){
    return this.room;
  }

  getLocalParticipant():LocalParticipant|null{
    return this.room?.localParticipant ?? null;
  }

  getPreviewVideoTrack():LocalVideoTrack|null{
    return this.previewVideoTrack;
  }

  getPreviewAudioTrack():LocalAudioTrack|null{
    return this.previewAudioTrack;
  }

  setCallbacks(callbacks:LiveKitCallbacks){
    this.callbacks={
      ...this.callbacks,
      ...callbacks
    };
  }

  clearCallbacks(){
    this.callbacks={};
  }

  getStudioState(){
    return {...this.studioState};
  }

  async prepareStudio(deviceId?:string){

    this.setStatus("preparing");

    try{

      const devices=
        await navigator.mediaDevices.enumerateDevices();

      const cameras=
        devices.filter(
          d=>d.kind==="videoinput"
        );

      const microphones=
        devices.filter(
          d=>d.kind==="audioinput"
        );

      this.callbacks.onDevicesAvailable?.({
        cameras,
        microphones
      });

      this.previewVideoTrack=
        await createLocalVideoTrack({
          deviceId:deviceId
            ? {exact:deviceId}
            : undefined,
          resolution:{
            width:1280,
            height:720
          }
        });

      this.callbacks.onPreviewTrack?.(
        this.previewVideoTrack
      );

      const stream=
        new MediaStream([
          this.previewVideoTrack.mediaStreamTrack
        ]);

      this.callbacks.onPreviewStream?.(stream);

      this.setStatus("preview_ready");

      console.log(
        "LiveKit preview ready"
      );

      return stream;

    }catch(error){

      console.error(
        "Preview error",
        error
      );

      this.setStatus("error");

      errorHandler.deviceError(
        "Impossible de préparer la caméra",
        (error as Error).message,
        false
      );

      throw error;
    }
  }

  async createMicrophonePreview(deviceId?:string){

    this.previewAudioTrack=
      await createLocalAudioTrack({
        deviceId:deviceId
          ? {exact:deviceId}
          : undefined
      });

    return this.previewAudioTrack;
  }

    async connect(config:LiveKitConfig){

    if(!config.token||!config.serverUrl||!config.roomName){
      throw new Error("Configuration LiveKit invalide");
    }

    if(!connectionManager.shouldConnect(config)){
      console.log("LiveKit connexion bloquée");
      return;
    }

    this.currentConfig=config;
    this.setStatus("connecting");
    this.setState("connecting");

    try{

      if(!this.room){

        this.room=new Room({
          adaptiveStream:true,
          dynacast:true
        });

        this.registerRoomEvents();
      }

      connectionManager.setRoom(this.room);

      // Create a promise that resolves when connected
      const connectedPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for connection"));
        }, 10000); // 10 seconds timeout

        const onConnected = () => {
          clearTimeout(timeout);
          resolve();
        };

        // Listen for RoomEvent.Connected
        this.room!.once(RoomEvent.Connected, onConnected);
      });

      await this.room.connect(
        config.serverUrl,
        config.token
      );

      // Wait for connection event
      await connectedPromise;

      this.setState("connected");

    }catch(error){

      console.error(
        "LiveKit connection error",
        error
      );

      this.setStatus("error");
      this.setState("error");

      errorHandler.connectionError(
        "Connexion LiveKit impossible",
        (error as Error).message,
        true
      );

      throw error;
    }
  }

  private registerRoomEvents(){

    if(!this.room)return;

    this.room.on(
      RoomEvent.Connected,
      async()=>{

        console.log(
          "LiveKit participant ready"
        );

        this.setStatus(
          "participant_ready"
        );

        this.callbacks.onConnected?.();

        /*
          Après connexion:
          on publie la source
          préparée en preview
        */

        await this.publishPreview();

      }
    );


    this.room.on(
      RoomEvent.Disconnected,
      async()=>{

        console.log(
          "LiveKit disconnected"
        );

        this.setState(
          "disconnected"
        );

        this.setStatus(
          "idle"
        );

        this.callbacks
        .onDisconnected?.();

        // Attempt reconnection if not intentionally disconnected
        if (this.mounted && this.currentConfig && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
          this.setState("reconnecting");
          
          this.reconnectTimer = setTimeout(async () => {
            try {
              this.reconnectAttempts++;
              if (this.currentConfig) {
                await this.connect(this.currentConfig);
                this.reconnectAttempts = 0; // Reset on successful reconnection
              }
            } catch (error) {
              console.error("Reconnection failed:", error);
              if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.setStatus("error");
                this.setState("error");
                errorHandler.connectionError(
                  "Reconnexion échouée après plusieurs tentatives",
                  (error as Error).message,
                  true
                );
              }
            }
          }, this.reconnectDelay);
          
          // Exponential backoff
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        }

      }
    );


    this.room.on(
      RoomEvent.LocalTrackPublished,
      (
        publication
      )=>{

        console.log(
          "Track publiée",
          publication.kind
        );

        this.checkMediaReady();

      }
    );


    this.room.on(
      RoomEvent.ParticipantConnected,
      participant=>{

        this.callbacks
        .onParticipantJoined?.(
          participant
        );

      }
    );


    this.room.on(
      RoomEvent.ParticipantDisconnected,
      participant=>{

        this.callbacks
        .onParticipantLeft?.(
          participant
        );

      }
    );


    this.room.on(
      RoomEvent.Reconnecting,
      ()=>{

        this.setState(
          "reconnecting"
        );

      }
    );


    this.room.on(
      RoomEvent.Reconnected,
      async()=>{

        console.log(
          "LiveKit reconnected"
        );

        this.setState(
          "connected"
        );

        await this.restoreTracks();

      }
    );

  }


  async startStudio(config: LiveKitConfig){
    // Create a promise that resolves when participant is ready
    const participantReadyPromise = new Promise<void>((resolve) => {
      const checkParticipant = () => {
        if (this.room?.localParticipant) {
          resolve();
        } else {
          setTimeout(checkParticipant, 50);
        }
      };
      checkParticipant();
    });
    
    await this.connect(config);
    
    // Wait for participant to be available
    await participantReadyPromise;
    
    await this.enableCameraAndMicrophone();
    return this.getStudioStatus();
  }


  async enableCameraAndMicrophone(){
    const participant=
      this.room?.localParticipant;

    if(!participant){
      console.warn(
        "Participant absent"
      );
      return;
    }

    try{
      this.setStatus(
        "publishing"
      );

      // Activer caméra
      await participant.setCameraEnabled(
        true
      );

      this.studioState.cameraEnabled=true;

      // Activer microphone
      await participant.setMicrophoneEnabled(
        true
      );

      this.studioState.microphoneEnabled=true;

      this.callbacks
      .onCameraEnabledChange?.(
        this.studioState.cameraEnabled
      );

      this.callbacks
      .onMicEnabledChange?.(
        this.studioState.microphoneEnabled
      );

      this.checkMediaReady();

    }catch(error){
      console.error(
        "Activation média error",
        error
      );

      errorHandler.deviceError(
        "Impossible d'activer les médias",
        (error as Error).message,
        false
      );
    }
  }


  private async publishPreview(){

    const participant=
      this.room?.localParticipant;


    if(!participant){
      console.warn(
        "Participant absent"
      );
      return;
    }


    try{

      this.setStatus(
        "publishing"
      );


      if(this.previewVideoTrack){

        await participant.publishTrack(
          this.previewVideoTrack
        );

        this.studioState.cameraEnabled=true;

      }
      else{

        await participant.setCameraEnabled(
          true
        );

        this.studioState.cameraEnabled=true;

      }



      if(this.previewAudioTrack){

        await participant.publishTrack(
          this.previewAudioTrack
        );

        this.studioState.microphoneEnabled=true;

      }
      else{

        await participant.setMicrophoneEnabled(
          true
        );

        this.studioState.microphoneEnabled=true;

      }


      this.callbacks
      .onCameraEnabledChange?.(
        this.studioState.cameraEnabled
      );


      this.callbacks
      .onMicEnabledChange?.(
        this.studioState.microphoneEnabled
      );


      this.checkMediaReady();


    }catch(error){

      console.error(
        "Publication preview error",
        error
      );

      errorHandler.deviceError(
        "Impossible de publier les médias",
        (error as Error).message,
        false
      );

    }

  }


  private checkMediaReady(){

    const participant=
      this.room?.localParticipant;


    if(!participant)return;


    const video=
      participant.getTrackPublication(
        Track.Source.Camera
      );


    const audio=
      participant.getTrackPublication(
        Track.Source.Microphone
      );


    console.log(
      "Media check",
      {
        video:!!video,
        audio:!!audio
      }
    );


    if(video&&audio){

      this.setStatus(
        "media_ready"
      );

      this.setStatus(
        "ready"
      );


      console.log(
        "Studio LiveKit READY"
      );

    }

  }



  async publishTrack(
    track:LocalVideoTrack|LocalAudioTrack
  ){

    let participant=
      this.room?.localParticipant;


    if(!participant){
      console.warn(
        "LiveKit publishTrack: Room not connected"
      );

      if(this.currentConfig){
        await this.connect(
          this.currentConfig
        );
        
        // Get participant after connection
        participant=this.room?.localParticipant;
        
        if(!participant){
          throw new Error(
            "Impossible de publier: participant toujours absent après connexion"
          );
        }
      }else{
        throw new Error(
          "Impossible de publier: aucune configuration LiveKit"
        );
      }
    }


    this.setStatus(
      "publishing"
    );


    await participant.publishTrack(
      track
    );


    this.checkMediaReady();

  }



  async switchCamera(
    deviceId:string
  ){

    const participant=
      this.room?.localParticipant;


    if(!participant)return false;


    try{

      await participant.setCameraEnabled(
        true,
        {
          deviceId:{
            exact:deviceId
          }
        }
      );


      this.studioState={
        ...this.studioState,
        cameraEnabled:true,
        cameraDeviceId:deviceId
      };


      return true;


    }catch(error){

      console.error(
        "Camera switch error",
        error
      );

      return false;

    }

  }



  async switchMicrophone(
    deviceId:string
  ){

    const participant=
      this.room?.localParticipant;


    if(!participant)return false;


    try{

      await participant.setMicrophoneEnabled(
        true,
        {
          deviceId:{
            exact:deviceId
          }
        }
      );


      this.studioState={
        ...this.studioState,
        microphoneEnabled:true,
        microphoneDeviceId:deviceId
      };


      return true;


    }catch(error){

      console.error(
        "Microphone switch error",
        error
      );

      return false;

    }

  }



  private async restoreTracks(){

    const participant=
      this.room?.localParticipant;


    if(!participant)return;


    try{

      if(this.studioState.cameraEnabled){

        await participant.setCameraEnabled(
          true
        );

      }


      if(this.studioState.microphoneEnabled){

        await participant.setMicrophoneEnabled(
          true
        );

      }


      console.log(
        "Tracks restored"
      );


    }catch(error){

      console.error(
        "Restore tracks error",
        error
      );

    }

  }



  getStudioStatus(){

    return {

      connection:this.state,

      status:this.status,

      roomConnected:!!this.room,

      participant:!!this.room?.localParticipant,

      camera:this.studioState.cameraEnabled,

      microphone:this.studioState.microphoneEnabled

    };

  }



  async disconnect(){

    console.log(
      "LiveKit disconnect"
    );


    try{

      this.previewVideoTrack?.stop();

      this.previewAudioTrack?.stop();


      if(this.room){

        await this.room.disconnect();

        this.room=null;

      }


    }catch(error){

      console.error(
        "Disconnect error",
        error
      );

    }


    connectionManager.releaseLock();


    this.setState(
      "idle"
    );

    this.setStatus(
      "idle"
    );


    this.currentConfig=null;

  }



  reset(){

    if(this.room){

      this.room.disconnect();

    }

    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    this.room=null;

    this.callbacks={};

    this.currentConfig=null;


    this.studioState={

      cameraEnabled:false,

      microphoneEnabled:false,

      screenSharing:false

    };


    this.setState(
      "idle"
    );

    this.setStatus(
      "idle"
    );

  }


  isConnected(){

    return this.state==="connected";

  }


  hasParticipant(){

    return !!this.room?.localParticipant;

  }


  isMediaReady(){

    return (
      this.status==="media_ready"||
      this.status==="ready"
    );

  }


}


export const liveKitService =
  LiveKitService.getInstance();

