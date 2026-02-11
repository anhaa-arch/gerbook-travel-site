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

    let currentRole = (user?.role || "user").toString().toLowerCase() as "admin" | "user" | "herder" | "customer"
    if (currentRole === "customer") currentRole = "user"
    const needsRole = requiredRole as ("admin" | "user" | "herder" | undefined)

    if (needsRole && currentRole !== needsRole) {
      // Redirect to appropriate dashboard based on user role
      const dashboardRoutes: Record<"admin" | "herder" | "user", string> = {
        admin: "/admin-dashboard",
        herder: "/herder-dashboard",
        user: "/user-dashboard",
      }

      router.push(dashboardRoutes[currentRole])
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

  let currentRole = (user?.role || "user").toString().toLowerCase() as "admin" | "user" | "herder" | "customer"
  if (currentRole === "customer") currentRole = "user"
  if (requiredRole && currentRole !== requiredRole) {
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
