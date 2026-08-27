# CHURCHFACE — AUDIT CIBLÉ APPELS MESSAGE
# ROOT CAUSE ANALYSIS

**Date:** 26 août 2026  
**Objectif:** Déterminer WebRTC P2P vs LiveKit et identifier pourquoi les appels n'arrivent jamais au destinataire

---

# 1. TECHNOLOGIE RÉELLEMENT UTILISÉE

**Réponse:** A. WebRTC P2P natif

**Preuves:**
- `components/messaging/CallModal.tsx` utilise `RTCPeerConnection` (lignes 124, 212)
- `getUserMedia()` pour capture audio/vidéo (lignes 114, 202)
- `createOffer()` / `createAnswer()` pour négociation SDP (lignes 150, 241)
- `setLocalDescription()` / `setRemoteDescription()` pour échange SDP (lignes 151, 240, 242)
- `addIceCandidate()` pour échange ICE (lignes 173, 254)
- `onicecandidate` pour génération candidats ICE (lignes 134, 222)
- `ontrack` pour réception tracks distants (lignes 144, 232)

**LiveKit:**
- LiveKit est configuré et utilisé pour: Studio live, Prières, Training, Mobile live
- LiveKit n'est PAS utilisé pour les appels audio/vidéo 1-1 du module Message
- Aucun import LiveKit dans `CallModal.tsx`, `CallContext.tsx`, `IncomingCallModal.tsx`

---

# 2. ARCHITECTURE RÉELLE

```
Message UI (ChatWindow.tsx)
  ↓
Bouton appel (Phone/Video icon)
  ↓
CallContext.startCall()
  ↓
setActiveCall({ recipientId, recipientName, recipientImage, callType, isIncoming: false })
  ↓
CallModal s'ouvre
  ↓
CallModal.startOutgoingCall()
  ↓
getUserMedia() - Capture audio/vidéo
  ↓
new RTCPeerConnection({ iceServers: STUN Google })
  ↓
addTrack() - Ajout tracks audio/vidéo
  ↓
createOffer() - Génération SDP offer
  ↓
setLocalDescription(offer)
  ↓
socket.emit("call:offer", { callId, offer, recipientId, callerId, callerName, callType })
  ↓
❌ SERVEUR: AUCUN handler pour relayer l'offre
  ↓
❌ DESTINATAIRE: Ne reçoit jamais l'invitation
```

---

# 3. FLOW CALLER

| Étape | Fichier | Ligne | Statut |
|-------|---------|-------|--------|
| Click bouton appel | ChatWindow.tsx | 172, 183 | ✅ OK |
| CallContext.startCall() | CallContext.tsx | 104-126 | ✅ OK |
| setActiveCall() | CallContext.tsx | 116-123 | ✅ OK |
| CallModal ouvre | CallModal.tsx | 43-67 | ✅ OK |
| startOutgoingCall() | CallModal.tsx | 112-198 | ✅ OK |
| getUserMedia() | CallModal.tsx | 114-117 | ✅ OK |
| RTCPeerConnection créé | CallModal.tsx | 124-129 | ✅ OK |
| addTrack() | CallModal.tsx | 132 | ✅ OK |
| onicecandidate handler | CallModal.tsx | 134-142 | ✅ OK |
| ontrack handler | CallModal.tsx | 144-148 | ✅ OK |
| createOffer() | CallModal.tsx | 150 | ✅ OK |
| setLocalDescription() | CallModal.tsx | 151 | ✅ OK |
| socket.emit("call:offer") | CallModal.tsx | 153-160 | ✅ OK |
| ❌ Handler serveur | server.ts | AUCUN | ❌ MANQUANT |
| ❌ Destinataire reçoit | - | - | ❌ ÉCHEC |

---

# 4. FLOW RECIPIENT

| Étape | Fichier | Ligne | Statut |
|-------|---------|-------|--------|
| ❌ call:incoming reçu | CallContext.tsx | 70 | ❌ JAMAIS |
| ❌ IncomingCallModal ouvre | CallContext.tsx | 133-144 | ❌ JAMAIS |
| ❌ handleAcceptIncoming() | CallContext.tsx | 90-100 | ❌ JAMAIS |
| ❌ CallModal acceptIncomingCall() | CallModal.tsx | 200-279 | ❌ JAMAIS |
| ❌ getUserMedia() | CallModal.tsx | 202-205 | ❌ JAMAIS |
| ❌ RTCPeerConnection créé | CallModal.tsx | 212-218 | ❌ JAMAIS |
| ❌ setRemoteDescription(offer) | CallModal.tsx | 240 | ❌ JAMAIS |
| ❌ createAnswer() | CallModal.tsx | 241 | ❌ JAMAIS |
| ❌ setLocalDescription(answer) | CallModal.tsx | 242 | ❌ JAMAIS |
| ❌ socket.emit("call:answer") | CallModal.tsx | 244-248 | ❌ JAMAIS |

