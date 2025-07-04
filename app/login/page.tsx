"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import '../../lib/i18n'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { redirectTo } = await login(email, password)
      router.push(typeof redirectTo === "string" && redirectTo.length ? redirectTo : "/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center font-display">Нэвтрэх</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Demo Accounts:</h3>
              <div className="text-xs sm:text-sm space-y-1 font-medium">
                <div>
                  <strong className="font-semibold">Admin:</strong> admin@malchincamp.com / password123
                </div>
                <div>
                  <strong className="font-semibold">Herder:</strong> herder@malchincamp.com / password123
                </div>
                <div>
                  <strong className="font-semibold">User:</strong> user@malchincamp.com / password123
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  И-мэйл
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full font-medium"
                  placeholder="admin@malchincamp.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Нууц үг
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full font-medium"
                  placeholder="password123"
                />
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium">
                  Нууц үгээ мартсан уу?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Бүртгэлгүй юу?{' '}
                <Link href="/register" className="text-emerald-600 hover:text-emerald-500 font-semibold">
                  Бүртгүүлэх
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
