# DATABASE DRIFT REPORT
# ChurchFace - Prisma Migration Stabilization Audit
# Generated: 2026-08-06

## État Initial

### Migrations Détectées
Total migrations: 31

**Migrations chronologiques:**
- 20260522184151_init
- 20260523155712_chat_system
- 20260523193313_add_search
- 20260523195956_notifications
- 20260523200527_notifications_fixed
- 20260523212837_posts
- 20260523215400_init
- 20260524173334_full_social_system
- 20260524195201_init
- 20260526181004_new
- 20260601131218_add_user_role
- 20260612155831_add_notification_fields
- 20260612211133_add_friendship_system
- 20260616222658_add_friendship_and_user_fields
- 20260620165710_add_user_follow
- 202607040001_add_generated_fields_to_churchpost
- 20260715220000_add_user_church_relation
- 20260721_add_updatedat_to_report
- 202607250001_add_missing_stream_fields
- 202607250002_add_missing_stream_status_url
- 202607250003_repair_radio_schema
- 20260729230000_add_missing_churchlive_columns
- 20260801180000_sync_missing_live_columns
- add_deleted_at_to_radio_chat_message
- add_generated_fields_to_post
- add_missing_prayer_live_room_member
- add_pinned_at_updated_at_to_radio_chat_message
- add_post_church_relation
- add_post_likes_and_notification_read
- add_prayer_request_church_id
- add_user_permissions
- fix_churchpost_generated_column
- fix_missing_prayer_tables
- unify_playlist_models

## Analyse Schema vs Migrations

### 1. LiveBroadcast

**Schema Prisma (prisma/schema.prisma):**
```prisma
model LiveBroadcast {
  ownerType          String         @default("USER") // "USER" | "CHURCH" | "GLOBAL"
  ownerId            String?
  streamUrl          String
  status             String         @default("SCHEDULED")
  // ... autres champs
}
```

**Migrations existantes:**
- ❌ AUCUNE migration pour `ownerType`
- ❌ AUCUNE migration pour `ownerId`
- ✅ `streamUrl` existe dans la migration initiale
- ✅ `status` existe dans la migration initiale

**État:** CRITIQUE - `ownerType` et `ownerId` sont dans le schema mais pas de migration

---

### 2. ChurchLive

**Schema Prisma:**
```prisma
model ChurchLive {
  rtmpUrl            String?
  streamKey          String?  @unique
  egressId           String?
  // ... autres champs
}
```

**Migrations existantes:**
- ❌ AUCUNE migration pour `rtmpUrl`
- ❌ AUCUNE migration pour `streamKey`
- ❌ AUCUNE migration pour `egressId`

**État:** CRITIQUE - Champs de streaming manquants dans les migrations

---

### 3. PrayerRequest

**Schema Prisma:**
```prisma
model PrayerRequest {
  churchId    String?
  // ... autres champs
}
```

**Migrations existantes:**
- ✅ `add_prayer_request_church_id/migration.sql`:
  ```sql
  ALTER TABLE "PrayerRequest"
  ADD COLUMN "churchId" TEXT;
  ```

**État:** OK - Migration présente

---

### 4. PrayerLiveRoomParticipant

**Schema Prisma:**
```prisma
model PrayerLiveRoomParticipant {
  id         String   @id @default(cuid())
  roomId     String
  userId     String
  joinedAt   DateTime @default(now())
  // ...
}
```

**Migrations existantes:**
- ✅ `add_missing_prayer_live_room_member/migration.sql` crée `PrayerLiveRoomMember`
- ⚠️ Le schema a `PrayerLiveRoomParticipant` mais la migration crée `PrayerLiveRoomMember`

**État:** CONFLIT - Noms de tables différents entre schema et migration

---

### 5. User Model

**Schema Prisma:**
```prisma
model User {
  permissions                Json?   @default("{}")
  // ... autres champs
}
```

**Migrations existantes:**
- ✅ `add_user_permissions/migration.sql`:
  ```sql
  ALTER TABLE "User"
  ADD COLUMN "permissions" JSONB;
  ```

**État:** OK - Migration présente

---

### 6. ChurchMember

**Schema Prisma:**
```prisma
model ChurchMember {
  notificationPreferences Json?   @default("{}")
  // ... autres champs
}
```

**Migrations existantes:**
- ❌ AUCUNE migration pour `notificationPreferences`

**État:** CRITIQUE - Champ dans schema mais pas de migration

---

### 7. RadioChatMessage

**Schema Prisma:**
```prisma
model RadioChatMessage {
  deletedAt   DateTime?
  pinnedAt    DateTime?
  updatedAt   DateTime   @updatedAt
  // ... autres champs
}
```

**Migrations existantes:**
- ✅ `add_deleted_at_to_radio_chat_message/migration.sql`:
  ```sql
  ALTER TABLE "RadioChatMessage"
  ADD COLUMN "deletedAt" TIMESTAMP(3);
  ```
- ✅ `add_pinned_at_updated_at_to_radio_chat_message/migration.sql`

**État:** OK - Migrations présentes

---

### 8. StudioOutput

**Schema Prisma:**
```prisma
model StudioOutput {
  name          String?
  configuration Json?
  // ... autres champs
}
```

**Migrations existantes:**
- ⚠️ Non vérifié - nécessite inspection des migrations initiales

**État:** À VÉRIFIER

---

## Résumé des Divergences

### Tables Prisma sans migration correspondante

1. **LiveBroadcast.ownerType** - CRITIQUE
2. **LiveBroadcast.ownerId** - CRITIQUE
3. **ChurchLive.rtmpUrl** - CRITIQUE
4. **ChurchLive.streamKey** - CRITIQUE
5. **ChurchLive.egressId** - CRITIQUE
6. **ChurchMember.notificationPreferences** - CRITIQUE

### Conflits de noms

1. **PrayerLiveRoomParticipant** (schema) vs **PrayerLiveRoomMember** (migration) - CRITIQUE

### Champs potentiellement manquants dans la DB

Sans accès direct à la base de données PostgreSQL, l'état réel ne peut être confirmé que via:
- `prisma db pull` (INTERDIT par les règles)
- Inspection manuelle de la DB en production

## Recommandations

### Priorité 1 - Critique

1. Créer migration additive pour `LiveBroadcast.ownerType` avec DEFAULT 'USER'
2. Créer migration additive pour `LiveBroadcast.ownerId`
3. Créer migration additive pour `ChurchLive.rtmpUrl`
4. Créer migration additive pour `ChurchLive.streamKey`
5. Créer migration additive pour `ChurchLive.egressId`
6. Créer migration additive pour `ChurchMember.notificationPreferences`
7. Résoudre le conflit PrayerLiveRoomParticipant vs PrayerLiveRoomMember

### Priorité 2 - Vérification

1. Vérifier l'état réel de la DB PostgreSQL
2. Confirmer que les migrations existantes ont été appliquées
3. Identifier les colonnes DB absentes du schema

### Priorité 3 - Documentation

1. Documenter la politique de migration additive
2. Créer un guide de réparation pour les futures divergences
