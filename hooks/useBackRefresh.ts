"use client";

import { useEffect } from "react";

export function useBackRefresh() {
  useEffect(() => {
    // Cette approche ne fonctionne pas de manière fiable avec Next.js
    // Le problème est que Next.js utilise son propre système de routing client-side
    // et les événements natifs du navigateur ne se déclenchent pas toujours
    
    // La meilleure solution est de recharger les données dans les composants
    // au lieu de recharger toute la page
    
    console.log('useBackRefresh hook called - Note: This may not work reliably with Next.js client-side routing');
  }, []);
}
