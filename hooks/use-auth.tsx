"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import client from '@/lib/apolloClient'
import { gql } from '@apollo/client'

interface User {
  id: string
  name: string
  email: string
  // Normalized frontend roles
  role: "admin" | "user" | "herder"
  avatar?: string
  isHerder?: boolean // Frontend flag for herder dashboard
  hostBio?: string
  hostExperience?: string
  hostLanguages?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  saveUserData: (user:User) => void
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
  login: (credentials: { email?: string; password?: string; phone?: string }) => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, otp: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  forgotPassword?: (email: string) => Promise<void>
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
          if (roleValue === "HERDER" || roleValue.toLowerCase() === "herder") return "herder"
          // Treat any other as customer
          return "user"
        })()
        const normalizedUser: User = {
          id: rawUser.id,
          name: rawUser.name,
          email: rawUser.email,
          avatar: rawUser.avatar,
          isHerder,
          role: normalizedRole,
          hostBio: rawUser.hostBio,
          hostExperience: rawUser.hostExperience,
          hostLanguages: rawUser.hostLanguages,
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
      // Normalize role from backend enums (ADMIN/CUSTOMER/HERDER) to frontend roles
      const normalizedRole: User["role"] = (() => {
        const roleValue = (user.role || "").toString()
        if (roleValue === "ADMIN" || roleValue.toLowerCase() === "admin") return "admin"
        if (roleValue === "HERDER" || roleValue.toLowerCase() === "herder") return "herder"
        // Treat any other as customer
        return "user"
      })()
      const userWithHerderFlag: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isHerder,
        role: normalizedRole,
        hostBio: user.hostBio,
        hostExperience: user.hostExperience,
        hostLanguages: user.hostLanguages,
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
    localStorage.removeItem('token')
  }
  // GraphQL operations
  const REGISTER_MUTATION = gql`
    mutation Register($input: CreateUserInput!) {
      register(input: $input) { token user { id name email role hostBio hostExperience hostLanguages } }
    }
  `

  const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) { token user { id name email role hostBio hostExperience hostLanguages } }
    }
  `

  const SEND_OTP_MUTATION = gql`
    mutation SendOtp($phone: String!) { sendOtp(phone: $phone) { message } }
  `

  const VERIFY_OTP_MUTATION = gql`
    mutation VerifyOtp($phone: String!, $otp: String!) { verifyOtp(phone: $phone, otp: $otp) { token user { id name email role hostBio hostExperience hostLanguages } } }
  `

  const RESET_PASSWORD_MUTATION = gql`
    mutation ResetPassword($token: String!, $newPassword: String!) { resetPassword(token: $token, newPassword: $newPassword) { token user { id name email role hostBio hostExperience hostLanguages } } }
  `

  const FORGOT_PASSWORD_MUTATION = gql`
    mutation ForgotPassword($email: String!) { forgotPassword(email: $email) { message } }
  `

  const register = async (userData: any) => {
    const { data } = await client.mutate({ mutation: REGISTER_MUTATION, variables: { input: userData } })
    if (data?.register) {
      const { token, user } = data.register
      localStorage.setItem('token', token)
      saveUserData(user)
    } else {
      throw new Error('Registration failed')
    }
  }

  const login = async (credentials: { email?: string; password?: string; phone?: string }) => {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password required')
    }
    const { data } = await client.mutate({ mutation: LOGIN_MUTATION, variables: { email: credentials.email, password: credentials.password } })
    if (data?.login) {
      const { token, user } = data.login
      localStorage.setItem('token', token)
      saveUserData(user)
    } else {
      throw new Error('Login failed')
    }
  }

  const sendOtp = async (phone: string) => {
    await client.mutate({ mutation: SEND_OTP_MUTATION, variables: { phone } })
  }

  const verifyOtp = async (phone: string, otp: string) => {
    const { data } = await client.mutate({ mutation: VERIFY_OTP_MUTATION, variables: { phone, otp } })
    if (data?.verifyOtp) {
      const { token, user } = data.verifyOtp
      localStorage.setItem('token', token)
      saveUserData(user)
    } else {
      throw new Error('OTP verification failed')
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const { data } = await client.mutate({ mutation: RESET_PASSWORD_MUTATION, variables: { token, newPassword } })
    if (data?.resetPassword) {
      const { token: newToken, user } = data.resetPassword
      localStorage.setItem('token', newToken)
      saveUserData(user)
    } else {
      throw new Error('Reset password failed')
    }
  }

  const forgotPassword = async (email: string) => {
    await client.mutate({ mutation: FORGOT_PASSWORD_MUTATION, variables: { email } })
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    saveUserData,
    logout,
    register,
    login,
    sendOtp,
    verifyOtp,
    resetPassword,
    // expose forgotPassword for UI
    // @ts-ignore
    forgotPassword,
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
