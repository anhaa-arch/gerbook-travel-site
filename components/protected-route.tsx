"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "TRAVELER" | "HERDER"
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

    if (requiredRole && user) {
      const currentRole = user.role?.toUpperCase()
      const needsRole = requiredRole?.toUpperCase()

      if (currentRole !== needsRole) {
        // Special case: ADMIN can access HERDER dashboard
        if (needsRole === "HERDER" && currentRole === "ADMIN") {
          return
        }

        // Redirect to their own dashboard if they are on the wrong one
        const dashboardRoutes: Record<string, string> = {
          ADMIN: "/admin-dashboard",
          HERDER: "/herder-dashboard",
          TRAVELER: "/user-dashboard",
        }
        router.push(dashboardRoutes[currentRole] || "/user-dashboard")
      }
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

  if (requiredRole && user) {
    const currentRole = user.role?.toUpperCase()
    const needsRole = requiredRole?.toUpperCase()

    if (currentRole !== needsRole) {
      // Allow ADMIN in HERDER dashboard
      if (!(needsRole === "HERDER" && currentRole === "ADMIN")) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Redirecting...</p>
            </div>
          </div>
        )
      }
    }
  }

  return <div className="font-sans">{children}</div>
}