---

# 5. SOCKET SIGNALING

## 5.1 Événements émis par le client

| Événement | Émetteur | Fichier | Ligne | Payload |
|-----------|----------|---------|-------|---------|
| `call:offer` | CallModal | CallModal.tsx | 153-160 | `{ callId, offer, recipientId, callerId, callerName, callType }` |
| `call:answer` | CallModal | CallModal.tsx | 244-248 | `{ callId, answer, recipientId }` |
| `call:ice` | CallModal | CallModal.tsx | 136-140, 224-228 | `{ callId, candidate, recipientId }` |
| `call:end` | CallModal | CallModal.tsx | 297-300 | `{ callId, recipientId }` |
| `call:end` | IncomingCallModal | IncomingCallModal.tsx | 74-77 | `{ callId, recipientId }` |

## 5.2 Événements écoutés par le client

| Événement | Récepteur | Fichier | Ligne | Handler |
|-----------|-----------|---------|-------|---------|
| `call:incoming` | CallContext | CallContext.tsx | 70 | handleIncomingCall |
| `call:answer` | CallModal (outgoing) | CallModal.tsx | 187 | setRemoteDescription(answer) |
| `call:ice` | CallModal (outgoing) | CallModal.tsx | 188 | addIceCandidate(candidate) |
| `call:end` | CallModal (outgoing) | CallModal.tsx | 189 | cleanup() |
| `call:ice` | CallModal (incoming) | CallModal.tsx | 267 | addIceCandidate(candidate) |
| `call:end` | CallModal (incoming) | CallModal.tsx | 268 | cleanup() |
| `call:end` | IncomingCallModal | IncomingCallModal.tsx | 50 | stopRinging() |

## 5.3 Handlers serveur

| Événement | Handler serveur | Fichier | Ligne | Statut |
|-----------|-----------------|---------|-------|--------|
| `call:offer` | ❌ AUCUN | server.ts | - | ❌ MANQUANT |
| `call:answer` | ❌ AUCUN | server.ts | - | ❌ MANQUANT |
| `call:ice` | ❌ AUCUN | server.ts | - | ❌ MANQUANT |
| `call:end` | ❌ AUCUN | server.ts | - | ❌ MANQUANT |
| `call:incoming` | ❌ AUCUN | server.ts | - | ❌ MANQUANT |

**Note:** Le serveur a `socket.onAny()` (ligne 617-628) qui logge tous les événements, mais ne les traite pas.

---

# 6. OFFER

**Génération:**
- Fichier: `CallModal.tsx`
- Ligne: 150
- Code: `const offer = await pc.createOffer()`

**Configuration:**
- STUN: `stun:stun.l.google.com:19302`
- STUN: `stun:stun1.l.google.com:19302`
- TURN: AUCUN

**Émission:**
- Fichier: `CallModal.tsx`
- Ligne: 153-160
- Code: `socket.emit("call:offer", { callId, offer, recipientId, callerId, callerName, callType })`

**Réception:**
- ❌ Aucun handler serveur
- ❌ Destinataire ne reçoit jamais

---

# 7. ANSWER

**Génération:**
- Fichier: `CallModal.tsx`
- Ligne: 241
- Code: `const answer = await pc.createAnswer()`

**Condition préalable:**
- Destinataire doit recevoir `call:incoming`
- Destinataire doit accepter l'appel
- `setRemoteDescription(offer)` doit réussir

**Statut:**
- ❌ JAMAIS généré car destinataire ne reçoit jamais l'offre

---

# 8. ICE

**Configuration:**
```javascript
iceServers: [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
]
```

**Candidats observés (logs fournis):**
- `typ host` - Adresse locale
- `typ srflx` - Adresse publique découverte via STUN
- `typ tcp host` - TCP local

**Candidats manquants:**
- `typ relay` - AUCUN (TURN non configuré)

**Échange:**
- Émetteur: `CallModal.tsx` lignes 136-140, 224-228
- Récepteur: `CallModal.tsx` lignes 188, 267
- ❌ Jamais atteint car destinataire ne reçoit jamais l'offre

---

# 9. STUN

**Configuration:**
- STUN Google: `stun:stun.l.google.com:19302`
- STUN Google: `stun:stun1.l.google.com:19302`

**Fonction:**
- Découvre l'adresse publique du peer
- Permet la connexion directe (P2P) si possible

