# Codex Task — Refonte WorkoutPanel ultra-impressionnante

## Contexte

Tu travailles sur `frontend/src/components/WorkoutPanel.tsx`, un fichier React/TypeScript de ~2045 lignes.
Stack : React 18, TypeScript, Tailwind CSS, React Query (`@tanstack/react-query`), lucide-react, date-fns.

Classes CSS disponibles dans `index.css` :
- `.card` → `bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 dark:bg-gray-800 dark:border-gray-700`
- `.btn-primary` → bouton primaire bleu
- `.btn-secondary` → bouton secondaire
- `.input` → champ de saisie
- `.animate-panel` → animation fadeSlideIn 0.22s

APIs backend existantes (aucune nouvelle API à créer) :
- `GET /workouts` → liste des séances (WorkoutSession[])
- `GET /workout-plans` → liste des programmes (WorkoutPlan[])
- `GET /workout-plans/{id}/progress` → PlanProgress

## Objectif

Transformer le WorkoutPanel en **fitness dashboard premium**. Passer de 2 onglets à **4 onglets** :
`Aujourd'hui` (défaut) | `Séances` | `Programmes` | `Progression`

---

## CHANGEMENTS REQUIS

### 1. Nouvelle structure de navigation — 4 onglets

Remplace le type `TabType = 'sessions' | 'programs'` par :
```typescript
type TabType = 'today' | 'sessions' | 'programs' | 'progression'
```

L'onglet par défaut devient `'today'`.

La navigation doit afficher :
```
[ Aujourd'hui ] [ Séances ] [ Programmes ] [ Progression ]
```

---

### 2. Nouveau composant `WeekHeroCard`

Ajouter ce composant avant le composant `WorkoutPanel`. Il affiche les stats de la semaine en cours (7 derniers jours) sous forme de carte hero gradient.

**Props :**
```typescript
interface WeekHeroCardProps {
  sessions: WorkoutSession[]
  onAddSession: () => void
}
```

**Contenu visuel :**
- Fond gradient : `from-amber-500 via-orange-500 to-red-500`
- Texte blanc
- Gauche : titre "Cette semaine", stats en chiffres (séances, kcal, durée)
- Centre/Droite : anneau SVG de progression (séances faites / 4 objectif)
- Bas : badge streak (nombre de semaines consécutives avec au moins 1 séance)

**Calculs :**
```typescript
// Séances des 7 derniers jours
const weekSessions = sessions.filter(s => {
  const d = new Date(`${s.sessionDate}T00:00:00`)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 6)
  cutoff.setHours(0,0,0,0)
  return d >= cutoff
})
const weekCount = weekSessions.length
const weekGoal = 4
const weekCalories = weekSessions.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0)
const weekMinutes = weekSessions.reduce((s, w) => s + (w.durationMinutes ?? 0), 0)
const weekPercent = Math.min(100, Math.round((weekCount / weekGoal) * 100))

// Streak : nombre de semaines ISO consécutives (en remontant depuis maintenant) avec au moins 1 séance
// Utilise la fonction getIsoWeekKey(dateStr) déjà présente dans le fichier
```

