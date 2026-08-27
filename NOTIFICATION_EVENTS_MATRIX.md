# MATRICE OFFICIELLE DES ÉVÉNEMENTS DE NOTIFICATION CHURCHFACE

## LÉGENDE
- ✅ **Implémenté** avec createNotification()
- ⚠️ **Partiellement implémenté** (contournement ou incomplet)
- ❌ **Non implémenté**
- 🔄 **À corriger** (contournement identifié)

---

## A. AMITIÉ / RELATIONS

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| FRIEND_REQUEST | Social | POST /api/friends/request | Utilisateur demandé | FRIEND_REQUEST | "X vous a envoyé une demande d'amitié" | ✅ | ✅ | ✅ | ✅ |
| FRIEND_ACCEPTED | Social | POST /api/friends/accept | Utilisateur ayant envoyé la demande | FRIEND_ACCEPTED | "X a accepté votre demande d'amitié" | ✅ | ✅ | ✅ | ✅ |
| USER_FOLLOWED | Social | POST /api/follow (si existe) | Utilisateur suivi | USER_FOLLOWED | "X vous suit maintenant" | ❌ | ❌ | ❌ | ❌ |

---

## B. POSTS

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| POST_CREATED | Social | POST /api/posts | Followers concernés | POST_CREATED | "X a publié une nouvelle publication" | ✅ | ✅ | ✅ | ✅ |
| POST_MENTIONED | Social | POST /api/posts (mention @X) | Utilisateur mentionné | USER_MENTIONED | "X vous a mentionné dans une publication" | ✅ | ✅ | ✅ | ✅ |
| POST_LIKED | Social | POST /api/likes | Auteur du post | POST_LIKE | "X a aimé votre publication" | ✅ | ✅ | ✅ | ✅ |
| COMMENT_CREATED | Social | POST /api/comments | Auteur du post | POST_COMMENT | "X a commenté votre publication" | ✅ | ✅ | ✅ | ✅ |
| COMMENT_REPLIED | Social | POST /api/comments (reply) | Auteur du commentaire parent | COMMENT_REPLIED | "X a répondu à votre commentaire" | ❌ | ❌ | ❌ | ❌ |
| COMMENT_MENTIONED | Social | POST /api/comments (mention) | Utilisateur mentionné | COMMENT_MENTIONED | "X vous a mentionné dans un commentaire" | ❌ | ❌ | ❌ | ❌ |
| COMMENT_LIKED | Social | POST /api/comments/like (si existe) | Auteur du commentaire | COMMENT_LIKED | "X a aimé votre commentaire" | ❌ | ❌ | ❌ | ❌ |

---

## C. ÉGLISES

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| CHURCH_FOLLOWED | Church | POST /api/church/follow | Admins de l'église | CHURCH_FOLLOW | "X a commencé à suivre votre église" | ✅ | ✅ | ✅ | ✅ |
| CHURCH_POST_CREATED | Church | POST /api/church/posts | Followers concernés | CHURCH_POST_CREATED | "Votre église a publié un nouveau contenu" | ❌ | ❌ | ❌ | ❌ |
| CHURCH_EVENT_CREATED | Church | POST /api/church/events | Membres concernés | CHURCH_EVENT_CREATED | "Nouvel événement dans votre église" | ❌ | ❌ | ❌ | ❌ |
| CHURCH_LIVE_STARTED | Church | POST /api/church/live/start | Membres concernés | CHURCH_LIVE_STARTED | "Votre église est en direct" | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| CHURCH_MEMBER_INVITED | Church | POST /api/church/members/invite | Utilisateur invité | CHURCH_MEMBER_INVITED | "X vous invite à rejoindre l'église" | ❌ | ❌ | ❌ | ❌ |

---

