# PLAN DE TEST END-TO-END - SYSTÈME DE NOTIFICATIONS CHURCHFACE

## OBJECTIF
Vérifier que le système de notifications fonctionne correctement de bout en bout pour tous les canaux (DB, Socket.IO, Web Push) et respecte les préférences utilisateur.

## PRÉREQUIS
- Base de données PostgreSQL avec données de test
- Socket.IO serveur démarré
- Service Worker enregistré
- Clés VAPID configurées
- 2 utilisateurs de test (User A et User B)

## SCÉNARIOS DE TEST

### TEST 1: Notification d'amitié (FRIEND_REQUEST)
**Étapes:**
1. User A envoie une demande d'amitié à User B
2. Vérifier DB: Notification créée pour User B
3. Vérifier Socket.IO: User B reçoit `notification:new` si connecté
4. Vérifier Web Push: User B reçoit notification push si abonné
5. Vérifier préférences: Si User B a désactivé les notifications sociales, pas de push

**Résultat attendu:** ✅ Notification créée en DB, émise via Socket.IO, envoyée via Push (si préférences autorisées)

---

### TEST 2: Auto-notification empêchée
**Étapes:**
1. User A like son propre post
2. Vérifier DB: AUCUNE notification créée
3. Vérifier Socket.IO: AUCUN événement émis
4. Vérifier Web Push: AUCUNE notification push

**Résultat attendu:** ✅ Aucune notification créée (senderId === userId)

---

### TEST 3: Anti-duplication
**Étapes:**
1. User A like le post de User B
2. User A like à nouveau le même post dans les 5 minutes
3. Vérifier DB: Une seule notification créée
4. Vérifier Socket.IO: Un seul événement émis
5. Vérifier Web Push: Une seule notification push

**Résultat attendu:** ✅ La deuxième tentative retourne la notification existante

---

### TEST 4: Notification de messagerie (MESSAGE_SENT)
**Étapes:**
1. User A envoie un message à User B dans une conversation privée
2. Vérifier DB: Notification créée pour User B
3. Vérifier Socket.IO: User B reçoit `notification:new` si connecté
4. Vérifier Web Push: User B reçoit notification push si abonné
5. Vérifier deep link: URL pointe vers `/messages/{chatId}`

**Résultat attendu:** ✅ Notification créée avec deep link correct

---

### TEST 5: Préférences utilisateur - Push désactivé
**Étapes:**
1. User B désactive les notifications push dans ses préférences
2. User A envoie un message à User B
3. Vérifier DB: Notification créée (toujours source de vérité)
4. Vérifier Socket.IO: User B reçoit `notification:new` (inApp activé)
5. Vérifier Web Push: AUCUNE notification push

**Résultat attendu:** ✅ DB et Socket.IO fonctionnent, Push désactivé

---

### TEST 6: Préférences utilisateur - InApp désactivé
**Étapes:**
1. User B désactive les notifications inApp dans ses préférences
2. User A envoie un message à User B
3. Vérifier DB: Notification créée (toujours source de vérité)
4. Vérifier Socket.IO: AUCUN événement émis
5. Vérifier Web Push: User B reçoit notification push (si activé)

**Résultat attendu:** ✅ DB et Push fonctionnent, Socket.IO désactivé

---

### TEST 7: Notification de prière (PRAYER_NEW_ENGAGEMENT)
**Étapes:**
1. User A prie pour la demande de prière de User B
2. Vérifier DB: Notification créée pour User B
3. Vérifier Socket.IO: User B reçoit `notification:new` si connecté
4. Vérifier Web Push: User B reçoit notification push si abonné
5. Vérifier deep link: URL pointe vers `/prayers/request/{prayerRequestId}`

**Résultat attendu:** ✅ Notification créée avec deep link correct

---

### TEST 8: Notification de live (LIVE_FORCE_STOPPED)
**Étapes:**
1. Admin force l'arrêt du live de User A
2. Vérifier DB: Notification créée pour User A
3. Vérifier Socket.IO: User A reçoit `notification:new` si connecté
4. Vérifier Web Push: User A reçoit notification push si abonné

**Résultat attendu:** ✅ Notification de modération créée

---

### TEST 9: Deep links dynamiques
**Étapes:**
1. Tester différents types d'entités:
   - Post → `/post/{id}`
   - PrayerChain → `/prayers/chain/{id}`
   - Chat → `/messages/{id}`
   - Church → `/church/{id}`
2. Vérifier que chaque notification a le bon deep link

**Résultat attendu:** ✅ Chaque type d'entité a le bon deep link

---

### TEST 10: Nettoyage subscriptions expirées
**Étapes:**
1. Simuler une subscription push expirée (retourner erreur 410)
2. Envoyer une notification à l'utilisateur
3. Vérifier DB: Subscription supprimée
4. Vérifier logs: "Removed stale push subscription"

**Résultat attendu:** ✅ Subscription expirée supprimée automatiquement

---

## COMMANDES DE TEST

### Démarrer le serveur
```bash
npm run dev
```

### Exécuter les tests unitaires
```bash
npm test tests/notifications.test.ts
```

### Tests manuels via API
```bash
# Test FRIEND_REQUEST
curl -X POST http://localhost:3000/api/friends/request \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"receiverId": "user-b-id"}'

# Test MESSAGE_SENT
curl -X POST http://localhost:3000/api/conversations/[chat-id]/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"content": "Test message"}'

# Test préférences
curl -X PATCH http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"pushEnabled": false}'
```

---

## CRITÈRES DE SUCCÈS

- ✅ Toutes les notifications sont créées en DB
- ✅ Socket.IO émet correctement les événements
- ✅ Web Push fonctionne pour les utilisateurs abonnés
- ✅ Les préférences utilisateur sont respectées
- ✅ L'auto-notification est empêchée
- ✅ L'anti-duplication fonctionne
- ✅ Les deep links sont corrects
- ✅ Les subscriptions expirées sont nettoyées

---

## PROBLÈMES CONNUS

1. **Handlers Socket.IO dupliqués** - Les handlers `post:like`, `post:comment`, `user:follow` dans `server.ts` créent des doublons potentiels avec les API routes
2. **Appels sans tracking serveur** - Les appels sont gérés uniquement côté client
3. **Pas de parsing @** - Les mentions dans messages/commentaires ne sont pas détectées

---

## RECOMMANDATIONS POST-TEST

1. Supprimer les handlers Socket.IO dupliqués dans `server.ts`
2. Ajouter tracking côté serveur pour les appels
3. Implémenter le parsing @ pour les mentions
4. Ajouter monitoring pour les taux de livraison des notifications