**Rendu attendu (structure) :**
```jsx
<div className="relative rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-lg">
  {/* Motif décoratif en arrière-plan (cercles semi-transparents) */}
  {/* Contenu principal */}
  <div className="relative z-10 p-5 sm:p-6 flex items-center gap-4">
    {/* Gauche : texte */}
    <div className="flex-1">
      <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-1">Cette semaine</p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-5xl font-black text-white">{weekCount}</span>
        <span className="text-white/70 text-lg font-medium">/{weekGoal} séances</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {weekCalories > 0 && (
          <div className="flex items-center gap-1.5 text-white/90 text-sm">
            <Flame size={14} />
            <span className="font-semibold">{weekCalories} kcal</span>
          </div>
        )}
        {weekMinutes > 0 && (
          <div className="flex items-center gap-1.5 text-white/90 text-sm">
            <Clock size={14} />
            <span className="font-semibold">{Math.floor(weekMinutes/60)}h{weekMinutes%60 > 0 ? ` ${weekMinutes%60}min` : ''}</span>
          </div>
        )}
      </div>
      {/* Streak badge si ≥ 2 semaines */}
      {streak >= 2 && (
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm">🔥</span>
          <span className="text-white text-xs font-bold">{streak} semaines consécutives</span>
        </div>
      )}
    </div>
    {/* Droite : anneau SVG */}
    <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" className="stroke-white/25" />
        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8"
          stroke="white"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${(2 * Math.PI * 40) * (1 - weekPercent / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{weekPercent}%</span>
        <span className="text-[10px] text-white/70">objectif</span>
      </div>
    </div>
  </div>
</div>
```

---

### 3. Nouveau composant `TodaySessionBanner`

Affiché dans l'onglet "Aujourd'hui" uniquement si un programme est en statut `ACTIVE`.

**Props :**
```typescript
interface TodaySessionBannerProps {
  plans: WorkoutPlan[]
  onStartSession: (plan: WorkoutPlan, day: PlanDay) => void
  onViewProgram: (plan: WorkoutPlan) => void
}
```

**Logique :**
```typescript
const activePlan = plans.find(p => p.status === 'ACTIVE')
if (!activePlan) return null

const jsDow = new Date().getDay()
const planDow = jsDow === 0 ? 7 : jsDow
const today = activePlan.days.find(d => d.dayNumber === planDow)
const isRest = !today || today.label.toLowerCase() === 'repos'
```

