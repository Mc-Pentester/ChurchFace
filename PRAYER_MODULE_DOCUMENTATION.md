# Documentation du Module Prières - ChurchFace

## Vue d'ensemble

Le module Prières de ChurchFace a été transformé en un **réseau d'intercession collaboratif** complet. Il permet aux utilisateurs de créer des chaînes de prière, de participer à des campagnes, de rejoindre des salles de prière en temps réel (text, audio, vidéo), et de s'engager activement dans les demandes de prière.

**Version :** 2.0 (Évolution complète)  
**Date :** 12 août 2026  
**Rétrocompatibilité :** 100% - Toutes les fonctionnalités existantes sont préservées

---

## Architecture du Module

### Modèles de Données (Prisma)

#### Modèles Existants (Étendus)

**PrayerRequest** - Demande de prière
- **Nouveaux champs :**
  - `groupId` : Association à un groupe
  - `ministryId` : Association à un ministère
  - `eventId` : Association à un événement
  - `liveBroadcastId` : Association à un live
  - `prayerCampaignId` : Association à une campagne
  - `prayerRoomId` : Association à une salle de prière
  - `scheduledAt` : Date de prière programmée
  - `status` : Statut (ACTIVE, ANSWERED, ARCHIVED)

**PrayerChain** - Chaîne de prière
- **Nouveaux champs :**
  - `ownerId` : ID du propriétaire
  - `ownerType` : Type de propriétaire (USER, CHURCH, GROUP)
  - `churchId` : Église associée
  - `groupId` : Groupe associé
  - `ministryId` : Ministère associé
  - `eventId` : Événement associé
  - `imageUrl` : Image de la chaîne
  - `visibility` : Visibilité (PUBLIC, PRIVATE, CHURCH_MEMBERS)
  - `prayerCampaignId` : Campagne associée
  - `scheduledStart` : Début programmé
  - `scheduledEnd` : Fin programmée

**PrayerChainLink** - Lien utilisateur-chaîne
- **Nouveaux champs :**
  - `role` : Rôle (PARTICIPANT, MODERATOR, ADMIN)
  - `joinedAt` : Date d'adhésion
  - `lastPrayedAt` : Dernière prière
  - `prayerCount` : Nombre de prières
  - `notificationEnabled` : Notifications activées

**PrayerTestimony** - Témoignage
- **Nouveau champ :**
  - `videoUrl` : URL de la vidéo du témoignage

#### Nouveaux Modèles

**PrayerParticipant** - Système de participation avancé
```typescript
{
  id: string
  prayerChainId: string
  userId: string
  role: 'PARTICIPANT' | 'MODERATOR' | 'ADMIN'
  joinedAt: Date
  lastPrayedAt: Date | null
  prayerCount: number
  notificationEnabled: boolean
}
```

**PrayerSchedule** - Calendrier d'intercession
```typescript
{
  id: string
  prayerChainId: string
  userId: string
  hour: number (0-23)
  dayOfWeek: number | null (0-6, null = tous les jours)
  isActive: boolean
  createdAt: Date
}
```

**PrayerRoom** - Salles de prière (text/audio/video)
```typescript
{
  id: string
  prayerChainId: string | null
  title: string
  description: string | null
  roomType: 'TEXT' | 'AUDIO' | 'VIDEO'
  isPublic: boolean
  isActive: boolean
  moderatorId: string
  maxParticipants: number | null
  scheduledStart: Date | null
  scheduledEnd: Date | null
  createdAt: Date
  endedAt: Date | null
}
```

**PrayerRoomParticipant** - Participants aux salles
```typescript
{
  id: string
  roomId: string
  userId: string
  joinedAt: Date
  isMuted: boolean
  hasHandRaised: boolean
}
```

**PrayerCampaign** - Campagnes de prière
```typescript
{
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  type: 'FAST' | 'PRAYER' | 'VIGIL' | 'NATIONAL' | 'GLOBAL'
  startDate: Date
  endDate: Date
  isActive: boolean
  churchId: string | null
  createdBy: string
  createdAt: Date
}
```

