# Audit Mobile-First ChurchFace
**Date :** 12 août 2026
**Objectif :** Transformer ChurchFace en plateforme mobile-first

---

## 1. État actuel de l'interface

### 1.1 Pages principales analysées

#### Page d'accueil (`app/page.tsx`)
**Statut :** ❌ Non optimisé mobile
- Layout desktop obligatoire : `grid-cols-[200px_1fr_200px]`
- LeftSidebar cachée sur mobile (`hidden lg:block`)
- RightSidebar cachée sur mobile (`hidden lg:block`)
- Feed centré avec `max-w-[680px]`
- HeroSlider potentiellement non adapté mobile

#### Page profil (`app/profile/[userId]/page.tsx`)
**Statut :** ⚠️ Partiellement optimisé
- Navbar présente
- ProfileHeader et ProfileTabs existants
- Feed intégré dans tab "posts"
- CreateMenuButton fixed bottom-right (desktop-first)
- Pas de bottom navigation spécifique profil

#### Page église (`app/church/[slug]/page.tsx`)
**Statut :** ❌ Non optimisé mobile
- Layout desktop : `flex-col lg:flex-row gap-8`
- Sidebar desktop `lg:w-80`
- ChurchTabs et ChurchSidebar non adaptés mobile

#### Studio Pro (`components/live/studio/StudioPro.tsx`)
**Statut :** ❌ Desktop-only
- Layout complexe : `grid-cols-[250px_1fr_210px_300px]`
- 4 colonnes fixes
- Mode VIDEO et RADIO
- Panels nombreux (Preview, Program, Scenes, Sources, Audio, Chat, etc.)
- Aucune adaptation mobile visible

---

## 2. Composants layout existants

### 2.1 Déjà en place ✅

#### MobileBottomNav (`components/layout/MobileBottomNav.tsx`)
**Statut :** ✅ Existant et fonctionnel
- Navigation fixe bottom
- 6 items : Accueil, Profil, Messages, Lives, Radio, Chat
- Icônes tactiles (22px)
- État actif avec couleur emerald
- Masquée sur desktop (`lg:hidden`)
- Safe area inset pour iOS

#### HamburgerMenu (`components/layout/HamburgerMenu.tsx`)
**Statut :** ✅ Existant et fonctionnel
- Menu drawer coulissant droite
- Largeur 80 (85vw max)
- Backdrop blur
- Navigation complète (Profil, Amis, Prière, Créer église)
- Auth state handling
- Animation transition

#### Viewport mobile (`app/layout.tsx`)
**Statut :** ✅ Configuré
```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};
```

### 2.2 À adapter ⚠️

#### Navbar (`components/layout/Navbar.tsx`)
**Statut :** ⚠️ Partiellement adapté
- **Desktop :** Recherche, liens, notifications, messages, amis, auth
- **Mobile :** Logo, notifications, hamburger menu
- **Problèmes :**
  - Recherche cachée sur mobile (`hidden md:block`)
  - Liens desktop cachés sur mobile
  - Boutons messages/amis desktop-only
  - Auth desktop-only

#### LeftSidebar (`components/layout/LeftSidebar.tsx`)
**Statut :** ❌ Desktop-only
- Navigation complète (Accueil, Profil, Amis, Messages, Lives, Radio, Admin, Paramètres)
- Chat en direct button
- Cachée sur mobile (`hidden lg:block`)
- **Action requise :** Transformer en drawer mobile accessible via hamburger

#### RightSidebar (`components/layout/RightSidebar.tsx`)
**Statut :** ❌ Non analysé (à vérifier)
- Probablement desktop-only
- **Action requise :** Analyser et adapter

---

## 3. Composants fonctionnels

### 3.1 Feed (`components/posts/Feed.tsx`)
**Statut :** ⚠️ Partiellement adapté
- **Positif :**
  - `playsInline` sur vidéos
  - MediaModal pour plein écran
  - Grille responsive pour médias
- **Problèmes :**
  - Cartes non pleine largeur mobile
  - Boutons d'action petits (text-sm)
  - Commentaires input non optimisé tactile
  - Pas de lazy loading visible
  - Pas de pagination infinie

### 3.2 PostCreator (`components/posts/PostCreator.tsx`)
**Statut :** ⚠️ Partiellement adapté
- **Positif :**
  - UploadThing intégré
  - Prévisualisation médias
- **Problèmes :**
  - Textarea non optimisé mobile
  - Boutons non 44px minimum
  - Album selector complexe

### 3.3 FriendsList (`components/profile/FriendsList.tsx`)
**Statut :** ⚠️ Partiellement adapté
- **Positif :**
  - Cartes avec avatar
  - Actions (message, unfriend)
- **Problèmes :**
  - Boutons icônes < 44px
  - Pas de swipe actions

### 3.4 MediaGallery (`components/profile/MediaGallery.tsx`)
**Statut :** ⚠️ Partiellement adapté
- **Positif :**
  - Grille responsive
  - MediaModal intégré
- **Problèmes :**
  - Boutons upload non 44px
  - Album selector complexe mobile

---

## 4. Problèmes identifiés par catégorie

