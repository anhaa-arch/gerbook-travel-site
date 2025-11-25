"use client"

import { ProtectedRoute } from "@/components/protected-route"
import userDashboardContent from "./user-dashboard-content"

export default function userDashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <userDashboardContent />
    </ProtectedRoute>
  )
}
