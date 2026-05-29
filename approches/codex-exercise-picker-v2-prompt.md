# Codex Task — Bibliothèque d'exercices visuelle (V2) dans CreatePlanModal

## Contexte

Projet SmartLife — section Sport. Stack : React 18, TypeScript, Tailwind CSS, lucide-react.

Fichiers concernés :
- `frontend/src/components/ExerciseGuide.tsx` — contient `getExerciseMedia`, `MUSCLE_LABELS`, `ExerciseInfoButton`, `MuscleDiagramSVG`
- `frontend/src/components/WorkoutPanel.tsx` — contient `CreatePlanModal` (step 3) et `EXERCISE_LIBRARY`

## État actuel (à remplacer)

Dans `CreatePlanModal` step 3, la bibliothèque affiche des simples boutons pills par type de jour :
```jsx
{EXERCISE_LIBRARY[currentDay.label].map(ex => (
  <div key={ex.name} className="flex items-center gap-1">
    <button ...>+ {ex.name}</button>
    <ExerciseInfoButton ... />
  </div>
))}
```

## Objectif

Remplacer cette bibliothèque par un **sélecteur visuel** avec :
1. Champ de recherche par nom
2. Filtres rapides par groupe musculaire
3. Cards mini avec image (si disponible) + muscle principal + boutons ⓘ et +

---

## CHANGEMENT 1 — Ajouter dans `ExerciseGuide.tsx`

### 1.1 Export du catalogue unifié

Ajouter à la fin de `ExerciseGuide.tsx` une fonction qui expose le catalogue complet d'exercices utilisable par le picker :

```typescript
export interface CatalogExercise {
  name: string
  sets: number | null
  reps: number | null
  weightKg: number | null
  notes: string
  category: string        // 'Poitrine' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras' | 'Abdos' | 'Cardio' | 'Autre'
  imageUrl: string | null
  primaryMuscleLabel: string | null  // premier muscle principal traduit, ex: "Pectoraux"
}
```

### 1.2 Map catégorie → filtre

```typescript
const CATEGORY_FILTER_MAP: Record<string, string> = {
  'Poitrine':   'Poitrine',
  'Poitrine haute': 'Poitrine',
  'Triceps & Poitrine': 'Poitrine',
  'Dos':        'Dos',
  'Dos & chaîne postérieure': 'Dos',
  'Jambes':     'Jambes',
  'Épaules':    'Épaules',
  'Biceps':     'Bras',
  'Triceps':    'Bras',
  'Biceps & Avant-bras': 'Bras',
  'Abdominaux': 'Abdos',
  'Cardio':     'Cardio',
}
```

### 1.3 Catalogue EXERCISE_LIBRARY_FLAT (interne à ExerciseGuide.tsx)

Définir en interne les exercices de la bibliothèque qui n'ont pas de média dans EXERCISE_DB mais qui doivent apparaître dans le picker. Créer une liste statique couvrant tous les exercices de `EXERCISE_LIBRARY` de WorkoutPanel.tsx :

