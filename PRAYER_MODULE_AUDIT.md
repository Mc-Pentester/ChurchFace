# Rapport d'Audit - Module Prières ChurchFace
**Date :** 12 août 2026  
**Objectif :** Analyser le module Prières existant pour préparer une évolution progressive et rétrocompatible

---

## 1. ARCHITECTURE ACTUELLE

### 1.1 Modèles Prisma existants

#### PrayerRequest (Modèle principal)
```prisma
model PrayerRequest {
  id            String           @id @default(cuid())
  userId        String
  title         String
  content       String
  category      String?          // SANTE, FAMILLE, TRAVAIL, ETUDES, MINISTERE, FINANCES, MARIAGE, EVANGELISATION
  isUrgent      Boolean          @default(false)
  isAnswered    Boolean          @default(false)
  createdAt     DateTime         @default(now())
  prayerChainId String?          // Relation optionnelle avec PrayerChain
  churchId      String?          // Relation optionnelle avec Church
  reactions     PrayerReaction[]
  prayerChain   PrayerChain?     @relation
  user          User             @relation
  responses     PrayerResponse[]
  testimony     PrayerTestimony?
  verses        PrayerVerse[]
  church        Church?          @relation
}
```

#### PrayerChain (Chaînes de prière - DÉJÀ EXISTANT)
```prisma
model PrayerChain {
  id              String            @id @default(cuid())
  prayerRequestId String?           // Optionnel : peut être lié à une demande
  title           String
  description     String?
  isActive        Boolean           @default(true)
  createdAt       DateTime          @default(now())
  links           PrayerChainLink[]
  prayerRequests  PrayerRequest[]
}
```

#### PrayerChainLink (Participants aux chaînes)
```prisma
model PrayerChainLink {
  id        String      @id @default(cuid())
  chainId   String
  userId    String
  message   String?
  createdAt DateTime    @default(now())
  chain     PrayerChain @relation
  user      User        @relation
  
  @@unique([chainId, userId])
}
```

#### PrayerReaction (Réactions)
```prisma
model PrayerReaction {
  id              String        @id @default(cuid())
  prayerRequestId String
  userId          String
  type            String        @default("PRAY") // PRAY | ENCOURAGE
  createdAt       DateTime      @default(now())
  prayerRequest   PrayerRequest @relation
  user            User          @relation
  
  @@unique([userId, prayerRequestId, type])
}
```

#### PrayerResponse (Commentaires/Réponses)
```prisma
model PrayerResponse {
  id              String        @id @default(cuid())
  prayerRequestId String
  userId          String
  content         String
  type            String        @default("PRAYER") // COMMENT | ENCOURAGEMENT
  createdAt       DateTime      @default(now())
  prayerRequest   PrayerRequest @relation
  user            User          @relation
}
```

#### PrayerVerse (Versets bibliques)
```prisma
model PrayerVerse {
  id              String        @id @default(cuid())
  prayerRequestId String
  userId          String
  reference       String
  text            String?
  createdAt       DateTime      @default(now())
  prayerRequest   PrayerRequest @relation
  user            User          @relation
}
```

#### PrayerTestimony (Témoignages - DÉJÀ EXISTANT)
```prisma
model PrayerTestimony {
  id              String        @id @default(cuid())
  prayerRequestId String        @unique
  userId          String
  content         String
  imageUrl        String?
  createdAt       DateTime      @default(now())
  prayerRequest   PrayerRequest @relation
  user            User          @relation
}
```

#### PrayerLiveRoom (Salles de prière live - DÉJÀ EXISTANT)
```prisma
model PrayerLiveRoom {
  id                        String                      @id @default(cuid())
  title                     String
  description               String?
  isPublic                  Boolean                     @default(true)
  isActive                  Boolean                     @default(true)
  moderatorId               String
  createdAt                 DateTime                    @default(now())
  participants              PrayerLiveParticipant[]
  moderator                 User                        @relation
  PrayerLiveRoomMember      PrayerLiveRoomMember[]
  PrayerLiveRoomParticipant PrayerLiveRoomParticipant[]
}
```

