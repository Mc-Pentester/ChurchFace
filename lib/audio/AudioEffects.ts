// Audio Effects Architecture for Studio Pro
// Extensible system for audio processing effects

export interface AudioEffectConfig {
  enabled: boolean;
}

export interface CompressorConfig extends AudioEffectConfig {
  parameters: {
    threshold: number; // -60 to 0 dB
    ratio: number; // 1:1 to 20:1
    attack: number; // 0 to 100 ms
    release: number; // 0 to 1000 ms
    makeupGain: number; // 0 to 24 dB
  };
}

export interface NoiseGateConfig extends AudioEffectConfig {
  parameters: {
    threshold: number; // -60 to 0 dB
    ratio: number; // 1:1 to 20:1
    attack: number; // 0 to 100 ms
    release: number; // 0 to 1000 ms
    hold: number; // 0 to 1000 ms
  };
}

export interface LimiterConfig extends AudioEffectConfig {
  parameters: {
    threshold: number; // -20 to 0 dB
    release: number; // 0 to 1000 ms
    ceiling: number; // -10 to 0 dB
  };
}

export interface EqualizerConfig extends AudioEffectConfig {
  parameters: {
    bands: {
      low: number; // -12 to +12 dB
      lowMid: number; // -12 to +12 dB
      mid: number; // -12 to +12 dB
      highMid: number; // -12 to +12 dB
      high: number; // -12 to +12 dB
    };
  };
}

export interface NoiseReductionConfig extends AudioEffectConfig {
  parameters: {
    amount: number; // 0 to 100%
    sensitivity: number; // 0 to 100%
    fftSize: number; // 512 to 8192
  };
}

export type AudioEffectType = 
  | "COMPRESSOR" 
  | "NOISE_GATE" 
  | "LIMITER" 
  | "EQUALIZER" 
  | "NOISE_REDUCTION";

export type AudioEffectConfigType = 
  | CompressorConfig 
  | NoiseGateConfig 
  | LimiterConfig 
  | EqualizerConfig 
  | NoiseReductionConfig;

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  config: AudioEffectConfigType;
  apply: (audioData: Float32Array) => Float32Array;
  reset: () => void;
}

// Default configurations
export const defaultCompressorConfig: CompressorConfig = {
  enabled: false,
  parameters: {
    threshold: -24,
    ratio: 4,
    attack: 10,
    release: 100,
    makeupGain: 0,
  },
};

export const defaultNoiseGateConfig: NoiseGateConfig = {
  enabled: false,
  parameters: {
    threshold: -30,
    ratio: 10,
    attack: 5,
    release: 50,
    hold: 100,
  },
};

export const defaultLimiterConfig: LimiterConfig = {
  enabled: false,
  parameters: {
    threshold: -1,
    release: 100,
    ceiling: -0.1,
  },
};

export const defaultEqualizerConfig: EqualizerConfig = {
  enabled: false,
  parameters: {
    bands: {
      low: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      high: 0,
    },
  },
};

export const defaultNoiseReductionConfig: NoiseReductionConfig = {
  enabled: false,
  parameters: {
    amount: 50,
    sensitivity: 50,
    fftSize: 2048,
  },
};

// Effect registry
class AudioEffectsRegistry {
  private effects: Map<string, AudioEffect> = new Map();

  registerEffect(effect: AudioEffect): void {
    this.effects.set(effect.id, effect);
  }

  getEffect(id: string): AudioEffect | undefined {
    return this.effects.get(id);
  }

  removeEffect(id: string): boolean {
    return this.effects.delete(id);
  }

  getAllEffects(): AudioEffect[] {
    return Array.from(this.effects.values());
  }

  clear(): void {
    this.effects.clear();
  }
}

export const audioEffectsRegistry = new AudioEffectsRegistry();

// Effect factory
export function createAudioEffect(type: AudioEffectType, config: AudioEffectConfigType): AudioEffect {
  const id = `${type.toLowerCase()}_${Date.now()}_${Math.random()}`;

  const effect: AudioEffect = {
    id,
    type,
    config,
    apply: (audioData: Float32Array) => {
      if (!config.enabled) return audioData;

      switch (type) {
        case "COMPRESSOR":
          return applyCompressor(audioData, config as CompressorConfig);
        case "NOISE_GATE":
          return applyNoiseGate(audioData, config as NoiseGateConfig);
        case "LIMITER":
          return applyLimiter(audioData, config as LimiterConfig);
        case "EQUALIZER":
          return applyEqualizer(audioData, config as EqualizerConfig);
        case "NOISE_REDUCTION":
          return applyNoiseReduction(audioData, config as NoiseReductionConfig);
        default:
          return audioData;
      }
    },
    reset: () => {
      // Reset effect state
    },
  };

  return effect;
}

