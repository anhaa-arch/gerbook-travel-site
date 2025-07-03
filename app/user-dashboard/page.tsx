"use client"

import { ProtectedRoute } from "@/components/protected-route"
import UserDashboardContent from "./user-dashboard-content"

export default function UserDashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserDashboardContent />
    </ProtectedRoute>
  )
}
