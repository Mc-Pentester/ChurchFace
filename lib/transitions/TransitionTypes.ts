// Extensible transition architecture for Studio Pro
// Supports built-in transitions and custom transitions

export type BaseTransitionType = 
  | "CUT" 
  | "FADE" 
  | "FADE_TO_BLACK" 
  | "CROSS_DISSOLVE" 
  | "SLIDE" 
  | "SWIPE_LEFT" 
  | "SWIPE_RIGHT" 
  | "ZOOM";

export type AdvancedTransitionType = 
  | "STINGER" 
  | "LUMA_WIPE" 
  | "CUSTOM";

export type TransitionType = BaseTransitionType | AdvancedTransitionType;

export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing?: string;
  // For custom transitions
  customConfig?: {
    videoUrl?: string; // For Stinger transitions
    lumaMaskUrl?: string; // For Luma Wipe
    customShader?: string; // For custom shader transitions
    parameters?: Record<string, any>;
  };
}

export interface TransitionEffect {
  apply: (fromCanvas: HTMLCanvasElement, toCanvas: HTMLCanvasElement, progress: number) => void;
  cleanup?: () => void;
}

// Built-in transition implementations
export const transitionRegistry: Record<TransitionType, TransitionEffect> = {
  CUT: {
    apply: (from, to, progress) => {
      // Instant cut - no animation
      if (progress >= 0.5) {
        const ctx = from.getContext('2d');
        if (ctx) {
          ctx.drawImage(to, 0, 0);
        }
      }
    },
  },
  FADE: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(from, 0, 0);
        ctx.globalAlpha = progress;
        ctx.drawImage(to, 0, 0);
        ctx.globalAlpha = 1;
      }
    },
  },
  FADE_TO_BLACK: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        // Fade to black first
        if (progress < 0.5) {
          ctx.globalAlpha = 1 - (progress * 2);
          ctx.drawImage(from, 0, 0);
          ctx.globalAlpha = progress * 2;
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, from.width, from.height);
        } else {
          // Fade from black to new scene
          ctx.globalAlpha = (progress - 0.5) * 2;
          ctx.drawImage(to, 0, 0);
          ctx.globalAlpha = 1 - ((progress - 0.5) * 2);
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, from.width, from.height);
        }
        ctx.globalAlpha = 1;
      }
    },
  },
  CROSS_DISSOLVE: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(from, 0, 0);
        ctx.globalAlpha = progress;
        ctx.drawImage(to, 0, 0);
        ctx.globalAlpha = 1;
      }
    },
  },
  SLIDE: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        const offset = from.width * progress;
        ctx.drawImage(from, -offset, 0);
        ctx.drawImage(to, from.width - offset, 0);
      }
    },
  },
  SWIPE_LEFT: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        const offset = from.width * progress;
        ctx.drawImage(from, -offset, 0);
        ctx.drawImage(to, from.width - offset, 0);
      }
    },
  },
  SWIPE_RIGHT: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        const offset = from.width * progress;
        ctx.drawImage(from, offset, 0);
        ctx.drawImage(to, offset - from.width, 0);
      }
    },
  },
  ZOOM: {
    apply: (from, to, progress) => {
      const ctx = from.getContext('2d');
      if (ctx) {
        const scale = 1 + progress * 0.5;
        const centerX = from.width / 2;
        const centerY = from.height / 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(from, 0, 0);
        ctx.restore();
        
        ctx.globalAlpha = progress;
        ctx.drawImage(to, 0, 0);
        ctx.globalAlpha = 1;
      }
    },
  },
  // Placeholder for advanced transitions (to be implemented)
  STINGER: {
    apply: (from, to, progress) => {
      // TODO: Implement stinger video transition
      // Will require video playback and compositing
      const ctx = from.getContext('2d');
      if (ctx) {
        ctx.drawImage(to, 0, 0);
      }
    },
  },
  LUMA_WIPE: {
    apply: (from, to, progress) => {
      // TODO: Implement luma wipe transition
      // Will require luma mask processing
      const ctx = from.getContext('2d');
      if (ctx) {
        ctx.drawImage(to, 0, 0);
      }
    },
  },
  CUSTOM: {
    apply: (from, to, progress) => {
      // TODO: Implement custom shader transition
      // Will require WebGL shader support
      const ctx = from.getContext('2d');
      if (ctx) {
        ctx.drawImage(to, 0, 0);
      }
    },
  },
};

// Register custom transitions
export function registerCustomTransition(type: string, effect: TransitionEffect): void {
  transitionRegistry[type as TransitionType] = effect;
}

// Get transition effect
export function getTransitionEffect(type: TransitionType): TransitionEffect {
  return transitionRegistry[type] || transitionRegistry.CUT;
}

// Validate transition config
export function validateTransitionConfig(config: TransitionConfig): boolean {
  if (!config.type || !transitionRegistry[config.type]) {
    return false;
  }
  
  if (config.duration < 0 || config.duration > 10000) {
    return false;
  }
  
  // Validate custom config for advanced transitions
  if (config.type === "STINGER" && !config.customConfig?.videoUrl) {
    return false;
  }
  
  if (config.type === "LUMA_WIPE" && !config.customConfig?.lumaMaskUrl) {
    return false;
  }
  
  if (config.type === "CUSTOM" && !config.customConfig?.customShader) {
    return false;
  }
  
  return true;
}
