import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Zap, Moon, UtensilsCrossed, CheckSquare, Dumbbell, BookOpen, BookMarked } from 'lucide-react'
import api from '../api/axios'

interface ModuleData {
  score:   number
  weight:  number
  label:   string
  present: boolean
}

interface SynergyData {
  name:        string
  bonus:       number
  description: string
}

interface HistoryPoint {
  date:  string
  total: number
  band:  string
}

interface DayScoreData {
  total:     number
  band:      string
  bandLabel: string
  delta:     number
  modules: {
    sleep:        ModuleData
    nutrition:    ModuleData
    productivity: ModuleData
    workout:      ModuleData
    study:        ModuleData
    mood:         ModuleData
  }
  synergies: SynergyData[]
  insight:   string | null
  history:   HistoryPoint[]
}

const BAND_COLORS: Record<string, string> = {
  PERFECT:  '#A78BFA',
  PEAK:     '#6366F1',
  STRONG:   '#10B981',
  STEADY:   '#F59E0B',
  SLOW:     '#F97316',
  RECHARGE: '#EF4444',
}

const MODULE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; panel: string }> = {
  sleep:        { icon: Moon,            label: 'Sommeil',   color: '#6366F1', panel: 'sleep' },
  nutrition:    { icon: UtensilsCrossed, label: 'Nutrition', color: '#10B981', panel: 'food' },
  productivity: { icon: CheckSquare,     label: 'Tâches',    color: '#8B5CF6', panel: 'tasks' },
  workout:      { icon: Dumbbell,        label: 'Sport',     color: '#F97316', panel: 'workout' },
  study:        { icon: BookOpen,        label: 'Étude',     color: '#F59E0B', panel: 'study' },
  mood:         { icon: BookMarked,      label: 'Journal',   color: '#F43F5E', panel: 'diary' },
}

function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let current = 0
    const step = Math.max(1, Math.ceil(target / 40))
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setVal(current)
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <>{val}</>
}

interface SmartDayScoreProps {
  onNavigate: (panel: string) => void
}

export default function SmartDayScore({ onNavigate }: SmartDayScoreProps) {
  const { data, isLoading } = useQuery<DayScoreData>({
    queryKey: ['day-score'],
    queryFn:  () => api.get('/score/today').then(r => r.data),
    staleTime: 60_000,
  })

  if (isLoading || !data) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-36 bg-white/10 rounded" />
          <div className="h-6 w-20 bg-white/10 rounded-full" />
        </div>
        <div className="flex gap-5 items-center">
          <div className="w-28 h-28 rounded-full bg-white/10 shrink-0" />
          <div className="flex-1 space-y-2.5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-2 bg-white/10 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  const { total, band, bandLabel, delta, modules, synergies, insight, history } = data
  const bandColor = BAND_COLORS[band] ?? '#6366F1'

  // Conic gauge: starts at 7:30 (225°), sweeps 270° clockwise
  // fill% = total * 0.75 (maps 0-100 score to 0-75% of full circle)
  const fillPct = total * 0.75
  const gaugeStyle = {
    background: `conic-gradient(
      from 225deg,
      ${bandColor} 0% ${fillPct}%,
      rgba(255,255,255,0.07) ${fillPct}% 75%,
      transparent 75% 100%
    )`,
  }

  const today = history[history.length - 1]?.date

  return (
    <div
      className="glass-card p-5 space-y-4"
      style={{ boxShadow: `0 0 40px ${bandColor}1A, 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)` }}
    >
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${bandColor}20` }}>
            <Zap size={14} style={{ color: bandColor }} />
          </div>
          <span className="font-bold text-sm text-white">Smart Day Score</span>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: `${bandColor}18`, color: bandColor, border: `1px solid ${bandColor}35` }}
        >
          {bandLabel}
        </span>
      </div>

      {/* ── Gauge + module bars ───────────────────────────── */}
      <div className="flex gap-5 items-center">

        {/* Conic gauge ring */}
        <div className="relative shrink-0 w-28 h-28 rounded-full" style={gaugeStyle}>
          <div className="absolute inset-3 rounded-full bg-[#070B14] flex flex-col items-center justify-center">
            <p className="text-3xl font-black leading-none" style={{ color: bandColor }}>
              <AnimatedCounter target={total} />
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">/ 100</p>
            {delta !== 0 && (
              <p className={`text-[10px] font-bold mt-0.5 ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {delta > 0 ? '▲+' : '▼'}{Math.abs(delta)}
              </p>
            )}
          </div>
        </div>

        {/* Module bars */}
        <div className="flex-1 space-y-2">
          {(Object.entries(modules) as [string, ModuleData][]).map(([key, mod]) => {
            const cfg = MODULE_CONFIG[key]
            if (!cfg) return null
            const Icon = cfg.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(cfg.panel)}
                className="w-full flex items-center gap-2 group"
              >
                <Icon size={11} style={{ color: cfg.color }} className="shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${mod.present ? mod.score : 0}%`,
                      background: cfg.color,
                      opacity: mod.present ? 1 : 0.25,
                    }}
                  />
                </div>
                <span className="text-[10px] tabular-nums w-5 text-right" style={{ color: mod.present ? cfg.color : '#4B5563' }}>
                  {mod.present ? mod.score : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Synergy badges ────────────────────────────────── */}
      {synergies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {synergies.map(s => (
            <span
              key={s.name}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
              title={s.description}
            >
              ✨ {s.name} +{s.bonus}
            </span>
          ))}
        </div>
      )}

      {/* ── 7-day sparkline ──────────────────────────────── */}
      {history.length > 0 && (
        <div className="flex items-end gap-1 pt-2 border-t border-white/[0.06]" style={{ height: '36px' }}>
          {history.map(h => {
            const barH = Math.max(4, (h.total / 100) * 24)
            const color = BAND_COLORS[h.band] ?? '#6366F1'
            const isToday = h.date === today
            return (
              <div
                key={h.date}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${barH}px`,
                  background: color,
                  opacity: isToday ? 1 : 0.30,
                  boxShadow: isToday ? `0 0 8px ${color}80` : 'none',
                }}
                title={`${h.date} · ${h.total} pts · ${BAND_LABELS[h.band] ?? h.band}`}
              />
            )
          })}
        </div>
      )}

      {/* ── Insight ──────────────────────────────────────── */}
      {insight && (
        <p className="text-[11px] text-gray-500 flex items-start gap-1.5 pt-1 border-t border-white/[0.06]">
          <span className="shrink-0">💡</span>
          <span>{insight}</span>
        </p>
      )}
    </div>
  )
}

const BAND_LABELS: Record<string, string> = {
  PERFECT:  'Perfect Day',
  PEAK:     'Peak Day',
  STRONG:   'Strong Day',
  STEADY:   'Steady',
  SLOW:     'Slow Start',
  RECHARGE: 'Recharge Day',
}
