# Rapport d'Audit - Module de Prière ChurchFace

**Date:** 14 août 2026  
**Objectif:** Audit complet du module de prière existant avant évolution

---

## 1. Modèles Prisma (schema.prisma)

### 1.1 Modèles Actifs dans le Schema

| Modèle | Lignes | Description |
|--------|--------|-------------|
| `PrayerRequest` | 1010-1030 | Demande de prière avec réactions, réponses, témoignages |
| `PrayerLiveRoom` | 1032-1044 | Salle de prière en direct (LiveKit) |
| `PrayerLiveParticipant` | 1046-1055 | Participant à une PrayerLiveRoom |
| `PrayerLiveRoomMember` | 1057-1066 | Membre d'une PrayerLiveRoom |
| `PrayerLiveRoomParticipant` | 1068-1077 | Participant à une PrayerLiveRoom (doublon?) |
| `PrayerChain` | 1079-1088 | Chaîne de prière avec liens |
| `PrayerChainLink` | 1090-1100 | Lien utilisateur-chaîne de prière |
| `PrayerReaction` | 1102-1112 | Réaction à une demande de prière |
| `PrayerResponse` | 1114-1123 | Réponse à une demande de prière |
| `PrayerVerse` | 1125-1137 | Verset biblique associé |
| `PrayerTestimony` | 1139-1148 | Témoignage de réponse à prière |

### 1.2 Modèles Définis dans Migrations mais PAS dans Schema

| Modèle | Migration | Description |
|--------|-----------|-------------|
| `PrayerParticipant` | 20260814140000_repair_missing_studio_prayer_tables | Participant à une chaîne de prière avec rôle, stats |
| `PrayerSchedule` | 20260814140000_repair_missing_studio_prayer_tables | Horaires de prière pour chaînes |
| `PrayerRoom` | 20260814140000_repair_missing_studio_prayer_tables | Salle de prière (différente de PrayerLiveRoom) |
| `PrayerCampaign` | 20260814140000_repair_missing_studio_prayer_tables | Campagne de prière |
| `PrayerEngagement` | 20260814140000_repair_missing_studio_prayer_tables | Engagement utilisateur sur demande |
| `PrayerRoomParticipant` | 20260612155831_add_notification_fields | Participant à une PrayerRoom |

### 1.3 Problèmes Identifiés

**CRITIQUE - Incohérence Schema/Migration:**
- `PrayerParticipant`, `PrayerSchedule`, `PrayerRoom`, `PrayerCampaign`, `PrayerEngagement` sont créés dans la migration `20260814140000_repair_missing_studio_prayer_tables` mais ne sont PAS définis dans `schema.prisma`
- Ces modèles sont utilisés dans le code TypeScript (`types/prayer.ts`) et les hooks (`usePrayers.ts`)
- **Risque:** Prisma Client ne générera pas ces modèles, le code TypeScript utilisera des types qui n'existent pas dans le client Prisma

**CRITIQUE - Doublon de modèles Live:**
- `PrayerLiveParticipant`, `PrayerLiveRoomMember`, `PrayerLiveRoomParticipant` existent dans le schema
- Ces 3 modèles semblent avoir la même fonction (participant à une salle live)
- `PrayerLiveRoomParticipant` est référencé dans les migrations mais son rôle exact est ambigu

**CRITIQUE - Deux systèmes de salles:**
- `PrayerRoom` (migration) vs `PrayerLiveRoom` (schema)
- `PrayerRoom` a des champs: `roomType`, `maxParticipants`, `scheduledStart`, `scheduledEnd`
- `PrayerLiveRoom` a: `isPublic`, `isActive`, `moderatorId`
- Le frontend utilise `PrayerRoom` (types) mais l'API utilise `PrayerLiveRoom`

---

## 2. Migrations Existantes

### 2.1 Migrations Prayer Identifiées

