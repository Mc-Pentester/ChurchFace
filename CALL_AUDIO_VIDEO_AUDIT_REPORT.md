# CHURCHFACE — AUDIT COMPLET DES APPELS AUDIO/VIDÉO DU MODULE MESSAGERIE

**Date:** 26 août 2026  
**Objectif:** Identifier précisément pourquoi les appels n'arrivent jamais au destinataire

---

# 1. ARCHITECTURE ACTUELLE

## 1.1 Système d'appel identifié

**Technologie utilisée:** WebRTC natif + Socket.IO  
**LiveKit:** NON utilisé pour les appels 1-1 (utilisé uniquement pour studio live, prières, training)

## 1.2 Fichiers impliqués

### Frontend
- `contexts/CallContext.tsx` - Contexte global d'appel
- `components/messaging/CallModal.tsx` - Modale d'appel actif (WebRTC)
- `components/messaging/IncomingCallModal.tsx` - Modale d'appel entrant

### Backend
- `app/api/calls/route.ts` - POST création d'appel
- `app/api/calls/[id]/route.ts` - PATCH mise à jour de statut
- `server.ts` - Serveur Socket.IO

### Base de données
- `prisma/schema.prisma` - Modèles `Call` et `CallParticipant`

---

# 2. FLOW RÉEL DE L'APPEL

## 2.1 Flow actuel (cassé)

```
UTILISATEUR A clique "Appel"
  ↓
CallContext.startCall()
  ↓
CallModal s'ouvre
  ↓
CallModal.startOutgoingCall()
  ↓
getUserMedia() - Capture audio/vidéo
  ↓
RTCPeerConnection créé avec STUN Google
  ↓
socket.emit("call:offer", { callId, offer, recipientId, callerId, callerName, callType })
  ↓
❌ AUCUN HANDLER côté serveur pour "call:offer"
  ↓
❌ UTILISATEUR B ne reçoit jamais l'invitation
  ↓
❌ L'appel n'aboutit jamais
```

## 2.2 Flow attendu (non implémenté)

```
UTILISATEUR A clique "Appel"
  ↓
CallContext.startCall()
  ↓
CallModal s'ouvre
  ↓
CallModal.startOutgoingCall()
  ↓
getUserMedia() - Capture audio/vidéo
  ↓
RTCPeerConnection créé avec STUN Google
  ↓
socket.emit("call:offer", { callId, offer, recipientId, callerId, callerName, callType })
  ↓
✅ Handler serveur "call:offer" reçoit l'offre
  ↓
✅ Serveur émet "call:incoming" vers room user:{recipientId}
  ↓
✅ CallContext B reçoit "call:incoming"
  ↓
✅ IncomingCallModal B s'affiche
  ↓
UTILISATEUR B accepte
  ↓
CallModal B s'ouvre en mode réponse
  ↓
socket.emit("call:answer", { callId, answer, recipientId: callerId })
  ↓
✅ Handler serveur "call:answer" relaie vers A
  ↓
✅ RTCPeerConnection A et B établissent connexion
  ↓
✅ Échange ICE candidates via "call:ice"
  ↓
✅ Connexion audio/vidéo établie
```

---

# 3. POINT EXACT DE DÉFAILLANCE

**Étape critique:** Signalisation Socket.IO

**Premier point d'échec:** `socket.emit("call:offer", ...)` côté client

**Cause:** Aucun handler Socket.IO côté serveur pour relayer l'offre WebRTC au destinataire

---

# 4. SIGNALISATION SOCKET.IO

## 4.1 Événements émis par le client

| Événement | Source | Payload |
|-----------|--------|---------|
| `call:offer` | CallModal.tsx (ligne 153) | `{ callId, offer, recipientId, callerId, callerName, callType }` |
| `call:answer` | CallModal.tsx (ligne 244) | `{ callId, answer, recipientId }` |
| `call:ice` | CallModal.tsx (ligne 136, 224) | `{ callId, candidate, recipientId }` |
| `call:end` | CallModal.tsx (ligne 297) | `{ callId, recipientId }` |

## 4.2 Événements écoutés par le client

| Événement | Composant | Handler |
|-----------|-----------|---------|
| `call:incoming` | CallContext.tsx (ligne 70) | Affiche IncomingCallModal |
| `call:answer` | CallModal.tsx (ligne 187) | setRemoteDescription(answer) |
| `call:ice` | CallModal.tsx (ligne 188, 267) | addIceCandidate(candidate) |
| `call:end` | CallModal.tsx (ligne 189, 268) | cleanup() |

## 4.3 Handlers serveur

**Résultat de la recherche dans `server.ts`:**