### 4.1 Layout structurel ❌
- **Grid desktop obligatoire** sur page d'accueil
- **Sidebar non transformée** en drawer mobile
- **Right sidebar non adaptée**
- **Studio Pro layout desktop-only** (4 colonnes fixes)

### 4.2 Navigation ⚠️
- **Recherche cachée** sur mobile
- **Liens desktop non accessibles** sur mobile
- **Bottom navigation limitée** (6 items seulement)
- **Pas de navigation contextuelle** (église, profil)

### 4.3 Touch experience ❌
- **Boutons < 44px** (Feed, FriendsList, MediaGallery)
- **Inputs non optimisés** tactile
- **Pas de feedback visuel** touch
- **Gestes tactiles absents** (swipe, pinch)

### 4.4 Performance ⚠️
- **Pas de lazy loading** évident
- **Pas de dynamic imports** visible
- **Images non optimisées** Next.js (pas de next/image partout)
- **Pas de réduction JS initial**

### 4.5 Audio/Vidéo ❌
- **Pas de gestion orientation** paysage
- **Pas de switch caméra** avant/arrière visible
- **Pas d'optimisation** réseau faible
- **Studio Pro non adapté** mobile

---

## 5. Pages non analysées (à compléter)

- [ ] `app/prayer-space/page.tsx` - Prières
- [ ] `app/messages/page.tsx` - Messages
- [ ] `app/chat/page.tsx` - Chat
- [ ] `app/live/page.tsx` - Lives
- [ ] `app/radio/page.tsx` - Radio
- [ ] `app/events/page.tsx` - Événements
- [ ] `app/admin/page.tsx` - Administration
- [ ] `app/profile/edit/page.tsx` - Paramètres

---

## 6. Recommandations prioritaires

### Phase 1 : Structure (Critique)
1. **Adapter layout page d'accueil** - Mobile-first grid
2. **Transformer LeftSidebar en drawer** - Accessible via hamburger
3. **Adapter RightSidebar** - Panneaux mobiles
4. **Simplifier Navbar mobile** - Recherche accessible

### Phase 2 : Navigation (Important)
1. **Revoir Bottom Navigation** - Ajouter Église, Prières
2. **Adapter navigation contextuelle** - Profil, Église
3. **Optimiser HamburgerMenu** - Compléter navigation

### Phase 3 : Composants (Important)
1. **Optimiser Feed mobile** - Cartes pleine largeur
2. **Adapter boutons 44px+** - Touch experience
3. **Optimiser inputs** - Tactile friendly
4. **Ajouter feedback tactile** - Animations

### Phase 4 : Performance (Moyen)
1. **Lazy loading images** - Next.js Image
2. **Dynamic imports** - Code splitting
3. **Optimiser API** - Pagination progressive

### Phase 5 : Studio Pro (Complexe)
1. **Mode Radio mobile** - Interface simplifiée
2. **Mode Vidéo mobile** - Contrôles essentiels
3. **Gestes tactiles** - Swipe, pinch

---

## 7. Architecture mobile-first proposée

### 7.1 Breakpoints
```css
/* Mobile first par défaut */
default: mobile (< 640px)
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### 7.2 Navigation
- **Mobile :** Bottom nav (5 items) + Hamburger drawer
- **Tablet :** Bottom nav + Sidebar réduite
- **Desktop :** Sidebar gauche + Navbar complète

### 7.3 Layout pattern
```tsx
/* Mobile */
<div className="flex flex-col">
  <Navbar />
  <MainContent />
  <BottomNav />
</div>

/* Desktop */
<div className="grid grid-cols-[200px_1fr_200px]">
  <LeftSidebar />
  <MainContent />
  <RightSidebar />
</div>
```

---

## 8. Tests requis

### 8.1 Appareils
- [ ] Android Chrome (petit écran)
- [ ] Android Chrome (grand écran)
- [ ] iOS Safari (iPhone)
- [ ] iPad (portrait/landscape)
- [ ] Desktop (1920x1080)

### 8.2 Fonctionnalités
- [ ] Navigation bottom
- [ ] Hamburger drawer
- [ ] Feed scroll
- [ ] Upload média
- [ ] Live streaming
- [ ] Studio Pro (modes)

---

## 9. Estimation

- **Phase 1 (Structure) :** 2-3 jours
- **Phase 2 (Navigation) :** 1-2 jours
- **Phase 3 (Composants) :** 2-3 jours
- **Phase 4 (Performance) :** 1-2 jours
- **Phase 5 (Studio Pro) :** 3-4 jours
- **Tests :** 1-2 jours

**Total estimé :** 10-16 jours

---

## Conclusion

ChurchFace a une **base mobile partielle** (MobileBottomNav, HamburgerMenu, viewport) mais l'architecture reste **desktop-first**. Une transformation complète en mobile-first nécessite une refonte structurelle importante, particulièrement sur :

1. **Layout page d'accueil** (grid desktop → mobile-first)
2. **Navigation** (compléter bottom nav, adapter sidebar)
3. **Touch experience** (44px minimum, feedback)
4. **Studio Pro** (adaptation mobile complexe)

La transformation est **techniquement faisable** sans duplication de code, en utilisant les breakpoints Tailwind et une architecture responsive progressive.