#### Participants live (3 modèles - POSSIBLE DUPLICATION)
```prisma
model PrayerLiveParticipant {
  id       String         @id @default(cuid())
  roomId   String
  userId   String
  joinedAt DateTime       @default(now())
  room     PrayerLiveRoom @relation
  user     User           @relation
  @@unique([roomId, userId])
}

model PrayerLiveRoomMember {
  id       String         @id @default(cuid())
  roomId   String
  userId   String
  joinedAt DateTime       @default(now())
  room     PrayerLiveRoom @relation
  user     User           @relation
  @@unique([roomId, userId])
}

model PrayerLiveRoomParticipant {
  id       String         @id @default(cuid())
  roomId   String
  userId   String
  joinedAt DateTime       @default(now())
  room     PrayerLiveRoom @relation
  user     User           @relation
  @@unique([roomId, userId])
}
```

### 1.2 API Routes existantes

| Route | Méthode | Fonction | Statut |
|-------|---------|----------|--------|
| `/api/prayers` | GET | Liste des demandes de prière (pagination, filtres) | ✅ Conservé |
| `/api/prayers` | POST | Créer une demande de prière | ✅ Conservé |
| `/api/prayers/[id]` | DELETE | Supprimer une demande | ✅ Conservé |
| `/api/prayers/chain` | GET | Liste des chaînes de prière | ✅ Conservé |
| `/api/prayers/chain` | POST | Créer/rejoindre une chaîne | ✅ Conservé |
| `/api/prayers/live` | GET | Liste des salles live | ✅ Conservé |
| `/api/prayers/live` | POST | Créer une salle live | ✅ Conservé |
| `/api/prayers/pray` | POST | Réagir (PRAY) | ✅ Conservé |
| `/api/prayers/respond` | POST | Répondre/commenter | ✅ Conservé |
| `/api/prayers/verse` | POST | Ajouter un verset | ✅ Conservé |
| `/api/prayers/testimony` | POST | Ajouter un témoignage | ✅ Conservé |
| `/api/church/prayers` | GET/POST | Prières par église | ✅ Conservé |

### 1.3 Composants React existants

| Composant | Fonction | Statut |
|-----------|----------|--------|
| `PrayerCard` | Affichage d'une demande de prière | ✅ Conservé |
| `PrayerDetailModal` | Modal de détail avec réactions, réponses, versets | ✅ Conservé |
| `PrayerForm` | Formulaire de création | ✅ Conservé |
| `PrayerSidebarLeft` | Sidebar gauche (filtres?) | ✅ Conservé |
| `PrayerSidebarRight` | Sidebar droite (statistiques?) | ✅ Conservé |

### 1.4 Hooks existants

| Hook | Fonction | Statut |
|------|----------|--------|
| `usePrayers` | Gestion des prières (fetch, create, react, respond, verse, testimony) | ✅ Conservé |

### 1.5 Contexts existants

| Context | Fonction | Statut |
|---------|----------|--------|
| `PrayerRoomContext` | Gestion des salles live avec WebSocket | ✅ Conservé |

### 1.6 Types TypeScript existants

| Type | Fonction | Statut |
|------|----------|--------|
| `PrayerRequestWithUser` | Demande avec utilisateur | ✅ Conservé |
| `PrayerReactionWithUser` | Réaction avec utilisateur | ✅ Conservé |
| `PrayerResponseWithUser` | Réponse avec utilisateur | ✅ Conservé |
| `PrayerVerseWithUser` | Verset avec utilisateur | ✅ Conservé |
| `PrayerTestimony` | Témoignage | ✅ Conservé |
| `PrayerChainWithLinks` | Chaîne avec liens | ✅ Conservé |
| `PrayerLiveRoomWithCount` | Salle live avec compteur | ✅ Conservé |
| `PrayerCategory` | Catégories (SANTE, FAMILLE, etc.) | ✅ Conservé |

---

## 2. CE QUI EST CONSERVÉ ✅

