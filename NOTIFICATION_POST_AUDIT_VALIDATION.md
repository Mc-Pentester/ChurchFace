# PLAN DE VALIDATION POST-AUDIT - SYSTÈME DE NOTIFICATIONS CHURCHFACE

**Date:** 26 août 2026  
**Objectif:** Valider que les 4 corrections post-audit fonctionnent correctement de bout en bout

---

## ARCHITECTURE VALIDÉE

```
ACTION (API Route)
    ↓
SERVICE MÉTIER
    ↓
createNotification()
    ↓
┌──────────────┬──────────────┐
│              │              │
DB          Socket.IO       Push
    ↓              ↓              ↓
Source de     Temps réel    Site fermé
vérité        (si connecté)  (si abonné)
```

---

## VALIDATION 1: HANDLERS SOCKET.IO DUPLIQUÉS SUPPRIMÉS

### Objectif
Vérifier que les handlers `post:like`, `post:comment`, et `user:follow` ont été supprimés de `server.ts` et que les notifications passent uniquement par les API routes.

### Test manuel

1. **Vérifier le code:**
   ```bash
   grep -n "post:like\|post:comment\|user:follow" server.ts
   ```
   **Résultat attendu:** Aucun handler trouvé (seulement le commentaire explicite)

2. **Tester like via API:**
   ```bash
   curl -X POST http://localhost:3000/api/likes \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"postId": "post-id"}'
   ```
   **Résultat attendu:** Notification créée en DB, émise via Socket.IO, envoyée via Push

3. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'POST_LIKE' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Une notification POST_LIKE créée

### Critères de succès
- ✅ Handlers Socket.IO supprimés de `server.ts`
- ✅ Notifications créées uniquement via API routes
- ✅ Aucun doublon de notification

---

## VALIDATION 2: PARSING CENTRALISÉ DES MENTIONS @

### Objectif
Vérifier que le parsing des mentions @ fonctionne dans les comments et messages.

### Test manuel

1. **Tester mention dans comment:**
   ```bash
   curl -X POST http://localhost:3000/api/comments \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"postId": "post-id", "content": "Hello @john_doe !"}'
   ```
   **Résultat attendu:** Notification COMMENT_MENTIONED créée pour john_doe

2. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'COMMENT_MENTIONED' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Une notification COMMENT_MENTIONED créée

3. **Tester mention dans message:**
   ```bash
   curl -X POST http://localhost:3000/api/conversations/[chat-id]/messages \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"content": "Hey @jane_smith check this"}'
   ```
   **Résultat attendu:** Notification MESSAGE_MENTIONED créée pour jane_smith

4. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'MESSAGE_MENTIONED' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Une notification MESSAGE_MENTIONED créée

### Critères de succès
- ✅ Parsing @ fonctionne dans comments
- ✅ Parsing @ fonctionne dans messages
- ✅ Notifications COMMENT_MENTIONED créées
- ✅ Notifications MESSAGE_MENTIONED créées
- ✅ Auto-notification empêchée (senderId !== recipientId)

---

## VALIDATION 3: TRACKING SERVEUR DES APPELS

### Objectif
Vérifier que le tracking serveur des appels fonctionne et que les notifications CALL_MISSED et CALL_ENDED sont créées.

### Prérequis
- Exécuter `npx prisma migrate dev` pour appliquer les nouveaux modèles Call et CallParticipant

### Test manuel

1. **Créer un appel:**
   ```bash
   curl -X POST http://localhost:3000/api/calls \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"recipientId": "user-id", "callType": "video"}'
   ```
   **Résultat attendu:** Call créé avec status "incoming", notification CALL_INCOMING créée

2. **Vérifier DB:**
   ```sql
   SELECT * FROM "Call" WHERE "callerId" = 'your-id' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Un appel avec status "incoming"

3. **Mettre à jour le statut à "missed":**
   ```bash
   curl -X PATCH http://localhost:3000/api/calls/[call-id] \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"status": "missed"}'
   ```
   **Résultat attendu:** Call mis à jour avec status "missed", notification CALL_MISSED créée

4. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'CALL_MISSED' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Une notification CALL_MISSED créée

5. **Mettre à jour le statut à "ended":**
   ```bash
   curl -X PATCH http://localhost:3000/api/calls/[call-id] \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"status": "ended"}'
   ```
   **Résultat attendu:** Call mis à jour avec status "ended", notification CALL_ENDED créée

6. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'CALL_ENDED' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Une notification CALL_ENDED créée

### Critères de succès
- ✅ Modèles Call et CallParticipant créés via migration
- ✅ API POST /api/calls crée un appel
- ✅ Notification CALL_INCOMING créée
- ✅ API PATCH /api/calls/[id] met à jour le statut
- ✅ Notification CALL_MISSED créée
- ✅ Notification CALL_ENDED créée

---

## VALIDATION 4: NOTIFICATIONS POUR CONTENUS/ÉVÉNEMENTS/LIVE D'ÉGLISE

### Objectif
Vérifier que les notifications CHURCH_EVENT_CREATED et CHURCH_LIVE_STARTED sont créées pour les membres de l'église.

### Test manuel

1. **Créer un événement d'église:**
   ```bash
   curl -X POST http://localhost:3000/api/church/event/create \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"title": "Sunday Service", "startDate": "2026-08-27T10:00:00Z", "churchId": "church-id"}'
   ```
   **Résultat attendu:** Événement créé, notifications CHURCH_EVENT_CREATED créées pour tous les membres

2. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'CHURCH_EVENT_CREATED' ORDER BY "createdAt" DESC LIMIT 5;
   ```
   **Résultat attendu:** Plusieurs notifications CHURCH_EVENT_CREATED créées (une par membre)

