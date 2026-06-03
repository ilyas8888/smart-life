import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'system' | 'light' | 'dark'

interface ThemeStore {
  preference: ThemePreference
  isDark: boolean
  toggle: () => void
  setPreference: (preference: ThemePreference) => void
  syncSystemTheme: () => void
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
}

function resolveDark(preference: ThemePreference) {
  return preference === 'system' ? systemPrefersDark() : preference === 'dark'
}

function applyTheme(preference: ThemePreference) {
  const isDark = resolveDark(preference)
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#0f172a' : '#f8fafc')
  return isDark
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      preference: 'system',
      isDark: applyTheme('system'),
      toggle: () => {
        const preference = get().isDark ? 'light' : 'dark'
        set({ preference, isDark: applyTheme(preference) })
      },
      setPreference: (preference) => set({ preference, isDark: applyTheme(preference) }),
      syncSystemTheme: () => {
        const { preference } = get()
        if (preference === 'system') set({ isDark: applyTheme(preference) })
      },
    }),
    {
      name: 'smartlife-theme',
      version: 1,
      partialize: ({ preference }) => ({ preference }),
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<ThemeStore> | undefined
        if (state?.preference) return { preference: state.preference }
        if (typeof state?.isDark === 'boolean') {
          return { preference: state.isDark ? 'dark' : 'light' }
        }
        return { preference: 'system' }
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.setPreference(state.preference ?? 'system')
      },
    }
  )
)