| Migration | Date | Contenu |
|-----------|------|---------|
| `20260612155831_add_notification_fields` | 2026-06-12 | Ajoute PrayerRoomParticipant |
| `20260806113318_repair_prayer_live_room_participant` | 2026-08-06 | Répare PrayerLiveRoomParticipant |
| `20260814140000_repair_missing_studio_prayer_tables` | 2026-08-14 | Crée PrayerParticipant, PrayerSchedule, PrayerRoom, PrayerCampaign, PrayerEngagement |
| `add_missing_prayer_live_room_member` | N/A | Ajoute PrayerLiveRoomMember |
| `fix_missing_prayer_tables` | N/A | Répare tables manquantes |
| `add_prayer_request_church_id` | N/A | Ajoute churchId à PrayerRequest |

### 2.2 Analyse de la Migration Critique

**Migration `20260814140000_repair_missing_studio_prayer_tables`:**
- Crée 5 tables: `PrayerParticipant`, `PrayerSchedule`, `PrayerRoom`, `PrayerCampaign`, `PrayerEngagement`
- Commentaire: "Ne pas recréer StudioOutput", "Ne pas recréer PrayerRoomParticipant"
- Crée des index et foreign keys
- **Problème:** Ces tables ne sont PAS dans `schema.prisma`

---

## 3. Routes API Prayer

### 3.1 Routes Identifiées

| Route | Méthodes | Modèle Utilisé | Fichier |
|-------|----------|----------------|---------|
| `/api/prayers` | GET, POST | PrayerRequest | route.ts |
| `/api/prayers/[id]` | DELETE | PrayerRequest | [id]/route.ts |
| `/api/prayers/pray` | POST | PrayerReaction | pray/route.ts |
| `/api/prayers/respond` | POST | PrayerResponse | respond/route.ts |
| `/api/prayers/verse` | POST | PrayerVerse | verse/route.ts |
| `/api/prayers/testimony` | POST | PrayerTestimony | testimony/route.ts |
| `/api/prayers/chain` | GET, POST | PrayerChain, PrayerChainLink | chain/route.ts |
| `/api/prayers/rooms` | GET, POST | PrayerLiveRoom | rooms/route.ts |
| `/api/prayers/rooms/[id]/participants` | GET | PrayerLiveRoomMember | rooms/[id]/participants/route.ts |
| `/api/prayers/live` | GET, POST | PrayerLiveRoom | live/route.ts |
| `/api/prayers/participants` | - | PrayerParticipant | (route manquante?) |
| `/api/prayers/schedule` | - | PrayerSchedule | (route manquante?) |
| `/api/prayers/campaigns` | - | PrayerCampaign | (route manquante?) |
| `/api/prayers/engagements` | - | PrayerEngagement | (route manquante?) |

### 3.2 Problèmes Identifiés

**CRITIQUE - Routes manquantes:**
- Les hooks `usePrayers.ts` appellent `/api/prayers/participants`, `/api/prayers/schedule`, `/api/prayers/campaigns`, `/api/prayers/engagements`
- Ces routes n'existent PAS dans `app/api/prayers/`
- Le code frontend échouera silencieusement ou avec des erreurs 404

**INCOHÉRENCE - Room API:**
- `/api/prayers/rooms` utilise `PrayerLiveRoom` (schema)
- Mais le type TypeScript `PrayerRoom` (types/prayer.ts) correspond à la table `PrayerRoom` (migration)
- Ces deux modèles ont des structures différentes

---

## 4. Server Actions

**Résultat:** Aucun Server Action identifié pour le module Prayer.
- Le module utilise exclusivement des routes API REST
- Pas de dossier `actions/` ou fichiers `*.actions.ts` liés aux prières

---

## 5. Composants Frontend Prayer

### 5.1 Composants Identifiés

