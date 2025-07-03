"use client"

import { ProtectedRoute } from "@/components/protected-route"
import AdminDashboardContent from "./admin-dashboard-content"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