**Rendu si séance aujourd'hui (pas repos) :**
```jsx
<div className={`card mb-5 border-l-4 ${goalDayBorder(activePlan.goal)} bg-gradient-to-r ${GOAL_CONFIG[activePlan.goal as GoalType]?.gradient ?? 'from-amber-500/10 to-orange-500/5'}`}>
  <div className="flex items-center justify-between mb-3">
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-0.5">
        Séance d'aujourd'hui
      </p>
      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{today.label}</h3>
      <p className="text-sm text-gray-500">{today.exercises.length} exercices · {activePlan.name}</p>
    </div>
    <button type="button" onClick={() => onStartSession(activePlan, today)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white ${goalAccentBtn(activePlan.goal)} shadow-md`}>
      <Play size={16} /> Démarrer
    </button>
  </div>
  {/* Liste des 4 premiers exercices */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
    {today.exercises.slice(0, 4).map((ex, i) => (
      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
        <span className="truncate">{ex.name}</span>
        {ex.sets && ex.reps && <span className="text-xs text-gray-400 ml-auto shrink-0">{ex.sets}×{ex.reps}</span>}
      </div>
    ))}
    {today.exercises.length > 4 && (
      <p className="text-xs text-gray-400 col-span-full">+{today.exercises.length - 4} autres exercices</p>
    )}
  </div>
  <button type="button" onClick={() => onViewProgram(activePlan)}
    className="mt-3 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium">
    Voir le programme complet →
  </button>
</div>
```

**Rendu si jour de repos :**
```jsx
<div className="card mb-5 text-center py-6">
  <span className="text-3xl block mb-2">🧘</span>
  <p className="font-semibold text-gray-700 dark:text-gray-300">Jour de repos</p>
  <p className="text-sm text-gray-400 mt-1">{activePlan.name} · Profite de la récupération</p>
</div>
```

---

### 4. Nouveau composant `PRSection`

Pour l'onglet "Progression". Affiche les meilleurs records personnels par exercice.

```typescript
function PRSection({ sessions }: { sessions: WorkoutSession[] }) {
  if (sessions.length === 0) return null
  
  // Construire la map des max par exercice
  const prMap = new Map<string, { weightKg: number; date: string; reps: number | null }>()
  sessions.forEach(s => {
    s.exercises.forEach(ex => {
      if (!ex.weightKg) return
      const current = prMap.get(ex.name)
      if (!current || ex.weightKg > current.weightKg) {
        prMap.set(ex.name, { weightKg: ex.weightKg, date: s.sessionDate, reps: ex.reps })
      }
    })
  })
  
  const prs = Array.from(prMap.entries())
    .filter(([, v]) => v.weightKg > 0)
    .sort((a, b) => b[1].weightKg - a[1].weightKg)
    .slice(0, 6) // max 6 records affichés
  
  if (prs.length === 0) return null
  
  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        🏆 Records personnels
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prs.map(([name, pr]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 px-3 py-3 border border-amber-100 dark:border-amber-800/30">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-base shrink-0">🏆</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {format(new Date(`${pr.date}T00:00:00`), 'd MMM yyyy', { locale: fr })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">{pr.weightKg}<span className="text-xs font-medium"> kg</span></p>
              {pr.reps && <p className="text-[10px] text-gray-400">× {pr.reps} reps</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 5. Amélioration de `GlobalStats`

Modifier les valeurs de `text-xl font-bold` à `text-3xl font-black`. Ajouter `hover:-translate-y-0.5 transition-transform cursor-default` sur chaque carte.

```jsx
// Avant
<p className={`text-xl font-bold leading-none ${s.text}`}>{s.value}</p>
// Après
<p className={`text-3xl font-black leading-none ${s.text}`}>{s.value}</p>
// Sur le container de carte, ajouter : hover:-translate-y-0.5 transition-transform cursor-default
```

---

### 6. Session Cards — badge PR doré visible

Dans `SessionCard`, détecter si la séance contient au moins un PR :
```typescript
const hasPR = session.exercises.some(ex => isPR(sessions, ex.name, ex.weightKg, session.sessionDate))
```

Si `hasPR === true`, afficher un badge à côté du titre de la séance :
```jsx
{hasPR && (
  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
    🏆 PR
  </span>
)}
```

---

### 7. Onglet "Programmes" — programme actif featured

Si au moins un plan est `ACTIVE`, l'afficher en premier sous forme de bannière large **avant** le grid :

```jsx
{(() => {
  const featured = plans.find(p => p.status === 'ACTIVE')
  if (!featured) return null
  const cfg = GOAL_CONFIG[(featured.goal as GoalType) in GOAL_CONFIG ? featured.goal as GoalType : 'GENERAL']
  return (
    <div className="mb-5 cursor-pointer" onClick={() => { setDetailPlan(featured); setView('detail') }}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Programme actif</p>
      <div className="relative rounded-2xl overflow-hidden h-36 group">
        <img src={GOAL_IMAGES[(featured.goal as GoalType) in GOAL_IMAGES ? featured.goal as GoalType : 'GENERAL']}
          alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{cfg.emoji}</span>
              <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/20">{cfg.label}</span>
              <span className="w-2 h-2 rounded-full bg-green-400 ring-2 ring-white animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-white truncate">{featured.name}</h3>
            <p className="text-sm text-white/70">{featured.daysPerWeek}j/sem · {featured.weeks} semaines</p>
          </div>
          {/* Progress ring */}
          {/* Récupérer depuis le cache React Query */}
        </div>
      </div>
    </div>
  )
})()}
```

---

### 8. Structure de l'onglet "Aujourd'hui" dans WorkoutPanel

```jsx
{activeTab === 'today' && (
  <>
    <WeekHeroCard sessions={sessions} onAddSession={() => setShowAddModal(true)} />
    <TodaySessionBanner
      plans={plans}
      onStartSession={(plan, day) => {
        setActivePlan(plan)
        setActiveDay(day)
        setView('session')
      }}
      onViewProgram={(plan) => { setDetailPlan(plan); setView('detail') }}
    />
    {/* Dernières séances — max 3 */}
    {sessions.length > 0 && (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Dernières séances</p>
        <div className="space-y-3">
          {sessions
            .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
            .slice(0, 3)
            .map(s => (
              <SessionCard key={s.id} session={s} sessions={sessions}
                isExpanded={expandedId === s.id}
                onToggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                onDelete={() => deleteSessionMutation.mutate(s.id)} />
            ))}
        </div>
        {sessions.length > 3 && (
          <button type="button" onClick={() => setActiveTab('sessions')}
            className="mt-4 w-full text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline">
            Voir tout l'historique ({sessions.length} séances) →
          </button>
        )}
      </div>
    )}
    {sessions.length === 0 && (
      <div className="card text-center py-10">
        <Dumbbell size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Prêt pour ton premier entraînement ?</p>
        <p className="text-sm text-gray-400 mb-4">Enregistre ta première séance et suis ta progression.</p>
        <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary">
          + Nouvelle séance
        </button>
      </div>
    )}
  </>
)}
```

---

### 9. Structure de l'onglet "Progression"

```jsx
{activeTab === 'progression' && (
  <>
    {sessions.length > 0 && <GlobalStats sessions={sessions} />}
    {sessions.length > 0 && <ActivityHeatmap sessions={sessions} />}
    {sessions.length > 1 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <SportDonut sessions={sessions} />
        <WeeklyVolumeChart sessions={sessions} />
      </div>
    )}
    <PRSection sessions={sessions} />
    {sessions.length === 0 && (
      <div className="card text-center py-10">
        <Activity size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="font-semibold text-gray-600 dark:text-gray-300">Aucune donnée pour l'instant</p>
        <p className="text-sm text-gray-400 mt-1">Enregistre des séances pour voir ta progression.</p>
      </div>
    )}
  </>
)}
```

---

### 10. Onglet "Séances" — simplifier (retirer les graphiques)

```jsx
{activeTab === 'sessions' && (
  <>
    {/* Garder uniquement les badges de stats hebdo + liste des séances par mois */}
    {weekSessions.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-3 py-1.5 text-sm font-medium">
          {weekStats.count} séance{weekStats.count > 1 ? 's' : ''} cette semaine
        </span>
        {/* ... autres badges existants ... */}
      </div>
    )}
    {sessions.length === 0 ? (
      <EmptyPanel ... />  // inchangé
    ) : (
      // liste par mois — inchangée
    )}
  </>
)}
```

---

## CE QU'IL NE FAUT PAS TOUCHER

Ces composants doivent rester **strictement identiques** :
- `ActiveWorkoutSession` — le mode séance guidée (plein écran dark)
- `AddWorkoutModal` — la modale d'ajout de séance
- `CreatePlanModal` — la modale de création de programme
- `ProgramDetailView` — la vue détail d'un programme
- `ProgramCard` — les cartes de programme dans la grille
- `ActivityHeatmap`, `SportDonut`, `WeeklyVolumeChart` — les graphiques
- Tous les types/interfaces TypeScript en tête de fichier
- Toutes les constantes (GOAL_CONFIG, SPORT_PRESETS, EXERCISE_LIBRARY, etc.)
- La logique `view === 'session'` et `view === 'detail'` dans le render principal

---

## RÉSULTAT ATTENDU

WorkoutPanel avec :
1. **Onglet "Aujourd'hui"** : Hero semaine en cours (gradient amber/orange, anneau %, streak), banner programme actif si existant avec bouton Démarrer, 3 dernières séances
2. **Onglet "Séances"** : liste historique par mois (inchangée, sans graphiques)
3. **Onglet "Programmes"** : programme actif featured en premier, puis grid existante
4. **Onglet "Progression"** : GlobalStats amélioré + heatmap + donut + bar chart + section PRs

Aucun changement backend. Zéro nouvelles APIs. Tout doit build sans erreur TypeScript.
