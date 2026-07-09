# ADR-001: ChurchFace v2 Architecture Decision Record

**Status:** Accepted
**Date:** 2026-07-06
**Context:** ChurchFace v2 Product Vision

## Context

ChurchFace évolue d'un prototype vers un produit professionnel. Cette ADR définit l'architecture stable qui servira de référence pour tout développement futur, évitant la dette technique et les refontes majeures.

## Decision

### Vision des 4 Piliers

ChurchFace est composé de quatre piliers interconnectés:

```
                 CHURCHFACE
        ┌───────────────────────┐
        │  🌍 Réseau social     │
        │  chrétien             │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │  ⛪ Pages d'église    │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │  🏛 Church OS         │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │  🎥 Church Studio     │
        └───────────────────────┘
```

## Modèle de Données

### Core Models

#### User
- **Rôles globaux:** `USER`, `ADMIN`, `SUPER_ADMIN`
- **Champs:** `id`, `email`, `password`, `name`, `image`, `bio`, `role`, `createdAt`, `suspendedAt`

#### Church
- **Identité:** `slug` (unique), `name`, `description`, `slogan`, `logo`, `coverImage`
- **Contact:** `website`, `email`, `phone`, `address`, `city`, `country`
- **Relations:** `members`, `admins`, `events`, `media`, `radios`, `lives`, `courses`, `posts`, `follows`

### Système de Permissions

#### Rôles d'Église (ChurchAdmin.role)
- `CHURCH_OWNER` - Propriétaire unique, peut transférer
- `CHURCH_ADMIN` - Administrateur, accès complet
- `CHURCH_MODERATOR` - Modérateur, gestion contenu
- `PASTOR` - Pasteur, rôle symbolique + accès modération

#### Rôles de Membre (ChurchMember.role)
- `MEMBER` - Membre actif de l'église
- `ADMIN` - Membre avec privilèges admin

#### Règles d'Accès

| Action | CHURCH_OWNER | CHURCH_ADMIN | CHURCH_MODERATOR | PASTOR | MEMBER | FOLLOWER |
|--------|--------------|--------------|------------------|--------|--------|----------|
| Gérer admins | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Transférer ownership | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Créer/éditer posts | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer posts | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gérer événements | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gérer membres | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir contenu privé | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Séparation Abonnés vs Membres

**Abonnés (ChurchFollow):**
- Relation légère, unilatérale
- Peut voir le feed public
- Reçoit notifications de publications
- Pas d'accès au contenu privé

**Membres (ChurchMember):**
- Relation forte, bilatérale (nécessite acceptation)
- Accès au contenu privé
- Participation aux événements
- Statut `isActive` pour désactivation temporaire

### Système de Contenu Unifié (Sprint 2)

#### ChurchPost comme Source Unique

Le feed de ChurchFace n'affichera que des `ChurchPost`. Les autres entités génèrent automatiquement des posts:

```typescript
// Live crée automatiquement un Post
LiveBroadcast → ChurchPost {
  generated: true,
  generatedType: "LIVE",
  generatedId: liveBroadcastId
}

// Événement crée automatiquement un Post
ChurchEvent → ChurchPost {
  generated: true,
  generatedType: "EVENT",
  generatedId: eventId
}

// Annonce crée automatiquement un Post
Announcement → ChurchPost {
  generated: true,
  generatedType: "ANNOUNCEMENT",
  generatedId: announcementId
}

// Radio peut publier un Post
Radio → ChurchPost {
  generated: true,
  generatedType: "RADIO",
  generatedId: radioId
}
```

#### Avantages
- Feed unifié et cohérent
- Interactions uniformes (likes, commentaires)
- Filtrage facile par type
- Historique conservé même si source supprimée

## Conventions de Développement

### Structure de Projet

```
app/
├── api/                    # API Routes
│   ├── auth/
│   ├── church/[slug]/
│   │   ├── owner/transfer/
│   │   ├── studio/
│   │   └── ...
│   └── ...
├── church/[slug]/
│   ├── admin/             # Dashboard Church OS
│   │   ├── events/create/
│   │   ├── members/create/
│   │   ├── posts/create/
│   │   └── ...
│   ├── live/              # Church Studio
│   ├── radio/
│   └── ...
└── ...
lib/
├── auth.ts                # NextAuth config
├── prisma.ts              # Prisma client
├── church-perms.ts        # Permissions helpers
├── jwt.ts                 # JWT utilities
└── services/              # Business logic
    ├── posts.ts
    └── events.ts
```

