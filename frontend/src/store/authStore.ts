import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  setAuth: (token: string, email: string, firstName: string | null, lastName: string | null) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      firstName: null,
      lastName: null,
      setAuth: (token, email, firstName, lastName) => set({ token, email, firstName, lastName }),
      setToken: (token) => set({ token }),
      logout: () => set({ token: null, email: null, firstName: null, lastName: null }),
    }),
    {
      name: 'smartlife-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
