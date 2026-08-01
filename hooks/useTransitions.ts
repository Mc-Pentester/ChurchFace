"use client";

import { useState, useCallback, useRef } from "react";

export type TransitionType = "CUT" | "FADE" | "DISSOLVE" | "SLIDE" | "ZOOM" | "WIPE";

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  direction?: "left" | "right" | "up" | "down";
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface TransitionState {
  isTransitioning: boolean;
  currentTransition: Transition | null;
  progress: number;
}

export function useTransitions() {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    currentTransition: null,
    progress: 0,
  });

  const [defaultTransition, setDefaultTransition] = useState<Transition>({
    id: "default",
    type: "CUT",
    duration: 500,
    direction: "left",
    easing: "ease-in-out",
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Execute a transition
  const executeTransition = useCallback(
    (transition: Partial<Transition> = {}): Promise<void> => {
      return new Promise((resolve) => {
        const fullTransition: Transition = {
          ...defaultTransition,
          ...transition,
          id: transition.id || `transition_${Date.now()}`,
        };

        setTransitionState({
          isTransitioning: true,
          currentTransition: fullTransition,
          progress: 0,
        });

        const startTime = Date.now();
        const duration = fullTransition.duration;

        // Animation loop
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          setTransitionState((prev) => ({
            ...prev,
            progress,
          }));

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            // Transition complete
            setTransitionState({
              isTransitioning: false,
              currentTransition: null,
              progress: 0,
            });
            resolve();
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      });
    },
    [defaultTransition]
  );

  // Quick transition helpers
  const cut = useCallback(() => {
    return executeTransition({ type: "CUT", duration: 0 });
  }, [executeTransition]);

  const fade = useCallback((duration = 500) => {
    return executeTransition({ type: "FADE", duration });
  }, [executeTransition]);

  const dissolve = useCallback((duration = 500) => {
    return executeTransition({ type: "DISSOLVE", duration });
  }, [executeTransition]);

  const slide = useCallback((direction: "left" | "right" | "up" | "down" = "left", duration = 500) => {
    return executeTransition({ type: "SLIDE", direction, duration });
  }, [executeTransition]);

  const zoom = useCallback((duration = 500) => {
    return executeTransition({ type: "ZOOM", duration });
  }, [executeTransition]);

  const wipe = useCallback((direction: "left" | "right" | "up" | "down" = "left", duration = 500) => {
    return executeTransition({ type: "WIPE", direction, duration });
  }, [executeTransition]);

  // Set default transition
  const setDefault = useCallback((transition: Partial<Transition>) => {
    setDefaultTransition((prev) => ({
      ...prev,
      ...transition,
    }));
  }, []);

  // Cancel current transition
  const cancelTransition = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setTransitionState({
      isTransitioning: false,
      currentTransition: null,
      progress: 0,
    });
  }, []);

  // Get CSS styles for current transition
  const getTransitionStyles = useCallback(() => {
    const { currentTransition, progress } = transitionState;
    if (!currentTransition) return {};

    const styles: React.CSSProperties = {};

    switch (currentTransition.type) {
      case "FADE":
        styles.opacity = progress;
        styles.transition = `opacity ${currentTransition.duration}ms ${currentTransition.easing}`;
        break;

      case "DISSOLVE":
        styles.opacity = progress;
        styles.mixBlendMode = "normal";
        break;

      case "SLIDE":
        const slideOffset = (1 - progress) * 100;
        switch (currentTransition.direction) {
          case "left":
            styles.transform = `translateX(${slideOffset}%)`;
            break;
          case "right":
            styles.transform = `translateX(-${slideOffset}%)`;
            break;
          case "up":
            styles.transform = `translateY(${slideOffset}%)`;
            break;
          case "down":
            styles.transform = `translateY(-${slideOffset}%)`;
            break;
        }
        break;

      case "ZOOM":
        const scale = 0.5 + (progress * 0.5);
        styles.transform = `scale(${scale})`;
        styles.opacity = progress;
        break;

      case "WIPE":
        const clipPath = currentTransition.direction === "left"
          ? `inset(0 ${100 - progress * 100}% 0 0)`
          : currentTransition.direction === "right"
          ? `inset(0 0 0 ${100 - progress * 100}%)`
          : currentTransition.direction === "up"
          ? `inset(${100 - progress * 100}% 0 0 0)`
          : `inset(0 0 ${100 - progress * 100}% 0)`;
        styles.clipPath = clipPath;
        break;

      case "CUT":
      default:
        // No animation for cut
        break;
    }

    return styles;
  }, [transitionState]);

  // Get easing function
  const getEasingValue = useCallback((t: number, easing?: string): number => {
    switch (easing) {
      case "linear":
        return t;
      case "ease-in":
        return t * t;
      case "ease-out":
        return t * (2 - t);
      case "ease-in-out":
      default:
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    cancelTransition();
  }, [cancelTransition]);

  return {
    // State
    transitionState,
    defaultTransition,

    // Execute transitions
    executeTransition,
    cut,
    fade,
    dissolve,
    slide,
    zoom,
    wipe,

    // Configuration
    setDefault,

    // Control
    cancelTransition,

    // Utilities
    getTransitionStyles,
    getEasingValue,
    cleanup,
  };
}
