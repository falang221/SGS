# Design System - School Management System (EdTech)

## 🎨 Palette de Couleurs
Adaptée au secteur éducatif (Sénégal), inspirée par le professionnalisme et la clarté.

### 1. Couleurs Primaires
- **Indigo Education**: `#4F46E5` (Indigo-600) - Couleur principale pour les actions et la navigation.
- **Deep Slate**: `#1E293B` (Slate-800) - Utilisé pour le texte principal et les en-têtes.

### 2. Couleurs Secondaires (Accents)
- **Amber Academic**: `#F59E0B` (Amber-500) - Pour les alertes, les notifications importantes ou les notes.
- **Emerald Success**: `#10B981` (Emerald-500) - Pour les paiements complétés et les validations.

### 3. Couleurs Sémantiques
- **Danger**: `#EF4444` (Red-500)
- **Warning**: `#F59E0B` (Amber-500)
- **Info**: `#3B82F6` (Blue-500)
- **Success**: `#10B981` (Emerald-500)

---

## 🔡 Typographie
- **Police Principale**: `Inter` (Sans-serif) - Pour une lisibilité maximale sur tous les écrans.
- **Police Secondaire**: `Outfit` ou `Lexend` - Pour les titres (optionnel, apporte un côté moderne et accessible).

---

## 📐 Espacements & Grille
- Base 4px (4, 8, 12, 16, 24, 32, 48, 64).
- Bordures arrondies: `rounded-lg` (8px) par défaut.
- Ombres: `shadow-sm` pour les cartes, `shadow-lg` pour les modales.

---

## 🧩 Composants Clés (Tailwind CSS)

### 1. Bouton Professionnel
```html
<button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
  Enregistrer
</button>
```

### 2. Carte de Statistique (KPI)
```html
<div class="bg-white overflow-hidden shadow rounded-lg border border-slate-100">
  <div class="p-5">
    <div class="flex items-center">
      <div class="flex-shrink-0 bg-indigo-50 rounded-md p-3">
        <!-- Icon -->
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt class="text-sm font-medium text-slate-500 truncate">Total Élèves</dt>
          <dd class="text-lg font-semibold text-slate-900">1,248</dd>
        </dl>
      </div>
    </div>
  </div>
</div>
```

---

## 📱 Principes UX
1. **Feedback Immédiat**: Utiliser des Skeletons pendant le chargement et des Toasts après chaque action.
2. **Hiérarchie Claire**: Les informations les plus importantes (notes, statut de paiement) doivent être visibles sans défiler.
3. **Saisie Optimisée**: Formulaires avec validation en temps réel (Zod + React Hook Form).
