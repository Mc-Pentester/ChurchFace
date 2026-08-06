# DATABASE RUNTIME DRIFT REPORT
# ChurchFace - Prisma Production Schema Drift Analysis
# Generated: 2026-08-06

## Contexte

**Erreur Runtime P2022 détectée:**
- `LiveBroadcast.replayUrl does not exist`
- `ChurchLive.webrtcUrl does not exist`
- `LiveBroadcast.ownerType does not exist`

**Commande `npx prisma migrate status`:**
- Database schema is up to date

**Problème:** Les migrations existent mais les colonnes ne sont pas dans PostgreSQL.

---

## Analyse Schema Prisma vs PostgreSQL

### MODEL: LiveBroadcast

| FIELD | TYPE | PRESENT IN PRISMA | PRESENT IN DATABASE | ACTION REQUIRED |
|-------|------|-------------------|---------------------|-----------------|
| ownerType | String @default("USER") | ✅ YES | ❌ NO | ADD COLUMN |
| ownerId | String? | ✅ YES | ❌ NO | ADD COLUMN |
| replayUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| webrtcUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| streamId | String? @unique | ✅ YES | ❌ NO | ADD COLUMN |
| streamKey | String? @unique | ✅ YES | ❌ NO | ADD COLUMN |
| ingestUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| playbackUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| rtmpsUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| livekitRoom | String? | ✅ YES | ❌ NO | ADD COLUMN |
| livekitToken | String? | ✅ YES | ❌ NO | ADD COLUMN |
| relayEnabled | Boolean @default(false) | ✅ YES | ❌ NO | ADD COLUMN |
| relayStatus | String @default("DISABLED") | ✅ YES | ❌ NO | ADD COLUMN |
| encoder | String? | ✅ YES | ❌ NO | ADD COLUMN |
| ingestProtocol | String? @default("RTMP") | ✅ YES | ❌ NO | ADD COLUMN |
| playbackProtocol | String? @default("WEBRTC") | ✅ YES | ❌ NO | ADD COLUMN |
| heartbeatAt | DateTime? | ✅ YES | ❌ NO | ADD COLUMN |
| ingestStatus | String? @default("OFFLINE") | ✅ YES | ❌ NO | ADD COLUMN |
| duration | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| peakViewerCount | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| bitrate | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| bandwidth | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| packetLoss | Float? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| droppedFrames | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| cpuUsage | Float? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| recordingEnabled | Boolean @default(false) | ✅ YES | ❌ NO | ADD COLUMN |
| recordingUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| recordingStatus | String? @default("STOPPED") | ✅ YES | ❌ NO | ADD COLUMN |

**Total LiveBroadcast fields missing:** 27

---

### MODEL: ChurchLive

| FIELD | TYPE | PRESENT IN PRISMA | PRESENT IN DATABASE | ACTION REQUIRED |
|-------|------|-------------------|---------------------|-----------------|
| rtmpUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| streamMode | String? | ✅ YES | ❌ NO | ADD COLUMN |
| webrtcUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| outputDestinations | Json? | ✅ YES | ❌ NO | ADD COLUMN |
| studioConfig | Json? | ✅ YES | ❌ NO | ADD COLUMN |
| playUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| streamId | String? @unique | ✅ YES | ❌ NO | ADD COLUMN |
| streamKey | String? @unique | ✅ YES | ❌ NO | ADD COLUMN |
| ingestUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| playbackUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| rtmpsUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| livekitRoom | String? | ✅ YES | ❌ NO | ADD COLUMN |
| livekitToken | String? | ✅ YES | ❌ NO | ADD COLUMN |
| relayEnabled | Boolean @default(false) | ✅ YES | ❌ NO | ADD COLUMN |
| relayStatus | String @default("DISABLED") | ✅ YES | ❌ NO | ADD COLUMN |
| encoder | String? | ✅ YES | ❌ NO | ADD COLUMN |
| ingestProtocol | String? @default("RTMP") | ✅ YES | ❌ NO | ADD COLUMN |
| playbackProtocol | String? @default("WEBRTC") | ✅ YES | ❌ NO | ADD COLUMN |
| heartbeatAt | DateTime? | ✅ YES | ❌ NO | ADD COLUMN |
| ingestStatus | String? @default("OFFLINE") | ✅ YES | ❌ NO | ADD COLUMN |
| duration | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| peakViewerCount | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| bitrate | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| bandwidth | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| packetLoss | Float? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| droppedFrames | Int? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| cpuUsage | Float? @default(0) | ✅ YES | ❌ NO | ADD COLUMN |
| recordingEnabled | Boolean @default(false) | ✅ YES | ❌ NO | ADD COLUMN |
| recordingUrl | String? | ✅ YES | ❌ NO | ADD COLUMN |
| recordingStatus | String? @default("STOPPED") | ✅ YES | ❌ NO | ADD COLUMN |

