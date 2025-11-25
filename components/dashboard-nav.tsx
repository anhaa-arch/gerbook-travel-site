"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { user, Settings, Package, Home, BarChart3, users } from "lucide-react"

interface DashboardNavProps {
  userRole: "admin" | "user" | "herder"
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const { t } = useTranslation()
  const pathname = usePathname()

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { href: "/admin-dashboard", label: "Overview", icon: BarChart3 },
          { href: "/admin-dashboard?tab=users", label: "users", icon: users },
          { href: "/admin-dashboard?tab=camps", label: "Camps", icon: Home },
          { href: "/admin-dashboard?tab=products", label: "Products", icon: Package },
          { href: "/admin-dashboard?tab=orders", label: "Orders", icon: Settings },
        ]
      case "herder":
        return [
          { href: "/herder-dashboard", label: "Overview", icon: BarChart3 },
          { href: "/herder-dashboard?tab=products", label: "My Products", icon: Package },
          { href: "/herder-dashboard?tab=camps", label: "My Camps", icon: Home },
          { href: "/herder-dashboard?tab=orders", label: "Orders", icon: Settings },
          { href: "/herder-dashboard?tab=profile", label: "Profile", icon: user },
        ]
      case "user":
      default:
        return [
          { href: "/user-dashboard", label: "Profile", icon: user },
          { href: "/user-dashboard?tab=orders", label: "Orders", icon: Package },
          { href: "/user-dashboard?tab=bookings", label: "Bookings", icon: Home },
          { href: "/user-dashboard?tab=reviews", label: "Reviews", icon: Settings },
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <Card>
      <CardContent className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}
