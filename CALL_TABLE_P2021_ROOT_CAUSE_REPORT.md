# CALL TABLE P2021 — ROOT CAUSE REPORT

**Date:** 27 août 2026  
**Erreur:** Prisma P2021 - The table `public.Call` does not exist in the current database

---

## A. Base réellement utilisée

**Configuration:**
- Provider: PostgreSQL
- URL: `env("DATABASE_URL")` (défini dans .env)
- Le fichier .env est protégé par .gitignore et n'a pas pu être inspecté

---

## B. Prisma

**model Call :** ✅ PRÉSENT

**Structure (lignes 956-971):**
```prisma
model Call {
  id           String            @id @default(cuid())
  callerId     String
  recipientId  String
  callType     String // "audio" or "video"
  status       String // "incoming", "ringing", "connected", "ended", "missed"
  startedAt    DateTime          @default(now())
  endedAt      DateTime?
  caller       User              @relation("CallCaller", fields: [callerId], references: [id], onDelete: Cascade)
  recipient    User              @relation("CallRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  participants CallParticipant[]

  @@index([callerId])
  @@index([recipientId])
  @@index([status])
}
```

**model CallParticipant :** ✅ PRÉSENT

**Structure (lignes 973-985):**
```prisma
model CallParticipant {
  id       String    @id @default(cuid())
  callId   String
  userId   String
  joinedAt DateTime  @default(now())
  leftAt   DateTime?
  call     Call      @relation(fields: [callId], references: [id], onDelete: Cascade)
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([callId, userId])
  @@index([callId])
  @@index([userId])
}
```

**Relations User ↔ Call:**
- `callsMade` → `Call[]` @relation("CallCaller")
- `callsReceived` → `Call[]` @relation("CallRecipient")
- `callParticipants` → `CallParticipant[]`

---

## C. Migration créant Call

**Migration :** ❌ AUCUNE

**Recherche effectuée:**
- Grep sur `prisma/migrations/` pour `CREATE TABLE.*Call` → 0 résultats
- Grep sur `prisma/migrations/` pour `CREATE TABLE.*CallParticipant` → 0 résultats
- Grep sur `prisma/migrations/` pour `Call` → 0 résultats
- Grep sur `prisma/migrations/` pour `call` → 0 résultats

**Liste des migrations existantes (44 migrations):**
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
- 20260806100000_make_stream_url_optional
- 20260806113315_repair_livebroadcast_owner_fields
- 20260806113316_repair_churchlive_stream_fields
- 20260806113317_repair_churchmember_notification_preferences
- 20260806113318_repair_prayer_live_room_participant
- 20260806122427_repair_all_runtime_columns
- 20260806150000_add_profile_social_system
- 20260806155745_add_broadcast_hub
- 20260807130000_add_missing_studio_tables
- 20260810122512_add_missing_studio_tables
- 20260810130000_add_user_cover_image
- 20260812110000_add_postmedia
- 20260812165216_add_prayer_evolution
- 20260813160000_add_training_module
- 20260814140000_repair_missing_studio_prayer_tables
- 20260814150000_add_prayer_model_relations
- 20260814160000_add_prayer_chain_visibility
- 20260814170000_add_prayer_chain_campaign_relation
- 20260814180000_add_campaign_room_relation
- 20260814190000_add_unified_prayer_model
- 20260819125337_add_notification_read_at_and_index
- 20260819200000_add_prayer_campaign_chain_many_to_many_and_lifecycle
- 20260822153918_add_prayer_campaign_id_to_prayer_request
- add_deleted_at_to_radio_chat_message
- add_generated_fields_to_post
- add_missing_prayer_live_room_member
- add_pinned_at_updated_at_to_radio_chat_message
- add_post_church_relation
- add_post_likes_and_notification_read
- add_prayer_request_church_id
- add_schedule_to_church
- add_user_permissions
- fix_churchpost_generated_column
- fix_missing_prayer_tables
- unify_playlist_models

**Aucune migration ne crée Call ou CallParticipant.**

---

## D. _prisma_migrations

**Statut:** Non inspecté (requiert accès direct PostgreSQL)

**Note:** Étant donné qu'aucune migration ne contient `CREATE TABLE Call`, il est impossible qu'une migration soit enregistrée comme appliquée pour Call.

---

## E. PostgreSQL

**public."Call" :** ❌ MISSING (confirmé par erreur P2021)

