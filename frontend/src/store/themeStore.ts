import { create } from 'zustand'

interface ThemeStore {
  isDark: true
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(() => ({
  isDark: true,
  toggle: () => {},
}))
