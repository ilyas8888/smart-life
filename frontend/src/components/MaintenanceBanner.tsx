import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export default function MaintenanceBanner() {
  const [isDown, setIsDown] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/actuator/health`, {
          signal: AbortSignal.timeout(5000),
        })
        setIsDown(!res.ok)
      } catch {
        setIsDown(true)
      }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!isDown) return null

  return (
    <div
      role="alert"
      className="w-full px-4 py-2.5 text-sm font-medium text-center"
      style={{
        background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(234,88,12,0.12))',
        borderBottom: '1px solid rgba(245,158,11,0.30)',
        color: '#fbbf24',
      }}
    >
      🔧 Perturbation technique temporaire — Les services seront rétablis le{' '}
      <strong>1er juillet 2026</strong>. Merci de votre patience.
    </div>
  )
}