**public."CallParticipant" :** ❌ MISSING (probable, si Call n'existe pas)

---

## F. Divergence

**Tableau de cohérence:**

| Élément | Prisma | Migration | DB | Statut |
|---------|--------|-----------|-----|--------|
| Call | ✅ présent | ❌ absent | ❌ absent | ❌ DIVERGENCE |
| CallParticipant | ✅ présent | ❌ absent | ❌ absent | ❌ DIVERGENCE |

**Pourquoi Prisma indique "Database schema is up to date":**

Prisma compare le schema.prisma avec les migrations appliquées (_prisma_migrations), pas avec la structure physique de la base de données.

Si:
1. Le modèle Call existe dans schema.prisma
2. Aucune migration ne crée Call
3. Prisma considère que le schema est "à jour" car il n'y a pas de migrations en attente

Alors Prisma ne détecte pas que la table manque physiquement.

**Cependant**, lors de l'exécution de `prisma.call.create()`, Prisma tente d'insérer dans `public.Call`, qui n'existe pas, provoquant l'erreur P2021.

---

## G. Cause racine

**CAUSE RACINE:**

Le modèle `Call` et `CallParticipant` ont été ajoutés à `prisma/schema.prisma` **sans créer de migration correspondante**.

**Chronologie probable:**
1. Le développeur a ajouté manuellement les modèles Call et CallParticipant au schema.prisma
2. Le développeur n'a pas exécuté `npx prisma migrate dev --name add_calls`
3. Le développeur a peut-être exécuté `npx prisma generate` pour générer le client
4. Le code utilise `prisma.call.create()` qui échoue car la table n'existe pas

**Preuves:**
- Modèles présents dans schema.prisma (lignes 956-985)
- Aucune migration ne contient `CREATE TABLE Call`
- Aucune migration ne contient le mot "Call" ou "call"
- Erreur P2021 confirme que la table n'existe pas physiquement

---

## H. Correction minimale recommandée

**NE PAS exécuter immédiatement.**

**Option 1: Créer une migration (RECOMMANDÉ)**

```bash
npx prisma migrate dev --name add_call_tables
```

Cette commande va:
1. Détecter la différence entre schema.prisma et la base de données
2. Générer une migration SQL pour créer Call et CallParticipant
3. Appliquer la migration à la base de données
4. Mettre à jour _prisma_migrations

**Option 2: db push (NON RECOMMANDÉ)**

```bash
npx prisma db push
```

Cette commande va:
1. Synchroniser le schema.prisma directement avec la base de données
2. Créer les tables sans migration
3. **DANGER:** Ne crée pas de migration, donc l'historique est perdu
4. **DANGER:** Si l'environnement de production a une structure différente, cela peut causer des problèmes

**Option 3: Supprimer les modèles du schema (SI Call n'est pas utilisé)**

Si les modèles Call et CallParticipant ne sont pas nécessaires:
1. Supprimer les modèles de schema.prisma
2. Exécuter `npx prisma generate`

**Note:** Cette option n'est PAS applicable car Call est utilisé dans le code (app/api/calls/route.ts).

---

## I. Risques

**Option 1 (migrate dev):**
- ✅ Crée un historique de migration
- ✅ Peut être réversible
- ✅ Peut être appliquée en production
- ⚠️ Nécessite de vérifier que la migration SQL est correcte
- ⚠️ Peut affecter d'autres tables si des relations sont modifiées

**Option 2 (db push):**
- ❌ Pas d'historique de migration
- ❌ Difficile à synchroniser avec d'autres environnements
- ❌ Risque de divergence entre dev et prod
- ⚠️ Rapide pour le développement local

**Option 3 (suppression):**
- ❌ Casserait le code existant (app/api/calls/route.ts)
- ❌ N'est pas une option viable

---

## J. Commandes à exécuter ensuite

**1. Créer la migration (RECOMMANDÉ):**

```bash
npx prisma migrate dev --name add_call_tables
```

**2. Vérifier la migration générée:**

Inspecter le fichier SQL généré dans `prisma/migrations/XXXXXX_add_call_tables/migration.sql`

**3. Appliquer la migration:**

La commande `migrate dev` appliquera automatiquement la migration.

**4. Vérifier le statut:**

```bash
npx prisma migrate status
```

**5. Régénérer le client:**

```bash
npx prisma generate
```

**6. Tester:**

Tenter de créer un appel via l'API pour confirmer que la table existe.

---

## K. Conclusion

**Problème:** Les modèles Call et CallParticipant existent dans schema.prisma mais aucune migration ne crée les tables correspondantes dans PostgreSQL.

**Cause:** Ajout manuel des modèles au schema sans exécution de `prisma migrate dev`.

**Solution:** Exécuter `npx prisma migrate dev --name add_call_tables` pour créer et appliquer la migration manquante.

**Statut:** Audit terminé, correction identifiée mais non exécutée (conformément aux instructions).

---

**FIN DU RAPPORT**
