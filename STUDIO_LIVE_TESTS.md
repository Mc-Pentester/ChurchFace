# Studio Live - Tests de Stabilisation Production

## Tests Obligatoires

### TEST 1: Entrer dans un live
**Objectif:** Vérifier la connexion initiale
**Étapes:**
1. Naviguer vers `/church/[slug]/admin/live`
2. Attendre la connexion LiveKit
3. Vérifier la console

**Résultat attendu:**
- `StudioLiveKitRoom: Connecting to LiveKit room: studio-{id}`
- `LiveKit: Connected to room`
- `Studio connected to LiveKit`
- État: `CONNECTED`

**Logs à vérifier:**
- ✅ `ConnectionManager: Connection lock acquired for StudioLiveKitRoom`
- ✅ `ConnectionManager: State updated: { isConnected: true, isConnecting: false }`
- ❌ Pas de `Already connected` ou `skipping connection`

---

### TEST 2: Fast Refresh plusieurs fois
**Objectif:** Vérifier la stabilité lors du développement
**Étapes:**
1. Être connecté au Studio Live
2. Modifier un fichier (ex: StudioLive.tsx)
3. Attendre le Fast Refresh
4. Répéter 3-5 fois

**Résultat attendu:**
- Une seule connexion LiveKit active
- Pas de déconnexion/reconnexion inutile
- État reste `CONNECTED`

**Logs à vérifier:**
- ✅ `ConnectionManager: Already connected to {roomName}, skipping connection`
- ✅ `StudioLiveKitRoom: Already connecting, skipping`
- ❌ Pas de `Disconnected` suivi de `Connected`
- ❌ Pas de `client leave request received`

---

### TEST 3: Perdre Internet 10 secondes
**Objectif:** Vérifier la reconnexion automatique
**Étapes:**
1. Être connecté au Studio Live
2. Couper le réseau (mode avion ou désactiver WiFi)
3. Attendre 10 secondes
4. Rétablir le réseau

**Résultat attendu:**
- `LiveKit: Disconnected from room`
- `LiveKit: Reconnecting...`
- `LiveKit: Reconnected`
- État: `RECONNECTING` → `CONNECTED`

**Logs à vérifier:**
- ✅ `LiveKit: Attempting reconnection (1/5)`
- ✅ `ConnectionManager: State updated: { isReconnecting: true }`
- ✅ `LiveKit: Reconnected`
- ❌ Pas de boucle infinie de reconnexion

---

### TEST 4: Fermer la page
**Objectif:** Vérifier le cleanup propre
**Étapes:**
1. Être connecté au Studio Live
2. Fermer l'onglet du navigateur
3. Rouvrir la page

**Résultat attendu:**
- Déconnexion propre lors de la fermeture
- Reconnexion propre lors de la réouverture
- Pas d'état zombie

**Logs à vérifier:**
- ✅ `StudioLiveKitRoom: Component unmounting, disconnecting`
- ✅ `ConnectionManager: State updated: { disconnectReason: "PAGE_UNLOAD" }`
- ✅ `ConnectionManager: Connection lock released`
- ❌ Pas de `Attempting reconnection` après fermeture

---

### TEST 5: Deux onglets du même utilisateur
**Objectif:** Vérifier la gestion multi-onglets
**Étapes:**
1. Ouvrir le Studio Live dans un onglet
2. Ouvrir le Studio Live dans un deuxième onglet
3. Observer les deux onglets

**Résultat attendu:**
- Pas de boucle de connexion entre les onglets
- Chaque onglet gère sa connexion indépendamment
- Pas de conflit de locks

**Logs à vérifier:**
- ✅ `ConnectionManager: Connection locked, skipping` dans le deuxième onglet
- ✅ Pas de `Already connected` suivi de `Disconnected` en boucle
- ❌ Pas de crash ou freeze

---

### TEST 6: Connexion mobile faible
**Objectif:** Vérifier la résilience réseau
**Étapes:**
1. Simuler une connexion mobile faible (Chrome DevTools → Network → Slow 3G)
2. Se connecter au Studio Live
3. Observer la stabilité

**Résultat attendu:**
- Connexion réussie même avec réseau lent
- Pas de crash DataChannel
- Reconnexion automatique si déconnexion

**Logs à vérifier:**
- ✅ Pas de `DataChannel error on lossy` critique
- ✅ `LiveKit: Suppressing DataChannel error during reconnection` si applicable
- ❌ Pas de `could not createOffer with closed peer connection`

---

## Points de Surveillance

### Console Errors à Ignorer (Non-Critiques)
- `DataChannel error on lossy: User-Initiated Abort` (pendant reconnexion)
- `publisher data channel 'LOSSY' closed unexpectedly` (pendant reconnexion)
- `publisher data channel 'RELIABLE' closed unexpectedly` (pendant reconnexion)
- `publisher data channel 'DATA_TRACK_LOSSY' closed unexpectedly` (pendant reconnexion)

### Console Errors Critiques (À Corriger)
- `ConnectionError: could not establish pc connection` (en dehors de reconnexion)
- `Max reconnection attempts reached`
- `Missing required LiveKit configuration`
- `Failed to connect` (sans reconnexion automatique)

### États ConnectionManager à Surveiller
- `isLocked: true` persistant > 30 secondes → Lock stale
- `isConnecting: true` persistant > 10 secondes → Timeout connexion
- `isReconnecting: true` persistant > 60 secondes → Timeout reconnexion

### Métriques Performance
- Temps de connexion initial < 5 secondes
- Temps de reconnexion < 30 secondes
- Nombre de reconnexions < 3 par session normale
- Utilisation CPU < 30% pendant la connexion

---

## Checklist de Validation

- [ ] CSP Socket.io ne bloque plus ws:// en développement
- [ ] ConnectionManager empêche les connexions multiples
- [ ] Fast Refresh ne provoque pas de déconnexion
- [ ] Reconnexion automatique fonctionne après perte réseau
- [ ] Cleanup propre lors de la fermeture de page
- [ ] Multi-onglets ne créent pas de boucles
- [ ] DataChannel errors sont filtrés correctement
- [ ] Pas de memory leak après plusieurs sessions
- [ ] Studio Live reste connecté > 5 minutes stable
- [ ] Lecteur public reçoit les tracks vidéo

---

## Résultats des Tests

**Date:** _______________
**Testeur:** _______________

| Test | Résultat | Notes |
|------|----------|-------|
| TEST 1: Entrer dans un live | ⬜ Pass ⬜ Fail | |
| TEST 2: Fast Refresh | ⬜ Pass ⬜ Fail | |
| TEST 3: Perte Internet | ⬜ Pass ⬜ Fail | |
| TEST 4: Fermer la page | ⬜ Pass ⬜ Fail | |
| TEST 5: Deux onglets | ⬜ Pass ⬜ Fail | |
| TEST 6: Connexion mobile | ⬜ Pass ⬜ Fail | |

**Observations:**
_________________________________________________________________________
_________________________________________________________________________

**Problèmes détectés:**
_________________________________________________________________________
_________________________________________________________________________

**Actions requises:**
_________________________________________________________________________
_________________________________________________________________________
