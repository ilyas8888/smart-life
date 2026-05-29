# Codex Task — DayMuscleSummary dans CreatePlanModal

## Contexte

Projet SmartLife — section Sport. Stack : React 18, TypeScript, Tailwind CSS, lucide-react.

Fichiers concernés :
- `frontend/src/components/ExerciseGuide.tsx` — contient déjà `MuscleDiagramSVG`, `getExerciseMedia`, `MUSCLE_LABELS`
- `frontend/src/components/WorkoutPanel.tsx` — contient `CreatePlanModal` (step 3)

## Objectif

Dans `CreatePlanModal` (étape 3 — choix des exercices), afficher en temps réel un **résumé musculaire combiné de la journée** : quand l'utilisateur ajoute/retire des exercices, un diagramme SVG corps humain montre les muscles ciblés par l'ensemble des exercices de la journée.

---

## CHANGEMENT 1 — Ajouter `DayMuscleSummary` dans `ExerciseGuide.tsx`

Ajouter ce composant exporté **à la fin** de `frontend/src/components/ExerciseGuide.tsx`.

### Logique

```typescript
export function DayMuscleSummary({ exercises }: { exercises: { name: string }[] }) {
  // 1. Pour chaque exercice, récupérer les muscles via getExerciseMedia()
  // 2. Agréger tous les muscles primaires et secondaires
  // 3. Un muscle primaire chez n'importe quel exercice = primaire dans le résumé
  // 4. Un muscle secondaire (et non primaire ailleurs) = secondaire dans le résumé
  // 5. Calculer un label de dominante (ex: "Dominante poussée", "Dominante tirage", "Jambes", "Full body")
}
```

### Calcul dominante

```typescript
const PUSH_MUSCLES = ['chest', 'shoulders', 'triceps']
const PULL_MUSCLES = ['lats', 'traps', 'biceps']
const LEG_MUSCLES  = ['quads', 'hamstrings', 'glutes', 'calves']
const CORE_MUSCLES = ['core', 'lower-back']

function getDominance(primaryMuscles: string[]): string {
  const pushCount = primaryMuscles.filter(m => PUSH_MUSCLES.includes(m)).length
  const pullCount = primaryMuscles.filter(m => PULL_MUSCLES.includes(m)).length
  const legCount  = primaryMuscles.filter(m => LEG_MUSCLES.includes(m)).length
  const coreCount = primaryMuscles.filter(m => CORE_MUSCLES.includes(m)).length

  const max = Math.max(pushCount, pullCount, legCount, coreCount)
  if (max === 0) return ''
  const total = pushCount + pullCount + legCount + coreCount

  if (total >= 4 && max < total * 0.6) return 'Full body'
  if (pushCount === max) return 'Dominante poussée'
  if (pullCount === max) return 'Dominante tirage'
  if (legCount  === max) return 'Dominante jambes'
  if (coreCount === max) return 'Dominante abdos'
  return ''
}
```

### Rendu du composant

```tsx
export function DayMuscleSummary({ exercises }: { exercises: { name: string }[] }) {
  // Agréger les muscles
  const allPrimary = new Set<string>()
  const allSecondary = new Set<string>()

  exercises.forEach(ex => {
    const media = getExerciseMedia(ex.name)
    if (!media) return
    media.muscles.primary.forEach(m => allPrimary.add(m))
    media.muscles.secondary.forEach(m => {
      if (!allPrimary.has(m)) allSecondary.add(m)
    })
  })

  const primaryList   = Array.from(allPrimary)
  const secondaryList = Array.from(allSecondary)
  const dominance     = getDominance(primaryList)
  const knownCount    = exercises.filter(ex => getExerciseMedia(ex.name) !== null).length

  // Ne rien afficher si aucun exercice reconnu
  if (knownCount === 0 || exercises.length === 0) return null

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
          Muscles ciblés — cette journée
        </p>
        {dominance && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-600/40">
            {dominance}
          </span>
        )}
      </div>

      {/* Diagramme SVG (réutilise MuscleDiagramSVG existant) */}
      <div className="h-36 mb-3">
        <MuscleDiagramSVG
          primaryMuscles={primaryList}
          secondaryMuscles={secondaryList}
        />
      </div>

      {/* Badges muscles primaires */}
      {primaryList.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
            Principaux
          </p>
          <div className="flex flex-wrap gap-1.5">
            {primaryList.map(m => (
              <span key={m}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                {MUSCLE_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Badges muscles secondaires */}
      {secondaryList.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-amber-400/70 dark:text-amber-500 uppercase tracking-widest mb-1.5">
            Secondaires
          </p>
          <div className="flex flex-wrap gap-1.5">
            {secondaryList.map(m => (
              <span key={m}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-200/30 text-amber-600/80 dark:text-amber-400/60 border border-amber-300/20">
                {MUSCLE_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Note si certains exercices ne sont pas reconnus */}
      {knownCount < exercises.length && (
        <p className="text-[10px] text-gray-400 mt-2 italic">
          {exercises.length - knownCount} exercice(s) non reconnu(s) non inclus dans l'analyse.
        </p>
      )}
    </div>
  )
}
```

---

## CHANGEMENT 2 — Intégrer `DayMuscleSummary` dans `WorkoutPanel.tsx`

### 2.1 Ajouter l'import

En haut de `WorkoutPanel.tsx`, dans la ligne d'import de `ExerciseGuide`, ajouter `DayMuscleSummary` :

```typescript
import { ExerciseInfoButton, ExerciseGuideModal, getExerciseMedia, DayMuscleSummary } from './ExerciseGuide'
```

### 2.2 Placement dans `CreatePlanModal` — step 3

Dans l'étape 3 de `CreatePlanModal`, **après** la liste `space-y-2 mb-5` des exercices ajoutés et **avant** le bouton "Créer le programme", ajouter :

```jsx
{/* Résumé musculaire de la journée */}
<DayMuscleSummary
  exercises={dayExercises[currentDay.dayNumber] ?? []}
/>
```

Autrement dit, la structure finale de step 3 doit être :

```
[sélecteur de jours]
[bibliothèque presets]
[formulaire ajout custom]
[liste des exercices ajoutés avec ExerciseInfoButton] ← déjà en place
[DayMuscleSummary] ← NOUVEAU
[bouton Créer le programme]
```

---

## CE QU'IL NE FAUT PAS TOUCHER

- Tout le reste de `WorkoutPanel.tsx` (onglets, modales, session active, programmes)
- Les exports existants de `ExerciseGuide.tsx` (`getExerciseMedia`, `MuscleDiagramSVG`, `ExerciseInfoButton`, `ExerciseGuideModal`, `MUSCLE_LABELS`)
- Le EXERCISE_DB et les composants déjà en place

## RÉSULTAT ATTENDU

Dans `CreatePlanModal` → étape 3, sous la liste des exercices du jour en cours :
- Si ≥ 1 exercice reconnu → bloc amber avec SVG corps humain biface + badges muscles + label dominante
- Mise à jour en temps réel à chaque ajout/retrait d'exercice
- Si 0 exercice reconnu → rien affiché (pas d'erreur)
- Build TypeScript sans erreur