| Composant | Chemin | Modèle Utilisé |
|-----------|--------|----------------|
| `PrayerCard` | components/prayer/PrayerCard.tsx | PrayerRequest |
| `PrayerDetailModal` | components/prayer/PrayerDetailModal.tsx | PrayerRequest |
| `PrayerForm` | components/prayer/PrayerForm.tsx | PrayerRequest |
| `PrayerSidebarLeft` | components/prayer/PrayerSidebarLeft.tsx | - |
| `PrayerSidebarRight` | components/prayer/PrayerSidebarRight.tsx | - |
| `PrayerChainCard` | components/prayer/chains/PrayerChainCard.tsx | PrayerChain, PrayerParticipant |
| `PrayerChainList` | components/prayer/chains/PrayerChainList.tsx | PrayerChain |
| `PrayerRoomCard` | components/prayer/rooms/PrayerRoomCard.tsx | PrayerRoom |
| `PrayerNotificationCenter` | components/prayer/notifications/PrayerNotificationCenter.tsx | PrayerNotification (type local) |
| `ParticipantManagement` | components/prayer/participants/ParticipantManagement.tsx | PrayerParticipant |
| `CreatePrayerChainModal` | components/prayer/modals/CreatePrayerChainModal.tsx | PrayerChain |
| `CreatePrayerCampaignModal` | components/prayer/modals/CreatePrayerCampaignModal.tsx | PrayerCampaign |
| `CreatePrayerRoomModal` | components/prayer/modals/CreatePrayerRoomModal.tsx | PrayerRoom |

### 5.2 Pages Identifiées

| Page | Chemin | Modèle Utilisé |
|------|--------|----------------|
| Page prières | app/prayers/page.tsx | PrayerRequest, PrayerChain, PrayerCampaign, PrayerRoom |
| Chaînes | app/prayers/chains/page.tsx | PrayerChain |
| Détail chaîne | app/prayers/chains/[id]/page.tsx | PrayerChain, PrayerParticipant, PrayerSchedule |
| Campagnes | app/prayers/campaigns/page.tsx | PrayerCampaign |
| Détail campagne | app/prayers/campaigns/[id]/page.tsx | PrayerCampaign |
| Salles | app/prayers/rooms/page.tsx | PrayerRoom |
| Détail salle | app/prayers/rooms/[id]/page.tsx | PrayerRoom, PrayerLiveRoomMember, LiveKit |

---

## 6. Hooks Prayer

### 6.1 Hooks Identifiés (hooks/usePrayers.ts)

| Hook | Modèles Utilisés | API Appelée |
|------|------------------|-------------|
| `usePrayers` | PrayerRequest | /api/prayers |
| `usePrayerParticipants` | PrayerParticipant | /api/prayers/participants (MANQUANTE) |
| `usePrayerSchedule` | PrayerSchedule | /api/prayers/schedule (MANQUANTE) |
| `usePrayerRooms` | PrayerRoom | /api/prayers/rooms (utilise PrayerLiveRoom) |
| `usePrayerCampaigns` | PrayerCampaign | /api/prayers/campaigns (MANQUANTE) |
| `usePrayerEngagements` | PrayerEngagement | /api/prayers/engagements (MANQUANTE) |

### 6.2 Problèmes Identifiés

**CRITIQUE - Hooks appellent des routes inexistantes:**
- `usePrayerParticipants` → `/api/prayers/participants` (404)
- `usePrayerSchedule` → `/api/prayers/schedule` (404)
- `usePrayerCampaigns` → `/api/prayers/campaigns` (404)
- `usePrayerEngagements` → `/api/prayers/engagements` (404)

---

## 7. Notifications Prayer

### 7.1 Système de Notifications

**Composant:** `PrayerNotificationCenter` (components/prayer/notifications/PrayerNotificationCenter.tsx)

**Types de notifications définis:**
- `NEW_PRAYER` - Nouvelle demande de prière
- `PRAYER_ANSWERED` - Prière répondue
- `CHAIN_INVITE` - Invitation à une chaîne
- `CAMPAIGN_START` - Début de campagne
- `ROOM_STARTED` - Salle démarrée
- `ENGAGEMENT` - Engagement sur prière

