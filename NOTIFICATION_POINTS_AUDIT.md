# Audit des Points de Notification - ChurchFace

## Réseau Social

### ✅ Actions avec notifications existantes

| Action | API Route | Type Notification | Destinataire | Condition |
|--------|-----------|-------------------|--------------|-----------|
| Like un post | `POST /api/likes` | `POST_LIKE` | Auteur du post | Si pas self-like |
| Commenter un post | `POST /api/comments` | `POST_COMMENT` | Auteur du post | Si pas self-comment |
| Demande d'ami | `POST /api/friends` | `FRIEND_REQUEST` | Destinataire | Toujours |
| Accepter demande d'ami | `POST /api/friends/accept` | `FRIEND_ACCEPTED` | Demandeur | Toujours |
| Prier pour une prière | `POST /api/prayers/pray` | `PRAYER_PRAY` | Auteur de la prière | Si pas self-pray |
| Répondre à une prière | `POST /api/prayers/respond` | `PRAYER_RESPONSE` | Auteur de la prière | Si pas self-response |

### ❌ Actions SANS notifications (à implémenter)

| Action | API Route | Destinataire suggéré | Priorité |
|--------|-----------|---------------------|----------|
| Follow utilisateur | `POST /api/users/[id]/follow` | Utilisateur suivi | HAUTE |
| Follow église | `POST /api/church/follow` | Église (admins) | MOYENNE |
| Créer conversation privée | `POST /api/conversations` | Autre participant | HAUTE |
| Envoyer message privé | `POST /api/conversations/[id]/messages` | Destinataire(s) | HAUTE |
| Créer story | `POST /api/stories` | Followers | MOYENNE |
| Créer post | `POST /api/posts` | Followers | MOYENNE |
| Mentionner utilisateur | (à déterminer) | Utilisateur mentionné | HAUTE |
| Taguer utilisateur dans photo | (à déterminer) | Utilisateur tagué | MOYENNE |

## Réseau d'Intercession Collaborative

### ✅ Actions avec notifications existantes

| Action | API Route | Type Notification | Destinataire | Condition |
|--------|-----------|-------------------|--------------|-----------|
| Prier pour une prière | `POST /api/prayers/pray` | `PRAYER_PRAY` | Auteur de la prière | Si pas self-pray |
| Répondre à une prière | `POST /api/prayers/respond` | `PRAYER_RESPONSE` | Auteur de la prière | Si pas self-response |

### ❌ Actions SANS notifications (à implémenter)

| Action | API Route | Destinataire suggéré | Priorité |
|--------|-----------|---------------------|----------|
| Créer prière individuelle | `POST /api/prayers` | Followers de l'église | MOYENNE |
| Créer chaîne de prière | `POST /api/prayers/chain` (action: create) | Membres de l'église | HAUTE |
| Rejoindre chaîne de prière | `POST /api/prayers/chain` (action: join) | Créateur de la chaîne | HAUTE |
| Créer campagne de prière | `POST /api/prayers/campaigns` | Membres de l'église | HAUTE |
| Rejoindre campagne de prière | `POST /api/prayers/campaigns/[id]/join` | Créateur de la campagne | HAUTE |
| Créer salle de prière live | `POST /api/prayers/rooms` | Membres de l'église | HAUTE |
| Rejoindre salle de prière live | (via bouton rejoindre) | Créateur de la salle | HAUTE |
| Salle de prière devient active | (système) | Participants | MOYENNE |
| Prière marquée comme exaucée | `PUT /api/prayers/[id]` (isAnswered) | Auteur de la prière + priants | HAUTE |
| Nouveau participant dans chaîne | (système) | Autres participants | MOYENNE |
| Message dans salle de prière | (système) | Participants de la salle | HAUTE |

## Réseau Social - Actions Spéciales

### Actions conditionnelles (à évaluer)

