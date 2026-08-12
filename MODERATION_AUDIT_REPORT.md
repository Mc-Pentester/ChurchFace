# Rapport d'Audit - Module de Modération ChurchFace

**Date :** 12 août 2026  
**Objectif :** Analyser le module existant et identifier les améliorations nécessaires pour couvrir les règles de la communauté ChurchFace

---

## 1. ARCHITECTURE ACTUELLE

### Fichiers existants

**Modèles Prisma :**
- `Report` (ligne 341-362) - Signalements utilisateurs
- `AdminLog` (ligne 364-371) - Journal des actions admin

**Types TypeScript :**
- `types/moderation.ts` - Types pour Report, AdminLog, ModerationStats, PostModerationData, etc.

**API Routes :**
- `app/api/reports/route.ts` - Création et récupération des signalements
- `app/api/reports/[id]/route.ts` - Mise à jour des signalements (RESOLVED/DISMISSED)
- `app/api/admin/moderation/stats/route.ts` - Statistiques de modération

**Composants :**
- `components/moderation/ReportButton.tsx` - Bouton de signalement UI
- `components/moderation/AdminLog.tsx` - Affichage du journal admin
- `components/mobilelive/MobileLiveModeration.tsx` - Modération pour lives mobiles

**Panneau Admin :**
- `app/admin/moderation/page.tsx` - Interface de modération avec onglets

### Modèles Prisma existants

```prisma
model Report {
  id          String    @id @default(cuid())
  reporterId  String
  targetId    String
  targetType  String    // "post" | "comment" | "story" | "user"
  reason      String    // "spam" | "harassment" | "fake_account" | "offensive" | "inappropriate" | "other"
  description String?
  status      String    @default("PENDING") // "PENDING" | "RESOLVED" | "DISMISSED"
  createdAt   DateTime  @default(now())
  resolvedAt  DateTime?
  resolvedBy  String?
  updatedAt   DateTime  @updatedAt
  reporter    User      @relation("ReportReporter", fields: [reporterId], references: [id], onDelete: Cascade)
  resolver    User?     @relation("ReportResolver", fields: [resolvedBy], references: [id])
}

model AdminLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // "approve_post" | "hide_post" | "delete_post" | "suspend_user" | etc.
  details   String?
  createdAt DateTime @default(now())
  admin     User     @relation(fields: [adminId], references: [id], onDelete: Cascade)
}
```

### Intégrations actuelles

**Points de création de contenu (SANS modération automatique) :**

1. **Posts** - `app/api/posts/route.ts` (ligne 346)
   - `prisma.post.create()` appelé directement
   - PAS d'analyse de contenu avant création

2. **Comments** - `app/api/comments/route.ts` (ligne 84)
   - `prisma.comment.create()` appelé directement
   - PAS d'analyse de contenu avant création

3. **Stories** - `app/api/stories/route.ts` (ligne 123)
   - `prisma.story.create()` appelé directement
   - PAS d'analyse de contenu avant création

4. **Messages** - `app/api/conversations/[id]/messages/route.ts`
   - `prisma.message.create()` appelé directement
   - PAS d'analyse de contenu avant création

---

## 2. CE QUI EXISTE DÉJÀ ✅

### Signalements utilisateurs
- ✅ Système de signalement fonctionnel
- ✅ Catégories basiques : spam, harassment, fake_account, offensive, inappropriate, other
- ✅ Protection contre les doublons (un utilisateur ne peut signaler le même contenu deux fois)
- ✅ Workflow de résolution : PENDING → RESOLVED/DISMISSED
- ✅ Journal des actions admin (AdminLog)

### Panneau admin
- ✅ Interface de modération avec onglets
- ✅ Statistiques en temps réel
- ✅ Actions disponibles : hide_post, delete_post, suspend_user, ban_user, etc.
- ✅ Historique des actions admin

### Actions admin disponibles
- ✅ approve_post, hide_post, delete_post, restore_post, pin_post
- ✅ hide_comment, delete_comment, restore_comment
- ✅ suspend_user, ban_user, reactivate_user
- ✅ delete_story, hide_story
- ✅ resolve_report, dismiss_report

---

## 3. CE QUI MANQUE ❌

### 3.1 Service d'analyse de contenu automatique
- ❌ **PAS de ModerationService** - Aucun service centralisé pour analyser le contenu
- ❌ **PAS d'analyse de texte** - Aucune détection d'insultes, menaces, harcèlement
- ❌ **PAS de scoring** - Aucun système de score (0-100) pour évaluer la gravité
- ❌ **PAS d'intégration avant création** - Le contenu est créé SANS analyse

### 3.2 Catégories de signalement incomplètes
Catégories actuelles : spam, harassment, fake_account, offensive, inappropriate, other

**Catégories manquantes pour ChurchFace :**
- ❌ INSULT - Insultes directes
- ❌ PROFANITY - Grossièretés, jurons
- ❌ SEXUAL_CONTENT - Contenu sexuel explicite
- ❌ PORNOGRAPHY - Pornographie
- ❌ VIOLENCE - Violence
- ❌ THREAT - Menaces
- ❌ HATE - Haine, discrimination
- ❌ HARASSMENT (existe mais peut être affiné)

### 3.3 Analyse de texte avancée
- ❌ **PAS de détection d'insultes directes**
- ❌ **PAS de détection d'attaques personnelles**
- ❌ **PAS de détection de variantes masquées** (s.a.l.e, s@le, s***)
- ❌ **PAS de détection de menaces** ("je vais te tuer", "je vais te faire du mal")
- ❌ **PAS de détection de harcèlement répétitif**
- ❌ **PAS d'analyse contextuelle**