## D. PRIÈRES

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| PRAYER_CHAIN_CREATED | Prayer | POST /api/prayers/chain | Membres église concernés | PRAYER_CHAIN_CREATED | "Nouvelle chaîne de prière créée" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_CHAIN_JOINED | Prayer | POST /api/prayers/chain/join | Créateur de la chaîne | PRAYER_NEW_PARTICIPANT | "X a rejoint votre chaîne de prière" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_CAMPAIGN_CREATED | Prayer | POST /api/prayers/campaigns | Membres église concernés | PRAYER_CAMPAIGN_STARTED | "Nouvelle campagne de prière lancée" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_CAMPAIGN_CHAIN_MOBILIZED | Prayer | POST /api/prayers/campaign-chains | Participants chaîne | CAMPAIGN_MOBILIZES_CHAIN | "Votre chaîne est mobilisée pour une campagne" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_LIVE_STARTED | Prayer | POST /api/prayers/live | Participants concernés | PRAYER_LIVE_STARTED | "Session de prière en direct démarrée" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_REQUEST_PRAYED_FOR | Prayer | POST /api/prayers/pray | Auteur de la demande | PRAYER_NEW_ENGAGEMENT | "X a prié pour votre demande" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_RESPONDED | Prayer | POST /api/prayers/respond | Auteur de la demande | PRAYER_NEW_ENGAGEMENT | "X a répondu à votre prière" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_ROOM_CREATED | Prayer | POST /api/prayers/rooms | Membres concernés | PRAYER_ROOM_OPENED | "Nouvelle salle de prière ouverte" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_ROOM_JOINED | Prayer | POST /api/prayers/rooms/[id]/participants | Créateur de la salle | PRAYER_NEW_PARTICIPANT | "X a rejoint votre salle de prière" | ✅ | ✅ | ✅ | ✅ |
| PRAYER_TESTIMONY_CREATED | Prayer | POST /api/prayers/testimony | Communauté concernée | PRAYER_TESTIMONY_CREATED | "Nouveau témoignage partagé" | ✅ | ✅ | ✅ | ✅ |

---

## E. LIVE / STREAMING

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| LIVE_STARTED | Live | POST /api/mobilelive/session/start | Followers concernés | LIVE_STARTED | "X est en direct" | ❌ | ❌ | ❌ | ❌ |
| LIVE_INVITATION | Live | POST /api/mobilelive/session/invite | Utilisateur invité | LIVE_INVITATION | "X vous invite à rejoindre son live" | ❌ | ❌ | ❌ | ❌ |
| LIVE_MENTION | Live | Chat live avec @X | Utilisateur mentionné | LIVE_MENTION | "X vous a mentionné dans un live" | ❌ | ❌ | ❌ | ❌ |
| LIVE_MODERATION_WARNING | Live | POST /api/mobilelive/session/[id]/moderate | Diffuseur averti | MODERATION_WARNING | "Avertissement de modération" | ✅ | ✅ | ✅ | ✅ |
| LIVE_FORCE_STOPPED | Live | POST /api/mobilelive/session/[id]/force-stop | Diffuseur | LIVE_FORCE_STOPPED | "Votre live a été arrêté" | ✅ | ✅ | ✅ | ✅ |

---

## F. MESSAGERIE PRIVÉE

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| MESSAGE_SENT | Messaging | POST /api/conversations/[id]/messages | Autre participant(s) | MESSAGE_SENT | "Nouveau message de X" | 🔄 | 🔄 | 🔄 | ⚠️ |
| MESSAGE_REPLIED | Messaging | POST /api/conversations/[id]/messages (reply) | Auteur du message parent | MESSAGE_REPLIED | "X a répondu à votre message" | ❌ | ❌ | ❌ | ❌ |
| MESSAGE_MENTIONED | Messaging | POST /api/conversations/[id]/messages (@X) | Utilisateur mentionné | MESSAGE_MENTIONED | "X vous a mentionné dans un message" | ❌ | ❌ | ❌ | ❌ |
| CONVERSATION_INVITATION | Messaging | POST /api/conversations (group) | Utilisateurs invités | CONVERSATION_INVITATION | "X vous invite à une conversation" | ❌ | ❌ | ❌ | ❌ |
| USER_ADDED_TO_CONVERSATION | Messaging | POST /api/conversations/[id]/members | Utilisateur ajouté | USER_ADDED_TO_CONVERSATION | "X vous a ajouté à une conversation" | ❌ | ❌ | ❌ | ❌ |

---

## G. APPELS

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| CALL_INCOMING | Call | socket.emit("call:incoming") | Utilisateur appelé | CALL_INCOMING | "Appel entrant de X" | 🔄 | 🔄 | 🔄 | ⚠️ |
| CALL_MISSED | Call | Appel rejeté/non répondu | Appelant | CALL_MISSED | "Appel manqué de X" | ❌ | ❌ | ❌ | ❌ |
| CALL_ENDED | Call | socket.emit("call:end") | Les deux participants | CALL_ENDED | "Appel terminé" | ❌ | ❌ | ❌ | ❌ |