### 2.1 Modèles Prisma
- ✅ **PrayerRequest** - Modèle principal inchangé
- ✅ **PrayerChain** - Chaînes de prière déjà existantes
- ✅ **PrayerChainLink** - Participants aux chaînes déjà existants
- ✅ **PrayerReaction** - Réactions (PRAY, ENCOURAGE)
- ✅ **PrayerResponse** - Commentaires/réponses
- ✅ **PrayerVerse** - Versets bibliques
- ✅ **PrayerTestimony** - Témoignages déjà existants
- ✅ **PrayerLiveRoom** - Salles live déjà existantes

### 2.2 API Routes
- ✅ Toutes les routes existantes conservées
- ✅ Comportement inchangé
- ✅ Signatures API identiques

### 2.3 Composants React
- ✅ Tous les composants existants conservés
- ✅ Props inchangées
- ✅ Comportement inchangé

### 2.4 Hooks et Contexts
- ✅ `usePrayers` conservé
- ✅ `PrayerRoomContext` conservé

### 2.5 Types TypeScript
- ✅ Tous les types existants conservés
- ✅ Interfaces inchangées

---

## 3. CE QUI EST ÉTENDU 🔧

### 3.1 Modèles Prisma à étendre

#### PrayerRequest
**Ajouts proposés :**
```prisma
model PrayerRequest {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS (optionnels pour rétrocompatibilité)
  prayerChainId     String?           // Déjà existe, à utiliser pleinement
  churchId          String?           // Déjà existe, à utiliser pleinement
  groupId           String?           // NOUVEAU : lien avec groupe
  ministryId        String?           // NOUVEAU : lien avec ministère
  eventId           String?           // NOUVEAU : lien avec événement
  liveBroadcastId   String?           // NOUVEAU : lien avec live
  prayerCampaignId  String?           // NOUVEAU : lien avec campagne
  prayerRoomId      String?           // NOUVEAU : lien avec salle de prière
  scheduledAt       DateTime?         // NOUVEAU : pour planification
  status            String?           @default("ACTIVE") // NOUVEAU : ACTIVE, ANSWERED, ARCHIVED
  
  // Relations nouvelles (optionnelles)
  group             Group?            @relation(fields: [groupId], references: [id])
  ministry          Ministry?         @relation(fields: [ministryId], references: [id])
  event             Event?            @relation(fields: [eventId], references: [id])
  liveBroadcast     LiveBroadcast?    @relation(fields: [liveBroadcastId], references: [id])
  prayerCampaign    PrayerCampaign?   @relation(fields: [prayerCampaignId], references: [id])
  prayerRoom        PrayerRoom?       @relation(fields: [prayerRoomId], references: [id])
}
```

#### PrayerChain
**Ajouts proposés :**
```prisma
model PrayerChain {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS (optionnels)
  ownerId           String?           // NOUVEAU : propriétaire (user, church, group, ministry)
  ownerType         String?           // NOUVEAU : "USER" | "CHURCH" | "GROUP" | "MINISTRY" | "EVENT"
  churchId          String?           // NOUVEAU : lien avec église
  groupId           String?           // NOUVEAU : lien avec groupe
  ministryId        String?           // NOUVEAU : lien avec ministère
  eventId           String?           // NOUVEAU : lien avec événement
  imageUrl          String?           // NOUVEAU : image de la chaîne
  visibility        String?           @default("PUBLIC") // NOUVEAU : PUBLIC, PRIVATE, CHURCH_ONLY
  prayerCampaignId  String?           // NOUVEAU : lien avec campagne
  scheduledStart    DateTime?         // NOUVEAU : début planifié
  scheduledEnd      DateTime?         // NOUVEAU : fin planifiée
  
  // Relations nouvelles (optionnelles)
  owner             User?             @relation(fields: [ownerId], references: [id])
  church            Church?           @relation(fields: [churchId], references: [id])
  group             Group?            @relation(fields: [groupId], references: [id])
  ministry          Ministry?         @relation(fields: [ministryId], references: [id])
  event             Event?            @relation(fields: [eventId], references: [id])
  prayerCampaign    PrayerCampaign?   @relation(fields: [prayerCampaignId], references: [id])
}
```