### 3.4 Système de score
- ❌ **PAS de ModerationScore** (0-100)
- ❌ **PAS de catégories de score** : APPROVED (0-30), MONITOR (30-60), REVIEW (60-80), BLOCK (80-100)
- ❌ **PAS de prise en compte de la gravité**
- ❌ **PAS de prise en compte de la répétition**
- ❌ **PAS de prise en compte de l'historique utilisateur**

### 3.5 Historique utilisateur
- ❌ **PAS de système d'avertissements**
- ❌ **PAS de suivi des violations répétées**
- ❌ **PAS de niveau de confiance utilisateur**
- ❌ **PAS de surveillance automatique des utilisateurs à risque**

### 3.6 Modération multimédia
- ❌ **PAS d'analyse d'images** (nudité, pornographie, violence, armes)
- ❌ **PAS d'analyse de vidéos** (extraction frames, transcription audio)
- ❌ **PAS d'interface extensible** pour intégration future IA

### 3.7 Intégration avant création
**Flux actuel :**
```
Utilisateur publie → Sauvegarde directe → (Si problème) → Signalement utilisateur
```

**Flux attendu :**
```
Utilisateur publie → ModerationService.analyze() → Décision → Sauvegarde ou blocage
```

---

## 4. RISQUES ACTUELS ⚠️

### Risques élevés
1. **Contenu non filtré** - Les posts, commentaires, stories et messages sont créés sans aucune analyse
2. **Dépendance totale sur les signalements** - Si personne ne signale, le contenu inapproprié reste visible
3. **Pas de détection automatique** - Aucune protection contre les insultes, menaces, harcèlement
4. **Pas de scoring** - Impossible de prioriser la modération automatiquement
5. **Pas d'historique utilisateur** - Impossible de détecter les récidivistes

### Risques moyens
1. **Catégories de signalement limitées** - Les utilisateurs ne peuvent pas signaler précisément certains types de contenu
2. **Pas de modération multimédia** - Les images et vidéos ne sont pas analysées
3. **Pas de contexte** - L'analyse est basée uniquement sur les signalements manuels

---

## 5. RECOMMANDATIONS PRIORITAIRES

### Priorité CRITIQUE 🔴
1. **Créer ModerationService** - Service centralisé pour l'analyse de contenu
2. **Intégrer avant création** - Appeler ModerationService.analyze() avant Post.create(), Comment.create(), Story.create()
3. **Ajouter système de score** - ModerationScore (0-100) avec catégories
4. **Renforcer catégories de signalement** - Ajouter INSULT, PROFANITY, SEXUAL_CONTENT, PORNOGRAPHY, VIOLENCE, THREAT, HATE

### Priorité HAUTE 🟡
5. **Analyse de texte avancée** - Insultes, menaces, harcèlement, variantes masquées
6. **Historique utilisateur** - Avertissements, violations, niveau de confiance
7. **Architecture multimédia** - Interfaces extensibles pour images/vidéos

### Priorité MOYENNE 🟢
8. **Améliorer panneau admin** - Liste des contenus suspects, score IA, actions enrichies
9. **Tests** - Tests unitaires pour le service de modération
10. **Monitoring** - Dashboard de surveillance automatique

---

## 6. PLAN D'ACTION PROPOSÉ

### Phase 1 : Fondation (CRITIQUE)
1. Créer `lib/moderation/ModerationService.ts`
2. Ajouter modèle Prisma `ModerationScore` (si nécessaire)
3. Créer middleware/intégration avant création
4. Étendre les catégories de signalement

### Phase 2 : Analyse texte (HAUTE)
5. Implémenter l'analyse de texte avancée
6. Ajouter détection de variantes masquées
7. Ajouter détection de menaces et harcèlement
8. Implémenter le système de score

### Phase 3 : Historique utilisateur (MOYENNE)
9. Créer système d'avertissements
10. Implémenter le niveau de confiance utilisateur
11. Ajouter surveillance automatique des récidivistes

### Phase 4 : Multimédia (MOYENNE)
12. Créer interfaces pour analyse d'images
13. Créer interfaces pour analyse de vidéos
14. Préparer l'intégration future IA

### Phase 5 : Admin & Tests (MOYENNE)
15. Améliorer le panneau admin
16. Créer tests unitaires
17. Vérification finale (prisma generate, lint, build)

---

## 7. CONTRAINTES

**À NE PAS modifier :**
- ❌ Migrations Prisma existantes
- ❌ Socket.IO
- ❌ LiveKit
- ❌ Radio Studio
- ❌ Authentification
- ❌ Logique métier existante

**À respecter :**
- ✅ Ne pas créer un nouveau module (renforcer l'existant)
- ✅ Ne pas dupliquer les fonctionnalités
- ✌ Ne pas imposer un fournisseur IA spécifique
- ✅ Créer des interfaces extensibles

---

## 8. CONCLUSION

Le module de modération actuel de ChurchFace est **fonctionnel mais incomplet**. Il dispose d'un bon système de signalement utilisateur et d'un panneau admin, mais manque **critiquement** d'automatisation.

**Points forts :**
- Système de signalement robuste
- Journal des actions admin
- Interface admin fonctionnelle

**Points critiques à améliorer :**
- PAS d'analyse automatique de contenu
- PAS d'intégration avant création
- PAS de système de score
- Catégories de signalement limitées
- PAS d'historique utilisateur

**Recommandation immédiate :** Prioriser la création du ModerationService et l'intégration avant création pour protéger la plateforme contre le contenu inapproprié de manière proactive plutôt que réactive.
