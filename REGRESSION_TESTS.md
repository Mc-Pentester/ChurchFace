# Tests de Régression - Studio Live

## Objectif
Vérifier que toutes les fonctionnalités du Studio Live fonctionnent correctement après les corrections architecturales.

## Tests de Connexion LiveKit

### Test 1: Connexion initiale
- [ ] Ouvrir le Studio Live
- [ ] Vérifier que la connexion LiveKit s'établit automatiquement
- [ ] Vérifier que l'état passe à "CONNECTED"
- [ ] Vérifier que le flux vidéo local s'affiche

### Test 2: Reconnexion automatique
- [ ] Se connecter au Studio
- [ ] Simuler une déconnexion réseau (Chrome DevTools > Network > Offline)
- [ ] Vérifier que l'état passe à "RECONNECTING"
- [ ] Rétablir la connexion réseau
- [ ] Vérifier que la reconnexion automatique fonctionne
- [ ] Vérifier que l'état revient à "CONNECTED"
- [ ] Vérifier que les sources (caméra/micro) sont restaurées

### Test 3: Persistance de la Room
- [ ] Se connecter au Studio
- [ ] Changer de scène
- [ ] Changer de source
- [ ] Changer de résolution
- [ ] Vérifier que la Room LiveKit n'est pas détruite
- [ ] Vérifier qu'il n'y a pas de déconnexion/reconnexion

## Tests de Gestion des Périphériques

### Test 4: Changement de caméra
- [ ] Se connecter au Studio
- [ ] Ouvrir les paramètres de source
- [ ] Changer de caméra
- [ ] Vérifier que le flux vidéo change sans déconnexion
- [ ] Vérifier qu'il n'y a pas d'erreur "No room available"

### Test 5: Changement de micro
- [ ] Se connecter au Studio
- [ ] Ouvrir les paramètres de source
- [ ] Changer de micro
- [ ] Vérifier que le flux audio change sans déconnexion
- [ ] Vérifier qu'il n'y a pas d'erreur "No room available"

### Test 6: Détection de déconnexion de périphérique
- [ ] Se connecter au Studio avec une caméra USB
- [ ] Débrancher la caméra
- [ ] Vérifier que le système détecte la déconnexion
- [ ] Vérifier qu'il tente de basculer vers une autre caméra
- [ ] Rebrancher la caméra
- [ ] Vérifier que le système détecte la reconnexion

### Test 7: Toggle caméra/micro
- [ ] Se connecter au Studio
- [ ] Désactiver la caméra
- [ ] Vérifier que le flux vidéo s'arrête
- [ ] Réactiver la caméra
- [ ] Vérifier que le flux vidéo reprend
- [ ] Désactiver le micro
- [ ] Vérifier que le flux audio s'arrête
- [ ] Réactiver le micro
- [ ] Vérifier que le flux audio reprend

## Tests de Gestion des Tracks

### Test 8: Screen Share
- [ ] Se connecter au Studio
- [ ] Démarrer le partage d'écran
- [ ] Vérifier que le flux d'écran s'affiche
- [ ] Arrêter le partage d'écran
- [ ] Vérifier que le flux retourne à la caméra

### Test 9: Pas de déconnexion sur changement de track
- [ ] Se connecter au Studio
- [ ] Changer de caméra
- [ ] Vérifier dans la console qu'il n'y a pas de "Room disconnected"
- [ ] Changer de micro
- [ ] Vérifier dans la console qu'il n'y a pas de "Room disconnected"

## Tests de Monitoring

### Test 10: Affichage des statistiques
- [ ] Se connecter au Studio
- [ ] Vérifier que le panneau Monitoring s'affiche
- [ ] Vérifier que l'état de connexion est affiché
- [ ] Vérifier que le temps de connexion est affiché
- [ ] Vérifier que les statistiques WebRTC s'affichent (placeholder)

## Tests de Gestion des Erreurs

### Test 11: Affichage des erreurs
- [ ] Simuler une erreur de connexion (token invalide)
- [ ] Vérifier que l'erreur s'affiche dans le panneau d'erreurs
- [ ] Vérifier que l'erreur peut être rejetée
- [ ] Vérifier que l'action suggérée est affichée

### Test 12: Erreur de permission
- [ ] Bloquer l'accès caméra/micro dans le navigateur
- [ ] Tenter de se connecter au Studio
- [ ] Vérifier que l'erreur de permission s'affiche
- [ ] Vérifier que l'action suggérée est correcte

## Tests du Lecteur Public

### Test 13: Connexion du lecteur
- [ ] Démarrer un live depuis le Studio
- [ ] Ouvrir la page publique du live
- [ ] Vérifier que le lecteur se connecte
- [ ] Vérifier que le flux vidéo s'affiche
- [ ] Vérifier que l'indicateur LIVE s'affiche

### Test 14: Reconnexion du lecteur
- [ ] Ouvrir le lecteur public
- [ ] Simuler une déconnexion réseau
- [ ] Vérifier que le lecteur tente de se reconnecter
- [ ] Rétablir la connexion
- [ ] Vérifier que le flux reprend

## Tests de Robustesse

### Test 15: Changements rapides de configuration
- [ ] Se connecter au Studio
- [ ] Changer rapidement de caméra (3-4 fois)
- [ ] Changer rapidement de micro (3-4 fois)
- [ ] Changer rapidement de scène (3-4 fois)
- [ ] Vérifier qu'il n'y a pas d'erreurs
- [ ] Vérifier que la Room reste connectée

### Test 16: Session longue
- [ ] Se connecter au Studio
- [ ] Laisser la session active pendant 30 minutes
- [ ] Vérifier que la connexion reste stable
- [ ] Vérifier qu'il n'y a pas de reconnexion inattendue

## Checklist de Validation

### Architecture
- [ ] LiveKitService singleton est utilisé
- [ ] Room LiveKit persiste pendant toute la session
- [ ] Pas de destruction de Room sur changement de props
- [ ] Gestion des tracks via LiveKit API (pas disconnect/connect)
- [ ] Machine d'états implémentée
- [ ] Reconnexion automatique avec backoff exponentiel
- [ ] Restauration des sources après reconnexion

### Performance
- [ ] Pas de fuites de mémoire
- [ ] Pas de reconnexions inutiles
- [ ] Détection des changements de périphériques fonctionnelle
- [ ] Monitoring en temps réel

### Expérience Utilisateur
- [ ] Erreurs claires et exploitables
- [ ] Monitoring visible
- [ ] Pas de console.error dans le code de production
- [ ] Lecteur public fonctionnel

## Résultats

| Test | Statut | Notes |
|------|--------|-------|
| 1. Connexion initiale | ⬜ | |
| 2. Reconnexion automatique | ⬜ | |
| 3. Persistance de la Room | ⬜ | |
| 4. Changement de caméra | ⬜ | |
| 5. Changement de micro | ⬜ | |
| 6. Détection de déconnexion de périphérique | ⬜ | |
| 7. Toggle caméra/micro | ⬜ | |
| 8. Screen Share | ⬜ | |
| 9. Pas de déconnexion sur changement de track | ⬜ | |
| 10. Affichage des statistiques | ⬜ | |
| 11. Affichage des erreurs | ⬜ | |
| 12. Erreur de permission | ⬜ | |
| 13. Connexion du lecteur | ⬜ | |
| 14. Reconnexion du lecteur | ⬜ | |
| 15. Changements rapides de configuration | ⬜ | |
| 16. Session longue | ⬜ | |
