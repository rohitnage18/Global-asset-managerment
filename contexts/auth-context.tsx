"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

const AUTH_STORAGE_KEY = "xenvolt-auth-session"
const COMMON_DEMO_PASSWORD = "1234"
const MASTER_LOGIN = {
  email: "admin@xenvolt.com",
  password: "admin123",
}

export type StationManager = {
  id: string
  name: string
  email: string
  password: string
  station: string
  role: string
}

export type AuthSession = Omit<StationManager, "password">

const STATION_MANAGERS: StationManager[] = [
  {
    id: "SM-PAT-001",
    name: "Rohit Nage",
    email: "patna.manager@xenvolt.com",
    password: "Patna@123",
    station: "Patna",
    role: "Station Manager",
  },
  {
    id: "SM-PNQ-001",
    name: "Aarav Kulkarni",
    email: "pune.manager@xenvolt.com",
    password: "Pune@123",
    station: "Pune",
    role: "Station Manager",
  },
  {
    id: "SM-VTZ-001",
    name: "Meera Reddy",
    email: "vizag.manager@xenvolt.com",
    password: "Vizag@123",
    station: "Visakhapatnam",
    role: "Station Manager",
  },
]

type AuthContextType = {
  user: AuthSession | null
  isLoading: boolean
  login: (email: string, password: string) => { ok: boolean; message?: string }
  logout: () => void
  managers: Omit<StationManager, "password">[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) {
      setIsLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(stored) as AuthSession
      setUser(parsed)
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedPassword = password.trim()

    if (normalizedEmail === MASTER_LOGIN.email && normalizedPassword === MASTER_LOGIN.password) {
      const session: AuthSession = {
        id: "SM-ADMIN-001",
        name: "Xenvolt Admin",
        email: MASTER_LOGIN.email,
        station: "All Stations",
        role: "Admin",
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      setUser(session)
      return { ok: true }
    }

    const match = STATION_MANAGERS.find(
      (manager) =>
        manager.email.toLowerCase() === normalizedEmail &&
        (manager.password.toLowerCase().trim() === normalizedPassword.toLowerCase() ||
          normalizedPassword === COMMON_DEMO_PASSWORD),
    )

    if (!match) {
      return { ok: false, message: "Invalid email or password." }
    }

    const session: AuthSession = {
      id: match.id,
      name: match.name,
      email: match.email,
      station: match.station,
      role: match.role,
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      managers: STATION_MANAGERS.map(({ password, ...manager }) => manager),
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