**Total ChurchLive fields missing:** 30

---

### MODEL: User

| FIELD | TYPE | PRESENT IN PRISMA | PRESENT IN DATABASE | ACTION REQUIRED |
|-------|------|-------------------|---------------------|-----------------|
| permissions | Json? @default("{}") | ✅ YES | ✅ YES | OK (migration exists) |

**Total User fields missing:** 0

---

### MODEL: ChurchMember

| FIELD | TYPE | PRESENT IN PRISMA | PRESENT IN DATABASE | ACTION REQUIRED |
|-------|------|-------------------|---------------------|-----------------|
| notificationPreferences | Json? @default("{}") | ✅ YES | ❌ NO | ADD COLUMN |

**Total ChurchMember fields missing:** 1

---

### MODEL: PrayerLiveRoomParticipant

| FIELD | TYPE | PRESENT IN PRISMA | PRESENT IN DATABASE | ACTION REQUIRED |
|-------|------|-------------------|---------------------|-----------------|
| id | String @id @default(cuid()) | ✅ YES | ❌ NO | CREATE TABLE |
| roomId | String | ✅ YES | ❌ NO | CREATE TABLE |
| userId | String | ✅ YES | ❌ NO | CREATE TABLE |
| joinedAt | DateTime @default(now()) | ✅ YES | ❌ NO | CREATE TABLE |

**Total PrayerLiveRoomParticipant fields missing:** 4 (entire table)

---

## Résumé

**Total fields missing across all models:** 62

**Breakdown:**
- LiveBroadcast: 27 fields
- ChurchLive: 30 fields
- ChurchMember: 1 field
- PrayerLiveRoomParticipant: 4 fields (entire table)

**Root Cause:**
Les champs de streaming avancés (LiveKit, WebRTC, monitoring, recording) ont été ajoutés au schema Prisma mais n'ont jamais été migrés vers PostgreSQL. Les migrations existantes ne couvrent que les champs de base.

**Impact:**
- Erreurs P2022 en production
- Fonctionnalités Mobile Live non fonctionnelles
- Studio Live inaccessible
- Monitoring et recording désactivés

---

## Recommandations

### Priorité 1 - Critique (Runtime Errors)

1. **LiveBroadcast.replayUrl** - Erreur P2022 en production
2. **LiveBroadcast.ownerType** - Erreur P2022 en production
3. **ChurchLive.webrtcUrl** - Erreur P2022 en production

### Priorité 2 - Fonctionnalités Mobile Live

4. **LiveBroadcast.streamId, streamKey, ingestUrl, playbackUrl**
5. **ChurchLive.streamId, streamKey, ingestUrl, playbackUrl**
6. **LiveBroadcast.livekitRoom, livekitToken**
7. **ChurchLive.livekitRoom, livekitToken**

### Priorité 3 - Monitoring et Recording

8. **LiveBroadcast.monitoring fields** (heartbeatAt, ingestStatus, duration, etc.)
9. **ChurchLive.monitoring fields** (heartbeatAt, ingestStatus, duration, etc.)
10. **LiveBroadcast.recording fields** (recordingEnabled, recordingUrl, recordingStatus)
11. **ChurchLive.recording fields** (recordingEnabled, recordingUrl, recordingStatus)

### Priorité 4 - Compléter

12. **ChurchMember.notificationPreferences**
13. **PrayerLiveRoomParticipant table**

---

## Migration Requise

Une migration additive unique est nécessaire pour ajouter tous les champs manquants:

**Fichier:** `prisma/migrations/20260806_repair_all_runtime_columns/migration.sql`

**Approche:**
- Utiliser `ALTER TABLE ADD COLUMN IF NOT EXISTS` pour chaque champ
- Utiliser `CREATE TABLE IF NOT EXISTS` pour PrayerLiveRoomParticipant
- Migration idempotente (peut être exécutée plusieurs fois)
- Valeurs par défaut sécurisées
- Indexes uniques pour streamId et streamKey
