import { useState } from 'react'
import { Dumbbell, Info, X } from 'lucide-react'

interface ExerciseMuscles {
  primary: string[]
  secondary: string[]
}

interface ExerciseMediaEntry {
  aliases: string[]
  imageUrl: string
  muscles: ExerciseMuscles
  instructions: string[]
  category: string
  restSeconds: number
}

const EXERCISE_DB: ExerciseMediaEntry[] = [
  {
    aliases: ['deadlift', 'soulevé de terre', 'souleve de terre', 'dl'],
    imageUrl: 'https://wger.de/media/exercise-images/161/Dead-lifts-2.png',
    category: 'Dos & chaîne postérieure',
    muscles: { primary: ['glutes', 'hamstrings', 'lower-back'], secondary: ['traps', 'forearms', 'quads', 'lats'] },
    instructions: [
      'Pieds sous la barre, largeur de hanches.',
      'Dos neutre et plat pendant toute la montée.',
      'Pousser le sol avec les jambes, ne pas tirer avec le dos.',
      'Verrouiller les hanches en haut en contractant les fessiers.',
    ],
    restSeconds: 180,
  },
  {
    aliases: ['squat', 'back squat', 'barbell squat'],
    imageUrl: 'https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png',
    category: 'Jambes',
    muscles: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core', 'lower-back'] },
    instructions: [
      "Pieds légèrement tournés vers l'extérieur, largeur d'épaules.",
      "Descendre jusqu'à ce que les cuisses soient parallèles au sol.",
      "Garder les genoux dans l'axe des pieds.",
      'Pousser depuis les talons pour remonter.',
    ],
    restSeconds: 150,
  },
  {
    aliases: ['développé couché', 'developpe couche', 'develope couche', 'bench press', 'chest press'],
    imageUrl: 'https://wger.de/media/exercise-images/192/Bench-press-1.png',
    category: 'Poitrine',
    muscles: { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
    instructions: [
      'Pieds à plat sur le sol, dos légèrement cambré.',
      'Prise légèrement plus large que les épaules.',
      'Descendre la barre vers le bas de la poitrine.',
      'Expirer en poussant la barre vers le haut.',
    ],
    restSeconds: 150,
  },
  {
    aliases: ['développé militaire', 'developpe militaire', 'develope militaire', 'overhead press', 'military press', 'ohp', 'press épaules'],
    imageUrl: 'https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png',
    category: 'Épaules',
    muscles: { primary: ['shoulders'], secondary: ['triceps', 'traps', 'core'] },
    instructions: [
      'Prise légèrement plus large que les épaules.',
      'Gainer le corps, fessiers contractés.',
      'Pousser la barre verticalement en évitant de creuser les lombaires.',
      'Verrouiller les coudes en haut.',
    ],
    restSeconds: 120,
  },
  {
    aliases: ['tractions', 'traction', 'pull-up', 'pullup', 'chin-up', 'chinup'],
    imageUrl: 'https://wger.de/media/exercise-images/181/Chin-ups-2.png',
    category: 'Dos',
    muscles: { primary: ['lats', 'biceps'], secondary: ['traps', 'shoulders', 'forearms'] },
    instructions: [
      'Prise pronation ou supination, légèrement plus large que les épaules.',
      'Initier le mouvement en rétractant les omoplates.',
      'Tirer les coudes vers le bas et les hanches.',
      "Monter jusqu'à ce que la poitrine touche la barre.",
    ],
    restSeconds: 120,
  },
  {
    aliases: ['rowing barre', 'row barre', 'barbell row', 'bent over row', 'rowing haltère', 'rowing haltere', 'dumbbell row'],
    imageUrl: 'https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png',
    category: 'Dos',
    muscles: { primary: ['lats', 'traps'], secondary: ['biceps', 'lower-back', 'shoulders'] },
    instructions: [
      'Pencher le buste à 45°, dos droit.',
      'Tirer la barre vers le nombril, pas vers la poitrine.',
      'Rétracter les omoplates en fin de mouvement.',
      'Contrôler la descente lentement.',
    ],
    restSeconds: 120,
  },
  {
    aliases: ['dips', 'dip', 'dips lestés', 'dips lestes'],
    imageUrl: 'https://wger.de/media/exercise-images/83/Bench-dips-1.png',
    category: 'Triceps & Poitrine',
    muscles: { primary: ['triceps', 'chest'], secondary: ['shoulders'] },
    instructions: [
      'Légèrement penché en avant pour cibler la poitrine.',
      "Descendre jusqu'à ce que les épaules soient sous les coudes.",
      'Ne pas laisser les épaules remonter vers les oreilles.',
      'Pousser vers le haut en contractant les triceps.',
    ],
    restSeconds: 90,
  },
  {
    aliases: ['curl biceps barre', 'curl biceps', 'biceps curl', 'bicep curl', 'barbell curl'],
    imageUrl: 'https://wger.de/media/exercise-images/74/Bicep-curls-1.png',
    category: 'Biceps',
    muscles: { primary: ['biceps'], secondary: ['forearms'] },
    instructions: [
      'Coudes fixes contre le corps.',
      'Supiner les poignets en montant.',
      'Contracter les biceps en haut, ne pas balancer.',
      'Descente lente et contrôlée.',
    ],
    restSeconds: 90,
  },
  {
    aliases: ['curl haltères', 'curl halteres', 'dumbbell curl', 'dumbbell bicep curl'],
    imageUrl: 'https://wger.de/media/exercise-images/74/Bicep-curls-1.png',
    category: 'Biceps',
    muscles: { primary: ['biceps'], secondary: ['forearms'] },
    instructions: [
      'Alterner les bras ou faire les deux simultanément.',
      'Coudes fixes contre les flancs.',
      'Supiner en montant pour maximiser le pic biceps.',
      'Descente contrôlée sur 2-3 secondes.',
    ],
    restSeconds: 90,
  },
  {
    aliases: ['curl marteau', 'curl marteau haltères', 'hammer curl', 'hammer curls'],
    imageUrl: 'https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png',
    category: 'Biceps & Avant-bras',
    muscles: { primary: ['biceps', 'forearms'], secondary: [] },
    instructions: [
      'Prise neutre (pouces vers le haut) tout au long du mouvement.',
      'Coudes fixes, pas de balancement.',
      'Cible le long chef du biceps et le brachio-radial.',
    ],
    restSeconds: 90,
  },
  {
    aliases: ['fentes haltères', 'fentes halteres', 'fentes', 'lunges', 'lunge', 'walking lunges'],
    imageUrl: 'https://wger.de/media/exercise-images/113/Walking-lunges-1.png',
    category: 'Jambes',
    muscles: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    instructions: [
      'Grand pas en avant, genou arrière à 1 cm du sol.',
      'Genou avant aligné avec le pied.',
      'Garder le buste droit et les abdos gainés.',
      'Pousser depuis le talon avant pour revenir.',
    ],
    restSeconds: 90,
  },
  {
    aliases: ['développé incliné', 'developpe incline', 'develope incline', 'incline bench press', 'développé incliné haltères'],
    imageUrl: 'https://wger.de/media/exercise-images/41/Incline-bench-press-1.png',
    category: 'Poitrine haute',
    muscles: { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    instructions: [
      'Banc incliné à 30-45°.',
      'Prise légèrement plus large que les épaules.',
      'Descendre la barre vers le haut de la poitrine.',
      "Contrôler la descente pour préserver l'épaule.",
    ],
    restSeconds: 120,
  },
  {
    aliases: ['tirage vertical', 'lat pulldown', 'tirage poulie haute'],
    imageUrl: 'https://wger.de/media/exercise-images/181/Chin-ups-2.png',
    category: 'Dos',
    muscles: { primary: ['lats'], secondary: ['biceps', 'traps'] },
    instructions: [
      'Tirer la barre vers le haut de la poitrine.',
      'Initier avec les omoplates, pas les bras.',
      "Coudes dans l'axe du corps, pas en arrière.",
    ],
    restSeconds: 90,
  },
  {
    aliases: ['triceps poulie', 'tricep pushdown', 'extension triceps', 'triceps extension', 'cable tricep pushdown', 'triceps poulie haute'],
    imageUrl: 'https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png',
    category: 'Triceps',
    muscles: { primary: ['triceps'], secondary: [] },
    instructions: [
      "Coudes fixes contre le corps, pas d'oscillation.",
      "Pousser vers le bas jusqu'à extension complète.",
      'Contracter les triceps en bas 1 seconde.',
    ],
    restSeconds: 60,
  },
  {
    aliases: ['élévations latérales', 'elevations laterales', 'lateral raises', 'lateral raise', 'écarté haltères épaules'],
    imageUrl: 'https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png',
    category: 'Épaules',
    muscles: { primary: ['shoulders'], secondary: ['traps'] },
    instructions: [
      'Légère flexion des coudes tout au long du mouvement.',
      "Monter jusqu'à hauteur des épaules, pas plus.",
      'Descente lente et contrôlée sur 3 secondes.',
      'Ne pas balancer le corps.',
    ],
    restSeconds: 60,
  },
  {
    aliases: ['pompes', 'push-up', 'pushup', 'push up'],
    imageUrl: 'https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png',
    category: 'Poitrine & Triceps',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders', 'core'] },
    instructions: [
      'Corps aligné des talons à la tête.',
      "Descendre jusqu'à ce que la poitrine frôle le sol.",
      'Coudes à 45° du corps, pas évasés.',
    ],
    restSeconds: 60,
  },
  {
    aliases: ['gainage', 'plank', 'planche'],
    imageUrl: 'https://wger.de/media/exercise-images/192/Bench-press-1.png',
    category: 'Abdominaux',
    muscles: { primary: ['core'], secondary: ['shoulders', 'glutes'] },
    instructions: [
      'Corps parfaitement droit, fessiers contractés.',
      'Ne pas laisser les hanches monter ou descendre.',
      'Respirer normalement.',
    ],
    restSeconds: 30,
  },
]

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Pectoraux',
  shoulders: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Avant-bras',
  core: 'Abdominaux',
  quads: 'Quadriceps',
  lats: 'Dorsaux',
  traps: 'Trapèzes',
  'lower-back': 'Lombaires',
  glutes: 'Fessiers',
  hamstrings: 'Ischio-jambiers',
  calves: 'Mollets',
}

const normalizeExerciseName = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

export function getExerciseMedia(name: string): ExerciseMediaEntry | null {
  const normalized = normalizeExerciseName(name)
  return EXERCISE_DB.find(entry =>
    entry.aliases.some(alias => {
      const normalizedAlias = normalizeExerciseName(alias)
      return normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized)
    })
  ) ?? null
}

