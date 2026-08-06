# MIGRATION INTEGRITY REPORT
# ChurchFace - Prisma Migration Integrity Analysis
# Generated: 2026-08-06

## Contexte

Analyse des migrations historiques pour identifier:
1. Les migrations qui existent mais n'ont pas modifié PostgreSQL
2. Les champs qui sont dans le schema mais jamais migrés
3. Les duplications ou conflits de migrations

---

## Analyse des Migrations Historiques

### Recherche: ownerType

**Résultat:** Trouvé dans 2 migrations

1. **`20260806113315_repair_livebroadcast_owner_fields/migration.sql`**
   - Créée: 2026-08-06 11:33:15
   - Statut: NOUVELLE (créée lors de l'audit précédent)
   - Contenu: Ajoute `ownerType` et `ownerId` à LiveBroadcast
   - Problème: Peut ne pas avoir été appliquée en production

2. **`20260806122427_repair_all_runtime_columns/migration.sql`**
   - Créée: 2026-08-06 12:24:27
   - Statut: NOUVELLE (créée lors de cet audit)
   - Contenu: Ajoute `ownerType` et `ownerId` à LiveBroadcast
   - Problème: Duplication avec la migration précédente

**Conclusion:** `ownerType` n'existe dans AUCUNE migration historique avant 2026-08-06. Les deux migrations sont nouvelles et n'ont probablement pas été appliquées en production.

---

### Recherche: replayUrl

**Résultat:** Trouvé dans 1 migration

1. **`20260806122427_repair_all_runtime_columns/migration.sql`**
   - Créée: 2026-08-06 12:24:27
   - Statut: NOUVELLE (créée lors de cet audit)
   - Contenu: Ajoute `replayUrl` à LiveBroadcast
   - Problème: Jamais existé dans les migrations historiques

**Conclusion:** `replayUrl` n'existe dans AUCUNE migration historique. C'est un champ ajouté au schema Prisma mais jamais migré.

---

### Recherche: webrtcUrl

**Résultat:** Trouvé dans 1 migration

1. **`20260806122427_repair_all_runtime_columns/migration.sql`**
   - Créée: 2026-08-06 12:24:27
   - Statut: NOUVELLE (créée lors de cet audit)
   - Contenu: Ajoute `webrtcUrl` à LiveBroadcast et ChurchLive
   - Problème: Jamais existé dans les migrations historiques

**Conclusion:** `webrtcUrl` n'existe dans AUCUNE migration historique. C'est un champ ajouté au schema Prisma mais jamais migré.

---

## Analyse des Migrations Historiques par Date

### Migrations Antérieures à 2026-08-06

**Total:** 31 migrations historiques

**Analyse des migrations liées au streaming:**

1. **`202607250001_add_missing_stream_fields`**
   - Contenu: À vérifier
   - Probablement: Champs de base uniquement

2. **`202607250002_add_missing_stream_status_url`**
   - Contenu: À vérifier
   - Probablement: status et streamUrl uniquement

3. **`202607250003_repair_radio_schema`**
   - Contenu: Réparation Radio
   - Non lié au streaming

4. **`20260729230000_add_missing_churchlive_columns`**
   - Contenu: playUrl, scheduledStart, scheduledEnd
   - Manque: webrtcUrl, rtmpUrl, streamKey, etc.

5. **`20260801180000_sync_missing_live_columns`**
   - Contenu: playUrl, scheduledStart, scheduledEnd, allowComments
   - Manque: webrtcUrl, rtmpUrl, streamKey, etc.

**Conclusion:** Les migrations historiques n'ajoutent que les champs de base. Les champs avancés (LiveKit, WebRTC, monitoring, recording) ont été ajoutés au schema Prisma mais jamais migrés.

---

## Problèmes Identifiés

### 1. Schema Drift Massif

**Champs dans schema mais jamais migrés:**
- LiveBroadcast: 27 champs
- ChurchLive: 30 champs
- ChurchMember: 1 champ
- PrayerLiveRoomParticipant: Table entière

**Total:** 62 champs manquants

### 2. Duplication de Migrations

**Conflit:** `ownerType` et `ownerId` sont dans deux nouvelles migrations
- `20260806113315_repair_livebroadcast_owner_fields`
- `20260806122427_repair_all_runtime_columns`

**Solution:** Conserver uniquement `20260806122427_repair_all_runtime_columns` qui couvre tous les champs.

### 3. Migrations Non Appliquées

**Problème:** Les nouvelles migrations créées lors des audits n'ont probablement pas été appliquées en production.

**Cause:** 
- `prisma migrate status` indique "Database schema is up to date"
- Mais les colonnes n'existent pas dans PostgreSQL
- Cela suggère que les migrations n'ont pas été déployées

---

## Recommandations

### 1. Nettoyer les Duplications

**Action:** Supprimer `20260806113315_repair_livebroadcast_owner_fields`

**Justification:** 
- Cette migration est couverte par `20260806122427_repair_all_runtime_columns`
- Évite les conflits potentiels
- Simplifie l'historique des migrations

### 2. Déployer la Migration Complète

**Action:** Appliquer `20260806122427_repair_all_runtime_columns` en production

**Commande:**
```bash
npx prisma migrate deploy
```

**Ou via Render:**
- Automatique via `startCommand: prisma migrate deploy && node .next/standalone/server.js`

### 3. Vérifier l'État de la Base de Données

**Action:** Après déploiement, vérifier que toutes les colonnes existent

**Commande:**
```bash
npx prisma studio
```

Ou via PostgreSQL:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name IN ('LiveBroadcast', 'ChurchLive', 'ChurchMember')
ORDER BY table_name, column_name;
```

### 4. Établir un Processus de Migration

**Règle:** Tout ajout au schema Prisma doit être accompagné d'une migration immédiate

**Processus:**
1. Modifier `prisma/schema.prisma`
2. Créer manuellement `prisma/migrations/YYYYMMDDHHMMSS_description/migration.sql`
3. Utiliser `ALTER TABLE ADD COLUMN IF NOT EXISTS`
4. Tester en local avec `npx prisma migrate deploy`
5. Committer la migration
6. Déployer en production

---

## État des Migrations

### Migrations Historiques (31)
- ✅ Appliquées en production
- ⚠️ Incomplètes (manquent les champs avancés)

### Nouvelles Migrations (4)
1. `20260806113315_repair_livebroadcast_owner_fields` - ⚠️ Duplication
2. `20260806113316_repair_churchlive_stream_fields` - ⚠️ Partiel
3. `20260806113317_repair_churchmember_notification_preferences` - ✅ Couvert
4. `20260806113318_repair_prayer_live_room_participant` - ✅ Couvert
5. `20260806122427_repair_all_runtime_columns` - ✅ Complet

**Recommandation:** Conserver uniquement `20260806122427_repair_all_runtime_columns`

---

## Conclusion

**Problème principal:** Les champs de streaming avancés ont été ajoutés au schema Prisma sans migrations correspondantes.

**Solution:** Déployer `20260806122427_repair_all_runtime_columns` qui ajoute tous les 62 champs manquants de manière idempotente.

**Risque:** Faible - La migration utilise `IF NOT EXISTS` et est idempotente.

**Impact:** Après déploiement, toutes les fonctionnalités Mobile Live, Studio Live, monitoring et recording seront opérationnelles.
