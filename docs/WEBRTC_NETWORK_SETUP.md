# Configuration Réseau pour WebRTC (LiveKit)

## Serveurs STUN/TURN

### STUN (Session Traversal Utilities for NAT)
Les serveurs STUN aident à découvrir l'adresse IP publique et le type de NAT.

**Serveurs STUN publics (gratuits) :**
```
stun:stun.l.google.com:19302
stun:stun1.l.google.com:19302
stun:stun2.l.google.com:19302
stun:stun3.l.google.com:19302
stun:stun4.l.google.com:19302
```

### TURN (Traversal Using Relays around NAT)
Les serveurs TURN sont nécessaires lorsque STUN ne suffit pas (NAT symétrique, firewalls restrictifs).

**Options :**
1. **LiveKit Cloud** - Fournit des serveurs TURN par défaut (recommandé)
2. **Coturn** - Serveur TURN open source auto-hébergé
3. **Twilio TURN** - Service TURN payant

## Configuration dans `.env`

```bash
# Serveurs STUN (optionnel, LiveKit Cloud en fournit par défaut)
NEXT_PUBLIC_LIVEKIT_STUN_SERVERS="stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"

# Serveur TURN personnalisé (optionnel)
NEXT_PUBLIC_LIVEKIT_TURN_SERVERS="turn:your-turn-server.com:3478?transport=udp"
NEXT_PUBLIC_LIVEKIT_TURN_USERNAME="your_turn_username"
NEXT_PUBLIC_LIVEKIT_TURN_CREDENTIAL="your_turn_credential"
```

## Règles Firewall Requises

### Ports TCP
- **443** - HTTPS (WebSockets pour LiveKit)
- **80** - HTTP (redirection vers HTTPS)

### Ports UDP (WebRTC)
- **3478** - STUN/TURN standard
- **5349** - STUN/TURN sur TLS
- **10000-65535** - Plage de ports pour les connexions WebRTC (RTP/RTCP)

### Règles iptables (Linux)
```bash
# Autoriser HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Autoriser STUN/TURN
iptables -A INPUT -p udp --dport 3478 -j ACCEPT
iptables -A INPUT -p tcp --dport 3478 -j ACCEPT

# Autoriser la plage WebRTC
iptables -A INPUT -p udp --dport 10000:65535 -j ACCEPT
```

### Règles Windows Firewall
```powershell
# Autoriser HTTPS
New-NetFirewallRule -DisplayName "LiveKit HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Autoriser STUN/TURN
New-NetFirewallRule -DisplayName "LiveKit STUN/TURN UDP" -Direction Inbound -Protocol UDP -LocalPort 3478 -Action Allow
New-NetFirewallRule -DisplayName "LiveKit STUN/TURN TCP" -Direction Inbound -Protocol TCP -LocalPort 3478 -Action Allow

# Autoriser WebRTC
New-NetFirewallRule -DisplayName "LiveKit WebRTC" -Direction Inbound -Protocol UDP -LocalPort 10000-65535 -Action Allow
```

### Règles AWS Security Groups
```
Type: Custom UDP
Protocol: UDP
Port Range: 3478, 10000-65535
Source: 0.0.0.0/0

Type: Custom TCP
Protocol: TCP
Port Range: 443, 3478
Source: 0.0.0.0/0
```

## Configuration NAT

### Pour les routeurs domestiques
1. Activer UPnP (Universal Plug and Play) si disponible
2. Ou configurer le port forwarding manuel :
   - TCP 443 → IP du serveur
   - UDP 3478 → IP du serveur
   - UDP 10000-65535 → IP du serveur

### Pour les environnements d'entreprise
- Configurer le NAT statique pour les ports requis
- S'assurer que le NAT ne bloque pas les connexions UDP
- Utiliser des serveurs TURN si le NAT est restrictif

## Diagnostic de Connexion

### Vérifier la connectivité STUN
```bash
# Utiliser stun-client
stun-client stun.l.google.com:19302
```

### Vérifier la connectivité TURN
```bash
# Utiliser turn-client
turn-client --server your-turn-server.com:3478 --username user --credential pass
```

### Logs navigateur
Ouvrir les DevTools (F12) → Console et chercher :
- `ICE candidate`
- `DTLS`
- `Connection state`

## Dépannage

### Erreur : "could not establish pc connection"
- Vérifier que les ports UDP sont ouverts
- Essayer avec uniquement STUN (sans TURN)
- Vérifier la configuration NAT

### Erreur : "DataChannel error"
- Vérifier que le port 443 est ouvert
- Essayer de désactiver le VPN/firewall temporairement
- Vérifier que LiveKit Cloud est accessible

### Erreur : "User-Initiated Abort"
- Généralement causé par un timeout de connexion
- Augmenter le timeout dans la configuration LiveKit
- Vérifier la latence réseau

## Recommandations

1. **Utiliser LiveKit Cloud** pour la production (TURN inclus)
2. **Tester avec STUN public** avant de configurer TURN
3. **Surveiller les logs** pour identifier les problèmes de connexion
4. **Utiliser HTTPS** obligatoirement pour WebRTC
5. **Prévoir un fallback RTMP** si WebRTC échoue