#### PrayerChainLink
**Ajouts proposés :**
```prisma
model PrayerChainLink {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS (optionnels)
  role              String?           @default("PARTICIPANT") // NOUVEAU : PARTICIPANT, INTERCESSOR, MODERATOR, ADMIN
  joinedAt          DateTime         @default(now()) // NOUVEAU : date d'inscription
  lastPrayedAt      DateTime?         // NOUVEAU : dernière prière
  prayerCount       Int              @default(0) // NOUVEAU : nombre de prières
  notificationEnabled Boolean        @default(true) // NOUVEAU : notifications activées
}
```

#### PrayerReaction
**Ajouts proposés :**
```prisma
model PrayerReaction {
  // ... champs existants ...
  
  // Extension du type (rétrocompatible)
  // type peut maintenant être : "PRAY" | "ENCOURAGE" | "CONTINUE_PRAYING" | "SHARED_VERSE" | "ENCOURAGED"
}
```

#### PrayerLiveRoom
**Ajouts proposés :**
```prisma
model PrayerLiveRoom {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS (optionnels)
  prayerChainId    String?           // NOUVEAU : lien avec chaîne
  roomType         String?           @default("AUDIO") // NOUVEAU : TEXT, AUDIO, VIDEO
  maxParticipants  Int?              // NOUVEAU : limite participants
  scheduledStart   DateTime?         // NOUVEAU : début planifié
  scheduledEnd     DateTime?         // NOUVEAU : fin planifiée
  
  // Relations nouvelles (optionnelles)
  prayerChain      PrayerChain?      @relation(fields: [prayerChainId], references: [id])
}
```

### 3.2 Types TypeScript à étendre

#### PrayerRequestWithUser
```typescript
export interface PrayerRequestWithUser {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS (optionnels)
  groupId?: string;
  ministryId?: string;
  eventId?: string;
  liveBroadcastId?: string;
  prayerCampaignId?: string;
  prayerRoomId?: string;
  scheduledAt?: string;
  status?: string;
  
  // Relations nouvelles (optionnelles)
  group?: { id: string; name: string };
  ministry?: { id: string; name: string };
  event?: { id: string; name: string };
  liveBroadcast?: { id: string; title: string };
  prayerCampaign?: { id: string; title: string };
  prayerRoom?: { id: string; title: string };
}
```

#### PrayerChainWithLinks
```typescript
export interface PrayerChainWithLinks {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS (optionnels)
  ownerId?: string;
  ownerType?: string;
  churchId?: string;
  groupId?: string;
  ministryId?: string;
  eventId?: string;
  imageUrl?: string;
  visibility?: string;
  prayerCampaignId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  
  // Relations nouvelles (optionnelles)
  owner?: { id: string; name: string; image: string };
  church?: { id: string; name: string; slug: string };
  group?: { id: string; name: string };
  ministry?: { id: string; name: string };
  event?: { id: string; name: string };
  prayerCampaign?: { id: string; title: string };
}
```

---

## 4. CE QUI EST AJOUTÉ ➕

### 4.1 Nouveaux modèles Prisma

#### PrayerParticipant (Système de participation avancé)
```prisma
model PrayerParticipant {
  id              String         @id @default(cuid())
  prayerChainId   String
  userId          String
  role            String         @default("PARTICIPANT") // PARTICIPANT, INTERCESSOR, MODERATOR, ADMIN
  joinedAt        DateTime       @default(now())
  lastPrayedAt    DateTime?
  prayerCount     Int            @default(0)
  notificationEnabled Boolean     @default(true)
  
  prayerChain     PrayerChain    @relation(fields: [prayerChainId], references: [id])
  user            User           @relation(fields: [userId], references: [id])
  
  @@unique([prayerChainId, userId])
  @@index([prayerChainId])
  @@index([userId])
}
```

#### PrayerSchedule (Calendrier d'intercession)
```prisma
model PrayerSchedule {
  id              String         @id @default(cuid())
  prayerChainId   String
  userId          String
  hour            Int            // 0-23
  dayOfWeek       Int?           // 0-6 (null = tous les jours)
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  
  prayerChain     PrayerChain    @relation(fields: [prayerChainId], references: [id])
  user            User           @relation(fields: [userId], references: [id])
  
  @@unique([prayerChainId, userId, hour, dayOfWeek])
  @@index([prayerChainId])
  @@index([userId])
}
```

