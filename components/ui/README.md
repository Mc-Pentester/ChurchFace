# ChurchFace UI Components Library

Bibliothèque de composants UI mobile-first pour ChurchFace. Tous les composants sont optimisés pour les appareils tactiles avec des touch targets minimum de 44x44px et un feedback tactile.

## Installation

```typescript
import { Button, Input, Card, Tabs, Modal } from '@/components/ui';
```

## Composants

### Button

Bouton mobile-first avec touch targets et feedback tactile.

```typescript
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Enregistrer
</Button>
```

**Props :**
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `fullWidth`: `boolean` (default: `false`)
- `disabled`: `boolean`
- `className`: `string`

**Variants :**
- `primary`: Dégradé emerald-purple (action principale)
- `secondary`: Gris (action secondaire)
- `danger`: Rouge (action destructive)
- `ghost`: Transparent (action subtile)

**Tailles :**
- `sm`: min-h-[40px]
- `md`: min-h-[44px] (recommandé pour mobile)
- `lg`: min-h-[48px]

### Input

Champ de saisie mobile-first avec label et gestion d'erreurs.

```typescript
import { Input } from '@/components/ui';

<Input 
  label="Nom" 
  placeholder="Ton nom" 
  fullWidth 
  error="Ce champ est requis"
/>
```

**Props :**
- `label`: `string` (optionnel)
- `error`: `string` (optionnel)
- `fullWidth`: `boolean` (default: `false`)
- `placeholder`: `string`
- `type`: `string`
- `className`: `string`

**Caractéristiques :**
- min-h-[44px] pour touch targets
- Focus ring emerald-500
- Bordure rouge si erreur
- Label optionnel avec style cohérent

### Card

Carte mobile-first avec hover et feedback tactile.

```typescript
import { Card } from '@/components/ui';

<Card hoverable onClick={() => handleClick()}>
  <h3>Titre</h3>
  <p>Contenu</p>
</Card>
```

**Props :**
- `children`: `React.ReactNode`
- `className`: `string`
- `hoverable`: `boolean` (default: `false`)
- `onClick`: `() => void`

**Caractéristiques :**
- Shadow-sm par défaut
- Hover shadow-md si hoverable
- Feedback tactile active:scale-98
- Border gray-200

### Tabs

Onglets mobile-first avec icônes et badges de compteur.

```typescript
import { Tabs } from '@/components/ui';
import { Home, Users } from 'lucide-react';

const tabs = [
  { id: 'feed', label: 'Fil d\'actualité', icon: Home, count: 5 },
  { id: 'users', label: 'Utilisateurs', icon: Users },
];

<Tabs tabs={tabs} activeTab="feed" onTabChange={(id) => setActiveTab(id)} />
```

**Props :**
- `tabs`: `Tab[]` (array avec id, label, icon?, count?)
- `activeTab`: `string`
- `onTabChange`: `(tabId: string) => void`
- `className`: `string`

**Caractéristiques :**
- min-h-[44px] pour touch targets
- Icônes cachées sur mobile (seulement sur sm+)
- Overflow-x-auto pour navigation horizontale
- Badge de compteur optionnel
- Feedback tactile active:scale-95

### Modal

Modal mobile-first avec backdrop blur.

```typescript
import { Modal } from '@/components/ui';

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Titre"
  size="md"
>
  <p>Contenu du modal</p>
</Modal>
```

**Props :**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string` (optionnel)
- `children`: `React.ReactNode`
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)

**Caractéristiques :**
- Backdrop blur-sm
- max-h-[90vh] avec overflow-y-auto
- Bouton fermer avec touch target
- Lock du scroll body quand ouvert
- Tailles responsive

## Guidelines Mobile-First

### Touch Targets
- **Minimum 44x44px** sur tous les éléments interactifs
- Utiliser `min-h-[44px]` et `min-w-[44px]` quand nécessaire

### Feedback Tactile
- **Toujours** ajouter `active:scale-95` sur les boutons et éléments cliquables
- Utiliser `active:scale-98` pour les cartes et éléments plus larges

### Responsive Breakpoints
- **Mobile**: styles par défaut (< 640px)
- **Tablet**: `sm:` (640px+)
- **Desktop**: `md:` (768px+)
- **Large Desktop**: `lg:` (1024px+)

### Grilles
```css
/* Mobile: 1 colonne */
grid-cols-1

/* Tablet: 2 colonnes */
sm:grid-cols-2

/* Desktop: 3 colonnes */
lg:grid-cols-3
```

### Navigation
- Utiliser **MobileBottomNav** pour navigation principale mobile
- Utiliser **HamburgerMenu** pour navigation secondaire
- Cacher les sidebars sur mobile (`hidden lg:block`)
- Utiliser des onglets horizontaux avec `overflow-x-auto`

### Padding
- **Mobile**: `p-4` ou `px-4 py-6`
- **Desktop**: `p-6` ou `px-6 py-8`

## Exemple d'utilisation complet

```typescript
import { Button, Input, Card, Tabs, Modal } from '@/components/ui';
import { useState } from 'react';

export default function ExamplePage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');

  const tabs = [
    { id: 'feed', label: 'Fil d\'actualité' },
    { id: 'profile', label: 'Profil' },
  ];

  return (
    <div className="p-4 md:p-6">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Card className="mt-4">
        <Input 
          label="Nom" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        
        <div className="mt-4 flex gap-2">
          <Button variant="primary" fullWidth onClick={() => setIsModalOpen(true)}>
            Ouvrir Modal
          </Button>
          <Button variant="secondary" onClick={() => setName('')}>
            Effacer
          </Button>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmation">
        <p>Êtes-vous sûr de vouloir continuer ?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" fullWidth onClick={() => setIsModalOpen(false)}>
            Confirmer
          </Button>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Annuler
          </Button>
        </div>
      </Modal>
    </div>
  );
}
```

## Ajouter un nouveau composant

Pour ajouter un nouveau composant à la bibliothèque :

1. Créer le fichier dans `components/ui/`
2. Appliquer les principes mobile-first :
   - Touch targets minimum 44x44px
   - Feedback tactile `active:scale-95`
   - Responsive breakpoints
3. Exporter dans `components/ui/index.ts`
4. Documenter dans ce README

## Checklist pour nouveaux modules

Quand vous créez un nouveau module, utilisez ces composants UI pour garantir la cohérence mobile-first :

- ✅ Utiliser `Button` au lieu de `<button>` natif
- ✅ Utiliser `Input` au lieu de `<input>` natif
- ✅ Utiliser `Card` pour les conteneurs de contenu
- ✅ Utiliser `Tabs` pour la navigation par onglets
- ✅ Utiliser `Modal` pour les modaux
- ✅ Appliquer les breakpoints responsive (sm:, md:, lg:)
- ✅ Tester sur mobile viewport