// Effect implementations (simplified - production would use Web Audio API)
function applyCompressor(audioData: Float32Array, config: CompressorConfig): Float32Array {
  // Simplified compressor implementation
  // In production, use DynamicsCompressorNode from Web Audio API
  const output = new Float32Array(audioData.length);
  const threshold = Math.pow(10, config.parameters.threshold / 20);
  const ratio = config.parameters.ratio;

  for (let i = 0; i < audioData.length; i++) {
    const input = Math.abs(audioData[i]);
    let gain = 1;

    if (input > threshold) {
      gain = 1 - (input - threshold) * (1 - 1 / ratio);
    }

    output[i] = audioData[i] * gain * Math.pow(10, config.parameters.makeupGain / 20);
  }

  return output;
}

function applyNoiseGate(audioData: Float32Array, config: NoiseGateConfig): Float32Array {
  // Simplified noise gate implementation
  const threshold = Math.pow(10, config.parameters.threshold / 20);
  const output = new Float32Array(audioData.length);

  for (let i = 0; i < audioData.length; i++) {
    const input = Math.abs(audioData[i]);
    output[i] = input > threshold ? audioData[i] : 0;
  }

  return output;
}

function applyLimiter(audioData: Float32Array, config: LimiterConfig): Float32Array {
  // Simplified limiter implementation
  const threshold = Math.pow(10, config.parameters.threshold / 20);
  const ceiling = Math.pow(10, config.parameters.ceiling / 20);
  const output = new Float32Array(audioData.length);

  for (let i = 0; i < audioData.length; i++) {
    const input = audioData[i];
    const absInput = Math.abs(input);
    
    if (absInput > threshold) {
      const limited = Math.sign(input) * Math.min(absInput, ceiling);
      output[i] = limited;
    } else {
      output[i] = input;
    }
  }

  return output;
}

function applyEqualizer(audioData: Float32Array, config: EqualizerConfig): Float32Array {
  // Simplified EQ implementation
  // In production, use BiquadFilterNode from Web Audio API
  const output = new Float32Array(audioData.length);
  const bands = config.parameters.bands;

  // Very simplified EQ - just apply gain
  const totalGain = (bands.low + bands.lowMid + bands.mid + bands.highMid + bands.high) / 5;
  const gainFactor = Math.pow(10, totalGain / 20);

  for (let i = 0; i < audioData.length; i++) {
    output[i] = audioData[i] * gainFactor;
  }

  return output;
}

function applyNoiseReduction(audioData: Float32Array, config: NoiseReductionConfig): Float32Array {
  // Simplified noise reduction
  // In production, use spectral subtraction or advanced algorithms
  const amount = config.parameters.amount / 100;
  const output = new Float32Array(audioData.length);

  for (let i = 0; i < audioData.length; i++) {
    // Simple threshold-based noise reduction
    const threshold = 0.01 * (1 - config.parameters.sensitivity / 100);
    const input = audioData[i];
    
    if (Math.abs(input) < threshold) {
      output[i] = input * (1 - amount);
    } else {
      output[i] = input;
    }
  }

  return output;
}

// Validate effect config
export function validateEffectConfig(type: AudioEffectType, config: AudioEffectConfigType): boolean {
  switch (type) {
    case "COMPRESSOR":
      const comp = config as CompressorConfig;
      return comp.parameters.threshold >= -60 && comp.parameters.threshold <= 0 &&
             comp.parameters.ratio >= 1 && comp.parameters.ratio <= 20;
    case "NOISE_GATE":
      const gate = config as NoiseGateConfig;
      return gate.parameters.threshold >= -60 && gate.parameters.threshold <= 0;
    case "LIMITER":
      const limiter = config as LimiterConfig;
      return limiter.parameters.threshold >= -20 && limiter.parameters.threshold <= 0;
    case "EQUALIZER":
      const eq = config as EqualizerConfig;
      return Object.values(eq.parameters.bands).every(v => v >= -12 && v <= 12);
    case "NOISE_REDUCTION":
      const nr = config as NoiseReductionConfig;
      return nr.parameters.amount >= 0 && nr.parameters.amount <= 100;
    default:
      return false;
  }
}