#### PrayerRoom (Salles de prière étendues)
```prisma
model PrayerRoom {
  id              String         @id @default(cuid())
  prayerChainId   String?
  title           String
  description     String?
  roomType        String         @default("TEXT") // TEXT, AUDIO, VIDEO
  isPublic        Boolean        @default(true)
  isActive        Boolean        @default(true)
  moderatorId     String
  maxParticipants Int?
  scheduledStart  DateTime?
  scheduledEnd    DateTime?
  createdAt       DateTime       @default(now())
  endedAt         DateTime?
  
  prayerChain     PrayerChain?   @relation(fields: [prayerChainId], references: [id])
  moderator       User           @relation(fields: [moderatorId], references: [id])
  participants    PrayerRoomParticipant[]
  
  @@index([prayerChainId])
  @@index([moderatorId])
}
```

#### PrayerRoomParticipant (Participants aux salles)
```prisma
model PrayerRoomParticipant {
  id              String         @id @default(cuid())
  roomId          String
  userId          String
  joinedAt        DateTime       @default(now())
  isMuted         Boolean        @default(false)
  hasHandRaised   Boolean        @default(false)
  
  room            PrayerRoom     @relation(fields: [roomId], references: [id])
  user            User           @relation(fields: [userId], references: [id])
  
  @@unique([roomId, userId])
  @@index([roomId])
  @@index([userId])
}
```

#### PrayerCampaign (Campagnes de prière)
```prisma
model PrayerCampaign {
  id              String         @id @default(cuid())
  title           String
  description     String?
  imageUrl        String?
  type            String         // "FAST", "PRAYER", "VIGIL", "NATIONAL", "GLOBAL"
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean        @default(true)
  churchId        String?
  createdBy       String
  createdAt       DateTime       @default(now())
  
  chains          PrayerChain[]
  church          Church?        @relation(fields: [churchId], references: [id])
  creator         User           @relation(fields: [createdBy], references: [id])
  
  @@index([churchId])
  @@index([createdBy])
  @@index([startDate, endDate])
}
```

#### PrayerEngagement (Nouveaux types d'engagement)
```prisma
model PrayerEngagement {
  id              String         @id @default(cuid())
  prayerRequestId String
  userId          String
  type            String         // "PRAYED", "CONTINUING", "SHARED_VERSE", "ENCOURAGED"
  createdAt       DateTime       @default(now())
  
  prayerRequest   PrayerRequest  @relation(fields: [prayerRequestId], references: [id])
  user            User           @relation(fields: [userId], references: [id])
  
  @@index([prayerRequestId])
  @@index([userId])
  @@index([type])
}
```

### 4.2 Nouvelles API Routes

| Route | Méthode | Fonction | Statut |
|-------|---------|----------|--------|
| `/api/prayers/participants` | GET/POST | Gestion des participants aux chaînes | ➕ Nouveau |
| `/api/prayers/schedule` | GET/POST | Calendrier d'intercession | ➕ Nouveau |
| `/api/prayers/rooms` | GET/POST | Salles de prière étendues | ➕ Nouveau |
| `/api/prayers/rooms/[id]/join` | POST | Rejoindre une salle | ➕ Nouveau |
| `/api/prayers/rooms/[id]/leave` | POST | Quitter une salle | ➕ Nouveau |
| `/api/prayers/campaigns` | GET/POST | Campagnes de prière | ➕ Nouveau |
| `/api/prayers/engagements` | POST | Nouveaux types d'engagement | ➕ Nouveau |
| `/api/prayers/[id]/schedule` | GET/POST | Planification d'une demande | ➕ Nouveau |

### 4.3 Nouveaux composants React

