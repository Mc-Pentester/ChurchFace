# GUIDE DE DÉBOGAGE - NOTIFICATIONS TEMPS RÉEL

**Date:** 26 août 2026  
**Problème:** Les notifications ne s'affichent pas automatiquement sans rafraîchissement de page

---

## LOGS AJOUTÉS

Des logs de débogage ont été ajoutés à plusieurs endroits pour tracer le flux des notifications temps réel.

### 1. Côté serveur - `lib/notifications.ts`

```
[createNotification] userId: {userId}, type: {type}, shouldSendInApp: {true/false}
[createNotification] Emitting notification:new to room: user:{userId}
[createNotification] Socket.IO server not available
```

**Ce que cela indique:**
- Si `shouldSendInApp: false` → Les préférences utilisateur bloquent la notification
- Si `Socket.IO server not available` → Le serveur Socket.IO n'est pas initialisé
- Si `Emitting notification:new` → La notification est émise vers la room

### 2. Côté serveur - `server.ts`

```
[Socket] User {userId} registered and joined room: user:{userId}
```

**Ce que cela indique:**
- Si ce log apparaît → L'utilisateur est bien enregistré dans la room
- Si ce log n'apparaît pas → L'utilisateur ne s'est pas enregistré

### 3. Côté client - `contexts/NotificationContext.tsx`

```
[NotificationContext] Session changed: {userId}, Socket connected: {true/false}
[NotificationContext] Emitting register for user: {userId}
[NotificationContext] Socket reconnected, re-registering user: {userId}
[NotificationContext] Setting up notification:new listener
[NotificationContext] Notification received via Socket.IO: {notificationData}
[NotificationContext] Cleaning up notification:new listener
```

**Ce que cela indique:**
- Si `Socket connected: false` → Le socket n'est pas connecté
- Si `Emitting register` → L'utilisateur tente de s'enregistrer
- Si `Notification received` → La notification est reçue côté client

---

## ÉTAPES DE DIAGNOSTIC

### Étape 1: Ouvrir la console du navigateur

1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet Console
3. Filtrer les logs avec `[NotificationContext]`

### Étape 2: Vérifier la connexion Socket.IO

**Logs attendus au chargement de la page:**
```
[NotificationContext] Session changed: {userId}, Socket connected: true
[NotificationContext] Emitting register for user: {userId}
[NotificationContext] Setting up notification:new listener
```

**Si `Socket connected: false`:**
- Le socket ne se connecte pas
- Vérifier que le serveur Socket.IO est démarré
- Vérifier les CORS settings dans `server.ts`

### Étape 3: Vérifier l'enregistrement côté serveur

**Logs attendus dans le terminal serveur:**
```
[Socket] User {userId} registered and joined room: user:{userId}
```

**Si ce log n'apparaît pas:**
- L'événement `register` n'est pas reçu côté serveur
- Vérifier que le client émet bien l'événement

### Étape 4: Créer une notification

**Action:** Like un post ou commenter un post

**Logs attendus dans le terminal serveur:**
```
[createNotification] userId: {userId}, type: POST_LIKE, shouldSendInApp: true
[createNotification] Emitting notification:new to room: user:{userId}
```

**Si `shouldSendInApp: false`:**
- Les préférences utilisateur bloquent la notification
- Vérifier les préférences dans `lib/notificationPreferences.ts`

**Logs attendus dans la console du navigateur:**
```
[NotificationContext] Notification received via Socket.IO: {notificationData}
```

**Si ce log n'apparaît pas:**
- La notification n'est pas reçue côté client
- L'utilisateur n'est pas dans la bonne room
- Le socket est déconnecté

---

## PROBLÈMES COURANTS

### Problème 1: Socket non connecté

**Symptôme:** `Socket connected: false`

**Solution:**
- Vérifier que le serveur Socket.IO est démarré
- Vérifier que l'URL du socket est correcte dans `lib/socket.ts`
- Vérifier les CORS settings dans `server.ts`

### Problème 2: Utilisateur non enregistré

**Symptôme:** Pas de log `[Socket] User {userId} registered`

**Solution:**
- Vérifier que `socket.emit("register", userId)` est appelé
- Vérifier que le socket est connecté avant l'émission

### Problème 3: Préférences bloquent la notification

**Symptôme:** `shouldSendInApp: false`

**Solution:**
- Vérifier les préférences par défaut dans `lib/notificationPreferences.ts`
- Vérifier que l'utilisateur a des préférences valides en DB
- Temporairement désactiver le check de préférences pour tester

### Problème 4: Notification non reçue côté client

**Symptôme:** Pas de log `Notification received via Socket.IO`

**Solution:**
- Vérifier que l'utilisateur est dans la room `user:{userId}`
- Vérifier que le listener est bien configuré
- Vérifier que le socket est connecté

---

## TEST RAPIDE

Pour tester rapidement si le problème vient des préférences:

1. **Temporairement désactiver le check de préférences:**

Dans `lib/notifications.ts`, modifier:
```typescript
const shouldSendInApp = await shouldSendNotification(userId, type, "inApp");
```

En:
```typescript
const shouldSendInApp = true; // Temporairement forcer l'envoi
```

2. **Tester à nouveau:**
- Créer une notification
- Vérifier si elle s'affiche en temps réel

3. **Si ça fonctionne avec le bypass:**
- Le problème vient des préférences utilisateur
- Vérifier les préférences en DB

4. **Si ça ne fonctionne toujours pas:**
- Le problème vient de la connexion Socket.IO
- Vérifier les logs de connexion

---

## RÉSUMÉ DES FICHIERS MODIFIÉS

1. `lib/notifications.ts` - Logs pour l'émission des notifications
2. `server.ts` - Logs pour l'enregistrement des utilisateurs
3. `contexts/NotificationContext.tsx` - Logs pour la réception des notifications

---

## PROCHAINES ÉTAPES

Après avoir identifié le problème via les logs:

1. **Si problème de connexion Socket.IO:**
   - Vérifier la configuration CORS
   - Vérifier l'URL du socket
   - Vérifier que le serveur est démarré

2. **Si problème de préférences:**
   - Mettre à jour les préférences par défaut
   - Créer une UI pour gérer les préférences
   - Simplifier la logique de préférences

3. **Si problème de room:**
   - Vérifier que l'utilisateur est bien dans la room
   - Ajouter des logs pour vérifier les rooms actives