| Événement | Handler serveur | Statut |
|-----------|-----------------|--------|
| `call:offer` | ❌ AUCUN | MANQUANT |
| `call:answer` | ❌ AUCUN | MANQUANT |
| `call:ice` | ❌ AUCUN | MANQUANT |
| `call:end` | ❌ AUCUN | MANQUANT |
| `call:incoming` | ❌ AUCUN | MANQUANT |

---

# 5. API CALLS

## 5.1 POST /api/calls

**Fonction:** Créer un appel en base de données  
**Utilisation actuelle:** Créé mais non utilisé par le frontend pour la signalisation

```typescript
// Crée l'appel en DB
const call = await prisma.call.create({
  data: {
    callerId: session.user.id,
    recipientId,
    callType,
    status: "incoming",
  },
});

// Crée une notification CALL_INCOMING
await createNotification({
  userId: recipientId,
  senderId: session.user.id,
  type: "CALL_INCOMING",
  message: `Appel ${callType === "video" ? "vidéo" : "audio"} entrant`,
  entityId: call.id,
  entityType: "Call",
});
```

**Problème:** Le frontend n'appelle PAS cette API route avant d'émettre `call:offer`

## 5.2 PATCH /api/calls/[id]

**Fonction:** Mettre à jour le statut d'un appel  
**Utilisation actuelle:** Non utilisée par le frontend

**Statuts supportés:** `incoming`, `ringing`, `connected`, `ended`, `missed`

---

# 6. PRISMA CALL

## 6.1 Modèle Call

```prisma
model Call {
  id          String            @id @default(cuid())
  callerId    String
  recipientId String
  callType    String            // "audio" or "video"
  status      String            // "incoming", "ringing", "connected", "ended", "missed"
  startedAt   DateTime          @default(now())
  endedAt     DateTime?
  caller      User              @relation("CallCaller", fields: [callerId], references: [id], onDelete: Cascade)
  recipient   User              @relation("CallRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  participants CallParticipant[]

  @@index([callerId])
  @@index([recipientId])
  @@index([status])
}
```