```typescript
const LIBRARY_FALLBACK: Array<{ name: string; sets: number | null; reps: number | null; weightKg: number | null; notes: string; category: string }> = [
  // Push
  { name: 'Développé couché',    sets: 4, reps: 10, weightKg: 60,  notes: '', category: 'Poitrine' },
  { name: 'Développé militaire', sets: 4, reps: 8,  weightKg: 40,  notes: '', category: 'Épaules' },
  { name: 'Développé incliné',   sets: 3, reps: 10, weightKg: 50,  notes: '', category: 'Poitrine' },
  { name: 'Écarté haltères',     sets: 3, reps: 12, weightKg: 15,  notes: '', category: 'Poitrine' },
  { name: 'Dips',                sets: 3, reps: 10, weightKg: null, notes: '', category: 'Poitrine' },
  { name: 'Triceps poulie',      sets: 3, reps: 12, weightKg: 25,  notes: '', category: 'Bras' },
  { name: 'Extension triceps',   sets: 3, reps: 12, weightKg: 20,  notes: '', category: 'Bras' },
  // Pull
  { name: 'Tractions',           sets: 4, reps: 8,  weightKg: null, notes: '', category: 'Dos' },
  { name: 'Rowing barre',        sets: 4, reps: 10, weightKg: 60,  notes: '', category: 'Dos' },
  { name: 'Rowing haltère',      sets: 3, reps: 12, weightKg: 25,  notes: '', category: 'Dos' },
  { name: 'Tirage vertical',     sets: 4, reps: 10, weightKg: 55,  notes: '', category: 'Dos' },
  { name: 'Face pull',           sets: 3, reps: 15, weightKg: 20,  notes: '', category: 'Épaules' },
  { name: 'Curl biceps barre',   sets: 3, reps: 12, weightKg: 30,  notes: '', category: 'Bras' },
  { name: 'Curl haltères',       sets: 3, reps: 12, weightKg: 12,  notes: '', category: 'Bras' },
  { name: 'Curl marteau',        sets: 3, reps: 12, weightKg: 14,  notes: '', category: 'Bras' },
  // Legs
  { name: 'Squat',               sets: 4, reps: 8,  weightKg: 80,  notes: '', category: 'Jambes' },
  { name: 'Leg press',           sets: 4, reps: 10, weightKg: 120, notes: '', category: 'Jambes' },
  { name: 'Fentes haltères',     sets: 3, reps: 12, weightKg: 20,  notes: '', category: 'Jambes' },
  { name: 'Soulevé de terre',    sets: 4, reps: 6,  weightKg: 100, notes: '', category: 'Dos' },
  { name: 'Leg curl',            sets: 3, reps: 12, weightKg: 40,  notes: '', category: 'Jambes' },
  { name: 'Leg extension',       sets: 3, reps: 12, weightKg: 40,  notes: '', category: 'Jambes' },
  { name: 'Mollets debout',      sets: 4, reps: 15, weightKg: 60,  notes: '', category: 'Jambes' },
  { name: 'Hip thrust',          sets: 4, reps: 10, weightKg: 80,  notes: '', category: 'Jambes' },
  // Full Body
  { name: 'Deadlift',            sets: 4, reps: 5,  weightKg: 100, notes: '', category: 'Dos' },
  { name: 'Pompes',              sets: 3, reps: 15, weightKg: null, notes: '', category: 'Poitrine' },
  { name: 'Gainage',             sets: 3, reps: null, weightKg: null, notes: '60 secondes', category: 'Abdos' },
  { name: 'Élévations latérales', sets: 3, reps: 12, weightKg: 10, notes: '', category: 'Épaules' },
  // Cardio
  { name: 'Course à pied',       sets: null, reps: null, weightKg: null, notes: '30 min',          category: 'Cardio' },
  { name: 'Vélo stationnaire',   sets: null, reps: null, weightKg: null, notes: '45 min',          category: 'Cardio' },
  { name: 'Corde à sauter',      sets: 5,    reps: null, weightKg: null, notes: '2 min/série',     category: 'Cardio' },
  { name: 'Rameur',              sets: null, reps: null, weightKg: null, notes: '20 min',          category: 'Cardio' },
  { name: 'HIIT 20-40',          sets: 8,    reps: null, weightKg: null, notes: '20s effort / 40s repos', category: 'Cardio' },
]
```

### 1.4 Fonction `getExerciseCatalog`

```typescript
export function getExerciseCatalog(): CatalogExercise[] {
  // Construire depuis LIBRARY_FALLBACK en enrichissant avec EXERCISE_DB via getExerciseMedia()
  // Dédupliquer par nom normalisé
  const seen = new Set<string>()
  return LIBRARY_FALLBACK
    .filter(ex => {
      const key = normalizeExerciseName(ex.name)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(ex => {
      const media = getExerciseMedia(ex.name)
      return {
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weightKg: ex.weightKg,
        notes: ex.notes,
        category: media
          ? (CATEGORY_FILTER_MAP[media.category] ?? 'Autre')
          : (CATEGORY_FILTER_MAP[ex.category] ?? ex.category),
        imageUrl: media?.imageUrl ?? null,
        primaryMuscleLabel: media?.muscles.primary[0]
          ? (MUSCLE_LABELS[media.muscles.primary[0]] ?? null)
          : null,
      }
    })
}
```

---

## CHANGEMENT 2 — Nouveau composant `ExercisePicker` dans `ExerciseGuide.tsx`

Ajouter ce composant exporté à la fin de `ExerciseGuide.tsx`.