export function MuscleDiagramSVG({
  primaryMuscles,
  secondaryMuscles,
}: {
  primaryMuscles: string[]
  secondaryMuscles: string[]
}) {
  const getColor = (muscleId: string) => {
    if (primaryMuscles.includes(muscleId)) return '#f59e0b'
    if (secondaryMuscles.includes(muscleId)) return '#fde68a'
    return '#374151'
  }

  return (
    <svg viewBox="0 0 240 200" className="w-full h-full" fill="none" aria-label="Muscles ciblés, vues de face et de dos">
      <ellipse cx="55" cy="12" rx="11" ry="12" fill="#4b5563" />
      <rect x="50" y="23" width="10" height="8" rx="3" fill="#4b5563" />
      <ellipse cx="39" cy="33" rx="9" ry="5" fill={getColor('traps')} />
      <ellipse cx="71" cy="33" rx="9" ry="5" fill={getColor('traps')} />
      <ellipse cx="30" cy="42" rx="10" ry="9" fill={getColor('shoulders')} />
      <ellipse cx="80" cy="42" rx="10" ry="9" fill={getColor('shoulders')} />
      <ellipse cx="46" cy="46" rx="13" ry="10" fill={getColor('chest')} />
      <ellipse cx="64" cy="46" rx="13" ry="10" fill={getColor('chest')} />
      <rect x="46" y="58" width="18" height="22" rx="4" fill={getColor('core')} />
      <ellipse cx="24" cy="58" rx="7" ry="12" fill={getColor('biceps')} />
      <ellipse cx="86" cy="58" rx="7" ry="12" fill={getColor('biceps')} />
      <ellipse cx="20" cy="78" rx="5" ry="11" fill={getColor('forearms')} />
      <ellipse cx="90" cy="78" rx="5" ry="11" fill={getColor('forearms')} />
      <ellipse cx="44" cy="110" rx="12" ry="20" fill={getColor('quads')} />
      <ellipse cx="66" cy="110" rx="12" ry="20" fill={getColor('quads')} />
      <ellipse cx="44" cy="158" rx="8" ry="14" fill={getColor('calves')} />
      <ellipse cx="66" cy="158" rx="8" ry="14" fill={getColor('calves')} />
      <text x="55" y="195" textAnchor="middle" fontSize="8" fill="#9ca3af">Face</text>

      <ellipse cx="185" cy="12" rx="11" ry="12" fill="#4b5563" />
      <rect x="180" y="23" width="10" height="8" rx="3" fill="#4b5563" />
      <ellipse cx="170" cy="35" rx="9" ry="6" fill={getColor('traps')} />
      <ellipse cx="200" cy="35" rx="9" ry="6" fill={getColor('traps')} />
      <ellipse cx="185" cy="36" rx="11" ry="5" fill={getColor('traps')} />
      <ellipse cx="160" cy="43" rx="10" ry="9" fill={getColor('shoulders')} />
      <ellipse cx="210" cy="43" rx="10" ry="9" fill={getColor('shoulders')} />
      <ellipse cx="172" cy="58" rx="13" ry="14" fill={getColor('lats')} />
      <ellipse cx="198" cy="58" rx="13" ry="14" fill={getColor('lats')} />
      <rect x="177" y="72" width="16" height="14" rx="4" fill={getColor('lower-back')} />
      <ellipse cx="154" cy="58" rx="7" ry="12" fill={getColor('triceps')} />
      <ellipse cx="216" cy="58" rx="7" ry="12" fill={getColor('triceps')} />
      <ellipse cx="174" cy="96" rx="14" ry="13" fill={getColor('glutes')} />
      <ellipse cx="196" cy="96" rx="14" ry="13" fill={getColor('glutes')} />
      <ellipse cx="174" cy="122" rx="11" ry="18" fill={getColor('hamstrings')} />
      <ellipse cx="196" cy="122" rx="11" ry="18" fill={getColor('hamstrings')} />
      <ellipse cx="174" cy="158" rx="8" ry="14" fill={getColor('calves')} />
      <ellipse cx="196" cy="158" rx="8" ry="14" fill={getColor('calves')} />
      <text x="185" y="195" textAnchor="middle" fontSize="8" fill="#9ca3af">Dos</text>
      <line x1="118" y1="5" x2="118" y2="185" stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
    </svg>
  )
}