| Composant | Fonction | Statut |
|-----------|----------|--------|
| `PrayerChainCard` | Affichage d'une chaîne de prière | ➕ Nouveau |
| `PrayerChainModal` | Modal de création/édition de chaîne | ➕ Nouveau |
| `PrayerParticipantList` | Liste des participants | ➕ Nouveau |
| `PrayerScheduleCalendar` | Calendrier d'intercession | ➕ Nouveau |
| `PrayerRoomCard` | Affichage d'une salle de prière | ➕ Nouveau |
| `PrayerRoomInterface` | Interface de salle (text/audio/video) | ➕ Nouveau |
| `PrayerCampaignCard` | Affichage d'une campagne | ➕ Nouveau |
| `PrayerCampaignModal` | Modal de création de campagne | ➕ Nouveau |
| `PrayerEngagementButtons` | Boutons d'engagement étendus | ➕ Nouveau |
| `PrayerTestimonyGallery` | Galerie de témoignages | ➕ Nouveau |

### 4.4 Nouveaux hooks

| Hook | Fonction | Statut |
|------|----------|--------|
| `usePrayerChains` | Gestion des chaînes de prière | ➕ Nouveau |
| `usePrayerParticipants` | Gestion des participants | ➕ Nouveau |
| `usePrayerSchedule` | Gestion du calendrier | ➕ Nouveau |
| `usePrayerRooms` | Gestion des salles de prière | ➕ Nouveau |
| `usePrayerCampaigns` | Gestion des campagnes | ➕ Nouveau |
| `usePrayerEngagements` | Gestion des engagements | ➕ Nouveau |

### 4.5 Nouveaux types TypeScript

```typescript
export interface PrayerParticipant {
  id: string;
  prayerChainId: string;
  userId: string;
  role: "PARTICIPANT" | "INTERCESSOR" | "MODERATOR" | "ADMIN";
  joinedAt: string;
  lastPrayedAt?: string;
  prayerCount: number;
  notificationEnabled: boolean;
  user: { id: string; name: string | null; image: string | null };
}

export interface PrayerSchedule {
  id: string;
  prayerChainId: string;
  userId: string;
  hour: number;
  dayOfWeek?: number;
  isActive: boolean;
}

export interface PrayerRoom {
  id: string;
  prayerChainId?: string;
  title: string;
  description?: string;
  roomType: "TEXT" | "AUDIO" | "VIDEO";
  isPublic: boolean;
  isActive: boolean;
  moderatorId: string;
  maxParticipants?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  createdAt: string;
  endedAt?: string;
}

export interface PrayerCampaign {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: "FAST" | "PRAYER" | "VIGIL" | "NATIONAL" | "GLOBAL";
  startDate: string;
  endDate: string;
  isActive: boolean;
  churchId?: string;
  createdBy: string;
  createdAt: string;
}

export interface PrayerEngagement {
  id: string;
  prayerRequestId: string;
  userId: string;
  type: "PRAYED" | "CONTINUING" | "SHARED_VERSE" | "ENCOURAGED";
  createdAt: string;
}
```

---

## 5. PROBLÈMES IDENTIFIÉS ⚠️

### 5.1 Duplication de modèles participants
**Problème :** 3 modèles similaires pour les participants live :
- `PrayerLiveParticipant`
- `PrayerLiveRoomMember`
- `PrayerLiveRoomParticipant`

**Recommandation :** Unifier en un seul modèle `PrayerRoomParticipant` et migrer les données existantes.

### 5.2 Relations manquantes
**Problème :** Certains modèles ont des IDs étrangers mais pas de relations explicites dans Prisma.

**Recommandation :** Ajouter les relations `@relation` pour :
- `PrayerChain.ownerId` → `User`
- `PrayerChain.churchId` → `Church`
- `PrayerChain.groupId` → `Group`
- `PrayerChain.ministryId` → `Ministry`
- `PrayerChain.eventId` → `Event`

### 5.3 Index manquants
**Problème :** Certains champs fréquemment utilisés n'ont pas d'index.

**Recommandation :** Ajouter des index sur :
- `PrayerRequest.status`
- `PrayerRequest.scheduledAt`
- `PrayerChain.ownerType`
- `PrayerChain.visibility`
- `PrayerCampaign.type`
- `PrayerCampaign.startDate`

---

## 6. PLAN DE MIGRATION

