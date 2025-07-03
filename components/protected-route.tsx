"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user" | "herder"
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const dashboardRoutes = {
        admin: "/admin-dashboard",
        herder: "/herder-dashboard",
        user: "/user-dashboard",
      }

      router.push(dashboardRoutes[user?.role || "user"])
      return
    }
  }, [isAuthenticated, user, requiredRole, router, redirectTo])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <div className="font-sans">{children}</div>
}
