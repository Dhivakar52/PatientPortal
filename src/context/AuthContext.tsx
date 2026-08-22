import { createContext, useContext, type ReactNode } from "react"
import { useAuthStore, type AuthUser } from "@/stores/authStore"

export interface User {
  userId: string
  name: string
  email?: string
  avatar?: string
  roles?: string[]
  [key: string]: unknown
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (user: User, token?: string) => void
  updateUser: (changes: Partial<User>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user) as User | null
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const storeLogout = useAuthStore((s) => s.logout)

  const login = (userData: User, token?: string) => {
    setAuth({
      user: userData as AuthUser,
      userId: userData.userId,
      authToken: token || localStorage.getItem('authToken'),
    })
  }

  const logout = () => {
    storeLogout()
  }

  const updateUser = (changes: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...changes }
    setAuth({ user: updated as AuthUser })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