**Limitations:**
- NE fournit PAS de relais
- Si NAT restrictif ou CGNAT, la connexion directe échouera
- Sans TURN, les appels échoueront sur certains réseaux

---

# 10. TURN

**Configuration:**
- ❌ AUCUN serveur TURN configuré

**Impact:**
- **RISQUE CRITIQUE** pour les réseaux avec:
  - NAT restrictif
  - CGNAT (Carrier-Grade NAT)
  - Firewalls bloquant UDP
  - Réseaux mobiles
  - VPNs

**Scénarios:**
- LAN → LAN: ✅ Fonctionne probablement (host candidates)
- LAN → WAN: ⚠️ Dépend du NAT
- WAN → WAN: ❌ Échec probable sans TURN
- Mobile → Wi-Fi: ❌ Échec probable sans TURN
- NAT symétrique: ❌ Échec sans TURN

---

# 11. LIVEKIT

**Configuration:**
- Variables d'environnement: Configurées
- Service: `lib/livekit/LiveKitService.ts`
- API token: `app/api/livekit/token/route.ts`

**Utilisation:**
- ✅ Studio live d'église
- ✅ Prières en ligne
- ✅ Training rooms
- ✅ Mobile live
- ❌ Appels audio/vidéo 1-1 du module Message

**Conclusion:**
LiveKit est configuré mais non utilisé pour les appels 1-1. Le système utilise WebRTC P2P natif.

---

# 12. MEDIA

**Capture:**
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: callType === "video",
});
```

**Fichier:**
- `CallModal.tsx` lignes 114-117 (outgoing)
- `CallModal.tsx` lignes 202-205 (incoming)

**Ajout tracks:**
```javascript
stream.getTracks().forEach((track) => pc.addTrack(track, stream));
```

**Fichier:**
- `CallModal.tsx` ligne 132 (outgoing)
- `CallModal.tsx` ligne 220 (incoming)

**Statut:**
- ✅ Implémenté correctement
- ❌ Jamais atteint car destinataire ne reçoit jamais l'offre

---

# 13. CONNECTION STATE

**États WebRTC:**
- `iceConnectionState`: new, checking, connected, completed, failed, disconnected, closed
- `connectionState`: new, connecting, connected, disconnected, failed, closed

**Monitoring:**
- ❌ Aucun monitoring implémenté dans `CallModal.tsx`
- ❌ Aucun log de `iceConnectionState`
- ❌ Aucun log de `connectionState`

**État avant call:end:**
- ❌ Impossible de déterminer sans logs

---

# 14. CALL:END

**Émission:**
- Fichier: `CallModal.tsx`
- Ligne: 297-300
- Code: `socket.emit("call:end", { callId, recipientId })`

- Fichier: `IncomingCallModal.tsx`
- Ligne: 74-77
- Code: `socket.emit("call:end", { callId, recipientId })`

**Déclencheurs:**
- Bouton "Raccrocher" (handleEndCall)
- Rejet d'appel entrant (handleReject)
- Cleanup React (useEffect return)

**Logs fournis:**
- `call:end` reçu par serveur (via onAny)

**Analyse:**
- `call:end` est émis immédiatement après `call:offer` et `call:ice`
- Cela suggère que l'appelant termine l'appel après timeout
- Le timeout est probablement dû à l'absence de réponse du destinataire

---

# 15. CALLID

**Génération:**
```javascript
callIdRef.current = `${currentUserId}-${recipientId}-${Date.now()}`;
```

**Fichier:**
- `CallModal.tsx` ligne 57 (outgoing)
- `CallModal.tsx` ligne 51 (incoming)
- `IncomingCallModal.tsx` ligne 39

**Exemple:**
`cmt97arx400004nj5b6zc7low-cms7tgrm30000psim5r89pahu-1787782016736`

**Décomposition:**
- callerId: `cmt97arx400004nj5b6zc7low`
- recipientId: `cms7tgrm30000psim5r89pahu`
- timestamp: `1787782016736`

**Problème:**
- callId généré localement par chaque participant
- Aucune synchronisation avec la base de données
- Risque de callId différent entre appelant et destinataire

---

# 16. CAUSE RACINE

**Classification:** D — Signalisation Socket.IO

**CAUSE RACINE:**
Le système d'appel audio/vidéo 1-1 utilise WebRTC P2P natif avec signalisation Socket.IO, mais **aucun handler Socket.IO n'est implémenté côté serveur** pour relayer les messages WebRTC entre les participants.

**PREUVE:**
1. Le client émet `call:offer` via `socket.emit()` (CallModal.tsx ligne 153)
2. Le serveur a `socket.onAny()` qui logge l'événement (server.ts ligne 617-628)
3. Le serveur n'a AUCUN handler spécifique pour `call:offer` (grep_search = 0 résultats)
4. Le destinataire n'a aucun moyen de recevoir l'invitation
5. CallContext écoute `call:incoming` qui n'est jamais émis

**FICHIER:** `server.ts`

**LIGNE:** Aucune ligne (handlers manquants)

---

# 17. CAUSES SECONDAIRES

### 17.1 TURN non configuré
- **Impact:** Échec sur réseaux avec NAT restrictif, CGNAT, mobile
- **Priorité:** MOYENNE (après correction signalisation)

### 17.2 callId non synchronisé
- **Impact:** Risque de callId différent entre participants
- **Priorité:** MOYENNE

### 17.3 Monitoring absent
- **Impact:** Difficile de diagnostiquer les problèmes ICE/NAT
- **Priorité:** FAIBLE

### 17.4 API route non utilisée
- **Impact:** Appel non créé en base de données
- **Priorité:** FAIBLE

---

# 18. PREUVES

### 18.1 Logs fournis
```
Socket event received: call:offer
Socket event received: call:ice
Socket event received: call:end
```

**Interprétation:**
- Le serveur reçoit `call:offer` (preuve que le client l'émet)
- Le serveur reçoit `call:ice` (preuve que ICE candidates sont générées)
- Le serveur reçoit `call:end` (preuve que l'appel se termine)
- **ABSENCE de `call:answer`** (preuve que le destinataire ne répond jamais)

### 18.2 Code source
- `CallModal.tsx` ligne 153: `socket.emit("call:offer", ...)`
- `CallContext.tsx` ligne 70: `socket.on("call:incoming", ...)`
- `server.ts`: Aucun handler pour `call:*` événements

### 18.3 Candidats ICE
- `typ host` ✅
- `typ srflx` ✅
- `typ relay` ❌ (TURN non configuré)

---

# 19. CORRECTION RECOMMANDÉE

## 19.1 Option 1: Implémenter les handlers Socket.IO (RECOMMANDÉ)

Ajouter dans `server.ts` après le handler `register`:

```typescript
// ==================================================
// CALL SIGNALING (WebRTC P2P)
// ==================================================

