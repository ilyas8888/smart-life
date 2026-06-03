import { create } from 'zustand'

interface AuthState {
  token: string | null
  refreshToken: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  setAuth: (token: string, refreshToken: string | null, email: string, firstName: string | null, lastName: string | null) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    token: null,
    refreshToken: null,
    email: null,
    firstName: null,
    lastName: null,
    setAuth: (token, refreshToken, email, firstName, lastName) => set({ token, refreshToken, email, firstName, lastName }),
    setToken: (token) => set({ token }),
    logout: () => set({ token: null, refreshToken: null, email: null, firstName: null, lastName: null }),
  })
)
