"use client"

import { ProtectedRoute } from "@/components/protected-route"
import HerderDashboardContent from "./herder-dashboard-content"

export default function HerderDashboardPage() {
  return (
    <ProtectedRoute requiredRole="herder">
      <HerderDashboardContent />
    </ProtectedRoute>
  )
}
