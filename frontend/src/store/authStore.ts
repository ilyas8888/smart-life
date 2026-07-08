import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  refreshToken: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  setAuth: (token: string, email: string, firstName: string | null, lastName: string | null) => void
  setToken: (token: string) => void
  setRefreshToken: (refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      email: null,
      firstName: null,
      lastName: null,
      setAuth: (token, email, firstName, lastName) => set({ token, email, firstName, lastName }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      logout: () => set({ token: null, refreshToken: null, email: null, firstName: null, lastName: null }),
    }),
    {
      name: 'smartlife-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
