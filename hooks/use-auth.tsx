"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import client from '@/lib/apolloClient'
import { gql } from '@apollo/client'
import { useRouter } from 'next/navigation'

interface user {
  id: string
  name: string
  email: string
  role: "ADMIN" | "TRAVELER" | "HERDER"
  avatar?: string
  hostBio?: string
  hostExperience?: string
  hostLanguages?: string
}

interface AuthContextType {
  user: user | null
  isAuthenticated: boolean
  saveuserData: (user: user) => void
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
  requestRegistrationCode: (input: any) => Promise<{ success: boolean; message: string }>
  verifyRegistration: (email: string, code: string) => Promise<void>
  login: (credentials: { email?: string; password?: string; phone?: string }) => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, otp: string) => Promise<void>
  requestPasswordResetCode: (email: string) => Promise<{ success: boolean; message: string }>
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  forgotPassword?: (email: string) => Promise<void>
  googleLogin: (token: string) => Promise<void>
  googleSignIn: (input: { googleId: string; email: string; name: string; avatar?: string }) => Promise<void>
  resendVerificationCode: (email: string) => Promise<{ success: boolean; message: string }>
  redirectUser: (role: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setuser] = useState<user | null | undefined>(undefined)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()


  useEffect(() => {
    const storeduser = localStorage.getItem("user")
    if (storeduser) {
      try {
        const rawuser = JSON.parse(storeduser)
        const normalizedRole: user["role"] = (() => {
          const roleValue = (rawuser.role || "").toString().toUpperCase()
          if (roleValue === "ADMIN") return "ADMIN"
          if (roleValue === "HERDER") return "HERDER"
          return "TRAVELER"
        })()
        const normalizeduser: user = {
          id: rawuser.id,
          name: rawuser.name,
          email: rawuser.email,
          avatar: rawuser.avatar,
          role: normalizedRole,
          hostBio: rawuser.hostBio,
          hostExperience: rawuser.hostExperience,
          hostLanguages: rawuser.hostLanguages,
        }
        setuser(normalizeduser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("user")
        setuser(null)
        setIsAuthenticated(false)
      }
    } else {
      setuser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const redirectUser = (role: string) => {
    // 1. Check for 'redirect' query parameter
    let queryRedirect: string | null = null;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      queryRedirect = urlParams.get('redirect');
    }
    // Safety check for startsWith
    const safeRedirect = typeof queryRedirect === "string" ? queryRedirect : "";
    const redirectUrl = safeRedirect && safeRedirect.startsWith("/") ? safeRedirect : null;

    if (redirectUrl) {
      router.push(redirectUrl)
      return
    }

    // 2. Default role-based redirection
    const upperRole = (role || "").toString().toUpperCase()
    if (upperRole === "ADMIN") {
      router.push("/admin-dashboard")
    } else if (upperRole === "HERDER") {
      router.push("/herder-dashboard")
    } else {
      router.push("/user-dashboard")
    }
  }

  const saveuserData = async (user: user | any) => {
    if (!user) {
      throw new Error("Хэрэглэгчийн дата олдсонгүй")
    }

    const normalizedRole: user["role"] = (() => {
      const roleValue = (user.role || "").toString().toUpperCase()
      if (roleValue === "ADMIN") return "ADMIN"
      if (roleValue === "HERDER") return "HERDER"
      return "TRAVELER"
    })()

    const normalizeduser: user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: normalizedRole,
      hostBio: user.hostBio,
      hostExperience: user.hostExperience,
      hostLanguages: user.hostLanguages,
    };

    setuser(normalizeduser)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(normalizeduser))

    // Trigger redirect after state is updated
    redirectUser(normalizedRole)
  }

  const logout = async () => {
    setuser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem("isHerder")
    localStorage.removeItem('token')
    router.push('/login')
  }

  // GraphQL Operations
  const REQUEST_REGISTRATION_CODE = gql`
    mutation RequestRegistrationCode($input: CreateuserInput!) {
      requestRegistrationCode(input: $input) { success message }
    }
  `

  const RESEND_REGISTRATION_CODE = gql`
    mutation ResendRegistrationCode($email: String!) {
      resendRegistrationCode(email: $email) { success message }
    }
  `

  const VERIFY_REGISTRATION = gql`
    mutation VerifyRegistration($email: String!, $code: String!) {
      verifyRegistration(email: $email, code: $code) { 
        token 
        user { id name email role hostBio hostExperience hostLanguages } 
      }
    }
  `

  const REQUEST_PASSWORD_RESET_CODE = gql`
    mutation RequestPasswordResetCode($email: String!) {
      requestPasswordResetCode(email: $email) { success message }
    }
  `

  const RESET_PASSWORD_WITH_CODE = gql`
    mutation ResetPasswordWithCode($email: String!, $code: String!, $newPassword: String!) {
      resetPasswordWithCode(email: $email, code: $code, newPassword: $newPassword) { success message }
    }
  `

  const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) { 
        token 
        user { id name email role hostBio hostExperience hostLanguages } 
      }
    }
  `

  const REGISTER_MUTATION = gql`
     mutation Register($input: CreateuserInput!) {
      register(input: $input) { token user { id name email role hostBio hostExperience hostLanguages } }
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

  const GOOGLE_SIGN_IN_MUTATION = gql`
    mutation GoogleSignIn($input: GoogleSignInInput!) {
      googleSignIn(input: $input) {
        token
        user { id name email role avatar hostBio hostExperience hostLanguages }
      }
    }
  `

  const login = async (credentials: { email?: string; password?: string; phone?: string }) => {
    if (!credentials.email || !credentials.password) {
      throw new Error('Имэйл болон нууц үгээ оруулна уу')
    }
    const { data } = await client.mutate({ mutation: LOGIN_MUTATION, variables: { email: credentials.email, password: credentials.password } })
    if (data?.login) {
      const { token, user } = data.login
      localStorage.setItem('token', token)
      saveuserData(user)
    } else {
      throw new Error('Нэвтрэх амжилтгүй')
    }
  }

  const googleSignIn = async (input: { googleId: string; email: string; name: string; avatar?: string }) => {
    const { data } = await client.mutate({ mutation: GOOGLE_SIGN_IN_MUTATION, variables: { input } })
    if (data?.googleSignIn) {
      const { token: jwtToken, user } = data.googleSignIn
      localStorage.setItem('token', jwtToken)
      saveuserData(user)
    } else {
      throw new Error('Google нэвтрэлт амжилтгүй')
    }
  }

  const googleLogin = async (token: string) => {
    const GOOGLE_LOGIN_MUTATION = gql`
      mutation GoogleLogin($token: String!) {
        googleLogin(token: $token) {
          token
          user { id name email role avatar hostBio hostExperience hostLanguages }
        }
      }
    `
    const { data } = await client.mutate({ mutation: GOOGLE_LOGIN_MUTATION, variables: { token } })
    if (data?.googleLogin) {
      const { token: jwtToken, user } = data.googleLogin
      localStorage.setItem('token', jwtToken)
      saveuserData(user)
    } else {
      throw new Error('Google нэвтрэлт амжилтгүй')
    }
  }

  const register = async (userData: any) => {
    const { data } = await client.mutate({ mutation: REGISTER_MUTATION, variables: { input: userData } })
    if (data?.register) {
      const { token, user } = data.register
      localStorage.setItem('token', token)
      saveuserData(user)
    } else {
      throw new Error('Бүртгэл амжилтгүй')
    }
  }

  const requestRegistrationCode = async (input: any) => {
    const { data } = await client.mutate({ mutation: REQUEST_REGISTRATION_CODE, variables: { input } })
    return data.requestRegistrationCode
  }

  const verifyRegistration = async (email: string, code: string) => {
    const { data } = await client.mutate({ mutation: VERIFY_REGISTRATION, variables: { email, code } })
    if (data?.verifyRegistration) {
      const { token, user } = data.verifyRegistration
      localStorage.setItem('token', token)
      saveuserData(user)
    } else {
      throw new Error('Баталгаажуулалт амжилтгүй')
    }
  }

  const resendVerificationCode = async (email: string) => {
    const { data } = await client.mutate({ mutation: RESEND_REGISTRATION_CODE, variables: { email } })
    return data.resendRegistrationCode
  }

  const requestPasswordResetCode = async (email: string) => {
    const { data } = await client.mutate({ mutation: REQUEST_PASSWORD_RESET_CODE, variables: { email } })
    return data.requestPasswordResetCode
  }

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
    const { data } = await client.mutate({ mutation: RESET_PASSWORD_WITH_CODE, variables: { email, code, newPassword } })
    return data.resetPasswordWithCode
  }

  const sendOtp = async (phone: string) => {
    const SEND_OTP_MUTATION = gql`
      mutation SendOtp($phone: String!) { sendOtp(phone: $phone) { message } }
    `
    await client.mutate({ mutation: SEND_OTP_MUTATION, variables: { phone } })
  }

  const verifyOtp = async (phone: string, otp: string) => {
    const { data } = await client.mutate({ mutation: VERIFY_OTP_MUTATION, variables: { phone, otp } })
    if (data?.verifyOtp) {
      const { token, user } = data.verifyOtp
      localStorage.setItem('token', token)
      saveuserData(user)
    } else {
      throw new Error('OTP verification failed')
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const { data } = await client.mutate({ mutation: RESET_PASSWORD_MUTATION, variables: { token, newPassword } })
    if (data?.resetPassword) {
      const { token: newToken, user } = data.resetPassword
      localStorage.setItem('token', newToken)
      saveuserData(user)
    } else {
      throw new Error('Reset password failed')
    }
  }

  if (user === undefined) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        saveuserData,
        logout,
        register,
        requestRegistrationCode,
        resendVerificationCode,
        verifyRegistration,
        login,
        sendOtp,
        verifyOtp,
        requestPasswordResetCode,
        resetPasswordWithCode,
        resetPassword,
        googleLogin,
        googleSignIn,
        redirectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
