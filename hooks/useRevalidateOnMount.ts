"use client";

import { useEffect, useRef } from "react";

export function useRevalidateOnMount() {
  const hasMounted = useRef(false);

  useEffect(() => {
    // Si le composant a déjà été monté, c'est une navigation arrière
    // On peut déclencher un événement personnalisé pour recharger les données
    if (hasMounted.current) {
      window.dispatchEvent(new CustomEvent('revalidate-data'));
    }
    hasMounted.current = true;
  }, []);
}