**Statut:** ✅ Correct (relation `participants` ajoutée lors de l'audit précédent)

## 6.2 Modèle CallParticipant

```prisma
model CallParticipant {
  id        String   @id @default(cuid())
  callId    String
  userId    String
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  call      Call     @relation(fields: [callId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([callId, userId])
  @@index([callId])
  @@index([userId])
}
```

**Statut:** ✅ Correct

---

# 7. LIVEKIT CONFIGURATION

**Statut:** NON APPLICABLE

Le système d'appel audio/vidéo 1-1 n'utilise PAS LiveKit. LiveKit est utilisé uniquement pour:
- Studio live d'église
- Prières en ligne
- Training rooms
- Mobile live

---

# 8. LIVEKIT TOKEN

**Statut:** NON APPLICABLE

Aucun token LiveKit n'est généré pour les appels 1-1.

---

# 9. ROOM

**Statut:** NON APPLICABLE

Aucune room LiveKit n'est utilisée pour les appels 1-1.

---

# 10. PERMISSIONS LIVEKIT

**Statut:** NON APPLICABLE

---

# 11. AUDIO

**Statut:** ✅ Implémenté correctement

```typescript
// CallModal.tsx ligne 114-117
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: callType === "video",
});
```

---

# 12. VIDÉO

**Statut:** ✅ Implémentée correctement

```typescript
// CallModal.tsx ligne 114-117
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: callType === "video",
});
```

---

# 13. ICE/STUN/TURN

**Configuration actuelle:**

```typescript
// CallModal.tsx ligne 124-129
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
});
```

**Statut:** ✅ STUN Google configuré (TURN non configuré mais non bloquant pour le problème actuel)

---

# 14. HTTPS/WSS

**Statut:** NON ÉVALUÉ

Le problème se produit AVANT la connexion WebRTC, donc HTTPS/WSS n'est pas la cause.

---

# 15. DOCKER/FIREWALL

**Statut:** NON ÉVALUÉ

Le problème se produit AVANT la connexion WebRTC, donc Docker/Firewall n'est pas la cause.

---

# 16. VERSIONS

**Statut:** NON ÉVALUÉ

Le problème est dans la signalisation Socket.IO, pas dans les versions de dépendances.

---

# 17. TESTS EFFECTUÉS

**Tests d'audit (code only):**
- ✅ Inventaire des fichiers d'appel
- ✅ Audit de CallContext
- ✅ Audit du flux d'invitation
- ✅ Audit des Socket.IO rooms
- ✅ Audit API des appels
- ✅ Audit Prisma Call

**Tests fonctionnels:** NON EFFECTUÉS (audit code only)

---

# 18. CAUSE RACINE

**Classification:** D — Signalisation Socket.IO

**CAUSE RACINE:**
Le système d'appel audio/vidéo 1-1 utilise WebRTC natif avec signalisation Socket.IO, mais **aucun handler Socket.IO n'est implémenté côté serveur** pour relayer les messages WebRTC entre les participants.

**PREUVE:**
1. Le client émet `call:offer` via `socket.emit()` (CallModal.tsx ligne 153)
2. Le serveur n'a AUCUN handler pour `call:offer` (grep_search dans server.ts = 0 résultats)
3. Le destinataire n'a aucun moyen de recevoir l'invitation
4. CallContext écoute `call:incoming` qui n'est jamais émis

**FICHIER:** `server.ts`

**LIGNE:** Aucune ligne (handlers manquants)

---

# 19. CAUSES SECONDAIRES

1. **Décalage événementiel notification vs appel:**
   - Le serveur émet `notification:new` via `createNotification()`
   - Le client écoute `call:incoming`
   - Ces deux événements ne correspondent pas

2. **API route non utilisée:**
   - `POST /api/calls` existe mais n'est pas appelée par le frontend
   - L'appel est créé en DB mais la signalisation WebRTC ne passe pas par cette route

3. **callId généré localement:**
   - Le callId est généré localement côté client: `${currentUserId}-${recipientId}-${Date.now()}`
   - Aucune synchronisation avec la base de données
   - Risque de callId différent entre appelant et destinataire

---

# 20. CORRECTIONS RECOMMANDÉES

## 20.1 Option 1: Implémenter les handlers Socket.IO (RECOMMANDÉ)

Ajouter dans `server.ts`:

```typescript
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

## 20.2 Option 2: Intégrer avec l'API route existante

Modifier le frontend pour:
1. Appeler `POST /api/calls` avant d'émettre `call:offer`
2. Utiliser le `callId` retourné par l'API
3. Le serveur émet `call:incoming` après création de l'appel en DB

## 20.3 Option 3: Écouter `notification:new` côté client

Modifier `CallContext.tsx` pour écouter `notification:new` et détecter `type === "CALL_INCOMING"`.

**Problème:** Nécessite de passer l'offre WebRTC via la notification, ce qui n'est pas actuellement implémenté.

---

# 21. MATRICE DE DIAGNOSTIC

| Étape | Résultat | Détails |
|---|---|---|
| Click call | ✅ PASS | CallContext.startCall() fonctionne |
| API call | ❌ FAIL | Frontend n'appelle pas POST /api/calls |
| DB Call | ❌ FAIL | Appel non créé en DB avant signalisation |
| Socket connected | ✅ PASS | Socket.IO connecté, room user:{userId} jointe |
| Invitation sent | ❌ FAIL | call:offer émis mais aucun handler serveur |
| Invitation received | ❌ FAIL | Destinataire ne reçoit jamais call:incoming |
| Accept | ❌ FAIL | Jamais atteint (pas d'invitation) |
| Token caller | N/A | LiveKit non utilisé |
| Token recipient | N/A | LiveKit non utilisé |
| Same room | N/A | LiveKit non utilisé |
| LiveKit connect A | N/A | LiveKit non utilisé |
| LiveKit connect B | N/A | LiveKit non utilisé |
| A publish audio | ❌ FAIL | Jamais atteint (pas de connexion) |
| A publish video | ❌ FAIL | Jamais atteint (pas de connexion) |
| B subscribe audio | ❌ FAIL | Jamais atteint (pas de connexion) |
| B subscribe video | ❌ FAIL | Jamais atteint (pas de connexion) |
| ICE | ❌ FAIL | Jamais atteint (pas de connexion) |
| TURN | N/A | Non configuré mais non bloquant |
| Remote track | ❌ FAIL | Jamais atteint (pas de connexion) |
| UI rendering | ❌ FAIL | IncomingCallModal ne s'affiche jamais |

---

# 22. CONCLUSION

**Le problème est AVANT LiveKit:**
- Le système d'appel n'utilise PAS LiveKit
- Le problème est dans la signalisation Socket.IO
- Les handlers Socket.IO côté serveur sont manquants
- Le destinataire ne reçoit jamais l'invitation

**Point de défaillance:** Signalisation Socket.IO (Phase 3 de l'audit)

**Correction nécessaire:** Implémenter les handlers Socket.IO dans `server.ts` pour relayer les messages WebRTC entre les participants.

**Complexité:** FAIBLE - Il s'agit d'ajouter 4 handlers Socket.IO simples.

**Impact:** ÉLEVÉ - Sans ces handlers, les appels audio/vidéo ne fonctionneront jamais.

---

# 23. RÈGLES DE SÉCURITÉ RESPECTÉES

✅ Aucun secret affiché (LIVEKIT_API_SECRET, tokens, etc.)  
✅ Aucun mot de passe affiché  
✅ Aucune donnée sensible exposée  
✅ Logs de diagnostic uniquement sur les événements non sensibles

---

**FIN DE L'AUDIT**
