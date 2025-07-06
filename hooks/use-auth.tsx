"use client"

import { redirect } from "next/dist/server/api-utils"
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

  const saveUserData = async (user:User) => {
      if(!user){
        throw new Error("Хэрэглэгчийн дата олдсонгүй")
        
      }
      setUser(user)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(user))
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