---

## H. SÉCURITÉ / COMPTE

| Event Code | Catégorie | Déclencheur | Destinataire | Type | Message | DB | Socket | Push | État |
|------------|-----------|-------------|--------------|------|---------|----|----|----|----|
| NEW_LOGIN | Security | Connexion depuis nouveau device | Utilisateur | NEW_LOGIN | "Nouvelle connexion détectée" | ❌ | ❌ | ❌ | ❌ |
| PASSWORD_CHANGED | Security | PUT /api/user/password | Utilisateur | PASSWORD_CHANGED | "Votre mot de passe a été modifié" | ❌ | ❌ | ❌ | ❌ |

---

## RÉSUMÉ PAR ÉTAT

### ✅ Pleinement fonctionnels (14)
- FRIEND_REQUEST
- FRIEND_ACCEPTED
- POST_CREATED
- POST_MENTIONED
- POST_LIKED
- COMMENT_CREATED
- CHURCH_FOLLOWED
- PRAYER_CHAIN_CREATED
- PRAYER_CHAIN_JOINED
- PRAYER_CAMPAIGN_CREATED
- PRAYER_CAMPAIGN_CHAIN_MOBILIZED
- PRAYER_LIVE_STARTED
- PRAYER_REQUEST_PRAYED_FOR
- PRAYER_RESPONDED
- PRAYER_ROOM_CREATED
- PRAYER_ROOM_JOINED
- PRAYER_TESTIMONY_CREATED
- LIVE_MODERATION_WARNING
- LIVE_FORCE_STOPPED

### ⚠️ Partiellement implémentés / Contournements (2)
- MESSAGE_SENT (ChatWindow.tsx contournement)
- CALL_INCOMING (CallContext.tsx contournement)

### ❌ Non implémentés (20+)
- USER_FOLLOWED
- COMMENT_REPLIED
- COMMENT_MENTIONED
- COMMENT_LIKED
- CHURCH_POST_CREATED
- CHURCH_EVENT_CREATED
- CHURCH_LIVE_STARTED
- CHURCH_MEMBER_INVITED
- LIVE_STARTED
- LIVE_INVITATION
- LIVE_MENTION
- MESSAGE_REPLIED
- MESSAGE_MENTIONED
- CONVERSATION_INVITATION
- USER_ADDED_TO_CONVERSATION
- CALL_MISSED
- CALL_ENDED
- NEW_LOGIN
- PASSWORD_CHANGED

---

## PROBLÈMES STRUCTURELS IDENTIFIÉS

### 1. Codes d'événements non standardisés
- Types actuels: strings libres (ex: "FRIEND_REQUEST", "POST_LIKE", "MODERATION_WARNING")
- Pas d'enum centralisé
- Risque d'incohérences

### 2. Deep links incomplets
- createNotification utilise: `url: entityId ? \`/post/${entityId}\` : "/"`
- Pas de routing dynamique par type d'entité
- Pas de liens pour messagerie, appels, prières, etc.

### 3. Pas de vérification actorId !== recipientId
- Risque d'auto-notification
- Ex: utilisateur like son propre post

### 4. Préférences non respectées
- createNotification ignore notificationPreferences
- ChurchMember.notificationPreferences existe mais non utilisé

### 5. Pas d'anti-duplication
- Aucune stratégie d'idempotence
- Risque de doublons en cas de retry

---

## PRIORITÉS DE CORRECTION

### Priorité 1 - Critique
1. Corriger ChatWindow.tsx (MESSAGE_SENT)
2. Corriger CallContext.tsx (CALL_INCOMING)
3. Ajouter vérification actorId !== recipientId
4. Intégrer préférences utilisateur

### Priorité 2 - Important
5. Standardiser codes d'événements (enum)
6. Implémenter deep links dynamiques
7. Ajouter anti-duplication

### Priorité 3 - Améliorations
8. Implémenter événements manquants (MESSAGE_REPLIED, COMMENT_REPLIED, etc.)
9. Ajouter regroupement pour événements haute fréquence
10. Implémenter USER_FOLLOWED