3. **Démarrer un live d'église:**
   ```bash
   curl -X PATCH http://localhost:3000/api/church/[slug]/studio/live \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"id": "live-id", "status": "LIVE"}'
   ```
   **Résultat attendu:** Live démarré, notifications CHURCH_LIVE_STARTED créées pour tous les membres

4. **Vérifier DB:**
   ```sql
   SELECT * FROM "Notification" WHERE type = 'CHURCH_LIVE_STARTED' ORDER BY "createdAt" DESC LIMIT 5;
   ```
   **Résultat attendu:** Plusieurs notifications CHURCH_LIVE_STARTED créées (une par membre)

### Critères de succès
- ✅ Notification CHURCH_EVENT_CREATED créée pour chaque membre
- ✅ Notification CHURCH_LIVE_STARTED créée pour chaque membre
- ✅ Auto-notification empêchée (créateur non notifié)

---

## VALIDATION 5: FLUX COMPLET ACTION → DB → SOCKET.IO → UI → PUSH

### Objectif
Valider le flux complet de notification pour un scénario typique.

### Scénario: User A like le post de User B

1. **ACTION:** User A clique sur le bouton like
   ```bash
   curl -X POST http://localhost:3000/api/likes \
     -H "Content-Type: application/json" \
     -H "Cookie: session=user-a" \
     -d '{"postId": "post-id"}'
   ```

2. **DB:** Vérifier que la notification est créée
   ```sql
   SELECT * FROM "Notification" WHERE "userId" = 'user-b' AND type = 'POST_LIKE' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   **Résultat attendu:** Notification créée avec senderId = user-a, userId = user-b

3. **SOCKET.IO:** Vérifier que l'événement est émis
   - Ouvrir la console du navigateur de User B
   - Vérifier que `notification:new` est reçu
   **Résultat attendu:** Événement reçu avec les données de notification

4. **UI:** Vérifier que la notification s'affiche
   - User B voit la notification dans la liste
   - Le toast s'affiche
   **Résultat attendu:** Notification visible dans l'interface

5. **PUSH:** Vérifier que la notification push est envoyée
   - User B a une subscription push active
   - Notification push reçue sur l'appareil
   **Résultat attendu:** Notification push reçue

### Critères de succès
- ✅ Notification créée en DB
- ✅ Événement Socket.IO émis
- ✅ Notification affichée en UI
- ✅ Notification push reçue
- ✅ Préférences utilisateur respectées

---

## COMMANDES DE VALIDATION

### Migration Prisma
```bash
npx prisma migrate dev --name add_call_tracking
```

### Démarrer le serveur
```bash
npm run dev
```

### Vérifier les notifications en DB
```sql
-- Toutes les notifications récentes
SELECT * FROM "Notification" ORDER BY "createdAt" DESC LIMIT 20;

-- Notifications par type
SELECT type, COUNT(*) FROM "Notification" GROUP BY type;

-- Notifications pour un utilisateur
SELECT * FROM "Notification" WHERE "userId" = 'user-id' ORDER BY "createdAt" DESC LIMIT 10;
```

### Vérifier les appels en DB
```sql
-- Tous les appels récents
SELECT * FROM "Call" ORDER BY "createdAt" DESC LIMIT 10;

-- Appels par statut
SELECT status, COUNT(*) FROM "Call" GROUP BY status;
```

---

## RAPPORT DE VALIDATION

### Résultats attendus

| Validation | État | Notes |
|------------|-------|-------|
| Handlers Socket.IO supprimés | ✅ PASS | Aucun doublon |
| Parsing mentions @ | ✅ PASS | Comments et messages |
| Tracking serveur appels | ✅ PASS | Modèles et API routes |
| Notifications église | ✅ PASS | Events et Live |
| Flux complet | ✅ PASS | DB → Socket.IO → UI → Push |

### Problèmes potentiels

1. **Migration Prisma échoue**
   - Solution: Vérifier que les relations User sont correctes dans le schema

2. **Notifications non reçues via Socket.IO**
   - Solution: Vérifier que l'utilisateur est enregistré dans la room `user:${userId}`

3. **Notifications push non reçues**
   - Solution: Vérifier que l'utilisateur a une subscription push active et que les préférences autorisent le push

4. **Parsing @ ne trouve pas les utilisateurs**
   - Solution: Vérifier que les usernames correspondent aux champs name ou email dans User

---

## CONCLUSION

Une fois toutes les validations passées, le système de notifications ChurchFace sera:
- ✅ Centralisé via `createNotification()`
- ✅ Sans doublons (handlers Socket.IO supprimés)
- ✅ Avec parsing @ fonctionnel
- ✅ Avec tracking serveur des appels
- ✅ Avec notifications pour contenus/événements/Live d'église
- ✅ Respectant les préférences utilisateur
- ✅ Avec anti-auto-notification
- ✅ Avec anti-duplication

Le système sera prêt pour une utilisation en production.