**PrayerEngagement** - Types d'engagement
```typescript
{
  id: string
  prayerRequestId: string
  userId: string
  type: 'PRAYED' | 'ENCOURAGED' | 'SHARED_VERSE' | 'SHARED_TESTIMONY'
  createdAt: Date
}
```

---

## API Routes

### Routes Existantes (Modifiées)

#### `GET/POST /api/prayers/chain`
Gestion des chaînes de prière avec optimisation des requêtes.

**GET :** Récupérer les chaînes actives
```typescript
// Réponse
{
  chains: PrayerChainWithLinks[]
}
```

**POST :** Créer/Rejoindre une chaîne
```typescript
// Body
{
  action: 'create' | 'join'
  chainId?: string
  prayerRequestId?: string
  title?: string
  description?: string
  message?: string
}
```

### Nouvelles Routes

#### `GET/POST /api/prayers/participants`
Gestion des participants aux chaînes de prière avec pagination.

**GET :** Récupérer les participants
```typescript
// Query params
?prayerChainId=xxx&page=1&limit=20

// Réponse
{
  participants: PrayerParticipant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**POST :** Ajouter un participant
```typescript
// Body
{
  prayerChainId: string
  role?: 'PARTICIPANT' | 'MODERATOR' | 'ADMIN'
}
```

**DELETE :** Supprimer un participant
```typescript
// Query params
?id=xxx
```

#### `GET/POST/DELETE /api/prayers/schedule`
Gestion des horaires d'intercession.

**GET :** Récupérer les horaires
```typescript
// Query params
?prayerChainId=xxx&userId=xxx
```

**POST :** Créer un horaire
```typescript
// Body
{
  prayerChainId: string
  hour: number (0-23)
  dayOfWeek?: number (0-6)
}
```

**DELETE :** Supprimer un horaire
```typescript
// Query params
?id=xxx
```

#### `GET/POST /api/prayers/rooms`
Gestion des salles de prière.

**GET :** Récupérer les salles
```typescript
// Query params
?prayerChainId=xxx&isActive=true&roomType=VIDEO
```

**POST :** Créer une salle
```typescript
// Body
{
  prayerChainId?: string
  title: string
  description?: string
  roomType: 'TEXT' | 'AUDIO' | 'VIDEO'
  isPublic?: boolean
  maxParticipants?: number
  scheduledStart?: string
  scheduledEnd?: string
}
```

#### `GET/POST /api/prayers/campaigns`
Gestion des campagnes de prière avec optimisation des requêtes.

**GET :** Récupérer les campagnes
```typescript
// Query params
?churchId=xxx&isActive=true&type=FAST
```

**POST :** Créer une campagne
```typescript
// Body
{
  title: string
  description?: string
  imageUrl?: string
  type: 'FAST' | 'PRAYER' | 'VIGIL' | 'NATIONAL' | 'GLOBAL'
  startDate: string (ISO date)
  endDate: string (ISO date)
  churchId?: string
}
```

#### `GET/POST /api/prayers/engagements`
Gestion des engagements avec pagination.

**GET :** Récupérer les engagements
```typescript
// Query params
?prayerRequestId=xxx&type=PRAYED&page=1&limit=20

