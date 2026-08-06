# MISSING FEATURE FIELD REPORT
# ChurchFace - Prisma Migration Stabilization Audit
# Generated: 2026-08-06

## Contexte

Ce rapport documente le champ `notificationPreferences` qui a été ajouté au modèle `ChurchMember` dans le schema Prisma mais qui semble appartenir à une ancienne évolution de fonctionnalité.

## Analyse

### Champ: ChurchMember.notificationPreferences

**Schema Prisma (prisma/schema.prisma):**
```prisma
model ChurchMember {
  notificationPreferences Json?   @default("{}")
  // ... autres champs
}
```

**Migrations existantes:**
- ❌ AUCUNE migration pour `notificationPreferences`

**État:** CRITIQUE - Champ dans schema mais pas de migration

## Historique du Champ

Le champ `notificationPreferences` a été ajouté dans le cadre de l'implémentation du feature "Mobile Live Instantané" pour permettre:
- Filtrage des notifications de live selon les préférences des membres d'église
- Contrôle granulaire des notifications par utilisateur

## Recommandation

### Option 1: Conserver le champ (RECOMMANDÉ)

**Justification:**
- Le champ est fonctionnel et utilisé par le feature Mobile Live
- Permet une meilleure expérience utilisateur
- Les préférences de notification sont une fonctionnalité standard

**Action requise:**
- ✅ Migration créée: `20260806113317_repair_churchmember_notification_preferences`
- Appliquer la migration sur la base de données

### Option 2: Supprimer le champ

**Justification:**
- Si la fonctionnalité n'est pas activée en production
- Si le champ n'est pas utilisé

**Action requise:**
- Supprimer du schema Prisma
- Supprimer du code utilisant ce champ
- Aucune migration nécessaire

## Décision

**DECISION: CONSERVER LE CHAMP**

Le champ `notificationPreferences` est une fonctionnalité légitime qui améliore l'expérience utilisateur. Il a été implémenté dans le cadre du feature Mobile Live et est utilisé pour filtrer les notifications.

## Migration Créée

Une migration additive a été créée pour ajouter ce champ de manière sécurisée:

**Fichier:** `prisma/migrations/20260806113317_repair_churchmember_notification_preferences/migration.sql`

```sql
DO $$
BEGIN
    -- Add notificationPreferences column if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ChurchMember'
        AND column_name = 'notificationPreferences'
    ) THEN
        ALTER TABLE "ChurchMember"
        ADD COLUMN "notificationPreferences" JSONB DEFAULT '{}';
        
        -- Set existing records to empty JSON object
        UPDATE "ChurchMember"
        SET "notificationPreferences" = '{}'::jsonb
        WHERE "notificationPreferences" IS NULL;
    END IF;
END $$;
```

## Impact

**Aucun impact négatif:**
- Migration additive (IF NOT EXISTS)
- Valeur par défaut: `{}`
- Réversible (peut être supprimé si nécessaire)
- Compatible avec les données existantes

## Conclusion

Le champ `notificationPreferences` est conservé et une migration de réparation a été créée pour l'ajouter de manière sécurisée à la base de données.