// Handler pour l'offre WebRTC
socket.on("call:offer", async ({ callId, offer, recipientId, callerId, callerName, callType }) => {
  console.log("[CALL] Offer received from", callerId, "to", recipientId);
  
  // Émettre l'invitation vers le destinataire
  io.to(`user:${recipientId}`).emit("call:incoming", {
    callId,
    offer,
    callerId,
    callerName,
    callType,
  });
});

// Handler pour la réponse WebRTC
socket.on("call:answer", async ({ callId, answer, recipientId }) => {
  console.log("[CALL] Answer received for call", callId, "to", recipientId);
  
  // Relayer la réponse vers l'appelant
  io.to(`user:${recipientId}`).emit("call:answer", {
    callId,
    answer,
  });
});

// Handler pour les candidats ICE
socket.on("call:ice", async ({ callId, candidate, recipientId }) => {
  console.log("[CALL] ICE candidate received for call", callId);
  
  // Relayer le candidat ICE
  io.to(`user:${recipientId}`).emit("call:ice", {
    callId,
    candidate,
  });
});

// Handler pour la fin d'appel
socket.on("call:end", async ({ callId, recipientId }) => {
  console.log("[CALL] Call ended", callId);
  
  // Notifier l'autre participant
  io.to(`user:${recipientId}`).emit("call:end", {
    callId,
  });
});
```

## 19.2 Option 2: Ajouter TURN (après correction signalisation)

Configurer un serveur TURN (ex: coturn, Twilio TURN):

```javascript
iceServers: [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { 
    urls: "turn:your-turn-server.com:3478",
    username: "username",
    credential: "password"
  }
]
```

## 19.3 Option 3: Synchroniser callId avec API

Modifier le frontend pour:
1. Appeler `POST /api/calls` avant d'émettre `call:offer`
2. Utiliser le `callId` retourné par l'API
3. Le serveur émet `call:incoming` après création de l'appel en DB

---

# 20. CONCLUSION

**Technologie:** WebRTC P2P natif (PAS LiveKit)

**Cause racine:** Signalisation Socket.IO manquante côté serveur

**Premier point de rupture:** Handler `call:offer` manquant dans `server.ts`

**Impact:** ÉLEVÉ - Sans ces handlers, les appels ne fonctionneront jamais

**Complexité correction:** FAIBLE - Il s'agit d'ajouter 4 handlers Socket.IO simples

**Risques secondaires:** TURN non configuré (échec sur certains réseaux)

---

**FIN DE L'AUDIT**