// Réponse
{
  engagements: PrayerEngagement[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**POST :** Créer un engagement
```typescript
// Body
{
  prayerRequestId: string
  type: 'PRAYED' | 'ENCOURAGED' | 'SHARED_VERSE' | 'SHARED_TESTIMONY'
}
```

---

## Composants React

### Chaînes de Prière

#### `PrayerChainCard`
Affiche les détails d'une chaîne de prière avec compteur de participants et visibilité.

**Props :**
```typescript
{
  chain: PrayerChainWithLinks
  onJoin?: (chainId: string) => void
  onLeave?: (chainId: string) => void
}
```

**Utilisation :**
```tsx
<PrayerChainCard 
  chain={chain} 
  onJoin={(id) => console.log('Join:', id)}
/>
```

#### `PrayerChainList`
Liste des chaînes de prière avec filtres.

**Props :**
```typescript
{
  chains: PrayerChainWithLinks[]
  filter?: 'all' | 'public' | 'private'
  onChainClick?: (chain: PrayerChainWithLinks) => void
}
```

### Campagnes de Prière

#### `PrayerCampaignCard`
Affiche les détails d'une campagne avec compteur de chaînes et badge de statut.

**Props :**
```typescript
{
  campaign: PrayerCampaign
  onJoin?: (campaignId: string) => void
}
```

#### `PrayerCampaignList`
Liste des campagnes avec filtres par statut et type.

**Props :**
```typescript
{
  campaigns: PrayerCampaign[]
  filter?: 'all' | 'active' | 'completed'
  typeFilter?: string
}
```

### Salles de Prière

#### `PrayerRoomCard`
Affiche les détails d'une salle avec type (TEXT/AUDIO/VIDEO) et statut.

**Props :**
```typescript
{
  room: PrayerRoom
  onJoin?: (roomId: string) => void
}
```

#### `PrayerRoomList`
Liste des salles avec filtres par statut et type.

**Props :**
```typescript
{
  rooms: PrayerRoom[]
  filter?: 'all' | 'active' | 'ended'
  typeFilter?: 'TEXT' | 'AUDIO' | 'VIDEO'
}
```

#### `PrayerRoomVideo`
Composant pour les salles vidéo avec LiveKit (micro, caméra, partage d'écran).

**Props :**
```typescript
{
  roomId: string
  roomName: string
  userName: string
  token: string
  url: string
  onLeave?: () => void
}
```

### Calendrier

#### `PrayerScheduleCalendar`
Calendrier interactif pour gérer les horaires d'intercession.

**Props :**
```typescript
{
  prayerChainId: string
  schedules: PrayerSchedule[]
  onAddSchedule: (schedule: Omit<PrayerSchedule, 'id' | 'createdAt'>) => void
  onDeleteSchedule: (scheduleId: string) => void
}
```

### Engagements

#### `PrayerEngagementButtons`
Boutons pour interagir avec une demande de prière (prier, encourager, verset).

**Props :**
```typescript
{
  prayerRequestId: string
  onEngage: (type: EngagementType) => void
}
```

---

## Hooks React

### `usePrayers`
Hook principal pour les opérations sur les prières.

**Sous-hooks inclus :**
- `usePrayerParticipants(prayerChainId)` - Participants d'une chaîne
- `usePrayerSchedule(prayerChainId)` - Horaires d'une chaîne
- `usePrayerRooms(filters)` - Salles de prière
- `usePrayerCampaigns(filters)` - Campagnes
- `usePrayerEngagements(prayerRequestId)` - Engagements

**Exemple :**
```typescript
const { participants, loading, error } = usePrayerParticipants(chainId);
```

### `usePrayerRoomSocket`
Hook pour la communication WebSocket en temps réel dans les salles.

**Props :**
```typescript
{
  roomId: string
  userId: string
  onMessage?: (message: any) => void
  onUserJoined?: (userId: string) => void
  onUserLeft?: (userId: string) => void
}
```

**Retour :**
```typescript
{
  isConnected: boolean
  sendMessage: (message: any) => void
  disconnect: () => void
}
```

**Exemple :**
```typescript
const { isConnected, sendMessage } = usePrayerRoomSocket({
  roomId: 'xxx',
  userId: 'yyy',
  onMessage: (msg) => console.log(msg)
});
```

### `useLiveKitRoom`
Hook pour la connexion LiveKit (audio/vidéo).

**Props :**
```typescript
{
  token: string
  url: string
  roomName: string
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}
```

**Retour :**
```typescript
{
  room: Room
  isConnected: boolean
  participants: Map<string, Participant>
  isMuted: boolean
  isCameraEnabled: boolean
  isScreenSharing: boolean
  toggleMicrophone: () => void
  toggleCamera: () => void
  toggleScreenShare: () => void
  leaveRoom: () => void
}
```

### `useLiveKitToken`
Hook pour récupérer les tokens LiveKit.

**Retour :**
```typescript
{
  token: string | null
  url: string | null
  loading: boolean
  error: string | null
  fetchToken: (roomName: string, participantName: string, isPublisher?: boolean) => Promise<void>
}
```

---

## Services

### Notifications (`lib/notifications/prayer.ts`)

**Types de notifications prières :**
- `PRAYER_CHAIN_INVITE` - Invitation à une chaîne
- `PRAYER_ROOM_INVITE` - Invitation à une salle
- `PRAYER_CAMPAIGN_START` - Début de campagne
- `PRAYER_SCHEDULE_REMINDER` - Rappel d'horaire
- `PRAYER_ENGAGEMENT` - Nouvel engagement
- `PRAYER_ROOM_MESSAGE` - Message dans salle
- `PRAYER_CHAIN_UPDATE` - Mise à jour de chaîne
- `PRAYER_TESTIMONY_SHARED` - Témoignage partagé

**Fonctions utilitaires :**
```typescript
notifyPrayerChainInvite(userId: string, chainId: string, inviterName: string)
notifyPrayerRoomInvite(userId: string, roomId: string, roomTitle: string)
notifyPrayerCampaignStart(churchId: string, campaignId: string, title: string)
notifyPrayerScheduleReminder(userId: string, chainId: string, hour: number)
notifyPrayerEngagement(prayerRequestId: string, type: string, userId: string)
notifyPrayerRoomMessage(roomId: string, message: string, senderId: string)
notifyPrayerChainUpdate(chainId: string, updateType: string)
notifyPrayerTestimonyShared(prayerRequestId: string, testimonyId: string)
```

### Permissions (`lib/permissions/prayer.ts`)

**Rôles :**
- `PARTICIPANT` - Participant standard
- `MODERATOR` - Modérateur (peut gérer la salle)
- `ADMIN` - Administrateur (pleins droits)

**Visibilités :**
- `PUBLIC` - Visible par tous
- `PRIVATE` - Visible uniquement par les membres
- `CHURCH_MEMBERS` - Visible par les membres de l'église

**Fonctions de vérification :**
```typescript
canViewPrayerChain(user: User, chain: PrayerChain): boolean
canEditPrayerChain(user: User, chain: PrayerChain): boolean
canDelete_prayerChain(user: User, chain: PrayerChain): boolean
canJoinPrayerRoom(user: User, room: PrayerRoom): boolean
canModeratePrayerRoom(user: User, room: PrayerRoom): boolean
canManagePrayerCampaign(user: User, campaign: PrayerCampaign): boolean
```

---

## Pages Next.js

### `/prayers/chains`
Page de gestion des chaînes de prière.

**Fonctionnalités :**
- Liste des chaînes actives
- Filtres par visibilité
- Création de nouvelles chaînes
- Rejoindre/quitter des chaînes

### `/prayers/campaigns`
Page de gestion des campagnes de prière.

**Fonctionnalités :**
- Liste des campagnes
- Filtres par statut et type
- Création de campagnes
- Association à des églises

### `/prayers/rooms`
Page de gestion des salles de prière.

**Fonctionnalités :**
- Liste des salles actives
- Filtres par type (TEXT/AUDIO/VIDEO)
- Création de salles
- Accès aux salles vidéo avec LiveKit

---

## Guide d'Utilisation

### 1. Créer une Chaîne de Prière

```typescript
// Via API
const response = await fetch('/api/prayers/chain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    title: 'Chaîne de prière quotidienne',
    description: 'Prière pour nos familles',
    prayerRequestId: 'xxx' // Optionnel
  })
});
```

### 2. Rejoindre une Chaîne

```typescript
const response = await fetch('/api/prayers/chain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'join',
    chainId: 'xxx',
    message: 'Je joins cette chaîne avec foi'
  })
});
```

### 3. Créer une Campagne de Prière

```typescript
const response = await fetch('/api/prayers/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Jeûne de 21 jours',
    description: 'Jeûne pour la guérison',
    type: 'FAST',
    startDate: '2026-08-15T00:00:00Z',
    endDate: '2026-09-05T00:00:00Z',
    churchId: 'xxx' // Optionnel
  })
});
```

### 4. Créer une Salle de Prière Vidéo

```typescript
// 1. Créer la salle
const roomResponse = await fetch('/api/prayers/rooms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Salle de prière du soir',
    roomType: 'VIDEO',
    isPublic: true,
    maxParticipants: 50
  })
});

const { room } = await roomResponse.json();

// 2. Récupérer le token LiveKit
const { token, url } = await useLiveKitToken().fetchToken(
  room.id,
  userName,
  true // isPublisher
);

// 3. Utiliser le composant vidéo
<PrayerRoomVideo
  roomId={room.id}
  roomName={room.title}
  userName={userName}
  token={token}
  url={url}
/>
```

### 5. Ajouter un Horaire d'Intercession

```typescript
const response = await fetch('/api/prayers/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prayerChainId: 'xxx',
    hour: 18, // 18h
    dayOfWeek: 2 // Mardi (0 = dimanche)
  })
});
```

### 6. S'engager sur une Demande de Prière

```typescript
const response = await fetch('/api/prayers/engagements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prayerRequestId: 'xxx',
    type: 'PRAYED' // ou 'ENCOURAGED', 'SHARED_VERSE', 'SHARED_TESTIMONY'
  })
});
```

### 7. Utiliser le WebSocket en Temps Réel

```typescript
const { isConnected, sendMessage } = usePrayerRoomSocket({
  roomId: 'xxx',
  userId: 'yyy',
  onMessage: (msg) => {
    if (msg.type === 'prayer') {
      console.log('Nouvelle prière:', msg.content);
    }
  }
});

// Envoyer un message
sendMessage({
  type: 'prayer',
  content: 'Seigneur, nous te prions pour...',
  userId: 'yyy'
});
```

---

## Configuration Requise

### Variables d'Environnement

```env
# LiveKit (pour audio/vidéo)
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# WebSocket (pour temps réel)
WEBSOCKET_URL=ws://your-websocket-server.com
```

### Dépendances

```json
{
  "livekit-client": "^1.x.x",
  "livekit-server-sdk": "^1.x.x"
}
```

---

## Migration de Base de Données

La migration est **idempotente** et peut être réappliquée sans erreur.

**Appliquer la migration :**
```bash
npx prisma migrate deploy
```

**Résoudre un échec de migration :**
```bash
npx prisma migrate resolve --applied "20260812165216_add_prayer_evolution"
```

---

## Bonnes Pratiques

### Performance
- Utiliser la pagination sur les listes (participants, engagements)
- Éviter les N+1 queries avec `select` au lieu de `include`
- Charger les données au besoin avec lazy loading

### Sécurité
- Vérifier les permissions avant chaque action
- Ne jamais exposer les tokens LiveKit côté client
- Valider les types de données côté serveur

### UX
- Mobile-first design pour tous les composants
- Feedback visuel immédiat pour les actions
- Gestion des erreurs utilisateur-friendly

---

## Support

Pour toute question ou problème, consultez :
- Le code source dans `app/api/prayers/`
- Les types dans `types/prayer.ts`
- Les composants dans `components/prayer/`
- Les hooks dans `hooks/usePrayers.ts`

---

**Version de la documentation :** 1.0  
**Dernière mise à jour :** 13 août 2026
