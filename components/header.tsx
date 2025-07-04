"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/hooks/use-cart"

export function Header() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cartItems } = useCart()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return { href: "/admin-dashboard", label: t("nav.admin_dashboard") }
      case "herder":
        return { href: "/herder-dashboard", label: t("nav.herder_dashboard") }
      case "user":
        return { href: "/user-dashboard", label: t("nav.user_dashboard") }
      default:
        return null
    }
  }

  const dashboardLink = getDashboardLink()

  return (
    <header className="bg-emerald-600 border-b border-emerald-700 sticky top-0 z-50 font-sans shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo + Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group" aria-label="MalchinCamp Нүүр">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-lg md:text-2xl font-bold text-white font-display tracking-tight group-hover:text-emerald-100 transition-colors whitespace-nowrap">
                  MalchinCamp
                </span>
              </Link>
              <nav className="flex gap-6 ml-6">
                <Link href="/camps" className="text-white font-medium py-2 hover:border-b-2 hover:border-white transition">{t("nav.camps")}</Link>
                <Link href="/products" className="text-white font-medium py-2 hover:border-b-2 hover:border-white transition">{t("nav.products")}</Link>
                <Link href="/travel-routes" className="text-white font-medium py-2 hover:border-b-2 hover:border-white transition">{t("nav.travel_routes")}</Link>
                <Link href="/explore-mongolia" className="text-white font-medium py-2 hover:border-b-2 hover:border-white transition">{t("nav.explore_mongolia")}</Link>
                {dashboardLink && (
                  <Link href={dashboardLink.href} className="text-white font-medium py-2 hover:border-b-2 hover:border-white transition">{dashboardLink.label}</Link>
                )}
              </nav>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <button className="p-2 rounded-full hover:bg-emerald-700 transition-colors" aria-label="Гарах" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link href="/login" aria-label="Нэвтрэх">
                  <button className="p-2 rounded-full hover:bg-emerald-700 transition-colors" aria-label="Нэвтрэх">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
                  </button>
                </Link>
              )}
              <Link href="/cart" className="p-2 rounded-full hover:bg-emerald-700 transition-colors relative" aria-label="Cart">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
        {/* Mobile Header (хуучнаараа) */}
        <div className="lg:hidden flex items-center justify-between h-16 md:h-20">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="MalchinCamp Нүүр">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <span className="text-lg md:text-2xl font-bold text-emerald-600 font-display tracking-tight group-hover:text-emerald-700 transition-colors whitespace-nowrap">
              MalchinCamp
            </span>
          </Link>
          {/* Mobile menu button */}
          <div className="flex items-center ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={mobileMenuOpen ? t("common.close_menu") : t("common.open_menu")}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </Button>
          </div>
        </div>
        {/* Mobile Navigation (хуучнаараа) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 font-sans w-full animate-fade-in">
            <div className="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <LanguageSwitcher />
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="font-medium flex items-center gap-1 px-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>{t("nav.cart")}</span>
                </Button>
              </Link>
            </div>
            <nav className="flex flex-col space-y-2 w-full">
              <Link href="/camps" className="mobile-nav-link">{t("nav.camps")}</Link>
              <Link href="/products" className="mobile-nav-link">{t("nav.products")}</Link>
              <Link href="/travel-routes" className="mobile-nav-link">{t("nav.travel_routes")}</Link>
              <Link href="/explore-mongolia" className="mobile-nav-link">{t("nav.explore_mongolia")}</Link>
              {dashboardLink && (
                <Link href={dashboardLink.href} className="mobile-nav-link">{dashboardLink.label}</Link>
              )}
            </nav>
            <div className="flex flex-col space-y-2 pt-4 mt-1 border-t border-gray-200 w-full">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-md">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="font-medium bg-emerald-100 text-emerald-700">
                      {user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-base text-gray-800 max-w-[120px] truncate">{user?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto font-medium text-base px-3 py-2 h-auto"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    {t("nav.logout")}
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start font-medium text-base px-3 py-2 h-auto"
                    >
                      <User className="w-5 h-5 mr-3" />
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 w-full font-semibold text-base px-3 py-2 h-auto">
                      {t("nav.register")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Custom styles for nav links (хуучнаараа үлдээнэ) */}
      <style jsx global>{`
        .nav-link {
          color: #222;
          padding: 0.5rem 0;
          font-size: 1rem;
          border-radius: 0.375rem;
          transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover, .nav-link:focus {
          color: #059669;
          background: #f0fdfa;
        }
        .mobile-nav-link {
          color: #222;
          padding: 0.75rem 1rem;
          font-size: 1.1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: color 0.15s, background 0.15s;
        }
        .mobile-nav-link:hover, .mobile-nav-link:focus {
          color: #059669;
          background: #f0fdfa;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}
