export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}

/** Un élément <audio> ne peut être lié qu'une seule fois via createMediaElementSource. */
const legacyElementSources = new WeakMap<
  HTMLAudioElement,
  MediaElementAudioSourceNode
>();

function captureElementAudio(el: HTMLAudioElement): MediaStream | null {
  try {
    if (typeof el.captureStream === "function") {
      return el.captureStream();
    }
    const moz = (
      el as HTMLMediaElement & { mozCaptureStream?: () => MediaStream }
    ).mozCaptureStream;
    if (typeof moz === "function") {
      return moz.call(el);
    }
  } catch {
    /* navigateur sans support */
  }
  return null;
}

/**
 * Mixe le micro et la sortie d'un élément <audio> (playlist) pour WebRTC.
 */
export class RadioAudioMixer {
  private ctx: AudioContext | null = null;
  private dest: MediaStreamAudioDestinationNode | null = null;
  private micGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private musicStreamSource: MediaStreamAudioSourceNode | null = null;
  private legacyMusicSource: MediaElementAudioSourceNode | null = null;
  private connectedEl: HTMLAudioElement | null = null;
  private started = false;

  async start(audioEl: HTMLAudioElement | null): Promise<MediaStream> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.dest = this.ctx.createMediaStreamDestination();
      this.micGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.micGain.connect(this.dest);
      this.musicGain.connect(this.dest);
    }

    await this.ctx.resume();
    await this.ensureMic();

    if (audioEl) {
      this.attachPlaylist(audioEl);
    }

    this.started = true;
    return this.dest!.stream;
  }

  private async ensureMic() {
    if (!this.ctx || !this.micGain) return;
    if (this.micStream?.active) return;

    this.micSource?.disconnect();
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    this.micSource = this.ctx.createMediaStreamSource(this.micStream);
    this.micSource.connect(this.micGain);
  }

  attachPlaylist(audioEl: HTMLAudioElement) {
    if (!this.ctx || !this.musicGain) return;
    if (this.connectedEl === audioEl && this.musicStreamSource) return;
    if (this.connectedEl === audioEl && this.legacyMusicSource) return;

    this.disconnectMusic();

    const captured = captureElementAudio(audioEl);
    if (captured) {
      this.musicStreamSource = this.ctx.createMediaStreamSource(captured);
      this.musicStreamSource.connect(this.musicGain);
      this.connectedEl = audioEl;
      return;
    }

    let legacy = legacyElementSources.get(audioEl);
    if (!legacy) {
      legacy = this.ctx.createMediaElementSource(audioEl);
      legacyElementSources.set(audioEl, legacy);
      legacy.connect(this.ctx.destination);
    }

    legacy.connect(this.musicGain);
    this.legacyMusicSource = legacy;
    this.connectedEl = audioEl;
  }

  private disconnectMusic() {
    this.musicStreamSource?.disconnect();
    this.musicStreamSource = null;
    if (this.legacyMusicSource && this.musicGain) {
      try {
        this.legacyMusicSource.disconnect(this.musicGain);
      } catch {
        /* déjà déconnecté */
      }
    }
    this.legacyMusicSource = null;
    this.connectedEl = null;
  }

  setMicLevel(volume: number, muted: boolean) {
    if (!this.micGain) return;
    this.micGain.gain.value = muted ? 0 : Math.max(0, Math.min(1, volume / 100));
  }

  setMusicLevel(volume: number, muted: boolean) {
    if (!this.musicGain) return;
    this.musicGain.gain.value = muted ? 0 : Math.max(0, Math.min(1, volume / 100));
  }

  getStream(): MediaStream | null {
    return this.dest?.stream ?? null;
  }

  /** Coupe le micro mais conserve le mixeur (réutilisable ON/OFF AIR). */
  suspend() {
    this.micSource?.disconnect();
    this.micSource = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
  }

  /** Destruction complète (démontage du composant). */
  stop() {
    this.suspend();
    this.disconnectMusic();
    this.micGain?.disconnect();
    this.musicGain?.disconnect();
    this.dest?.disconnect();
    this.ctx?.close();

    this.ctx = null;
    this.dest = null;
    this.micGain = null;
    this.musicGain = null;
    this.started = false;
  }

  isStarted() {
    return this.started;
  }
}