**Problème:**
- Ce composant est purement frontend (type local `PrayerNotification`)
- Aucune intégration avec le modèle `Notification` de Prisma
- Aucune API pour créer/gérer ces notifications
- Le composant est inclus dans `app/prayers/page.tsx` mais non connecté

---

## 8. WebSockets/LiveKit liés à Prayer

### 8.1 Intégration LiveKit

**Page:** `app/prayers/rooms/[id]/page.tsx`

**Fonctionnement:**
- Utilise le composant `LiveKitRoom` (components/livekit/LiveKitRoom.tsx)
- Token généré via `/api/livekit/token`
- Room name = `roomId`
- Participant name = `userName` (depuis session)

**Problèmes identifiés:**
- La page utilise `PrayerRoom` (type) mais l'API `/api/prayers/rooms` utilise `PrayerLiveRoom`
- Les participants sont récupérés via `/api/prayers/rooms/[id]/participants` qui utilise `PrayerLiveRoomMember`
- Il n'y a pas de synchronisation entre LiveKit participants et `PrayerLiveRoomMember`
- Le compteur de participants est géré localement (state) et non synchronisé avec LiveKit

---

## 9. Types TypeScript (types/prayer.ts)

### 9.1 Types Définis

| Type | Correspondance Schema |
|------|----------------------|
| `PrayerRequestWithUser` | PrayerRequest ✓ |
| `PrayerReactionWithUser` | PrayerReaction ✓ |
| `PrayerResponseWithUser` | PrayerResponse ✓ |
| `PrayerVerseWithUser` | PrayerVerse ✓ |
| `PrayerTestimony` | PrayerTestimony ✓ |
| `PrayerChainWithLinks` | PrayerChain ✓ |
| `PrayerParticipant` | PrayerParticipant ✗ (pas dans schema) |
| `PrayerSchedule` | PrayerSchedule ✗ (pas dans schema) |
| `PrayerRoom` | PrayerRoom ✗ (pas dans schema, différent de PrayerLiveRoom) |
| `PrayerCampaign` | PrayerCampaign ✗ (pas dans schema) |
| `PrayerEngagement` | PrayerEngagement ✗ (pas dans schema) |
| `PrayerLiveRoomWithCount` | PrayerLiveRoom ✓ |

---

## 10. Synthèse des Problèmes Critiques

### 10.1 Problème #1: Désynchronisation Schema/Migration

**Sévérité:** CRITIQUE

**Description:**
- 6 modèles sont créés dans les migrations mais absents du schema Prisma:
  - `PrayerParticipant`
  - `PrayerSchedule`
  - `PrayerRoom`
  - `PrayerCampaign`
  - `PrayerEngagement`
  - `PrayerRoomParticipant` (référencé mais non créé dans schema)

**Impact:**
- Prisma Client ne générera pas ces modèles
- Le code TypeScript utilisera des types qui n'existent pas dans le client
- Toute tentative d'utiliser ces modèles via Prisma échouera

**Action requise:**
- Ajouter ces modèles à `prisma/schema.prisma`
- OU supprimer la migration et recréer les tables via Prisma Migrate
- OU supprimer le code qui utilise ces modèles

---

### 10.2 Problème #2: Routes API Manquantes

**Sévérité:** CRITIQUE

**Description:**
- 4 routes API sont appelées par les hooks mais n'existent pas:
  - `/api/prayers/participants`
  - `/api/prayers/schedule`
  - `/api/prayers/campaigns`
  - `/api/prayers/engagements`

**Impact:**
- Les fonctionnalités correspondantes ne fonctionnent pas
- Erreurs 404 silencieuses ou visibles dans la console

**Action requise:**
- Créer ces routes API
- OU modifier les hooks pour ne pas appeler ces routes

---

### 10.3 Problème #3: Deux Systèmes de Salles de Prière

**Sévérité:** CRITIQUE

**Description:**
- `PrayerRoom` (migration) vs `PrayerLiveRoom` (schema)
- Structures différentes
- Frontend utilise `PrayerRoom` (type)
- API utilise `PrayerLiveRoom`
- LiveKit utilise `PrayerLiveRoomMember`

