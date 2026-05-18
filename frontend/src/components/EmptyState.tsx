interface EmptyStateProps {
  illustration: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function EmptyState({ illustration, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-28 h-28 text-gray-200 dark:text-gray-700 mb-5">{illustration}</div>
      <p className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  )
}

export const IllustrationTasks = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="15" y="10" width="70" height="80" rx="8" />
    <line x1="30" y1="32" x2="70" y2="32" />
    <line x1="30" y1="48" x2="70" y2="48" />
    <line x1="30" y1="64" x2="55" y2="64" />
    <circle cx="22" cy="32" r="4" />
    <circle cx="22" cy="48" r="4" />
    <circle cx="22" cy="64" r="4" />
    <polyline points="19,32 21,34 25,30" strokeWidth="2" />
  </svg>
)

export const IllustrationReminders = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 15 C30 15 22 30 22 45 L18 68 H82 L78 45 C78 30 70 15 50 15Z" />
    <line x1="44" y1="78" x2="56" y2="78" strokeWidth="4" />
    <line x1="50" y1="10" x2="50" y2="15" />
    <circle cx="75" cy="25" r="8" fill="currentColor" fillOpacity="0.15" />
    <line x1="75" y1="20" x2="75" y2="25" strokeWidth="2" />
    <line x1="75" y1="25" x2="78" y2="25" strokeWidth="2" />
  </svg>
)

export const IllustrationNotes = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="20" y="15" width="55" height="70" rx="6" />
    <rect x="28" y="8" width="44" height="12" rx="3" />
    <line x1="32" y1="40" x2="68" y2="40" />
    <line x1="32" y1="52" x2="68" y2="52" />
    <line x1="32" y1="64" x2="52" y2="64" />
    <circle cx="72" cy="72" r="12" strokeDasharray="4 2" />
    <line x1="72" y1="67" x2="72" y2="72" />
    <line x1="72" y1="72" x2="76" y2="72" />
  </svg>
)

export const IllustrationContacts = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="35" r="18" />
    <path d="M18 82 C18 65 82 65 82 82" />
    <line x1="68" y1="20" x2="68" y2="30" strokeWidth="2.5" />
    <line x1="63" y1="25" x2="73" y2="25" strokeWidth="2.5" />
  </svg>
)

export const IllustrationFood = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="55" r="32" />
    <path d="M26 55 Q50 35 74 55" strokeDasharray="3 3" />
    <line x1="50" y1="20" x2="50" y2="10" />
    <line x1="36" y1="10" x2="64" y2="10" />
    <circle cx="50" cy="55" r="5" fill="currentColor" fillOpacity="0.2" />
  </svg>
)

export const IllustrationDiary = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="12" width="52" height="76" rx="6" />
    <line x1="18" y1="12" x2="18" y2="88" strokeWidth="6" />
    <line x1="32" y1="35" x2="62" y2="35" />
    <line x1="32" y1="47" x2="62" y2="47" />
    <line x1="32" y1="59" x2="48" y2="59" />
    <path d="M55 68 L60 63 Q65 58 70 63 Q75 68 70 73 L55 86 L40 73 Q35 68 40 63 Q45 58 50 63 Z" strokeWidth="2" />
  </svg>
)

export const IllustrationWorkout = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="44" width="18" height="12" rx="4" />
    <rect x="77" y="44" width="18" height="12" rx="4" />
    <rect x="20" y="38" width="12" height="24" rx="3" />
    <rect x="68" y="38" width="12" height="24" rx="3" />
    <line x1="32" y1="50" x2="68" y2="50" strokeWidth="5" />
    <circle cx="50" cy="28" r="10" />
    <path d="M44 70 L44 85 M56 70 L56 85" />
    <path d="M44 85 L38 95 M56 85 L62 95" />
  </svg>
)

export const IllustrationPrograms = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="15" y="15" width="70" height="70" rx="8" />
    <line x1="15" y1="35" x2="85" y2="35" />
    <line x1="50" y1="15" x2="50" y2="35" />
    <rect x="24" y="44" width="15" height="15" rx="3" />
    <rect x="43" y="44" width="15" height="15" rx="3" />
    <rect x="62" y="44" width="15" height="15" rx="3" />
    <rect x="24" y="64" width="15" height="15" rx="3" />
    <line x1="43" y1="72" x2="77" y2="72" strokeDasharray="4 3" />
  </svg>
)