### Helpers de Permissions

```typescript
// lib/church-perms.ts
export async function userHasChurchRole(
  churchId: string,
  userId: string,
  roles: string[]
): Promise<boolean>

export async function requireChurchRoleOrThrow(
  churchId: string,
  userId: string,
  roles: string[]
): Promise<void>

export async function isChurchOwner(
  churchId: string,
  userId: string
): Promise<boolean>
```

### API Routes Conventions

- **Authentification:** Vérifier session avec `getServerSession(authOptions)`
- **Authorization:** Utiliser `requireChurchRoleOrThrow()` pour les actions protégées
- **Validation:** Utiliser Zod schemas dans `lib/validators/schemas.ts`
- **Erreurs:** Retourner codes HTTP appropriés (401, 403, 404, 500)

### Frontend Conventions

- **Components:** Server components par défaut, client components seulement si nécessaire
- **Styling:** TailwindCSS + shadcn/ui components
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation

## Roadmap Technique

### Sprint 1 — Fondations ✅ (En cours)

**Objectif:** Rendre les pages d'église fiables

- [x] Corriger le système OWNER / ADMIN / MEMBER
- [x] Créer automatiquement le ChurchMember du fondateur
- [x] Séparer Abonnés et Membres
- [ ] Corriger le tableau de bord (le nombre de membres ne doit plus être 0)
- [ ] Backfill owners pour églises existantes

### Sprint 2 — Système de Contenu

**Objectif:** Unifier le feed

- [ ] Chaque Live crée automatiquement un Post
- [ ] Chaque Événement crée automatiquement un Post
- [ ] Chaque Annonce crée automatiquement un Post
- [ ] La Radio peut publier un post lorsqu'une diffusion démarre
- [ ] Le feed n'affiche plus que des ChurchPost
- [ ] Migration des posts existants vers ChurchPost

### Sprint 3 — Dashboard Church OS

**Objectif:** Dashboard complet pour gestion d'église

```
🏠 Vue d'ensemble
├── Statistiques (membres, abonnés, posts, événements)
└── Activité récente

📰 Contenus
├── Publications
├── Lives
├── Événements
├── Radios
└── Brouillons

👥 Communauté
├── Membres
├── Abonnés
├── Demandes
└── Invitations

📊 Statistiques
├── Croissance
├── Engagement
└── Analytics

⚙ Paramètres
├── Profil
├── Permissions
└── Transfert ownership
```

### Sprint 4 — Gestion des Membres

**Objectif:** Transformer ChurchFace en outil de gestion d'église

- [ ] Registre des fidèles
- [ ] Nouveaux convertis
- [ ] Baptisés
- [ ] Ministères (Chorale, Musiciens, Pasteurs, Diacres, Responsables)
- [ ] Visiteurs
- [ ] Petits groupes / cellules
- [ ] Lien avec comptes ChurchFace

### Sprint 5 — Diffusion

**Objectif:** Créer un véritable Church Studio

- [ ] 🎥 Live vidéo (RTMP + WebRTC)
- [ ] 📻 Radio avec programmation
- [ ] 🎙 Podcasts
- [ ] 📹 Replays
- [ ] 📅 Programmation des diffusions

### Sprint 6 — Plateforme Sociale

**Objectif:** Ajouter progressivement des features sociales

- [ ] Messagerie
- [ ] Groupes
- [ ] Prières (déjà implémenté)
- [ ] Témoignages
- [ ] Sondages
- [ ] Collectes de dons
- [ ] Campagnes d'évangélisation

## Conséquences

### Positifs
- Architecture stable et extensible
- Séparation claire des responsabilités
- Permissions bien définies
- Feed unifié et cohérent
- Roadmap claire et priorisée

### Négatifs
- Refactor nécessaire pour aligner code existant
- Migration de données pour Sprint 2
- Courbe d'apprentissage pour nouveaux développeurs

## Références

- [Prisma Schema](../prisma/schema.prisma)
- [Church Permissions](../lib/church-perms.ts)
- [API Routes](../app/api/)
- [Sprint 1 PR](../.github/pr_descriptions/fix_church_permissions_pr.md)