**Impact:**
- Confusion sur quel modèle utiliser
- Données potentiellement incohérentes
- Fonctionnalités brisées

**Action requise:**
- Déterminer quel modèle est le modèle canonique
- Unifier le système
- Migrer les données si nécessaire

---

### 10.4 Problème #4: Doublon de Modèles Live

**Sévérité:** ÉLEVÉE

**Description:**
- `PrayerLiveParticipant`, `PrayerLiveRoomMember`, `PrayerLiveRoomParticipant`
- 3 modèles pour la même fonctionnalité

**Impact:**
- Confusion sur quel modèle utiliser
- Redondance inutile
- Maintenance difficile

**Action requise:**
- Déterminer le modèle canonique
- Supprimer les doublons
- Migrer les données

---

### 10.5 Problème #5: Notifications Non Connectées

**Sévérité:** MOYENNE

**Description:**
- `PrayerNotificationCenter` est un composant frontend isolé
- Pas d'intégration avec le modèle `Notification` de Prisma
- Pas d'API pour créer/gérer ces notifications

**Impact:**
- Les notifications ne fonctionnent pas réellement
- Le composant est inutilisable

**Action requise:**
- Connecter le composant au système de notifications existant
- Créer les API nécessaires
- OU supprimer le composant

---

## 11. Recommandations pour l'Évolution

### 11.1 Avant Toute Évolution

**IMPERATIF:** Résoudre les problèmes critiques #1, #2, #3

1. **Unifier le schema Prisma:**
   - Décider: `PrayerRoom` ou `PrayerLiveRoom` comme modèle canonique
   - Ajouter tous les modèles manquants au schema
   - Générer une migration propre
   - Supprimer les migrations de réparation

2. **Créer les routes API manquantes:**
   - `/api/prayers/participants`
   - `/api/prayers/schedule`
   - `/api/prayers/campaigns`
   - `/api/prayers/engagements`

3. **Nettoyer les doublons Live:**
   - Choisir un modèle unique pour les participants live
   - Supprimer les autres
   - Migrer les données

### 11.2 Modèle Canonique Proposé

Basé sur l'analyse, le modèle canonique devrait être:

**Pour les chaînes de prière:**
- `PrayerChain` (existant)
- `PrayerChainLink` (existant)
- `PrayerParticipant` (à ajouter au schema) - pour les participants avec rôles
- `PrayerSchedule` (à ajouter au schema) - pour les horaires

**Pour les demandes de prière:**
- `PrayerRequest` (existant)
- `PrayerReaction` (existant)
- `PrayerResponse` (existant)
- `PrayerVerse` (existant)
- `PrayerTestimony` (existant)

**Pour les campagnes:**
- `PrayerCampaign` (à ajouter au schema)

**Pour les salles de prière:**
- `PrayerRoom` (à ajouter au schema, remplacer PrayerLiveRoom)
  - Champs: `roomType`, `isPublic`, `isActive`, `moderatorId`, `maxParticipants`, `scheduledStart`, `scheduledEnd`
- `PrayerRoomParticipant` (à ajouter au schema, unifier les 3 modèles live)
  - Champs: `roomId`, `userId`, `joinedAt`, `role`, `status`

**Pour les engagements:**
- `PrayerEngagement` (à ajouter au schema)

---

## 12. Conclusion

Le module de prière actuel présente des problèmes structurels majeurs qui empêchent toute évolution saine:

1. **Désynchronisation critique** entre le schema Prisma et les migrations
2. **Routes API manquantes** pour des fonctionnalités codées dans le frontend
3. **Deux systèmes parallèles** pour les salles de prière
4. **Doublons de modèles** pour les participants live
5. **Notifications déconnectées** du système existant

**RECOMMANDATION:** Ne pas commencer l'évolution avant d'avoir résolu ces problèmes. Le risque de créer encore plus d'incohérence est trop élevé.

---

**Rapport généré par:** Cascade AI  
**Date:** 14 août 2026