export function ExerciseGuideModal({
  exerciseName,
  sets,
  reps,
  weightKg,
  onClose,
}: {
  exerciseName: string
  sets?: number | null
  reps?: number | null
  weightKg?: number | null
  onClose: () => void
}) {
  const media = getExerciseMedia(exerciseName)
  const [activeTab, setActiveTab] = useState<'demo' | 'muscles' | 'tips'>('demo')

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="font-bold text-lg">{exerciseName}</h3>
            {media && <p className="text-xs text-amber-400">{media.category}</p>}
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {(sets || reps || weightKg) && (
          <div className="flex gap-3 px-4 py-3 border-b border-gray-800">
            {sets && <div className="text-center"><p className="text-xl font-black text-amber-400">{sets}</p><p className="text-[10px] text-gray-500">séries</p></div>}
            {reps && <div className="text-center"><p className="text-xl font-black text-amber-400">{reps}</p><p className="text-[10px] text-gray-500">reps</p></div>}
            {weightKg && <div className="text-center"><p className="text-xl font-black text-amber-400">{weightKg}<span className="text-xs">kg</span></p><p className="text-[10px] text-gray-500">charge</p></div>}
            {media?.restSeconds && <div className="text-center ml-auto"><p className="text-xl font-black text-blue-400">{media.restSeconds}s</p><p className="text-[10px] text-gray-500">repos</p></div>}
          </div>
        )}

        <div className="flex border-b border-gray-800">
          {([
            { key: 'demo', label: 'Mouvement' },
            { key: 'muscles', label: 'Muscles' },
            { key: 'tips', label: 'Technique' },
          ] as const).map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'demo' && (
          <div className="p-4">
            {media ? (
              <>
                <div className="rounded-xl overflow-hidden bg-gray-800 mb-3">
                  <img src={media.imageUrl} alt={exerciseName} className="w-full object-contain max-h-56"
                    onError={event => { event.currentTarget.style.display = 'none' }} />
                </div>
                <p className="text-xs text-gray-400 text-center">Source : wger.de - CC-BY</p>
              </>
            ) : (
              <div className="rounded-xl bg-gray-800 h-48 flex flex-col items-center justify-center gap-3">
                <Dumbbell size={32} className="text-gray-600" />
                <p className="text-sm text-gray-500">Illustration non disponible</p>
                <p className="text-xs text-gray-600">pour "{exerciseName}"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'muscles' && (
          <div className="p-4">
            {media ? (
              <>
                <div className="h-52 mb-4">
                  <MuscleDiagramSVG primaryMuscles={media.muscles.primary} secondaryMuscles={media.muscles.secondary} />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">Muscles principaux</p>
                    <div className="flex flex-wrap gap-1.5">
                      {media.muscles.primary.map(muscle => (
                        <span key={muscle} className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {MUSCLE_LABELS[muscle] ?? muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                  {media.muscles.secondary.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-amber-200 uppercase tracking-wide mb-2">Muscles secondaires</p>
                      <div className="flex flex-wrap gap-1.5">
                        {media.muscles.secondary.map(muscle => (
                          <span key={muscle} className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-200/10 text-amber-200 border border-amber-200/20">
                            {MUSCLE_LABELS[muscle] ?? muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center"><p className="text-sm text-gray-500">Données musculaires non disponibles</p></div>
            )}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="p-4">
            {media ? (
              <ol className="space-y-3">
                {media.instructions.map((tip, index) => (
                  <li key={tip} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{index + 1}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="h-48 flex items-center justify-center"><p className="text-sm text-gray-500">Aucun conseil disponible</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ExerciseInfoButton({
  exerciseName,
  sets,
  reps,
  weightKg,
}: {
  exerciseName: string
  sets?: number | null
  reps?: number | null
  weightKg?: number | null
}) {
  const [open, setOpen] = useState(false)
  if (!getExerciseMedia(exerciseName)) return null

  return (
    <>
      <button type="button" onClick={event => { event.stopPropagation(); setOpen(true) }}
        className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 hover:bg-amber-500/40 flex items-center justify-center transition-colors shrink-0"
        title={`Voir le guide : ${exerciseName}`}>
        <Info size={11} />
      </button>
      {open && (
        <ExerciseGuideModal exerciseName={exerciseName} sets={sets} reps={reps} weightKg={weightKg} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
