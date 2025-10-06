"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
  // Normalized frontend roles
  role: "admin" | "user" | "herder"
  avatar?: string
  isHerder?: boolean // Frontend flag for herder dashboard
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  saveUserData: (user:User) => void
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
        const rawUser = JSON.parse(storedUser)
        const isHerder = localStorage.getItem('isHerder') === 'true'
        // Normalize role in case older storage used backend enums or missing fields
        const normalizedRole: User["role"] = (() => {
          const roleValue = (rawUser.role || "").toString()
          if (roleValue === "ADMIN" || roleValue.toLowerCase() === "admin") return "admin"
          // Treat any non-admin as customer; split herder via flag
          return isHerder ? "herder" : "user"
        })()
        const normalizedUser: User = {
          id: rawUser.id,
          name: rawUser.name,
          email: rawUser.email,
          avatar: rawUser.avatar,
          isHerder,
          role: normalizedRole,
        }
        setUser(normalizedUser)
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

  const saveUserData = async (user:User | any) => {
      if(!user){
        throw new Error("Хэрэглэгчийн дата олдсонгүй")
      }
      
      // Add herder flag from localStorage
      const isHerder = localStorage.getItem('isHerder') === 'true';
      // Normalize role from backend enums (ADMIN/CUSTOMER) to frontend roles
      const normalizedRole: User["role"] = (() => {
        const roleValue = (user.role || "").toString()
        if (roleValue === "ADMIN" || roleValue.toLowerCase() === "admin") return "admin"
        return isHerder ? "herder" : "user"
      })()
      const userWithHerderFlag: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isHerder,
        role: normalizedRole,
      };
      
      setUser(userWithHerderFlag)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(userWithHerderFlag))
  }

  const logout = async () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem("isHerder")
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
    saveUserData,
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