| Action | API Route | Condition | Notification suggérée |
|--------|-----------|-----------|----------------------|
| Unlike un post | `DELETE /api/likes` | - | Pas de notification (annulation) |
| Unfollow utilisateur | `DELETE /api/users/[id]/follow` | - | Pas de notification (annulation) |
| Rejeter demande d'ami | `POST /api/friends/reject` | - | Pas de notification (annulation) |
| Annuler demande d'ami | `POST /api/friends/cancel` | - | Pas de notification (annulation) |
| Supprimer conversation | `DELETE /api/conversations/[id]` | - | Pas de notification (annulation) |

## Priorités d'Implémentation

### 🔴 HAUTE PRIORITÉ (Engagement utilisateur)

1. **Follow utilisateur** - Essentiel pour le réseau social
2. **Messages privés** (création conversation + envoi) - Communication directe
3. **Créer/Rejoindre chaîne de prière** - Engagement collaboratif
4. **Créer/Rejoindre campagne de prière** - Engagement collaboratif
5. **Créer/Rejoindre salle de prière live** - Engagement temps réel
6. **Prière marquée comme exaucée** - Feedback important
7. **Mentions utilisateur** - Engagement social

### 🟡 MOYENNE PRIORITÉ (Engagement secondaire)

1. **Follow église** - Engagement communautaire
2. **Créer story** - Engagement temporaire
3. **Créer post** - Engagement feed
4. **Salle de prière devient active** - Notification temps réel
5. **Nouveau participant dans chaîne** - Engagement collaboratif

### 🟢 BASSE PRIORITÉ (Nice to have)

1. **Taguer utilisateur dans photo** - Engagement visuel
2. **Statistiques de prière** - Rapport d'activité

## Types de Notifications à Créer

### Réseau Social
- `USER_FOLLOW` - Un utilisateur suit un autre
- `CHURCH_FOLLOW` - Un utilisateur suit une église
- `CONVERSATION_CREATED` - Nouvelle conversation privée
- `NEW_MESSAGE` - Nouveau message privé
- `STORY_CREATED` - Nouvelle story créée
- `POST_CREATED` - Nouveau post créé
- `USER_MENTIONED` - Utilisateur mentionné
- `USER_TAGGED` - Utilisateur tagué dans photo

### Réseau Intercession
- `PRAYER_CREATED` - Nouvelle prière individuelle créée
- `PRAYER_CHAIN_CREATED` - Nouvelle chaîne de prière créée
- `PRAYER_CHAIN_JOINED` - Quelqu'un rejoint une chaîne de prière
- `PRAYER_CAMPAIGN_CREATED` - Nouvelle campagne de prière créée
- `PRAYER_CAMPAIGN_JOINED` - Quelqu'un rejoint une campagne
- `PRAYER_ROOM_CREATED` - Nouvelle salle de prière créée
- `PRAYER_ROOM_JOINED` - Quelqu'un rejoint une salle
- `PRAYER_ROOM_STARTED` - Salle de prière devient active
- `PRAYER_ANSWERED` - Prière marquée comme exaucée
- `CHAIN_NEW_PARTICIPANT` - Nouveau participant dans chaîne
- `ROOM_MESSAGE` - Message dans salle de prière

## Notes d'Implémentation

### Gestion des doublons
- Éviter les notifications pour self-actions
- Regrouper les notifications similaires (ex: plusieurs likes)
- Limiter la fréquence des notifications pour les mêmes actions

### Préférences utilisateur
- Permettre de désactiver certains types de notifications
- Offrir des options de fréquence (immédiat, digest, horaire)
- Gestion des notifications par type de relation (amis, followers, église)

### Canaux de notification
- Notifications in-app (badge, centre de notifications)
- Notifications push (mobile)
- Notifications email (optionnel)
- Notifications SMS (optionnel pour urgences)

### Performance
- Utiliser des jobs en file d'attente pour les notifications
- Mettre en cache les préférences utilisateur
- Optimiser les requêtes de base de données pour les destinataires