```typescript
export interface PickerExercise {
  name: string
  sets: number | null
  reps: number | null
  weightKg: number | null
  notes: string
}

export function ExercisePicker({
  onAdd,
  alreadyAdded,
}: {
  onAdd: (ex: PickerExercise) => void
  alreadyAdded: string[]  // noms déjà dans la journée
}) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('Tous')
  const catalog = getExerciseCatalog()

  const FILTERS = ['Tous', 'Poitrine', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos', 'Cardio']

  const filtered = catalog.filter(ex => {
    const matchSearch = search.trim() === '' ||
      normalizeExerciseName(ex.name).includes(normalizeExerciseName(search))
    const matchFilter = activeFilter === 'Tous' || ex.category === activeFilter
    return matchSearch && matchFilter
  })

  return (
    <div className="mb-4">
      {/* Label */}
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bibliothèque d'exercices</p>

      {/* Barre de recherche */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Rechercher un exercice…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtres rapides */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeFilter === f
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grille de cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun exercice trouvé</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {filtered.map(ex => {
            const isAdded = alreadyAdded.some(
              n => normalizeExerciseName(n) === normalizeExerciseName(ex.name)
            )
            return (
              <div
                key={ex.name}
                className={`relative rounded-xl border overflow-hidden flex flex-col transition-all ${
                  isAdded
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Image ou placeholder */}
                {ex.imageUrl ? (
                  <div className="h-16 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.className =
                          'h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center'
                        ;(e.target as HTMLImageElement).replaceWith(
                          Object.assign(document.createElement('span'), { textContent: '🏋️', className: 'text-2xl' })
                        )
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Dumbbell size={20} className="text-gray-400" />
                  </div>
                )}

                {/* Infos */}
                <div className="p-2 flex-1 flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                    {ex.name}
                  </p>
                  {ex.primaryMuscleLabel && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      {ex.primaryMuscleLabel}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-2 pb-2 gap-1">
                  <ExerciseInfoButton
                    exerciseName={ex.name}
                    sets={ex.sets}
                    reps={ex.reps}
                    weightKg={ex.weightKg}
                  />
                  <button
                    type="button"
                    onClick={() => onAdd({ name: ex.name, sets: ex.sets, reps: ex.reps, weightKg: ex.weightKg, notes: ex.notes })}
                    disabled={isAdded}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                      isAdded
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    {isAdded ? '✓' : '+'} {isAdded ? 'Ajouté' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**Imports à ajouter dans `ExerciseGuide.tsx` :**
```typescript
import { useState } from 'react'  // déjà présent
import { Dumbbell, Info, Search, X } from 'lucide-react'  // ajouter Search
```

---

## CHANGEMENT 3 — Remplacer la bibliothèque dans `CreatePlanModal` (`WorkoutPanel.tsx`)

### 3.1 Ajouter l'import

Dans la ligne d'import de `ExerciseGuide`, ajouter `ExercisePicker` :

```typescript
import { ExerciseInfoButton, ExerciseGuideModal, getExerciseMedia, DayMuscleSummary, ExercisePicker } from './ExerciseGuide'
```

### 3.2 Remplacer le bloc bibliothèque dans step 3

**Supprimer** le bloc actuel :
```jsx
{EXERCISE_LIBRARY[currentDay.label] && (
  <div className="mb-4">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bibliothèque</p>
    <div className="flex flex-wrap gap-2">
      {EXERCISE_LIBRARY[currentDay.label].map(ex => (
        <div key={ex.name} className="flex items-center gap-1">
          <button type="button" onClick={() => addExerciseToDay(currentDay.dayNumber, ex)} ...>
            + {ex.name}
          </button>
          <ExerciseInfoButton ... />
        </div>
      ))}
    </div>
  </div>
)}
```

**Le remplacer par :**
```jsx
<ExercisePicker
  onAdd={(ex) => addExerciseToDay(currentDay.dayNumber, {
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    weightKg: ex.weightKg,
    notes: ex.notes,
  })}
  alreadyAdded={(dayExercises[currentDay.dayNumber] ?? []).map(e => e.name)}
/>
```

La fonction `addExerciseToDay` existante accepte `PlanExercise` — s'assurer que le type passé est compatible (`name`, `sets`, `reps`, `weightKg`, `notes`).

### 3.3 Garder le formulaire custom

Le formulaire d'ajout custom (champs nom/séries/reps/poids + bouton +) **reste en place**, juste en dessous du `ExercisePicker`, pour permettre d'ajouter des exercices qui ne sont pas dans le catalogue.

---

## RÉSULTAT ATTENDU

Dans `CreatePlanModal` → étape 3, la zone bibliothèque devient :

```
[🔍 Rechercher un exercice...]

[Tous] [Poitrine] [Dos] [Jambes] [Épaules] [Bras] [Abdos] [Cardio]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  [image]    │ │  [image]    │ │  🏋️          │
│ Développé   │ │   Dips      │ │  Leg press   │
│  Pectoraux  │ │  Pectoraux  │ │  Quadriceps  │
│ [ⓘ] [+Ajouter]│ │ [ⓘ] [✓Ajouté]│ │ [+Ajouter]  │
└─────────────┘ └─────────────┘ └─────────────┘

(scroll vertical max-h-64)
```

- Recherche filtre en temps réel
- Filtres rapides par muscle group
- Cards avec image wger si disponible, icône sinon
- Bouton "✓ Ajouté" (disabled, amber clair) si déjà dans la journée
- Bouton ⓘ uniquement si média disponible
- Formulaire custom toujours en dessous pour exercices hors catalogue

---

## CE QU'IL NE FAUT PAS TOUCHER

- Tout le reste de `WorkoutPanel.tsx` (onglets, sessions, programmes, historique)
- Les composants existants de `ExerciseGuide.tsx` (MuscleDiagramSVG, ExerciseGuideModal, ExerciseInfoButton, DayMuscleSummary)
- `EXERCISE_LIBRARY` dans `WorkoutPanel.tsx` (garde-la, mais elle n'est plus utilisée dans le picker)
- Build TypeScript sans erreur