### Phase 1 : Nettoyage (Critique)
1. Unifier les 3 modèles participants en `PrayerRoomParticipant`
2. Migration des données existantes
3. Suppression des anciens modèles (après migration)

### Phase 2 : Extensions (Haute priorité)
1. Ajouter les nouveaux champs optionnels aux modèles existants
2. Ajouter les relations optionnelles
3. Créer les nouveaux modèles
4. Créer les nouvelles API routes
5. Étendre les types TypeScript

### Phase 3 : Composants (Moyenne priorité)
1. Créer les nouveaux composants React
2. Créer les nouveaux hooks
3. Intégrer avec l'interface existante

### Phase 4 : Intégrations (Moyenne priorité)
1. Connecter avec les églises
2. Connecter avec les groupes
3. Connecter avec les ministères
4. Connecter avec les événements
5. Connecter avec les lives

### Phase 5 : Tests (Haute priorité)
1. Tests unitaires pour les nouveaux modèles
2. Tests d'intégration pour les nouvelles API
3. Tests E2E pour les nouveaux composants
4. Tests de rétrocompatibilité

---

## 7. CONTRAINTES DE RÉTROCOMPATIBILITÉ ✅

### 7.1 Règles strictes
- ❌ **JAMAIS** supprimer un modèle Prisma existant
- ❌ **JAMAIS** renommer une table
- ❌ **JAMAIS** renommer une colonne
- ❌ **JAMAIS** supprimer une route API
- ❌ **JAMAIS** modifier le comportement actuel
- ❌ **JAMAIS** casser les notifications existantes
- ❌ **JAMAIS** casser les réactions existantes
- ❌ **JAMAIS** casser les commentaires existants
- ❌ **JAMAIS** casser les témoignages existants

### 7.2 Stratégie d'extension
- ✅ Tous les nouveaux champs sont **optionnels** (`?`)
- ✅ Toutes les nouvelles relations sont **optionnelles**
- ✅ Toutes les nouvelles API routes sont **distinctes** des existantes
- ✅ Tous les nouveaux composants sont **additionnels**
- ✅ Tous les nouveaux types sont **extensions** des existants

### 7.3 Migration additive
- ✅ Uniquement des migrations `ADD COLUMN`
- ✅ Uniquement des migrations `CREATE TABLE`
- ✅ Uniquement des migrations `ADD INDEX`
- ❌ **INTERDIT** : `DROP TABLE`
- ❌ **INTERDIT** : `DROP COLUMN`
- ❌ **INTERDIT** : `RENAME COLUMN`
- ❌ **INTERDIT** : `RENAME TABLE`

---

## 8. ESTIMATION

| Phase | Durée estimée | Priorité |
|-------|---------------|----------|
| Phase 1 : Nettoyage | 1-2 jours | Critique |
| Phase 2 : Extensions | 3-4 jours | Haute |
| Phase 3 : Composants | 3-4 jours | Moyenne |
| Phase 4 : Intégrations | 2-3 jours | Moyenne |
| Phase 5 : Tests | 2-3 jours | Haute |
| **Total** | **11-16 jours** | - |

---

## 9. CONCLUSION

Le module Prières de ChurchFace dispose déjà d'une **base solide** avec :
- ✅ Demandes de prière fonctionnelles
- ✅ Chaînes de prière déjà implémentées
- ✅ Réactions et commentaires
- ✅ Versets bibliques
- ✅ Témoignages déjà existants
- ✅ Salles live déjà existantes
- ✅ API routes complètes
- ✅ Composants React fonctionnels

**L'évolution proposée est 100% rétrocompatible** car :
- Tous les ajouts sont optionnels
- Aucune suppression de fonctionnalité existante
- Aucune modification de comportement
- Extensions progressives autour du système actuel

**Les fonctionnalités à ajouter** :
- Système de participants avancé (rôles, statistiques)
- Calendrier d'intercession
- Salles de prière étendues (text/audio/video)
- Campagnes de prière (jeûne, veillée, etc.)
- Nouveaux types d'engagement
- Intégrations avec églises, groupes, ministères, événements, lives

**Risque principal** : Duplication des modèles participants live à unifier avant toute extension.
