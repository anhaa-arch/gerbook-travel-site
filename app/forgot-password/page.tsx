"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !email.includes("@")) {
      setError("Зөв и-мэйл хаяг оруулна уу.")
      return
    }
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center font-display">Нууц үг сэргээх</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <Alert className="mb-4" variant="default">
                <AlertDescription className="font-medium">
                  Нууц үг сэргээх заавар таны и-мэйл рүү илгээгдлээ.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
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
                    placeholder="Таны и-мэйл хаяг"
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold">
                  Нууц үг сэргээх
                </Button>
              </form>
            )}
            <div className="mt-6 text-center">
              <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-semibold">
                Нэвтрэх рүү буцах
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 