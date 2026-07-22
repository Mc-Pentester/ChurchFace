export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
}

/**
 * Un élément <audio> ne peut être associé qu'une seule fois
 * à createMediaElementSource().
 */
const legacyElementSources = new WeakMap<
  HTMLAudioElement,
  MediaElementAudioSourceNode
>();

type CapturableAudio = HTMLAudioElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

function captureElementAudio(
  element: HTMLAudioElement
): MediaStream | null {
  try {
    const media = element as CapturableAudio;

    if (
      typeof media.captureStream ===
      "function"
    ) {
      return media.captureStream();
    }

    if (
      typeof media.mozCaptureStream ===
      "function"
    ) {
      return media.mozCaptureStream();
    }
  } catch (error) {
    console.warn(
      "Audio capture not supported:",
      error
    );
  }

  return null;
}

/**
 * Mixe :
 *
 * - le microphone ;
 * - l'audio de la playlist ;
 *
 * dans un seul MediaStream destiné
 * à la diffusion WebRTC.
 */
export class RadioAudioMixer {
  private ctx: AudioContext | null = null;

  private destination:
    MediaStreamAudioDestinationNode | null =
    null;

  private micGain: GainNode | null = null;

  private musicGain: GainNode | null = null;

  private micStream: MediaStream | null =
    null;

  private micSource:
    MediaStreamAudioSourceNode | null =
    null;

  private musicStreamSource:
    MediaStreamAudioSourceNode | null =
    null;

  private legacyMusicSource:
    MediaElementAudioSourceNode | null =
    null;

  private connectedAudioElement:
    HTMLAudioElement | null =
    null;

  private started = false;

  /**
   * Démarre le mixeur audio.
   */
  async start(
    audioElement: HTMLAudioElement | null
  ): Promise<MediaStream> {
    if (!this.ctx) {
      this.ctx = new AudioContext();

      this.destination =
        this.ctx.createMediaStreamDestination();

      this.micGain =
        this.ctx.createGain();

      this.musicGain =
        this.ctx.createGain();

      this.micGain.connect(
        this.destination
      );

      this.musicGain.connect(
        this.destination
      );
    }

    await this.ctx.resume();

    await this.ensureMicrophone();

    if (audioElement) {
      this.attachPlaylist(
        audioElement
      );
    }

    this.started = true;

    return this.destination!.stream;
  }

  /**
   * Active le microphone.
   */
  private async ensureMicrophone() {
    if (
      !this.ctx ||
      !this.micGain
    ) {
      return;
    }

    if (
      this.micStream &&
      this.micStream.active
    ) {
      return;
    }

    this.micSource?.disconnect();

    this.micStream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        }
      );

    this.micSource =
      this.ctx.createMediaStreamSource(
        this.micStream
      );

    this.micSource.connect(
      this.micGain
    );
  }

  /**
   * Connecte l'audio de la playlist
   * au mixeur.
   */
  attachPlaylist(
    audioElement: HTMLAudioElement
  ) {
    if (
      !this.ctx ||
      !this.musicGain
    ) {
      return;
    }

    if (
      this.connectedAudioElement ===
      audioElement
    ) {
      return;
    }

    this.disconnectMusic();

    const capturedStream =
      captureElementAudio(
        audioElement
      );

    if (capturedStream) {
      this.musicStreamSource =
        this.ctx.createMediaStreamSource(
          capturedStream
        );

      this.musicStreamSource.connect(
        this.musicGain
      );

      this.connectedAudioElement =
        audioElement;

      return;
    }

    let legacySource =
      legacyElementSources.get(
        audioElement
      );

    if (!legacySource) {
      legacySource =
        this.ctx.createMediaElementSource(
          audioElement
        );

      legacyElementSources.set(
        audioElement,
        legacySource
      );

      legacySource.connect(
        this.ctx.destination
      );
    }

    legacySource.connect(
      this.musicGain
    );

    this.legacyMusicSource =
      legacySource;

    this.connectedAudioElement =
      audioElement;
  }

  /**
   * Déconnecte la playlist.
   */
  private disconnectMusic() {
    if (
      this.musicStreamSource
    ) {
      this.musicStreamSource.disconnect();

      this.musicStreamSource = null;
    }

    if (
      this.legacyMusicSource &&
      this.musicGain
    ) {
      try {
        this.legacyMusicSource.disconnect(
          this.musicGain
        );
      } catch {
        // Déjà déconnecté.
      }
    }

    this.legacyMusicSource =
      null;

    this.connectedAudioElement =
      null;
  }

  /**
   * Définit le volume du microphone.
   */
  setMicLevel(
    volume: number,
    muted: boolean
  ) {
    if (!this.micGain) {
      return;
    }

    const normalizedVolume =
      Math.max(
        0,
        Math.min(1, volume / 100)
      );

    this.micGain.gain.value =
      muted
        ? 0
        : normalizedVolume;
  }

  /**
   * Définit le volume de la musique.
   */
  setMusicLevel(
    volume: number,
    muted: boolean
  ) {
    if (!this.musicGain) {
      return;
    }

    const normalizedVolume =
      Math.max(
        0,
        Math.min(1, volume / 100)
      );

    this.musicGain.gain.value =
      muted
        ? 0
        : normalizedVolume;
  }

  /**
   * Retourne le flux audio mixé.
   */
  getStream(): MediaStream | null {
    return (
      this.destination?.stream ??
      null
    );
  }

  /**
   * Coupe temporairement le microphone.
   *
   * Le mixeur reste utilisable.
   */
  suspend() {
    this.micSource?.disconnect();

    this.micSource =
      null;

    this.micStream
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    this.micStream =
      null;
  }

  /**
   * Détruit complètement le mixeur.
   */
  stop() {
    this.suspend();

    this.disconnectMusic();

    this.micGain?.disconnect();

    this.musicGain?.disconnect();

    this.destination?.disconnect();

    this.ctx?.close();

    this.ctx =
      null;

    this.destination =
      null;

    this.micGain =
      null;

    this.musicGain =
      null;

    this.started =
      false;
  }

  /**
   * Indique si le mixeur est actif.
   */
  isStarted(): boolean {
    return this.started;
  }
}