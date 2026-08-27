# INVESTIGATION - POURQUOI LES APPELS N'ABOUTISSENT PAS CHEZ LE DESTINATAIRE

**Date:** 26 août 2026  
**Objectif:** Identifier pourquoi les appels n'arrivent pas chez le destinataire sans modifier le code

---

## ANALYSE DU FLUX D'APPEL ACTUEL

### 1. Création de l'appel (Côté serveur)

**Fichier:** `app/api/calls/route.ts`

```typescript
// POST /api/calls
const call = await prisma.call.create({
  data: {
    callerId: session.user.id,
    recipientId,
    callType,
    status: "incoming",
  },
});

// Créer la notification CALL_INCOMING
await createNotification({
  userId: recipientId,
  senderId: session.user.id,
  type: "CALL_INCOMING",
  message: `Appel ${callType === "video" ? "vidéo" : "audio"} entrant`,
  entityId: call.id,
  entityType: "Call",
});
```

**Ce qui se passe:**
- L'appel est créé en DB
- Une notification `CALL_INCOMING` est créée via `createNotification()`

### 2. Émission de la notification (Côté serveur)

**Fichier:** `lib/notifications.ts`

```typescript
// 2. SOCKET REALTIME (si user connecté et préférences autorisées)
const shouldSendInApp = await shouldSendNotification(userId, type, "inApp");
if (shouldSendInApp) {
  const io = getSocketServer();
  if (io) {
    const room = `user:${userId}`;
    console.log(`[createNotification] Emitting notification:new to room: ${room}`);
    io.to(room).emit("notification:new", notif);
  }
}
```

**Ce qui est émis:**
- Événement Socket.IO: `notification:new`
- Room: `user:{recipientId}`
- Données: L'objet notification complet

### 3. Réception côté client (CallContext)

**Fichier:** `contexts/CallContext.tsx`

```typescript
// Écoute app-wide de call:incoming
useEffect(() => {
  const handleIncomingCall = (data: IncomingCallData) => {
    // Ignorer si déjà en appel
    if (activeCall) return;

    setIncomingCall(data);
    setShowIncoming(true);
  };

  socket.on("call:incoming", handleIncomingCall);
  return () => {
    socket.off("call:incoming", handleIncomingCall);
  };
}, [activeCall]);
```

**Ce qui est écouté:**
- Événement Socket.IO: `call:incoming`
- Données attendues: `{ callId, offer, callerId, callerName, callerImage, callType }`

---

## PROBLÈME IDENTIFIÉ

### Décalage entre émission et écoute

| Côté | Événement | Données |
|------|-----------|---------|
| **Serveur** | `notification:new` | `{ id, type, message, sender, entityId, entityType, ... }` |
| **Client** | `call:incoming` | `{ callId, offer, callerId, callerName, callerImage, callType }` |

**Le problème:**
- Le serveur émet `notification:new` avec les données de notification
- Le client écoute `call:incoming` avec les données d'appel WebRTC
- Ces deux événements ne correspondent pas

### Conséquence

Quand un appel est créé:
1. ✅ L'appel est créé en DB
2. ✅ La notification `CALL_INCOMING` est créée
3. ✅ L'événement `notification:new` est émis vers `user:{recipientId}`
4. ❌ Le client n'écoute pas `notification:new` pour les appels
5. ❌ Le client écoute `call:incoming` qui n'est jamais émis
6. ❌ La modale d'appel entrant ne s'affiche pas

---

## ABSENCE DE HANDLER SOCKET.IO POUR LES APPELS

**Recherche dans `server.ts`:**
```bash
grep -i "call" server.ts
```

**Résultat:** Aucun handler `call:incoming` trouvé dans `server.ts`

**Conclusion:** Il n'y a aucun code côté serveur qui émet l'événement `call:incoming` que le client attend.

---

## SOLUTIONS POSSIBLES (SANS MODIFICATION)

### Option 1: Ajouter un handler Socket.IO côté serveur

Ajouter dans `server.ts`:
```typescript
socket.on("call:start", async (data) => {
  // Créer l'appel
  // Émettre call:incoming vers le destinataire
});
```

**Problème:** Nécessite une modification du code serveur.

### Option 2: Modifier le client pour écouter `notification:new`

Modifier `CallContext.tsx` pour écouter `notification:new` et filtrer sur `type === "CALL_INCOMING"`.

**Problème:** Nécessite une modification du code client.

### Option 3: Utiliser l'API route existante

L'API route `/api/calls` fonctionne correctement pour créer l'appel et la notification.

**Problème:** Le client n'utilise pas cette API route pour déclencher l'appel WebRTC.

---

## DONNÉES MANQUANTES

Pour compléter l'investigation, il faudrait vérifier:

1. **Comment le client lance un appel:**
   - Où est appelé `startCall()` ?
   - Comment l'offre WebRTC est-elle générée ?
   - Comment l'offre est-elle envoyée au destinataire ?

2. **Comment le destinataire reçoit l'offre WebRTC:**
   - L'offre est-elle envoyée via Socket.IO ?
   - L'offre est-elle stockée en DB ?
   - Comment le destinataire récupère-t-il l'offre ?

3. **Architecture WebRTC:**
   - Y a-t-il un serveur de signalisation ?
   - Comment les candidats ICE sont-ils échangés ?
   - Comment la connexion peer-to-peer est-elle établie ?

---

## CONCLUSION

**Cause principale:**
- Le système de notification (`createNotification()`) émet `notification:new`
- Le système d'appel (`CallContext`) écoute `call:incoming`
- Il n'y a pas de pont entre ces deux systèmes

**Impact:**
- Les notifications `CALL_INCOMING` sont créées en DB
- Les notifications sont émises via Socket.IO comme `notification:new`
- Mais le client n'écoute pas cet événement pour les appels
- La modale d'appel entrant ne s'affiche jamais

**Sans modification du code:**
- Le problème ne peut pas être résolu
- Il faut soit:
  - Ajouter un handler Socket.IO côté serveur pour émettre `call:incoming`
  - Modifier le client pour écouter `notification:new` et gérer `CALL_INCOMING`
  - Créer un pont entre les deux systèmes

---

## RECOMMANDATION

Pour résoudre ce problème, il faut:

1. **Option recommandée:** Modifier `CallContext.tsx` pour écouter `notification:new` et détecter les notifications de type `CALL_INCOMING`

2. **Alternative:** Ajouter un handler Socket.IO dans `server.ts` qui émet `call:incoming` quand un appel est créé via l'API route

3. **Architecture à long terme:** Unifier le système de notification et le système d'appel pour éviter ce décalage
