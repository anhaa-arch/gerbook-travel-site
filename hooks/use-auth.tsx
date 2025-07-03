"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "herder"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ redirectTo?: string }>
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("user")
        setUser(null)
        setIsAuthenticated(false)
      }
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  if (user === undefined) {
    return null // Or a loading spinner if you want
  }

  const login = async (email: string, password: string) => {
    // Mock login logic
    const mockUsers = {
      "admin@malchincamp.com": { id: "1", name: "Admin User", email: "admin@malchincamp.com", role: "admin" as const },
      "herder@malchincamp.com": { id: "2", name: "Herder User", email: "herder@malchincamp.com", role: "herder" as const },
      "user@malchincamp.com": { id: "3", name: "Regular User", email: "user@malchincamp.com", role: "user" as const },
    }

    const userData = mockUsers[email as keyof typeof mockUsers]
    if (userData && password === "password123") {
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(userData))

      // Return redirect URL based on role
      const redirectUrls = {
        admin: "/admin-dashboard",
        herder: "/herder-dashboard",
        user: "/user-dashboard",
      }

      return { redirectTo: redirectUrls[userData.role] }
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = async () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  const register = async (userData: any) => {
    // Mock registration logic
    const newUser = {
      id: Date.now().toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role || ("user" as const),
    }

    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
